const NATIVE_HOST = 'com.mapicallo.open_my_files_apps';
const STORAGE_KEY = 'omfaItems';
const LANG_KEY = 'omfaLang';
const DOCS_URL = 'https://github.com/mapicallo/open-my-files-apps/blob/main/docs/NATIVE_HOST.md';
const RELEASES_URL = 'https://github.com/mapicallo/open-my-files-apps/releases/latest';
/** Must match the asset name attached to GitHub Releases (see .github/workflows/release-host.yml). */
const HOST_EXE_DOWNLOAD_URL =
  'https://github.com/mapicallo/open-my-files-apps/releases/latest/download/OpenMyFilesApps.Host.exe';

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
    hostMissingLead:
      'Connect the small Windows program once. No extension ID to copy — the installer already matches this browser.',
    setupStepEasy1: 'Click the purple button and save the file (Downloads is fine).',
    setupStepEasy2:
      'Double-click the downloaded .cmd. If Windows shows SmartScreen, use “More info” → “Run anyway”.',
    setupStepEasy3: 'Close every browser window, reopen Chrome / Edge / Brave, and open this panel again.',
    setupDownloadCmdBtn: 'Download installer (double-click)',
    setupDownloadPs1Btn: 'PowerShell script instead (.ps1)',
    setupDownloadManualBtn: 'Already have the .exe? Register only',
    setupHostExeLink: 'Host .exe only (advanced)',
    setupSelfContainedNote:
      'The helper from GitHub is self-contained — you do not need to install .NET separately.',
    hostMissingLink: 'Technical details (developers)',
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
    versionPrefix: 'Version'
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
    hostMissingLead:
      'Conecta el programa de Windows una vez. No hace falta copiar el ID: el instalador ya corresponde a este navegador.',
    setupStepEasy1: 'Pulsa el botón morado y guarda el archivo (por ejemplo en Descargas).',
    setupStepEasy2:
      'Doble clic al .cmd descargado. Si sale SmartScreen, “Más información” → “Ejecutar de todas formas”.',
    setupStepEasy3: 'Cierra todas las ventanas del navegador, ábrelo de nuevo y vuelve a este panel.',
    setupDownloadCmdBtn: 'Descargar instalador (doble clic)',
    setupDownloadPs1Btn: 'Alternativa: script PowerShell (.ps1)',
    setupDownloadManualBtn: 'Ya tengo el .exe — solo registrar',
    setupHostExeLink: 'Solo el .exe (avanzado)',
    setupSelfContainedNote:
      'La versión de GitHub es autocontenida: no hace falta instalar .NET aparte.',
    hostMissingLink: 'Detalles técnicos (desarrolladores)',
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
    versionPrefix: 'Versión'
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

