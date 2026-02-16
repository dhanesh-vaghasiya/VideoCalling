"""
JWT token generation & decoding utilities.

Access  token : 15 min   – sent with every authenticated request.
Refresh token : 30 days  – used only to obtain a new access token.
"""

from datetime import datetime, timedelta, timezone

import jwt
from flask import current_app


ACCESS_TOKEN_EXPIRES  = timedelta(minutes=15)
REFRESH_TOKEN_EXPIRES = timedelta(days=30)


def create_token(
    user_id: int,
    role: str,
    expires_delta: timedelta,
    token_type: str = "access",
) -> str:
    """Return a signed HS256 JWT string."""
    now = datetime.now(timezone.utc)
    payload = {
        "sub":  user_id,
        "role": role,
        "type": token_type,
        "iat":  now,
        "exp":  now + expires_delta,
    }
    return jwt.encode(payload, current_app.config["SECRET_KEY"], algorithm="HS256")


def generate_tokens(user) -> dict:
    """Return an access + refresh token pair for the given user."""
    return {
        "accessToken":  create_token(user.id, user.role, ACCESS_TOKEN_EXPIRES,  "access"),
        "refreshToken": create_token(user.id, user.role, REFRESH_TOKEN_EXPIRES, "refresh"),
    }


def decode_token(token: str) -> dict:
    """Decode and verify a JWT. Raises jwt.InvalidTokenError on failure."""
    return jwt.decode(token, current_app.config["SECRET_KEY"], algorithms=["HS256"])
