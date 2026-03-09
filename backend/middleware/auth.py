"""
Authentication & authorisation middleware (decorators).

Usage
-----
    from middleware import token_required, role_required

    @app.route("/protected")
    @token_required
    def protected(*, current_user):
        ...

    @app.route("/admin-only")
    @token_required
    @role_required("admin")
    def admin_only(*, current_user):
        ...
"""

from functools import wraps

import jwt
from flask import request, jsonify

from middleware.token import decode_token
from model import get_account_by_role


def token_required(f):
    """Validate the Bearer access token and inject ``current_user`` into kwargs."""

    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")

        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Missing or malformed Authorization header"}), 401
        

        token = auth_header.split(" ", 1)[1]

        try:
            payload = decode_token(token)
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token has expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401

        if payload.get("type") != "access":
            return jsonify({"error": "Invalid token type"}), 401

        role = payload.get("role", "user")
        account = get_account_by_role(role, int(payload["sub"]))
        if not account:
            return jsonify({"error": "Account not found"}), 401

        kwargs["current_user"] = account
        return f(*args, **kwargs)

    return decorated


def role_required(*allowed_roles: str):
    """Restrict access to users whose role is in *allowed_roles*.

    Must be placed **after** ``@token_required`` so ``current_user`` exists.
    """

    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            user = kwargs.get("current_user")
            if not user or user.role not in allowed_roles:
                return jsonify({"error": "Forbidden – insufficient role"}), 403
            return f(*args, **kwargs)
        return decorated
    return decorator
