LCKR - Portable Encrypted Locker
=================================

Your encrypted locker. Works on any PC with Chrome, Edge, or Brave.
No installation. No cloud account. No trace left behind.


QUICK START
-----------

Windows:
  Double-click start.bat

Mac / Linux:
  Open Terminal, navigate to this folder, then run:
    chmod +x start.sh
    ./start.sh

Both scripts start a local server and open your browser automatically.
Python must be installed (free, https://python.org).


USB SETUP (how to copy LCKR to a USB drive)
--------------------------------------------

1. Build the app:
     npm run build

2. Copy these files to your USB drive:
     dist/         <- the built app
     start.bat     <- Windows launcher
     start.sh      <- Mac/Linux launcher
     README.txt    <- this file

3. Create a folder for your locker on the USB (e.g. "my-locker/")

4. On any PC: run start.bat or start.sh, then open your locker.


CLOUD SYNC (Dropbox, iCloud, Google Drive)
------------------------------------------

Put your locker folder inside your cloud sync folder.
Files sync encrypted — the cloud provider sees only .enc files.
Open LCKR at https://lckr.tech (or from USB) to access your files.


SECURITY NOTES
--------------

- All encryption is AES-GCM 256-bit, performed locally in your browser.
- Your password is used to derive an encryption key via PBKDF2
  (600,000 iterations, SHA-256). The key exists only in memory
  while the locker is open.
- Closing the tab or refreshing destroys the key. Files stay encrypted.
- File deletion uses standard OS removal — not a cryptographic wipe.
  For highly sensitive files, consider overwriting before deletion.
- The locker.metadata.json and test.encrypted files in your locker
  folder are required. Do not delete or rename them.


SUPPORT
-------

GitHub: https://github.com/bvckslvsh/lckr
Email:  bvckslvsh@gmail.com