/** Downloads OpenMyFilesApps.Host.exe from GitHub Releases, then registers (extension ID embedded). */
function buildAutoDownloadSetupScript() {
  const extId = chrome.runtime.id;
  const url = HOST_EXE_DOWNLOAD_URL;
  return `# Open my files & apps - one-step Windows setup (generated for this browser install)
# Downloads the helper from GitHub and registers native messaging. Run via the .cmd (double-click) or: Right-click this file - Run with PowerShell.

$ErrorActionPreference = "Stop"
$ExtensionId = "${extId}"
$HostExeDownloadUrl = "${url}"
$ManifestDir = Join-Path $env:LOCALAPPDATA "OpenMyFilesApps"
New-Item -ItemType Directory -Force -Path $ManifestDir | Out-Null
$HostExe = Join-Path $ManifestDir "OpenMyFilesApps.Host.exe"

Write-Host "Downloading helper..."
try {
  [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
} catch { }
try {
  Invoke-WebRequest -Uri $HostExeDownloadUrl -OutFile $HostExe -UseBasicParsing
} catch {
  Write-Host ""
  Write-Host "Download failed. Check your connection or firewall."
  Write-Host "You can also open Releases in the browser:"
  Write-Host "  https://github.com/mapicallo/open-my-files-apps/releases/latest"
  Write-Host "Save OpenMyFilesApps.Host.exe next to a manually downloaded register script from this panel."
  Write-Host ""
  Read-Host "Press Enter to exit"
  exit 1
}

if (-not (Test-Path -LiteralPath $HostExe) -or (Get-Item -LiteralPath $HostExe).Length -lt 1024) {
  Write-Host "Download looks invalid. Try again or install manually from GitHub Releases."
  Read-Host "Press Enter to exit"
  exit 1
}

try {
  Unblock-File -LiteralPath $HostExe -ErrorAction SilentlyContinue
} catch { }

$HostExe = [System.IO.Path]::GetFullPath($HostExe)
$ManifestPath = Join-Path $ManifestDir "com.mapicallo.open_my_files_apps.json"

$obj = [ordered]@{
  name = "com.mapicallo.open_my_files_apps"
  description = "Native host for Open my files & apps"
  path = $HostExe
  type = "stdio"
  allowed_origins = @("chrome-extension://$ExtensionId/")
}
$json = $obj | ConvertTo-Json -Compress -Depth 5
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($ManifestPath, $json, $utf8NoBom)

$nmh = "com.mapicallo.open_my_files_apps"
$parents = @(
  "HKCU:\\Software\\Google\\Chrome\\NativeMessagingHosts",
  "HKCU:\\Software\\Google\\Chrome Beta\\NativeMessagingHosts",
  "HKCU:\\Software\\Google\\Chrome Dev\\NativeMessagingHosts",
  "HKCU:\\Software\\Google\\Chrome SxS\\NativeMessagingHosts",
  "HKCU:\\Software\\Microsoft\\Edge\\NativeMessagingHosts",
  "HKCU:\\Software\\Microsoft\\Edge Beta\\NativeMessagingHosts",
  "HKCU:\\Software\\Microsoft\\Edge Dev\\NativeMessagingHosts",
  "HKCU:\\Software\\Microsoft\\Edge SxS\\NativeMessagingHosts",
  "HKCU:\\Software\\BraveSoftware\\Brave-Browser\\NativeMessagingHosts"
)

foreach ($parent in $parents) {
  $fullKey = Join-Path $parent $nmh
  New-Item -Path $fullKey -Force | Out-Null
  Set-ItemProperty -LiteralPath $fullKey -Name "(default)" -Value $ManifestPath -Type String
}

Write-Host ""
Write-Host "Done. Registered for $($parents.Count) browser locations."
Write-Host "Host:     $HostExe"
Write-Host "Manifest: $ManifestPath"
Write-Host ""
Write-Host "Close EVERY browser window, then reopen."
Read-Host "Press Enter"
`;
}

/** Batch header + same PowerShell body: user double-clicks .cmd, no "Run with PowerShell" step. */
function buildHybridCmdInstall() {
  const ps = buildAutoDownloadSetupScript();
  return (
    `@ECHO OFF\r\n` +
    `powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "Get-Content -LiteralPath '%~f0' | Select-Object -Skip 3 | Out-String | Invoke-Expression"\r\n` +
    `exit /b\r\n` +
    ps
  );
}

function downloadHybridCmd() {
  const text = buildHybridCmdInstall();
  // No UTF-8 BOM: a leading BOM can break the batch parser on some Windows setups.
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  const url = URL.createObjectURL(blob);
  a.href = url;
  a.download = 'OpenMyFilesApps-Install-Windows.cmd';
  a.click();
  URL.revokeObjectURL(url);
}

function downloadAutoSetupScript() {
  const text = buildAutoDownloadSetupScript();
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  const url = URL.createObjectURL(blob);
  a.href = url;
  a.download = 'OpenMyFilesApps-Install-Windows.ps1';
  a.click();
  URL.revokeObjectURL(url);
}

