# [LCKR](https://lckr.tech)

---

**LCKR** is a zero-knowledge, client-side encryption tool designed to securely encrypt and store your files locally using modern web technologies. It ensures your data privacy by performing all cryptographic operations on the client side — no data ever leaves your device.

---

## Why LCKR?

Many journalists, activists, or anyone handling sensitive information — need strong encryption for their files. But not everyone has the time, technical skills, or patience to set up complex software like Veracrypt. That’s where **LCKR** comes in.

Unlike many alternatives:

- **Smart Lockers** – Create a folder (locker) with associated metadata that tells LCKR how to handle encryption. Once a locker is set up, you can simply **drag and drop new files** into the app, and they are automatically encrypted according to the locker’s configuration. This avoids the need to manually encrypt each file and keeps your workflow smooth.
- **Local AES-GCM encryption** – All encryption is performed locally using AES-GCM; your files **never** leave your device.
- **Sleek, modern UI** – simple and intuitive, no steep learning curve.
- **Fast & lightweight** – works right in your browser without heavy installations.

**Who is it for?**

- Journalists and researchers who handle sensitive files on the go.
- Everyday users who want strong encryption but don’t want to wrestle with technical setups.
- Anyone who values privacy but prefers simplicity and speed.

**Why LCKR?**  
It’s designed to make encryption **accessible, fast, and reliable** for non-technical users—without compromising security.

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
