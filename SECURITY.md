# Security Policy

## Overview

The **RESQLINK** emergency dispatch platform handles safety-critical workflows, geographic telemetry, real-time dispatch queues, and sensitive health profiles (ABDM/ABHA). Ensuring security, system availability, and data integrity is essential to our mission.

## Supported Versions

Security updates and patches are applied to the latest code on the default branch and current tagged releases:

| Version | Supported          |
| ------- | ------------------ |
| v0.10 / 0.1.x | :white_check_mark: |
| < 0.1.0 | :x:                |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues, pull requests, or public discussions.**

If you discover a security vulnerability in RESQLINK, report it privately through one of the following methods:

### 1. GitHub Security Advisory (Recommended)
Submit a report via GitHub's private vulnerability reporting feature:
- Navigate to the [RESQLINK Security Tab](https://github.com/abhintr2006/RESQLINK/security/advisories/new) and click **Report a vulnerability**.

### 2. Contact the Maintainers Privately
If you are unable to use GitHub Security Advisories, contact the project maintainers directly:
* [@toxicbishop](https://github.com/toxicbishop)
* [@abhintr2006](https://github.com/abhintr2006)
* [@guruemail125-sys](https://github.com/guruemail125-sys)
* [@amir2560](https://github.com/amir2560)

### What to Include in Your Report
To help us triage and resolve the issue quickly, include:
* Description and category of the vulnerability (e.g., authentication bypass, injection, broken access control, CSRF, IDOR).
* Step-by-step reproduction instructions or a minimal proof-of-concept (PoC).
* Affected components (e.g., FastAPI backend endpoints, WebSocket handlers, React frontend, database schemas, SMS gateway adapters).
* Assessment of potential exploitability and impact on emergency dispatch operations or citizen data privacy.
* Any proposed mitigations or fixes, if available.

## Response Timelines

* **Initial Acknowledgment**: Within 48 to 72 hours of receiving the vulnerability report.
* **Triage & Assessment**: Maintainers will confirm whether the issue is reproducible and determine severity.
* **Resolution & Patch**: Once verified, maintainers will prepare a patch and coordinate a release.
* **Public Disclosure**: A public advisory and release notes will be published after the fix has been merged and deployed.

## Sensitive Security Areas

Given the civic emergency nature of RESQLINK, reports concerning the following areas receive high priority:
* **Citizen Privacy & PII**: Protection of emergency contact info, ABHA/ABDM healthcare credentials, and patient locations (aligned with India's Digital Personal Data Protection Act, 2023).
* **Dispatch Telemetry & Authentication**: Integrity of emergency responder coordinates, JWT verification, and fleet command controls.
* **Availability & DoS**: Resilience of WebSocket CAD feeds, rate-limiting bypass on emergency trigger endpoints, and SMS payload parsing.

## Responsible Disclosure & Safe Harbor

We appreciate the efforts of security researchers in improving RESQLINK's posture. We commit to:
* Not pursuing legal action against researchers acting in good faith.
* Collaborating with you to understand and resolve the vulnerability.
* Crediting your contribution in the advisory (unless you request anonymity).
