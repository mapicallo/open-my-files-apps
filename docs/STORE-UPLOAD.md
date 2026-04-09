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

## Chrome — Privacy tab (copy-paste)

Select **No** for **remote code** / **¿Utilizas código remoto?** The package only loads local `panel.js` and `background.js`; there are no externally hosted scripts or `eval` of downloaded code.

**Single purpose**

```
This extension has one narrow purpose: let the user keep a personal list of files, folders, and web URLs and open them quickly from one draggable floating window. It does not modify webpages, search results, or third-party content. On Windows only, optional native messaging connects to a separate local program the user installs to show OS file/folder pickers and launch paths the user chose.
```

**`storage`**

```
Stores only user-created data inside the extension: labels, file/folder paths, URLs, row order, and checkbox state for “open selection.” It uses chrome.storage.local so the list persists across browser restarts. This data is not transmitted to the developer’s servers; there is no backend or analytics in the package.
```

**`nativeMessaging`**

```
Chromium cannot open native Windows file/folder dialogs by itself. If the user installs the optional local OpenMyFilesApps.Host.exe, the extension exchanges JSON messages only with that process on the same machine (ping, pick file/folder, launch paths). No messaging is sent to remote servers.
```

**`windows`** *(if shown)*

```
The toolbar button opens or focuses a popup-style window for the panel UI so it can be moved and resized. chrome.windows is used only to create and reuse that window, not to access unrelated browser data.
```

### Spanish (optional, si la consola está en español)

- **Finalidad única:** Misma idea: lista local de archivos/carpetas/URLs y ventana flotante; sin modificar páginas; en Windows, mensajería nativa opcional con ejecutable local para diálogos del sistema.
- **storage:** Persistencia con `chrome.storage.local`; sin envío a servidores del desarrollador.
- **nativeMessaging:** Solo proceso local `OpenMyFilesApps.Host.exe` en el mismo equipo; sin reenvío a servidores externos.
- **windows:** Ventana popup de la interfaz; solo crear/enfocar esa ventana.

## After publication — fixed extension ID

Once listed, the extension ID is **stable** for that store listing. Update the Windows helper / installer `allowed_origins` to include:

- `chrome-extension://<CHROME_STORE_ID>/`
- `chrome-extension://<EDGE_ADDONS_ID>/` (if different)

See [NATIVE_HOST.md](NATIVE_HOST.md) and [USER-SETUP.md](USER-SETUP.md).

## Listing assets (non-technical checklist)

- **Chrome Web Store — “Icono de Chrome Web Store” (required):** upload **`extension/icons/icon128.png`**. It is already **128×128** PNG, same artwork as the toolbar icon. [Image guidelines](https://developer.chrome.com/docs/webstore/images/).
- **Screenshots (Chrome):** **1280×800** or **640×400**, JPEG or **24-bit PNG**, **no alpha**. If your raw grabs are in `pantallazos/`, generate store-ready files with:
  ```powershell
  python .\pantallazos\prepare-chrome-store-screenshots.py
  ```
  Outputs **`pantallazos/chrome-web-store/*.png`** — each image is scaled to fit, centered on white, exact **1280×800**, **RGB**.
- **Screenshots (content):** prefer the UI **after** the Windows helper is set up for “happy path” shots; one optional shot can show first-time setup if you want transparency for users.
- **Promotional tiles (Chrome):** **Small** **440×280** and **marquee** **1400×560**, 24-bit PNG or JPEG, **no alpha**. Generate branded tiles from `extension/icons/icon128.png` — from repo root:
  ```powershell
  python .\pantallazos\prepare-chrome-promo-tiles.py
  ```
  Writes **`pantallazos/chrome-web-store/promo-small-440x280.png`** and **`promo-marquee-1400x560.png`** (same folder as screenshot exports).
- **Support / homepage:** `https://github.com/mapicallo/open-my-files-apps`
