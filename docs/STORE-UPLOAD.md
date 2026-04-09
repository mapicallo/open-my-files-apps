# Publishing on Chrome Web Store & Microsoft Edge Add-ons

## Package (ZIP)

From the repo root:

```powershell
.\scripts\package-extension.ps1
```

Output: `dist/open-my-files-apps-<version>.zip`  
Contents: everything under `extension/` with **manifest.json at the ZIP root** (required by both stores).

Use the **same ZIP** for Chrome and Edge unless a store asks for a specific naming convention.

## Privacy policy URL (dashboard)

Use (same for Chrome and Edge partner centre):

**https://github.com/mapicallo/open-my-files-apps/blob/main/docs/PRIVACY.md**

Ensure `main` contains `docs/PRIVACY.md` before you submit.

## Permission justifications (short text you can paste)

| Permission        | Typical justification |
|-------------------|------------------------|
| `storage`         | Saves your list of files, folders, and URLs locally in the browser; no account or sync. |
| `nativeMessaging` | Optional Windows helper for native file/folder pickers and opening paths; communication stays on the device. |
| `windows`          | Opens and focuses the draggable panel window from the toolbar button. |

## Single purpose (Chrome)

One clear purpose: **quickly open user-chosen files, folders, and URLs from a single floating panel**, with optional Windows integration for pickers.

## After publication — fixed extension ID

Once listed, the extension ID is **stable** for that store listing. Update the Windows helper / installer `allowed_origins` to include:

- `chrome-extension://<CHROME_STORE_ID>/`
- `chrome-extension://<EDGE_ADDONS_ID>/` (if different)

See [NATIVE_HOST.md](NATIVE_HOST.md) and [USER-SETUP.md](USER-SETUP.md).

## Listing assets (non-technical checklist)

- **Screenshots:** prefer the UI **after** the Windows helper is set up (main panel with a few rows).
- **128×128** and promotional images: use `extension/icons/icon128.png` or higher-res artwork derived from it.
- **Support / homepage:** `https://github.com/mapicallo/open-my-files-apps`
