const NATIVE_HOST = 'com.mapicallo.open_my_files_apps';
const STORAGE_KEY = 'omfaItems';
const LANG_KEY = 'omfaLang';
const DOCS_URL = 'https://github.com/mapicallo/open-my-files-apps/blob/main/docs/NATIVE_HOST.md';

const TRANSLATIONS = {
  en: {
    title: 'Open my files & apps',
    subtitle: 'One-click open for your files & apps',
    language: 'Language',
    addFile: 'Add file',
    addFolder: 'Add folder',
    addUrl: 'Add URL',
    openAll: 'Open all',
    openSelection: 'Open selection',
    includeInLaunch: 'Include in Open selection',
    nothingSelected: 'Check at least one item to use Open selection.',
    emptyHint:
      'Add files, folders, or URLs. Check rows to include them in Open selection; Open all runs every row. Windows helper required for file and folder picks.',
    footerNote: 'Drag the top bar to move. Resize this window like any app. Data stays on this device.',
    brand: 'AI4Context',
    hostMissingTitle: 'Windows helper not detected',
    hostMissingBody:
      'Install and register the native host, then reload this panel. See the repository instructions.',
    hostMissingLink: 'Setup guide',
    hostErrorDetail: 'Technical detail',
    kindFile: 'file',
    kindFolder: 'folder',
    kindUrl: 'url',
    rename: 'Rename',
    remove: 'Remove',
    up: 'Up',
    down: 'Down',
    promptUrl: 'URL (https://…)',
    promptLabel: 'Display name (optional)',
    errorsOpen: 'Some items failed to open',
    cancelled: 'Cancelled',
    versionPrefix: 'Version',
    close: 'Close'
  },
  es: {
    title: 'Open my files & apps',
    subtitle: 'Abre tus archivos y apps en un clic',
    language: 'Idioma',
    addFile: 'Añadir archivo',
    addFolder: 'Añadir carpeta',
    addUrl: 'Añadir URL',
    openAll: 'Abrir todo',
    openSelection: 'Abrir selección',
    includeInLaunch: 'Incluir en Abrir selección',
    nothingSelected: 'Marca al menos un elemento para usar Abrir selección.',
    emptyHint:
      'Añade archivos, carpetas o URLs. Marca filas para incluirlas en Abrir selección; Abrir todo ejecuta todas las filas. El asistente de Windows es necesario para archivos y carpetas.',
    footerNote: 'Arrastra la barra superior para mover. Redimensiona como cualquier ventana. Los datos quedan en este dispositivo.',
    brand: 'AI4Context',
    hostMissingTitle: 'No se detecta el asistente de Windows',
    hostMissingBody: 'Instala y registra el host nativo y recarga este panel. Ver instrucciones en el repositorio.',
    hostMissingLink: 'Guía de instalación',
    hostErrorDetail: 'Detalle técnico',
    kindFile: 'archivo',
    kindFolder: 'carpeta',
    kindUrl: 'url',
    rename: 'Renombrar',
    remove: 'Quitar',
    up: 'Subir',
    down: 'Bajar',
    promptUrl: 'URL (https://…)',
    promptLabel: 'Nombre visible (opcional)',
    errorsOpen: 'Algunos elementos no se pudieron abrir',
    cancelled: 'Cancelado',
    versionPrefix: 'Versión',
    close: 'Cerrar'
  }
};

let currentLang = 'en';
let items = [];
let hostAvailable = false;

function t(key) {
  return TRANSLATIONS[currentLang][key] ?? TRANSLATIONS.en[key] ?? key;
}

function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (key && TRANSLATIONS[currentLang][key]) el.textContent = TRANSLATIONS[currentLang][key];
  });
  document.documentElement.lang = currentLang === 'es' ? 'es' : 'en';
  const closeBtn = document.getElementById('btnClose');
  if (closeBtn) {
    closeBtn.setAttribute('aria-label', t('close'));
    closeBtn.setAttribute('title', t('close'));
  }
}

