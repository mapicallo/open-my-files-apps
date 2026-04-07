const PANEL_URL = 'panel.html';

chrome.action.onClicked.addListener(async () => {
  const url = chrome.runtime.getURL(PANEL_URL);
  const windows = await chrome.windows.getAll({ populate: true });

  for (const win of windows) {
    if (!win.tabs?.length) continue;
    for (const tab of win.tabs) {
      if (tab.url === url && typeof win.id === 'number') {
        await chrome.windows.update(win.id, { focused: true });
        if (tab.id) await chrome.tabs.update(tab.id, { active: true });
        return;
      }
    }
  }

  await chrome.windows.create({
    url: PANEL_URL,
    type: 'popup',
    width: 448,
    height: 640,
    left: 72,
    top: 72,
    focused: true
  });
});
