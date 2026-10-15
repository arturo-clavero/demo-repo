import hmac
from functools import wraps
from typing import Callable

from flask import current_app, request

from .errors import Unauthorized


def key_matches(given: str, expected: str) -> bool:
    """Constant-time comparison, so response timing does not leak the key."""
    if not expected:
        return False
    return hmac.compare_digest(given.encode(), expected.encode())


def require_api_key(view: Callable) -> Callable:
    @wraps(view)
    def wrapped(*args, **kwargs):
        if not key_matches(request.headers.get("x-api-key", ""), current_app.config["API_KEY"]):
            raise Unauthorized("missing or wrong API key")
        return view(*args, **kwargs)

    return wrapped