function nativeSend(message) {
  return new Promise((resolve, reject) => {
    try {
      chrome.runtime.sendNativeMessage(NATIVE_HOST, message, (response) => {
        const err = chrome.runtime.lastError;
        if (err) {
          reject(new Error(err.message));
          return;
        }
        resolve(response ?? {});
      });
    } catch (e) {
      reject(e);
    }
  });
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function checkHost() {
  const banner = document.getElementById('hostBanner');
  let detail = '';
  try {
    const res = await nativeSend({ op: 'ping' });
    hostAvailable = res && res.ok === true;
    if (hostAvailable) {
      banner.classList.add('host-banner--hidden');
      banner.innerHTML = '';
    }
  } catch (e) {
    hostAvailable = false;
    detail = e && e.message ? e.message : String(e);
  }

  if (!hostAvailable) {
    banner.classList.remove('host-banner--hidden');
    const detailBlock = detail
      ? `<p class="host-banner-detail"><span class="host-banner-detail-label">${t('hostErrorDetail')}:</span> <code>${escapeHtml(detail)}</code></p>`
      : '';
    banner.innerHTML = `
      <strong>${t('hostMissingTitle')}</strong>
      ${t('hostMissingBody')}
      <div style="margin-top:8px;">
        <a href="${DOCS_URL}" target="_blank" rel="noopener noreferrer">${t('hostMissingLink')}</a>
      </div>
      ${detailBlock}
    `;
  }
}

function normalizeStoredItems() {
  let changed = false;
  for (const item of items) {
    if (item.checked === undefined) {
      item.checked = true;
      changed = true;
    }
  }
  return changed;
}

async function loadState() {
  const data = await chrome.storage.local.get([STORAGE_KEY, LANG_KEY]);
  if (Array.isArray(data[STORAGE_KEY])) items = data[STORAGE_KEY];
  if (data[LANG_KEY] === 'es' || data[LANG_KEY] === 'en') {
    currentLang = data[LANG_KEY];
    document.getElementById('languageSelect').value = currentLang;
  }
  if (normalizeStoredItems()) {
    await saveState();
  }
}

async function saveState() {
  await chrome.storage.local.set({ [STORAGE_KEY]: items, [LANG_KEY]: currentLang });
}

function renderList() {
  const list = document.getElementById('itemList');
  const empty = document.getElementById('emptyState');
  list.innerHTML = '';

  if (!items.length) {
    empty.classList.remove('empty-state--hidden');
    return;
  }
  empty.classList.add('empty-state--hidden');

  items.forEach((item, index) => {
    const li = document.createElement('li');
    li.className = 'item-row';
    const kindLabel =
      item.kind === 'folder' ? t('kindFolder') : item.kind === 'url' ? t('kindUrl') : t('kindFile');
    const checked = item.checked !== false;
    li.innerHTML = `
      <label class="item-check">
        <input type="checkbox" class="item-include" ${checked ? 'checked' : ''} aria-label="${escapeHtml(t('includeInLaunch'))}" title="${escapeHtml(t('includeInLaunch'))}" />
      </label>
      <span class="item-kind">${kindLabel}</span>
      <div class="item-body">
        <div class="item-label"></div>
        <div class="item-target"></div>
      </div>
      <div class="item-actions">
        <button type="button" class="btn-tiny btn-move-up" title="${t('up')}">${t('up')}</button>
        <button type="button" class="btn-tiny btn-move-down" title="${t('down')}">${t('down')}</button>
      </div>
      <div class="item-actions">
        <button type="button" class="btn-tiny btn-rename">${t('rename')}</button>
        <button type="button" class="btn-tiny btn-tiny--danger btn-remove">${t('remove')}</button>
      </div>
    `;
    li.querySelector('.item-label').textContent = item.label || item.target;
    li.querySelector('.item-target').textContent = item.target;

    const cb = li.querySelector('.item-include');
    cb.addEventListener('change', () => {
      items[index].checked = cb.checked;
      saveState();
    });

    li.querySelector('.btn-move-up').addEventListener('click', () => moveItem(index, -1));
    li.querySelector('.btn-move-down').addEventListener('click', () => moveItem(index, 1));
    li.querySelector('.btn-rename').addEventListener('click', () => renameItem(index));
    li.querySelector('.btn-remove').addEventListener('click', () => removeItem(index));

    list.appendChild(li);
  });
}

function moveItem(index, delta) {
  const next = index + delta;
  if (next < 0 || next >= items.length) return;
  const tmp = items[index];
  items[index] = items[next];
  items[next] = tmp;
  saveState();
  renderList();
}

function renameItem(index) {
  const item = items[index];
  const next = window.prompt(t('rename'), item.label || item.target);
  if (next === null) return;
  const trimmed = next.trim();
  if (!trimmed) return;
  item.label = trimmed;
  saveState();
  renderList();
}

function removeItem(index) {
  items.splice(index, 1);
  saveState();
  renderList();
}

function addItem(kind, target, label) {
  const trimmedTarget = target.trim();
  if (!trimmedTarget) return;
  items.push({
    id: crypto.randomUUID(),
    kind,
    target: trimmedTarget,
    label: (label && label.trim()) || suggestLabel(kind, trimmedTarget),
    checked: true
  });
  saveState();
  renderList();
}

function suggestLabel(kind, target) {
  if (kind === 'url') {
    try {
      const u = new URL(target);
      return u.hostname.replace(/^www\./, '');
    } catch {
      return target;
    }
  }
  const base = target.split(/[/\\]/).filter(Boolean).pop();
  return base || target;
}

async function launchItems(entries) {
  const payload = {
    op: 'launch',
    items: entries.map((i) => ({ kind: i.kind, target: i.target }))
  };
  const res = await nativeSend(payload);
  if (res.errors && res.errors.length) {
    window.alert(`${t('errorsOpen')}:\n${res.errors.join('\n')}`);
  }
}

async function onPickFile() {
  if (!hostAvailable) {
    await checkHost();
    if (!hostAvailable) return;
  }
  try {
    const res = await nativeSend({ op: 'pickFile' });
    if (res.cancelled) return;
    if (!res.ok || !res.path) return;
    addItem('file', res.path, res.suggestedName || '');
  } catch (e) {
    console.warn(e);
    await checkHost();
  }
}

async function onPickFolder() {
  if (!hostAvailable) {
    await checkHost();
    if (!hostAvailable) return;
  }
  try {
    const res = await nativeSend({ op: 'pickFolder' });
    if (res.cancelled) return;
    if (!res.ok || !res.path) return;
    addItem('folder', res.path, res.suggestedName || '');
  } catch (e) {
    console.warn(e);
    await checkHost();
  }
}

function onAddUrl() {
  const url = window.prompt(t('promptUrl'));
  if (url === null) return;
  const trimmed = url.trim();
  if (!trimmed) return;
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  let label = window.prompt(t('promptLabel'), '');
  if (label === null) label = '';
  addItem('url', withScheme, label);
}

async function onOpenAll() {
  if (!hostAvailable) {
    await checkHost();
    if (!hostAvailable) return;
  }
  if (!items.length) return;
  try {
    await launchItems(items);
  } catch (e) {
    console.warn(e);
    await checkHost();
  }
}

async function onOpenSelection() {
  if (!hostAvailable) {
    await checkHost();
    if (!hostAvailable) return;
  }
  const selected = items.filter((i) => i.checked !== false);
  if (!selected.length) {
    window.alert(t('nothingSelected'));
    return;
  }
  try {
    await launchItems(selected);
  } catch (e) {
    console.warn(e);
    await checkHost();
  }
}

async function onLangChange(lang) {
  currentLang = lang === 'es' ? 'es' : 'en';
  await chrome.storage.local.set({ [LANG_KEY]: currentLang });
  applyI18n();
  initVersion();
  renderList();
  await checkHost();
}

function initVersion() {
  const manifest = chrome.runtime.getManifest();
  const el = document.getElementById('versionLabel');
  el.textContent = `${t('versionPrefix')} ${manifest.version}`;
}

document.getElementById('btnClose').addEventListener('click', () => window.close());
document.getElementById('btnPickFile').addEventListener('click', () => onPickFile());
document.getElementById('btnPickFolder').addEventListener('click', () => onPickFolder());
document.getElementById('btnAddUrl').addEventListener('click', () => onAddUrl());
document.getElementById('btnOpenAll').addEventListener('click', () => onOpenAll());
document.getElementById('btnOpenSelection').addEventListener('click', () => onOpenSelection());
document.getElementById('languageSelect').addEventListener('change', (e) => onLangChange(e.target.value));

(async function init() {
  await loadState();
  applyI18n();
  initVersion();
  renderList();
  await checkHost();
})();
