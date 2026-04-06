# [LCKR](https://lckr.tech)

**Your files. Encrypted. No cloud. No accounts. No trace.**

LCKR is a private file locker that runs entirely in your browser. You pick a folder, set a password, and drop files in — they get encrypted instantly on your device. Nobody else can read them. Not us, not anyone.

---

## What it does

- **Encrypts your files with a password** — drag files into LCKR and they're locked with military-grade encryption before anything is written to disk.
- **Works offline** — no internet connection required after the first load. Everything happens locally.
- **No accounts, no cloud** — LCKR never sees your files or your password. There are no servers involved.
- **Works from a USB drive** — carry LCKR on a USB stick along with your encrypted files. Open them on any PC with Chrome, Edge, or Brave. Unplug and nothing stays behind.
- **Works with cloud sync** — put your locker folder inside Dropbox, iCloud, or Google Drive. Your files sync encrypted. The cloud provider only sees `.enc` files.

---

## Who it's for

- **Journalists and researchers** who carry sensitive material and need it locked at all times.
- **Everyday users** who want their personal files protected without learning complicated software.
- **People on the move** who need encryption that works on any computer — without installing anything.

---

## How to use

### In the browser

1. Go to [lckr.tech](https://lckr.tech)
2. Click **Create locker** and pick an empty folder on your computer
3. Set a strong password
4. Drag files into LCKR — they encrypt automatically
5. To open later: click **Open locker**, pick the same folder, enter your password

### From a USB drive

1. Download the latest release from the [Releases page](https://github.com/bvckslvsh/lckr/releases/latest)
2. Unzip onto your USB drive
3. Create a folder on the USB for your locker (e.g. `my-locker/`)
4. On any PC: run `start.bat` (Windows) or `start.sh` (Mac/Linux) — Chrome opens automatically
5. Open your locker, work with your files, close the tab when done

> Python must be installed to run the local server. Download free at [python.org](https://python.org).

---

## Security

All encryption happens in your browser using:

- **AES-256-GCM** — the same standard used by governments and banks
- **PBKDF2 with 600,000 iterations** — makes brute-forcing your password extremely slow even with powerful hardware
- **SHA-256** key derivation

Your password is never stored anywhere. The encryption key exists only in memory while the locker is open — closing the tab destroys it.

> **Your password is your only key.** If you forget it, your files cannot be recovered. There is no reset.

---

## Frequently asked questions

**Can LCKR read my files?**
No. Encryption happens entirely on your device. We have no servers that receive your data.

**What if I forget my password?**
There is no recovery option by design. Choose a password you won't forget, or store it in a password manager.

**Can I use the same locker on multiple devices?**
Yes — put your locker folder in a cloud-synced location (Dropbox, iCloud, Google Drive) and open it with LCKR on any device.

**What browsers are supported?**
Chrome, Edge, and Brave. Firefox does not yet support the File System Access API that LCKR relies on.

**Is it free?**
Yes, completely. No plans, no limits, no ads.

---

## For developers

### Stack

- React 19 + TypeScript
- Vite
- Zustand
- Tailwind CSS v4
- Framer Motion
- dnd-kit (drag and drop)
- Vitest (tests)

### Running locally

```bash
git clone https://github.com/bvckslvsh/lckr.git
cd lckr
npm install
npm run dev
```

### Running tests

```bash
npm run test:run   # run once
npm test           # watch mode
```

### Branch rules

- `main` — production-ready code only, merged via Pull Requests
- `dev` — integration branch for ongoing development
- `feature/*` — branch from `dev`, PR back to `dev` when ready
- `hotfix/*` — branch from `main`, merge back to both `main` and `dev`
