from __future__ import annotations

from slowapi import Limiter
from slowapi.util import get_remote_address

# Shared limiter instance — imported by routers that need rate limiting
limiter = Limiter(key_func=get_remote_address)
