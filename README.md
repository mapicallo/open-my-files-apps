# Open my files & apps

Chromium extension + **optional Windows native host**: save a list of **files, folders, and URLs**, then **open all** or **close session** from a floating, draggable, resizable panel.

- **Repo:** [github.com/mapicallo/open-my-files-apps](https://github.com/mapicallo/open-my-files-apps)
- **Workspace local:** clona o trabaja en `C:\code\open-my-files-apps\` (junto al resto de extensiones en `C:\code\`).

## Pieces

| Part | Role |
|------|------|
| `extension/` | MV3 UI (`panel.html`), `storage`, Native Messaging client |
| `native-host/OpenMyFilesApps.Host/` | .NET 8 WinForms app: `ping`, file/folder pickers, `launch`, `closeSession` |
| `scripts/dev-register-host.ps1` | Dev registration for Chrome + Edge (current user) |

## Quick start (developers)

1. **Extension:** Chrome/Edge → Extensions → Developer mode → Load unpacked → select `extension/`.
2. **Host:** Install [.NET 8 SDK](https://dotnet.microsoft.com/download), then:

   ```bash
   dotnet build native-host/OpenMyFilesApps.Host/OpenMyFilesApps.Host.csproj -c Release
   ```

3. **Register native messaging** (replace ID with yours from `chrome://extensions`):

   ```powershell
   cd scripts
   .\dev-register-host.ps1 -ExtensionId "your_extension_id_here"
   ```

4. Reload the extension and open the toolbar icon — yellow banner should disappear when `ping` succeeds.

Package ZIP for store submission:

```powershell
.\scripts\package-extension.ps1
```

## UX

- **Floating window** (not a popup menu): move by dragging the **top bar** (`-webkit-app-region: drag`), **resize** with window edges, **×** closes the window.
- **Footer:** **AI4Context** link + **Version** from `manifest.json`.
- **Languages:** English / Español (selector in header).

## Docs

- [Native host details](docs/NATIVE_HOST.md)

## License

Specify in a `LICENSE` file when you publish the GitHub repo.
