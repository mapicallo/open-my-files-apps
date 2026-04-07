# Native host (Windows)

The browser cannot show native file/folder dialogs or close desktop apps reliably. This extension uses **Native Messaging** to talk to `OpenMyFilesApps.Host.exe`.

## Build

Requirements: **.NET 8 SDK** (Windows), **.NET 8 Desktop Runtime** on machines that only run the published `exe` if you use `SelfContained=false`).

From repo, using **cmd** in `scripts/`:

```cmd
build-host.cmd
```

Or manually:

```bash
cd native-host/OpenMyFilesApps.Host
dotnet build -c Release
```

Or publish a folder for distribution:

```bash
dotnet publish -c Release -r win-x64 --self-contained false
```

The output executable path is used in the JSON manifest `path` field.

## Register (development)

1. Load the extension **unpacked** from `extension/` and copy the **extension ID** from `chrome://extensions`.
2. From repo root:

```powershell
cd scripts
.\dev-register-host.ps1 -ExtensionId "YOUR_32_CHAR_EXTENSION_ID"
```

If your `OpenMyFilesApps.Host.exe` is not in the default build output, pass `-HostExe` with a full path.

3. **Quit the browser completely** and open it again (not only “reload extension”). Native Messaging hosts are read at startup.
4. **Re-run** `dev-register-host.ps1` whenever your **unpacked extension ID changes** (another folder or new load) — the ID must match `allowed_origins` in the JSON manifest.

### If the panel still shows “Windows helper not detected”

- **Detail under the banner:** the extension now shows Chrome’s error text (e.g. “Specified native messaging host not found” = registry/manifest path wrong; “Forbidden” / access = **wrong extension ID** in the manifest).
- Confirm the **ID** on `chrome://extensions` (Developer mode) is exactly what you passed to `-ExtensionId` — **32 characters**, no `chrome-extension://` prefix.
- Confirm the file exists: `%LOCALAPPDATA%\OpenMyFilesApps\com.mapicallo.open_my_files_apps.json` and that `"path"` points to a real `OpenMyFilesApps.Host.exe`.
- **Edge / Chrome channel:** Stable, Beta, Dev and Canary (SxS) use **different registry roots**. The current `dev-register-host.ps1` registers the same manifest under Chrome, Edge, and Brave families so “**Specified native messaging host not found**” goes away if you were only registered on stable but use **Edge Dev** or **Chrome Canary**, etc.
- After registering, run **`scripts\verify-native-host.ps1`** in PowerShell to confirm the manifest path, that `OpenMyFilesApps.Host.exe` exists, and which browser hives point at your JSON.
- Install **[.NET 8 Runtime](https://dotnet.microsoft.com/download/dotnet/8.0)** (Desktop) if `OpenMyFilesApps.Host.exe` fails to start when run manually.

## Manifest file

Chrome and Edge read a registry key that points to a JSON file. The file format is documented in [Native messaging](https://developer.chrome.com/docs/extensions/mv3/nativeMessaging/). This project uses the host name `com.mapicallo.open_my_files_apps`.

## Security

- The host only handles messages from origins listed in `allowed_origins` (your extension ID).
- `launch` uses the paths the user previously added in the extension UI (plus native pickers). Review paths before sharing session exports in the future if you add backup features.

## Limitations (MVP)

- `Process.Start` with `UseShellExecute` may return `null`; those processes are not tracked for **Close session**.
- Some apps (e.g. extra `explorer.exe` windows) do not map 1:1 to a single `Process` handle; closing behavior may vary.
- **Close session** tries `CloseMainWindow`, waits, then `Kill` the process tree — use with care if unsaved work appears.
