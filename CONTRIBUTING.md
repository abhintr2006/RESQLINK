# Contributing to RESQLINK

Thank you for your interest in contributing to **RESQLINK**! We welcome community contributions to help improve emergency dispatch equity, real-time telemetry, and citizen safety.

All contributors and participants are expected to adhere to our [Code of Conduct](CODE_OF_CONDUCT.md).

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
  - [Prerequisites](#prerequisites)
  - [1. Clone Repository](#1-clone-repository)
  - [2. Backend Setup](#2-backend-setup)
  - [3. Frontend Setup](#3-frontend-setup)
- [Validation & Testing](#validation--testing)
  - [Backend Verification](#backend-verification)
  - [Frontend Verification](#frontend-verification)
- [Git Workflow & Conventions](#git-workflow--conventions)
  - [Branch Naming](#branch-naming)
  - [Commit Messages](#commit-messages)
  - [Pull Request Checklist](#pull-request-checklist)
- [Security Disclosures](#security-disclosures)
- [Maintainers](#maintainers)

---

## How Can I Contribute?

* **Reporting Bugs**: Open an issue describing the unexpected behavior, steps to reproduce, and your environment.
* **Suggesting Enhancements**: Propose improvements to dispatch algorithms, accessibility features, or offline resilience.
* **Writing Code**: Pick up open issues labeled `good first issue` or `help wanted`, or propose fixes via pull requests.
* **Improving Documentation**: Fix typos, clarify setup steps, or improve API specifications.

---

## Development Setup

### Prerequisites

Ensure you have the following installed on your machine:
* **Node.js** 22+ and **pnpm** (`npm install -g pnpm`)
* **Python** 3.11+ and `pip`
* **Git**

### 1. Clone Repository

```bash
git clone https://github.com/abhintr2006/RESQLINK.git
cd RESQLINK
```

### 2. Backend Setup

The backend is built with FastAPI, SQLAlchemy 2 (async), and SQLite/PostgreSQL:

```bash
cd server

# Create and activate virtual environment
python -m venv .venv

# On Windows (PowerShell):
.venv\Scripts\Activate.ps1
# On macOS / Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start local development server
uvicorn app.main:app --reload --port 8000
```

- **API Base URL**: `http://localhost:8000`
- **Interactive OpenAPI Docs**: `http://localhost:8000/docs`
- **WebSocket CAD Stream**: `ws://localhost:8000/api/ws`

### 3. Frontend Setup

In a new terminal window from the root repository directory:

```bash
# Install dependencies
pnpm install

# Start Vite development server
pnpm run dev
```

- **Frontend Application**: `http://localhost:3000`

---

## Validation & Testing

Always verify that your changes pass all local linting and test suites before submitting a pull request. These checks match our continuous integration pipeline.

### Backend Verification

In the `server` directory with your virtual environment activated:

```bash
# 1. Lint code with ruff
pip install ruff --quiet
ruff check app/ tests/ --select E,F,W,I --ignore E501

# 2. Type check with pyright
pip install pyright --quiet
pyright app/

# 3. Run automated tests
python -m pytest -q --tb=short
```

### Frontend Verification

From the root project directory:

```bash
# 1. TypeScript type check
pnpm exec tsc --noEmit

# 2. Production build check
pnpm run build
```

---

## Git Workflow & Conventions

### Branch Naming

Create branch names that reflect the intent of your changes:
* `feat/short-description` for new capabilities
* `fix/short-description` for bug fixes
* `docs/short-description` for documentation updates
* `refactor/short-description` for code restructuring

### Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>
```

Common types:
* `feat`: A new feature
* `fix`: A bug fix
* `docs`: Documentation-only updates
* `refactor`: Code change that neither fixes a bug nor adds a feature
* `test`: Adding or updating automated tests
* `chore`: Maintenance tasks, dependencies, tooling updates

Example:
```bash
git commit -m "feat(dispatch): add priority weighting for pediatric trauma cases"
```

### Pull Request Checklist

Before submitting your PR, ensure:
1. The branch is up-to-date with `master`.
2. All local tests, type checks, and linting passes.
3. Commit history is clear and concise.
4. If your PR changes API schemas or database models, update corresponding documentation.
5. No confidential data, private tokens, or test credentials are committed.

---

## Security Disclosures

Do not report potential security vulnerabilities through public GitHub issues. Please follow our disclosure process documented in [SECURITY.md](SECURITY.md).

---

## Maintainers

If you have questions or need guidance on contributing, feel free to reach out to the project maintainers:

* [@toxicbishop](https://github.com/toxicbishop)
* [@abhintr2006](https://github.com/abhintr2006)
* [@guruemail125-sys](https://github.com/guruemail125-sys)
* [@amir2560](https://github.com/amir2560)
