"""Auth endpoint tests."""
from __future__ import annotations

import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.asyncio


async def test_login_success(client: AsyncClient):
    resp = await client.post("/api/auth/login", json={"username": "admin", "password": "admin123"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["token_type"] == "bearer"
    assert "access_token" in data
    assert data["user"]["role"] == "admin"


async def test_login_wrong_password(client: AsyncClient):
    resp = await client.post("/api/auth/login", json={"username": "admin", "password": "wrong"})
    assert resp.status_code == 401


async def test_login_unknown_user(client: AsyncClient):
    resp = await client.post("/api/auth/login", json={"username": "nobody", "password": "x"})
    assert resp.status_code == 401


async def test_me_authenticated(client: AsyncClient, admin_token: str):
    resp = await client.get("/api/auth/me", headers={"Authorization": f"Bearer {admin_token}"})
    assert resp.status_code == 200
    assert resp.json()["username"] == "admin"


async def test_me_unauthenticated(client: AsyncClient):
    resp = await client.get("/api/auth/me")
    assert resp.status_code == 401


async def test_logout(client: AsyncClient, admin_token: str):
    resp = await client.post("/api/auth/logout", headers={"Authorization": f"Bearer {admin_token}"})
    assert resp.status_code == 200
    assert resp.json()["ok"] is True


async def test_hospital_role_cannot_access_eeg(client: AsyncClient, hospital_token: str):
    resp = await client.get("/api/eeg-metrics", headers={"Authorization": f"Bearer {hospital_token}"})
    assert resp.status_code == 403


async def test_signup_success_and_subsequent_login(client: AsyncClient):
    signup_payload = {
        "username": "newdriver",
        "password": "driverpassword",
        "displayName": "Paramedic Driver",
        "role": "patient",
    }
    resp = await client.post("/api/auth/signup", json=signup_payload)
    assert resp.status_code == 201
    data = resp.json()
    assert data["token_type"] == "bearer"
    assert data["user"]["username"] == "newdriver"
    assert data["user"]["displayName"] == "Paramedic Driver"

    # Verify that the new user can log in with their credentials
    login_resp = await client.post(
        "/api/auth/login",
        json={"username": "newdriver", "password": "driverpassword"},
    )
    assert login_resp.status_code == 200
    assert login_resp.json()["user"]["username"] == "newdriver"


async def test_signup_duplicate_username(client: AsyncClient):
    resp = await client.post(
        "/api/auth/signup",
        json={
            "username": "admin",
            "password": "anotherpassword",
            "displayName": "Admin Clone",
            "role": "admin",
        },
    )
    assert resp.status_code == 409


async def test_signup_validation(client: AsyncClient):
    # Short password (< 6 chars)
    resp = await client.post(
        "/api/auth/signup",
        json={"username": "validuser", "password": "123", "displayName": "Valid Name", "role": "patient"},
    )
    assert resp.status_code == 422 or resp.status_code == 400

