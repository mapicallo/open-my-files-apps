# Open my files & apps

Chromium extension + **optional Windows native host**: save a list of **files, folders, and URLs**, then **open all** from a floating, draggable, resizable panel. You close opened apps yourself in Windows.

- **Repo:** [github.com/mapicallo/open-my-files-apps](https://github.com/mapicallo/open-my-files-apps)
- **Workspace local:** clona o trabaja en `C:\code\open-my-files-apps\` (junto al resto de extensiones en `C:\code\`).

## Pieces

| Part | Role |
|------|------|
| `extension/` | MV3 UI (`panel.html`), `storage`, Native Messaging client |
| `native-host/OpenMyFilesApps.Host/` | .NET 8 WinForms app: `ping`, file/folder pickers, `launch` |
| `scripts/dev-register-host.ps1` | Dev registration for Chromium browsers (current user) |
| `scripts/build-host.cmd` | Compila el `.exe` del host antes de registrar (usa **cmd** o doble clic) |

## Quick start (developers)

1. **Extension:** Chrome/Edge → Extensions → Developer mode → Load unpacked → select `extension/`.
2. **Host (.exe):** Instala **[.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)** (incluye `dotnet` en el PATH; cierra y abre **cmd** después de instalar). Luego **compila** antes de registrar:

   ```cmd
   cd C:\code\open-my-files-apps\scripts
   build-host.cmd
   ```

   O desde la raíz del repo:

   ```bash
   dotnet build native-host/OpenMyFilesApps.Host/OpenMyFilesApps.Host.csproj -c Release
   ```

   Si `dotnet` “no se reconoce”, el SDK no está instalado o PATH no está actualizado.

3. **Register native messaging** (ID de **32 caracteres** copiado de `chrome://extensions` / `edge://extensions`):

   **PowerShell** (`cd` a `scripts`):

   ```powershell
   .\dev-register-host.ps1 -ExtensionId "your_extension_id_here"
   .\verify-native-host.ps1
   ```

   **Símbolo del sistema (cmd):** no ejecutes `.ps1` con `.\`; usa por ejemplo:

   ```cmd
   cd C:\code\open-my-files-apps\scripts
   dev-register-host.cmd your_extension_id_here
   powershell -NoProfile -ExecutionPolicy Bypass -File .\verify-native-host.ps1
   ```

4. **Quit the browser fully** and reopen. If you see *Specified native messaging host not found*, you may be on **Edge/Chrome Beta, Dev or Canary** — the script registers all common channels; re-run it after `git pull`, then `verify-native-host.ps1` again.

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
