# Setup for everyday users (Windows)

This extension can open **real files and folders** on your PC. A small **Windows helper** must be connected **once**. You do **not** copy an extension ID: the panel downloads a script that already includes it.

## Recommended (fewest steps)

1. Install the extension and open its panel. If you see the **yellow banner**, continue.
2. Click **Download installer (double-click)** and save `OpenMyFilesApps-Install-Windows.cmd` anywhere (e.g. Downloads).
3. **Double-click** the `.cmd`. A PowerShell window will run briefly: it **downloads** `OpenMyFilesApps.Host.exe` from GitHub (self-contained, **no separate .NET install**), registers it, and finishes. If **SmartScreen** appears, use **More info** → **Run anyway**.
4. **Close every browser window**, reopen Chrome / Edge / Brave, and open the panel again.

**Alternative:** use **PowerShell script instead (.ps1)** in the panel if your organisation blocks `.cmd` or you prefer **Run with PowerShell** on the `.ps1` file.

Maintainers attach **`OpenMyFilesApps.Host.exe`** to each [GitHub Release](https://github.com/mapicallo/open-my-files-apps/releases/latest). If download fails (no release yet or offline), use the manual path below.

## Manual / offline (you already have the .exe)

1. Download `OpenMyFilesApps.Host.exe` from [Releases](https://github.com/mapicallo/open-my-files-apps/releases/latest).
2. Put it in a folder.
3. In the panel, use **Already have the .exe? Register only** and save `OpenMyFilesApps-Setup-Offline.ps1` **next to** the `.exe`.
4. Run that `.ps1` with PowerShell, then fully quit and reopen the browser.

## .NET runtime

**Published** `OpenMyFilesApps.Host.exe` on GitHub Releases is **self-contained** — end users do not install .NET.

If you **compile the host yourself** with `dotnet build` / non-self-contained publish, you need the **[.NET 8 Desktop Runtime](https://dotnet.microsoft.com/download/dotnet/8.0)** on that machine.

## Problems?

- If double-clicking the `.cmd` does nothing, try the **.ps1** button instead, then:  
  `powershell -ExecutionPolicy Bypass -File .\OpenMyFilesApps-Install-Windows.ps1`
- Developers: [NATIVE_HOST.md](NATIVE_HOST.md)
