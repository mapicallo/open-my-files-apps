# Privacy policy — Open my files & apps

**Last updated:** 2026-03-31

## Summary

Open my files & apps is built so your data stays on your device. It does not send your lists, paths, or browsing activity to us or to third-party analytics.

## What the extension stores

- **Locally in your browser** (Chrome / Edge / Brave): the items you add (labels, paths, URLs, and checkbox state) using the `storage` API (`chrome.storage.local`). This data remains on your machine and is not synced to our servers (we do not operate a backend for this extension).

## Permissions

- **`storage`:** saves your list between sessions.
- **`nativeMessaging`:** talks only to an **optional** companion app you install on **Windows** (`OpenMyFilesApps.Host.exe`) so the browser can show native file/folder dialogs and open paths you chose. That channel is limited to your PC; we do not receive those messages.
- **`windows`:** opens the floating panel window when you click the toolbar icon.

## Windows helper (optional)

If you install the native host from [GitHub Releases](https://github.com/mapicallo/open-my-files-apps/releases), it runs only to handle picker dialogs and launch requests from the extension. It does not upload your file names or paths to us.

## Contact

- **Repository / issues:** [github.com/mapicallo/open-my-files-apps](https://github.com/mapicallo/open-my-files-apps)

For Chrome Web Store and Microsoft Edge Add-ons, use this page as the **privacy policy URL** (link to the file on GitHub):

`https://github.com/mapicallo/open-my-files-apps/blob/main/docs/PRIVACY.md`
