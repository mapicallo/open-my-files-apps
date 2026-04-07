# Native host (Windows)

The browser cannot show native file/folder dialogs or close desktop apps reliably. This extension uses **Native Messaging** to talk to `OpenMyFilesApps.Host.exe`.

## Build

Requirements: **.NET 8 SDK** (Windows), **.NET 8 Desktop Runtime** on machines that only run the published `exe` if you use `SelfContained=false`).

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

3. Restart the browser (or at least reload the extension) and open the panel again.

## Manifest file

Chrome and Edge read a registry key that points to a JSON file. The file format is documented in [Native messaging](https://developer.chrome.com/docs/extensions/mv3/nativeMessaging/). This project uses the host name `com.mapicallo.open_my_files_apps`.

## Security

- The host only handles messages from origins listed in `allowed_origins` (your extension ID).
- `launch` uses the paths the user previously added in the extension UI (plus native pickers). Review paths before sharing session exports in the future if you add backup features.

## Limitations (MVP)

- `Process.Start` with `UseShellExecute` may return `null`; those processes are not tracked for **Close session**.
- Some apps (e.g. extra `explorer.exe` windows) do not map 1:1 to a single `Process` handle; closing behavior may vary.
- **Close session** tries `CloseMainWindow`, waits, then `Kill` the process tree — use with care if unsaved work appears.