/** PowerShell one-time registration; extension ID embedded; host .exe must sit next to this .ps1. */
function buildUserSetupScript() {
  const extId = chrome.runtime.id;
  return `# Open my files & apps - Windows helper registration (generated for this browser install)
# Before running: place OpenMyFilesApps.Host.exe in the SAME folder as this .ps1

$ErrorActionPreference = "Stop"
$ExtensionId = "${extId}"
$HostExe = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot "OpenMyFilesApps.Host.exe"))

if (-not (Test-Path -LiteralPath $HostExe)) {
    Write-Host ""
    Write-Host "OpenMyFilesApps.Host.exe not found next to this script."
    Write-Host "Download: https://github.com/mapicallo/open-my-files-apps/releases/latest"
    Write-Host "Save the .exe in the same folder as this .ps1, then run again."
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

$ManifestDir = Join-Path $env:LOCALAPPDATA "OpenMyFilesApps"
New-Item -ItemType Directory -Force -Path $ManifestDir | Out-Null
$ManifestPath = Join-Path $ManifestDir "com.mapicallo.open_my_files_apps.json"

$obj = [ordered]@{
  name = "com.mapicallo.open_my_files_apps"
  description = "Native host for Open my files & apps"
  path = $HostExe
  type = "stdio"
  allowed_origins = @("chrome-extension://$ExtensionId/")
}
$json = $obj | ConvertTo-Json -Compress -Depth 5
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($ManifestPath, $json, $utf8NoBom)

$nmh = "com.mapicallo.open_my_files_apps"
$parents = @(
  "HKCU:\\Software\\Google\\Chrome\\NativeMessagingHosts",
  "HKCU:\\Software\\Google\\Chrome Beta\\NativeMessagingHosts",
  "HKCU:\\Software\\Google\\Chrome Dev\\NativeMessagingHosts",
  "HKCU:\\Software\\Google\\Chrome SxS\\NativeMessagingHosts",
  "HKCU:\\Software\\Microsoft\\Edge\\NativeMessagingHosts",
  "HKCU:\\Software\\Microsoft\\Edge Beta\\NativeMessagingHosts",
  "HKCU:\\Software\\Microsoft\\Edge Dev\\NativeMessagingHosts",
  "HKCU:\\Software\\Microsoft\\Edge SxS\\NativeMessagingHosts",
  "HKCU:\\Software\\BraveSoftware\\Brave-Browser\\NativeMessagingHosts"
)

foreach ($parent in $parents) {
  $fullKey = Join-Path $parent $nmh
  New-Item -Path $fullKey -Force | Out-Null
  Set-ItemProperty -LiteralPath $fullKey -Name "(default)" -Value $ManifestPath -Type String
}

Write-Host ""
Write-Host "Done. Registered for $($parents.Count) browser locations."
Write-Host "Manifest: $ManifestPath"
Write-Host "Host:     $HostExe"
Write-Host ""
Write-Host "Close EVERY browser window, then reopen."
Read-Host "Press Enter"
`;
}

function downloadUserSetupScript() {
  const text = buildUserSetupScript();
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  const url = URL.createObjectURL(blob);
  a.href = url;
  a.download = 'OpenMyFilesApps-Setup-Offline.ps1';
  a.click();
  URL.revokeObjectURL(url);
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
      <strong>${escapeHtml(t('hostMissingTitle'))}</strong>
      <p class="host-banner-lead">${escapeHtml(t('hostMissingLead'))}</p>
      <ol class="host-setup-steps">
        <li>${escapeHtml(t('setupStepEasy1'))}</li>
        <li>${escapeHtml(t('setupStepEasy2'))}</li>
        <li>${escapeHtml(t('setupStepEasy3'))}</li>
      </ol>
      <div class="host-banner-actions host-banner-actions--stack">
        <button type="button" class="btn btn-setup-banner" id="btnDownloadSetupCmd">${escapeHtml(t('setupDownloadCmdBtn'))}</button>
        <button type="button" class="btn btn-setup-banner-secondary btn-setup-banner--ghost" id="btnDownloadSetupPs1">${escapeHtml(
          t('setupDownloadPs1Btn')
        )}</button>
        <button type="button" class="btn btn-setup-banner-secondary btn-setup-banner--ghost" id="btnDownloadSetup">${escapeHtml(
          t('setupDownloadManualBtn')
        )}</button>
        <a class="btn btn-setup-banner-secondary" href="${RELEASES_URL}" target="_blank" rel="noopener noreferrer">${escapeHtml(t('setupHostExeLink'))}</a>
      </div>
      <p class="host-banner-runtime">${escapeHtml(t('setupSelfContainedNote'))}</p>
      <div class="host-banner-dev-link">
        <a href="${DOCS_URL}" target="_blank" rel="noopener noreferrer">${escapeHtml(t('hostMissingLink'))}</a>
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

document.getElementById('btnPickFile').addEventListener('click', () => onPickFile());
document.getElementById('btnPickFolder').addEventListener('click', () => onPickFolder());
document.getElementById('btnAddUrl').addEventListener('click', () => onAddUrl());
document.getElementById('btnOpenAll').addEventListener('click', () => onOpenAll());
document.getElementById('btnOpenSelection').addEventListener('click', () => onOpenSelection());
document.getElementById('languageSelect').addEventListener('change', (e) => onLangChange(e.target.value));

document.getElementById('hostBanner').addEventListener('click', (e) => {
  const el = e.target;
  if (el && el.id === 'btnDownloadSetupCmd') {
    e.preventDefault();
    downloadHybridCmd();
    return;
  }
  if (el && el.id === 'btnDownloadSetupPs1') {
    e.preventDefault();
    downloadAutoSetupScript();
    return;
  }
  if (el && el.id === 'btnDownloadSetup') {
    e.preventDefault();
    downloadUserSetupScript();
  }
});

(async function init() {
  await loadState();
  applyI18n();
  initVersion();
  renderList();
  await checkHost();
})();
