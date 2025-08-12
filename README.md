<!-- # [LCKR](https://lckr.tech) -->

**LCKR** is a zero-knowledge, client-side encryption tool designed to securely encrypt and store your files locally using modern web technologies. It ensures your data privacy by performing all cryptographic operations on the client side — no data ever leaves your device.

---

## Features

- Zero-knowledge encryption: encryption keys are derived from your password locally
- Encrypt and decrypt files seamlessly within your browser
- Create, open, and manage encrypted lockers (secure folders)
- Simple and clean UI powered by React, Tailwind CSS, and Radix UI components
- Client-only: no backend or cloud storage required

---

## Stack

- React 19
- TypeScript
- Vite
- Zustand
- Tailwind CSS
- Framer Motion
- Lucide React

---

## Installation

Make sure you have Node.js (>=18) and npm/yarn installed.

```bash
# Clone the repo
git clone https://github.com/bvckslvsh/lckr.git
cd lckr

# Install dependencies
npm install
# or
yarn install
```

---

## Branch Rules

- `main` :

  - Production-ready code only
  - All features merged via Pull Requests

- `dev`:

  - Integration branch for ongoing development
  - Features branches merge here for testing and review

- Feature branches:

  - Branch from `dev`
  - Use descriptive names, e.g., `feature/encryption-ui`, `feature/file-download`
  - Create pull requests back to `dev` when ready

- Hotfix branches:
  - Branch from `main`
  - For urgent bug fixes on production
  - Merge back to both `main` and `dev`

---
