"""
Auth routes – signup, login (JWT-based), token refresh, profile, password.
Supports two separate schemas: User and Doctor.
"""

from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash

from model import User, Doctor, get_account_by_role, find_account_by_email
from extensions import db
from middleware.token import generate_tokens, create_token, decode_token, ACCESS_TOKEN_EXPIRES
from middleware.auth import token_required

import jwt

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


# ──────────────────── SIGNUP ────────────────────
@auth_bp.route("/signup", methods=["POST"])
def signup():
    data = request.get_json() or {}

    required = ["fullName", "email", "password"]
    for field in required:
        if not data.get(field):
            return jsonify({"error": f"{field} is required"}), 400

    role = data.get("role", "user")

    # Check both tables for duplicate email
    if find_account_by_email(data["email"]):
        return jsonify({"error": "Email already registered"}), 409

    if role == "doctor":
        account = Doctor(
            full_name      = data["fullName"],
            email          = data["email"],
            phone          = data.get("phone"),
            password_hash  = generate_password_hash(data["password"]),
            specialization = data.get("specialization"),
            license_number = data.get("licenseNumber"),
        )
    else:
        account = User(
            full_name     = data["fullName"],
            email         = data["email"],
            phone         = data.get("phone"),
            password_hash = generate_password_hash(data["password"]),
            address       = data.get("address"),
            city          = data.get("city"),
        )

    db.session.add(account)
    db.session.commit()

    tokens = generate_tokens(account)

    return jsonify({
        "message": "Account created",
        "user":    account.to_dict(),
        **tokens,
    }), 201


# ──────────────────── LOGIN ────────────────────
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}

    if not data.get("email") or not data.get("password"):
        return jsonify({"error": "Email and password are required"}), 400

    role_hint = data.get("role")  # optional – narrows search to one table

    account = find_account_by_email(data["email"], role_hint)

    if not account or not check_password_hash(account.password_hash, data["password"]):
        return jsonify({"error": "Invalid email or password"}), 401

    # If the frontend sent a role, verify it matches the account found
    if role_hint and account.role != role_hint:
        return jsonify({"error": f"This account is not registered as {role_hint}"}), 403

    tokens = generate_tokens(account)

    return jsonify({
        "message": "Login successful",
        "user":    account.to_dict(),
        **tokens,
    }), 200


# ──────────────────── REFRESH TOKEN ────────────────────
@auth_bp.route("/refresh", methods=["POST"])
def refresh():
    """Exchange a valid refresh token for a new access token."""
    data = request.get_json() or {}
    refresh_token = data.get("refreshToken")

    if not refresh_token:
        return jsonify({"error": "refreshToken is required"}), 400

    try:
        payload = decode_token(refresh_token)
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Refresh token has expired, please login again"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid refresh token"}), 401

    if payload.get("type") != "refresh":
        return jsonify({"error": "Invalid token type"}), 401

    role = payload.get("role", "user")
    account = get_account_by_role(role, int(payload["sub"]))
    if not account:
        return jsonify({"error": "Account not found"}), 401

    new_access = create_token(account.id, account.role, ACCESS_TOKEN_EXPIRES, "access")

    return jsonify({"accessToken": new_access}), 200


# ──────────────────── GET CURRENT USER ────────────────────
@auth_bp.route("/me", methods=["GET"])
@token_required
def me(*, current_user):
    """Return the authenticated user's profile (from the access token)."""
    return jsonify({"user": current_user.to_dict()}), 200


# ──────────────────── PROFILE (protected) ────────────────────
@auth_bp.route("/profile/<int:user_id>", methods=["GET"])
@token_required
def get_profile(user_id, *, current_user):
    account = get_account_by_role(current_user.role, user_id)
    if not account:
        return jsonify({"error": "Profile not found"}), 404
    return jsonify(account.to_dict()), 200


@auth_bp.route("/profile/<int:user_id>", methods=["PUT"])
@token_required
def update_profile(user_id, *, current_user):
    # Users/Doctors can only update their own profile
    if current_user.id != user_id:
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json() or {}

    # Common updatable fields
    common_map = {
        "fullName": "full_name",
        "phone":    "phone",
    }

    for api_field, db_field in common_map.items():
        if api_field in data:
            setattr(current_user, db_field, data[api_field])

    # Role-specific fields
    if current_user.role == "user":
        user_map = {"address": "address", "city": "city"}
        for api_field, db_field in user_map.items():
            if api_field in data:
                setattr(current_user, db_field, data[api_field])
    elif current_user.role == "doctor":
        doctor_map = {"specialization": "specialization", "licenseNumber": "license_number"}
        for api_field, db_field in doctor_map.items():
            if api_field in data:
                setattr(current_user, db_field, data[api_field])

    db.session.commit()
    return jsonify({"message": "Profile updated", "user": current_user.to_dict()}), 200


# ──────────────────── CHANGE PASSWORD (protected) ────────────────────
@auth_bp.route("/change-password", methods=["PUT"])
@token_required
def change_password(*, current_user):
    data = request.get_json() or {}

    if not data.get("currentPassword") or not data.get("newPassword"):
        return jsonify({"error": "currentPassword and newPassword are required"}), 400

    if not check_password_hash(current_user.password_hash, data["currentPassword"]):
        return jsonify({"error": "Current password is incorrect"}), 401

    if len(data["newPassword"]) < 6:
        return jsonify({"error": "New password must be at least 6 characters"}), 400

    current_user.password_hash = generate_password_hash(data["newPassword"])
    db.session.commit()

    return jsonify({"message": "Password changed successfully"}), 200


# ──────────────────── LOGOUT (protected) ────────────────────
@auth_bp.route("/logout", methods=["POST"])
@token_required
def logout(*, current_user):
    """Logout endpoint - client-side token cleanup."""
    return jsonify({"message": "Logout successful"}), 200
