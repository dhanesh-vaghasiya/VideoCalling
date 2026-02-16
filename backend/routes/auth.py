"""
Auth routes – signup, login (JWT-based), token refresh, profile, password.
"""

from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash

from model import User
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

    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "Email already registered"}), 409

    user = User(
        full_name      = data["fullName"],
        email          = data["email"],
        phone          = data.get("phone"),
        password_hash  = generate_password_hash(data["password"]),
        role           = data.get("role", "user"),
        specialization = data.get("specialization"),
        license_number = data.get("licenseNumber"),
        address        = data.get("address"),
        city           = data.get("city"),
    )

    db.session.add(user)
    db.session.commit()

    tokens = generate_tokens(user)

    return jsonify({
        "message": "Account created",
        "user":    user.to_dict(),
        **tokens,
    }), 201


# ──────────────────── LOGIN ────────────────────
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}

    if not data.get("email") or not data.get("password"):
        return jsonify({"error": "Email and password are required"}), 400

    user = User.query.filter_by(email=data["email"]).first()

    if not user or not check_password_hash(user.password_hash, data["password"]):
        return jsonify({"error": "Invalid email or password"}), 401

    # Optional: check role matches what the frontend sent
    if data.get("role") and user.role != data["role"]:
        return jsonify({"error": f"This account is not registered as {data['role']}"}), 403

    tokens = generate_tokens(user)

    return jsonify({
        "message": "Login successful",
        "user":    user.to_dict(),
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

    user = User.query.get(payload["sub"])
    if not user:
        return jsonify({"error": "User not found"}), 401

    new_access = create_token(user.id, user.role, ACCESS_TOKEN_EXPIRES, "access")

    return jsonify({"accessToken": new_access}), 200


# ──────────────────── GET CURRENT USER ────────────────────
@auth_bp.route("/me", methods=["GET"])
@token_required
def me(*, current_user: User):
    """Return the authenticated user's profile (from the access token)."""
    return jsonify({"user": current_user.to_dict()}), 200


# ──────────────────── PROFILE (protected) ────────────────────
@auth_bp.route("/profile/<int:user_id>", methods=["GET"])
@token_required
def get_profile(user_id, *, current_user: User):
    user = User.query.get_or_404(user_id)
    return jsonify(user.to_dict()), 200


@auth_bp.route("/profile/<int:user_id>", methods=["PUT"])
@token_required
def update_profile(user_id, *, current_user: User):
    # Users can only update their own profile (admins can update any)
    if current_user.id != user_id and current_user.role != "admin":
        return jsonify({"error": "Unauthorized"}), 403

    user = User.query.get_or_404(user_id)
    data = request.get_json() or {}

    updatable = ["fullName", "phone", "specialization", "licenseNumber", "address", "city"]
    field_map = {
        "fullName":       "full_name",
        "phone":          "phone",
        "specialization": "specialization",
        "licenseNumber":  "license_number",
        "address":        "address",
        "city":           "city",
    }

    for api_field in updatable:
        if api_field in data:
            setattr(user, field_map[api_field], data[api_field])

    db.session.commit()
    return jsonify({"message": "Profile updated", "user": user.to_dict()}), 200


# ──────────────────── CHANGE PASSWORD (protected) ────────────────────
@auth_bp.route("/change-password", methods=["PUT"])
@token_required
def change_password(*, current_user: User):
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
