# ─────────────────────────────────────────────────────────────────────────────
# RESQLINK - Autonomous Emergency Assistance & Dispatch CAD Framework
# ─────────────────────────────────────────────────────────────────────────────

.DEFAULT_GOAL := help
SHELL := /bin/bash

# Executables
PYTHON ?= $(shell command -v python3 2>/dev/null || command -v python 2>/dev/null)
PNPM   ?= $(shell command -v pnpm 2>/dev/null || echo "npx pnpm")
NODE   ?= $(shell command -v node 2>/dev/null)

VENV            := server/.venv
VENV_BIN        := $(VENV)/bin
VENV_PYTHON     := $(VENV_BIN)/python
VENV_PIP        := $(VENV_BIN)/pip
VENV_UVICORN    := $(VENV_BIN)/uvicorn
VENV_PYTEST     := $(VENV_BIN)/pytest
VENV_RUFF       := $(VENV_BIN)/ruff

# Terminal formatting
BOLD   := \033[1m
GREEN  := \033[32m
CYAN   := \033[36m
YELLOW := \033[33m
RED    := \033[31m
DIM    := \033[2m
RESET  := \033[0m

# ─────────────────────────────────────────────────────────────────────────────
# Help / Target Index
# ─────────────────────────────────────────────────────────────────────────────

.PHONY: help
help:
	@echo -e "${BOLD}${CYAN}RESQLINK - Operational Commands${RESET}"
	@echo -e "${DIM}================================================================${RESET}"
	@echo -e "  ${BOLD}make demo${RESET}             Verify all dependencies & launch full platform (backend + frontend)"
	@echo -e "  ${BOLD}make dev${RESET}              Alias for make demo"
	@echo -e "  ${BOLD}make install${RESET}          Install dependencies for both backend and frontend"
	@echo -e "  ${BOLD}make check-deps${RESET}       Verify required runtimes, virtualenvs, and libraries"
	@echo -e "  ${BOLD}make test${RESET}             Run complete test suite (backend pytest + frontend typecheck)"
	@echo -e "  ${BOLD}make test-backend${RESET}     Run pytest on server"
	@echo -e "  ${BOLD}make test-frontend${RESET}    Run TypeScript typecheck and Vite build"
	@echo -e "  ${BOLD}make lint${RESET}             Run ruff checks on backend code"
	@echo -e "  ${BOLD}make build${RESET}            Build frontend production assets"
	@echo -e "  ${BOLD}make clean${RESET}            Remove build artifacts, caches, and test databases"
	@echo -e "${DIM}================================================================${RESET}"

# ─────────────────────────────────────────────────────────────────────────────
# Dependency Verification & Setup
# ─────────────────────────────────────────────────────────────────────────────

.PHONY: check-runtimes
check-runtimes:
	@echo -e "${BOLD}1/3 Checking system runtimes...${RESET}"
	@if [ -z "$(PYTHON)" ]; then \
		echo -e "  ${RED}✗ Python 3 not found.${RESET} Please install Python 3.11+."; exit 1; \
	else \
		echo -e "  ${GREEN}✓${RESET} Python: $$($(PYTHON) --version)"; \
	fi
	@if [ -z "$(NODE)" ]; then \
		echo -e "  ${RED}✗ Node.js not found.${RESET} Please install Node.js 20+."; exit 1; \
	else \
		echo -e "  ${GREEN}✓${RESET} Node.js: $$($(NODE) --version)"; \
	fi
	@if command -v pnpm >/dev/null 2>&1; then \
		echo -e "  ${GREEN}✓${RESET} pnpm: $$(pnpm --version)"; \
	else \
		echo -e "  ${YELLOW}!${RESET} pnpm not in PATH; falling back to npx pnpm"; \
	fi

.PHONY: check-backend-deps
check-backend-deps: check-runtimes
	@echo -e "${BOLD}2/3 Checking backend virtualenv & packages...${RESET}"
	@if [ ! -f "$(VENV_PYTHON)" ]; then \
		echo -e "  ${YELLOW}→ Creating virtual environment at $(VENV)...${RESET}"; \
		$(PYTHON) -m venv $(VENV); \
		echo -e "  ${GREEN}✓${RESET} Virtual environment created."; \
	fi
	@if [ ! -f "server/.env" ]; then \
		echo -e "  ${YELLOW}→ server/.env missing; copying from server/.env.example${RESET}"; \
		cp server/.env.example server/.env; \
	fi
	@if $(VENV_PYTHON) -c "import fastapi, uvicorn, sqlalchemy, jwt, ruff" >/dev/null 2>&1; then \
		echo -e "  ${GREEN}✓${RESET} Backend dependencies verified in $(VENV)."; \
	else \
		echo -e "  ${YELLOW}→ Installing missing backend packages from server/requirements.txt...${RESET}"; \
		$(VENV_PIP) install --quiet --upgrade pip; \
		$(VENV_PIP) install --quiet -r server/requirements.txt ruff; \
		echo -e "  ${GREEN}✓${RESET} Backend dependencies installed successfully."; \
	fi

.PHONY: check-frontend-deps
check-frontend-deps: check-runtimes
	@echo -e "${BOLD}3/3 Checking frontend node_modules & configuration...${RESET}"
	@if [ ! -f ".env" ]; then \
		echo -e "  ${YELLOW}→ Root .env missing; copying from .env.example${RESET}"; \
		cp .env.example .env; \
	fi
	@if [ -d "node_modules" ] && [ -f "node_modules/.pnpm/lock.yaml" -o -d "node_modules/vite" ]; then \
		echo -e "  ${GREEN}✓${RESET} Frontend packages verified."; \
	else \
		echo -e "  ${YELLOW}→ Installing frontend dependencies via $(PNPM)...${RESET}"; \
		$(PNPM) install; \
		echo -e "  ${GREEN}✓${RESET} Frontend packages installed successfully."; \
	fi

.PHONY: check-deps
check-deps: check-runtimes check-backend-deps check-frontend-deps
	@echo -e "${GREEN}${BOLD}All dependencies and environment files are ready!${RESET}\n"

.PHONY: install
install: check-deps

# ─────────────────────────────────────────────────────────────────────────────
# Demo / Run Platform
# ─────────────────────────────────────────────────────────────────────────────

.PHONY: demo dev
demo dev: check-deps
	@echo -e "${BOLD}${CYAN}╔══════════════════════════════════════════════════════════════╗${RESET}"
	@echo -e "${BOLD}${CYAN}║                    LAUNCHING RESQLINK DEMO                   ║${RESET}"
	@echo -e "${BOLD}${CYAN}╚══════════════════════════════════════════════════════════════╝${RESET}"
	@echo -e "  ${BOLD}Frontend:${RESET}     ${GREEN}http://localhost:3000${RESET}"
	@echo -e "  ${BOLD}Backend API:${RESET}  ${GREEN}http://127.0.0.1:8000${RESET}"
	@echo -e "  ${BOLD}API Docs:${RESET}     ${CYAN}http://127.0.0.1:8000/docs${RESET}"
	@echo -e "  ${BOLD}WebSocket:${RESET}    ${CYAN}ws://127.0.0.1:8000/api/ws${RESET}"
	@echo -e ""
	@echo -e "  ${BOLD}Demo Accounts:${RESET}"
	@echo -e "    • ${YELLOW}Dispatcher / CAD:${RESET}    admin / admin123"
	@echo -e "    • ${YELLOW}Hospital ER Staff:${RESET}   hospital / hospital123"
	@echo -e "    • ${YELLOW}Citizen / Patient:${RESET}   patient / patient123"
	@echo -e ""
	@echo -e "  ${DIM}Press [Ctrl+C] to cleanly stop both backend and frontend servers.${RESET}\n"
	@bash -c '\
		trap "echo -e \"\n${YELLOW}Stopping RESQLINK processes...${RESET}\"; kill 0" EXIT INT TERM; \
		(cd server && .venv/bin/uvicorn app.main:app --reload --port 8000) & \
		$(PNPM) run dev & \
		wait \
	'

# ─────────────────────────────────────────────────────────────────────────────
# Testing & Code Quality
# ─────────────────────────────────────────────────────────────────────────────

.PHONY: test-backend
test-backend: check-backend-deps
	@echo -e "${BOLD}Running backend test suite (pytest)...${RESET}"
	@cd server && .venv/bin/pytest -v

.PHONY: test-frontend
test-frontend: check-frontend-deps
	@echo -e "${BOLD}Running frontend typecheck & build test...${RESET}"
	@$(PNPM) run build

.PHONY: test
test: test-backend test-frontend
	@echo -e "${GREEN}${BOLD}✓ All test suites passed!${RESET}"

.PHONY: lint
lint: check-backend-deps
	@echo -e "${BOLD}Running ruff lint check on backend...${RESET}"
	@cd server && .venv/bin/ruff check app/ tests/ --select E,F,W,I --ignore E501
	@echo -e "${GREEN}✓ Linting clean!${RESET}"

.PHONY: build
build: check-frontend-deps
	@echo -e "${BOLD}Building production frontend bundle...${RESET}"
	@$(PNPM) run build

# ─────────────────────────────────────────────────────────────────────────────
# Clean
# ─────────────────────────────────────────────────────────────────────────────

.PHONY: clean
clean:
	@echo -e "${YELLOW}Cleaning build caches, temporary files, and test databases...${RESET}"
	@rm -rf dist/
	@rm -rf server/.pytest_cache server/__pycache__ server/app/__pycache__ server/app/**/__pycache__
	@rm -rf .cache .turbo
	@echo -e "${GREEN}✓ Clean complete.${RESET}"
