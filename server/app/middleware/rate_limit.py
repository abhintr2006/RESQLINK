from __future__ import annotations

from slowapi import Limiter
from starlette.requests import Request


def get_client_ip(request: Request) -> str:
    """
    Resolve client IP, honoring reverse-proxy headers (Render, Vercel, Cloudflare).
    Falls back to direct connection IP if no proxy header is present.
    """
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        # First IP in the comma-separated list is the original client
        return forwarded.split(",")[0].strip()
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip.strip()
    return request.client.host if request.client else "127.0.0.1"


# Shared limiter instance — proxy-aware for Render / Vercel
limiter = Limiter(key_func=get_client_ip)
