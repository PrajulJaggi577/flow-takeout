'use strict';

const HAS_PICKER = 'showDirectoryPicker' in window;
const IMG_RE = /\.(jpe?g|png|webp|gif)$/i;
const VID_RE = /\.(mp4|webm|mov)$/i;
const MEDIA_RE = /\.(jpe?g|png|webp|gif|mp4|webm|mov)$/i;
const GAP = 16;
const GAP_ROW = 28;
const CAP_H = 46;
const BAND = 1200;
const THUMB_MAX = 520;
const THUMB_JOBS = 3;

const COLOURS = ['red', 'blue', 'green', 'black', 'white', 'yellow', 'pink', 'purple', 'orange', 'brown', 'grey', 'gray', 'beige', 'navy', 'gold', 'silver'];
const COLOUR_RE = new RegExp(`\\b(${COLOURS.join('|')})\\b`, 'gi');
const FILTER0 = {
  type: '',
  model: '',
  period: ''
};
const SIZE = {
  columns: 260,
  grid: 200,
  mixed: 220
};

const ICONS = {
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>',
  folder: '<path d="M3 7.5a2 2 0 0 1 2-2h4l2 2.2h8a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  theme: '<circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor"/>',
  more: '<circle cx="5" cy="12" r="1.4" fill="currentColor"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/><circle cx="19" cy="12" r="1.4" fill="currentColor"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  left: '<path d="M15 6l-6 6 6 6"/>',
  right: '<path d="M9 6l6 6-6 6"/>',
  star: '<path d="M12 4l2.4 5 5.4.7-4 3.7 1 5.4L12 16.3 7.2 18.8l1-5.4-4-3.7 5.4-.7z"/>',
  starOn: '<path d="M12 4l2.4 5 5.4.7-4 3.7 1 5.4L12 16.3 7.2 18.8l1-5.4-4-3.7 5.4-.7z" fill="currentColor"/>',
  expand: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
  shrink: '<path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5"/><path d="M12 7.8v.2"/>',
  download: '<path d="M12 4v11M7 10.5l5 5 5-5M5 20h14"/>',
  copy: '<rect x="8" y="8" width="11" height="11" rx="2"/><path d="M16 8V6.5A1.5 1.5 0 0 0 14.5 5h-8A1.5 1.5 0 0 0 5 6.5v8A1.5 1.5 0 0 0 6.5 16H8"/>',
  trash: '<path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12"/>',
  hide: '<path d="M3 3l18 18"/><path d="M10.6 6.2A9.6 9.6 0 0 1 12 6c5 0 9 6 9 6a15 15 0 0 1-2.4 2.9"/><path d="M6.6 6.6C4 8.3 3 12 3 12s4 6 9 6a9 9 0 0 0 4.4-1.2"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  album: '<rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/>',
  photos: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-8 9"/>',
  video: '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3z"/>',
  play: '<path d="M8 5v14l11-7z" fill="currentColor"/>',
};
const icon = (n) => `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n] || ''}</svg>`;

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
} [c]));
const uniq = (a) => [...new Set(a)];
const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
const ymd = (ts) => {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const monthName = (m) => new Date(`${m}-01T12:00`).toLocaleDateString(undefined, {
  month: 'long'
});
const fmtDate = (ts) => (ts ? new Date(ts).toLocaleDateString(undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric'
}) : 'No date');
const fmtBytes = (n) => (n > 1e9 ? `${(n / 1e9).toFixed(1)} GB` : n > 1e6 ? `${(n / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1e3))} KB`);
const optsOf = (pairs, cur) => pairs.map(([v, l]) => `<option value="${esc(v)}"${v === cur ? ' selected' : ''}>${esc(l)}</option>`).join('');
const debounce = (fn, ms) => {
  let t;
  return (...a) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...a), ms);
  };
};

const DB = (() => {
  let db = null;
  const open = () => new Promise((res, rej) => {
    const r = indexedDB.open('flow', 1);
    r.onupgradeneeded = () => ['meta', 'thumbs', 'user', 'handles'].forEach((n) => r.result.createObjectStore(n));
    r.onsuccess = () => {
      db = r.result;
      res();
    };
    r.onerror = () => rej(r.error);
    r.onblocked = () => rej(new Error('database blocked'));
  });
  const tx = (store, mode, fn) => (!db ? Promise.resolve(undefined) : new Promise((res, rej) => {
    const t = db.transaction(store, mode);
    const q = fn(t.objectStore(store));
    t.oncomplete = () => res(q ? q.result : undefined);
    t.onerror = () => rej(t.error);
    t.onabort = () => rej(t.error);
  }));
  return {
    open,
    get: (s, k) => tx(s, 'readonly', (o) => o.get(k)),
    put: (s, k, v) => tx(s, 'readwrite', (o) => o.put(v, k)),
    del: (s, k) => tx(s, 'readwrite', (o) => o.delete(k)),
    keys: (s) => tx(s, 'readonly', (o) => o.getAllKeys()),
    all: (s) => tx(s, 'readonly', (o) => o.getAll()),
    clear: (s) => tx(s, 'readwrite', (o) => o.clear()),
  };
})();

const S = {
  items: [],
  byId: new Map(),
  user: new Map(),
  albums: [],
  prefs: {},
  root: null,
  needsPerm: false,
  files: new Map(),
  page: {
    name: 'photos',
    arg: ''
  },
  base: null,
  metaExtra: '',
  layout: 'columns',
  size: SIZE.columns,
  sort: 'newest',
  q: '',
  f: {
    ...FILTER0
  },
  showHidden: false,
  sel: new Set(),
  list: [],
  lastList: [],
  noticeShown: false,
  dupGroups: null,
};
const V = {
  ids: [],
  i: 0,
  url: null,
  zoom: false,
  token: null
};
const LAY = {
  blocks: [],
  bands: new Map(),
  mounted: new Map(),
  height: 0
};

const U = (id) => S.user.get(id) || {};
const isFav = (it) => U(it.id).fav ?? it.takeoutFav;
const hayCache = new Map();

function setU(id, patch) {
  const rec = {
    ...U(id),
    ...patch
  };
  S.user.set(id, rec);
  hayCache.delete(id);
  DB.put('user', id, rec);
}
const saveAlbums = () => DB.put('user', '__albums', S.albums);

function parseDate(s) {
  if (!s) return null;
  const m = String(s).trim().match(/^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2}(?::\d{2})?)(?:\.(\d+))?\s*(Z|[+-]\d{2}(?::?\d{2})?)?$/);
  if (!m) {
    const t = Date.parse(s);
    return isNaN(t) ? null : t;
  }
  let tz = m[4] || '';
  if (tz && tz !== 'Z') tz = tz.includes(':') ? tz : /^[+-]\d{2}$/.test(tz) ? `${tz}:00` : `${tz.slice(0, 3)}:${tz.slice(3)}`;
  const sec = m[2].length === 5 ? `${m[2]}:00` : m[2];
  const frac = m[3] ? `.${m[3].slice(0, 3).padEnd(3, '0')}` : '';
  const t = Date.parse(`${m[1]}T${sec}${frac}${tz}`);
  return isNaN(t) ? null : t;
}

/* Width and height from the file's own header: only the first bytes are read. */
async function readDims(file) {
  const buf = new Uint8Array(await file.slice(0, 98304).arrayBuffer());
  const dv = new DataView(buf.buffer);
  if (buf[0] === 0x89 && buf[1] === 0x50) return {
    w: dv.getUint32(16),
    h: dv.getUint32(20)
  };
  if (buf[0] === 0x47 && buf[1] === 0x49) return {
    w: dv.getUint16(6, true),
    h: dv.getUint16(8, true)
  };
  if (buf[0] === 0x52 && buf[1] === 0x49 && buf[8] === 0x57 && buf[9] === 0x45) {
    const tag = String.fromCharCode(buf[12], buf[13], buf[14], buf[15]);
    if (tag === 'VP8X') return {
      w: 1 + (buf[24] | (buf[25] << 8) | (buf[26] << 16)),
      h: 1 + (buf[27] | (buf[28] << 8) | (buf[29] << 16))
    };
    if (tag === 'VP8 ') return {
      w: dv.getUint16(26, true) & 0x3fff,
      h: dv.getUint16(28, true) & 0x3fff
    };
    if (tag === 'VP8L') {
      const b = dv.getUint32(21, true);
      return {
        w: (b & 0x3fff) + 1,
        h: ((b >> 14) & 0x3fff) + 1
      };
    }
    return null;
  }
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i + 9 < buf.length) {
      if (buf[i] !== 0xff) {
        i++;
        continue;
      }
      const m = buf[i + 1];
      if (m === 0xff) {
        i++;
        continue;
      }
      if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) {
        return {
          h: dv.getUint16(i + 5),
          w: dv.getUint16(i + 7)
        };
      }
      const len = dv.getUint16(i + 2);
      if (len < 2) break;
      i += 2 + len;
    }
  }
  return null;
}

function derive(it) {
  it.ts = parseDate(it.createdAt);
  const r = it.width && it.height ? it.width / it.height : (it.isVideo ? 16 / 9 : 4 / 3);
  it.ratio = Math.min(3, Math.max(0.33, r));
  it.smart = uniq(((it.prompt || '').match(COLOUR_RE) || []).map((c) => c.toLowerCase()));
  return it;
}

function hay(it) {
  let h = hayCache.get(it.id);
  if (h === undefined) {
    const u = U(it.id);
    h = [it.prompt, it.model, it.project, it.collection, it.file, it.source, u.notes, ...(u.tags || []), ...it.smart]
      .filter(Boolean).join(' ').toLowerCase();
    hayCache.set(it.id, h);
  }
  return h;
}
const tagsOf = (it) => [...(U(it.id).tags || []), ...it.smart].map((t) => t.toLowerCase());

function parseQuery(q) {
  const inc = [],
    exc = [],
    tags = [];
  for (const t of q.toLowerCase().split(/\s+/).filter(Boolean)) {
    if (t[0] === '#' && t.length > 1) tags.push(t.slice(1));
    else if (t[0] === '-' && t.length > 1) exc.push(t.slice(1));
    else inc.push(t);
  }
  return {
    inc,
    exc,
    tags
  };
}

function applyFilters(base) {
  const Q = parseQuery(S.q);
  const f = S.f;
  return base.filter((it) => {
    if (!S.showHidden && U(it.id).hidden) return false;
    if (f.type === 'photo' && it.isVideo) return false;
    if (f.type === 'video' && !it.isVideo) return false;
    if (f.model && it.model !== f.model) return false;
    if (f.period && !(it.ts && ymd(it.ts).startsWith(f.period))) return false;
    const h = hay(it),
      tg = tagsOf(it);
    return Q.inc.every((t) => h.includes(t)) &&
      !Q.exc.some((t) => h.includes(t)) &&
      Q.tags.every((t) => tg.includes(t));
  });
}

function sortItems(list) {
  const dir = S.sort === 'oldest' ? 1 : -1;
  return list.slice().sort((a, b) => (a.ts == null) - (b.ts == null) || (a.ts == null ? 0 : dir * (a.ts - b.ts)));
}

async function* walk(dir, prefix = '') {
  for await (const [name, h] of dir.entries()) {
    const path = prefix + name;
    if (h.kind === 'directory') yield* walk(h, `${path}/`);
    else yield {
      path,
      get: () => h.getFile()
    };
  }
}

async function dirOf(it) {
  let d = S.root;
  for (const seg of (it.dir || '').split('/').filter(Boolean)) d = await d.getDirectoryHandle(seg);
  return d;
}

async function fileOf(it) {
  if (S.files.has(it.id)) return S.files.get(it.id);
  if (!S.root) return null;
  try {
    const f = await (await (await dirOf(it)).getFileHandle(it.file)).getFile();
    S.files.set(it.id, f);
    return f;
  } catch {
    return null;
  }
}

async function scan(src) {
  progress('Reading folder');
  const entries = [];
  for await (const e of src) entries.push(e);

  const base = (p) => p.split('/').pop();
  const inMedia = (p) => /(^|\/)media\//i.test(p);
  let media = entries.filter((e) => MEDIA_RE.test(e.path) && inMedia(e.path));
  if (!media.length) media = entries.filter((e) => MEDIA_RE.test(e.path));

  const jsonOf = async (e) => {
    try {
      return JSON.parse(await (await e.get()).text());
    } catch {
      return null;
    }
  };
  const named = (n) => entries.find((e) => base(e.path).toLowerCase() === n);
  const projects = {},
    collections = {},
    editPrompt = new Map(),
    infoBy = new Map();

  const pj = named('projects.json');
  for (const p of ((pj && await jsonOf(pj))?.projects || [])) projects[p.projectId] = p.name;
  const cj = named('collections.json');
  for (const c of ((cj && await jsonOf(cj))?.collections || [])) collections[c.collectionId] = c.name;
  const ej = named('edit_stacks.json');
  for (const s of ((ej && await jsonOf(ej))?.editStacks || [])) {
    for (const m of s.editStackMedia || [])
      if (m.prompt) editPrompt.set(m.mediaId, m.prompt);
  }
  for (const e of entries.filter((x) => /_metadata\.json$/i.test(x.path))) {
    for (const en of (await jsonOf(e))?.mediaEntries || []) infoBy.set(String(en.mediaId), en);
  }

  const items = [],
    seen = new Set();
  let n = 0;
  for (const e of media) {
    n++;
    if (n % 20 === 0 || n === media.length) progress('Reading photos', n, media.length);
    const file = await e.get();
    const stem = file.name.replace(MEDIA_RE, '');
    const info = infoBy.get(stem) || null;
    let id = stem;
    if (seen.has(id)) id = `${stem}-${n}`;
    seen.add(id);
    const isVideo = VID_RE.test(file.name);
    let width = info?.dimensions?.width || 0;
    let height = info?.dimensions?.height || 0;
    if (!width && IMG_RE.test(file.name)) {
      const d = await readDims(file).catch(() => null);
      if (d) {
        width = d.w;
        height = d.h;
      }
    }
    S.files.set(id, file);
    items.push(derive({
      id,
      file: file.name,
      dir: e.path.split('/').slice(0, -1).join('/'),
      key: `${file.name}|${file.size}|${file.lastModified}`,
      size: file.size,
      isVideo,
      createdAt: info?.createdAt || null,
      prompt: info?.generationInputs?.prompt || editPrompt.get(stem) || '',
      model: info?.modelName || '',
      project: info?.project || projects[info?.projectId] || '',
      collection: info?.collection || collections[info?.collectionId] || '',
      width,
      height,
      takeoutFav: !!info?.isFavorited,
      source: String(info?.source || '').toLowerCase(),
      hasInfo: !!info,
    }));
  }

  S.items = items;
  S.byId = new Map(items.map((i) => [i.id, i]));
  S.needsPerm = false;
  hayCache.clear();
  await DB.put('meta', 'index', items);
  progressDone();
  render();
  probeVideos();
  if (!items.length) toast('No photos or videos found in that folder.');
}

async function pickFolder() {
  if (!HAS_PICKER) return $('#fileFallback').click();
  let dir;
  try {
    dir = await window.showDirectoryPicker({
      mode: 'readwrite'
    });
  } catch (err) {
    if (err && err.name === 'AbortError') return;
    toast('The folder picker was blocked. Choose the folder with the classic picker.');
    return $('#fileFallback').click();
  }
  S.root = dir;
  await DB.put('handles', 'root', dir);
  return scan(walk(dir));
}

async function reconnect() {
  if (!S.root) return pickFolder();
  let p = 'denied';
  try {
    p = await S.root.requestPermission({
      mode: 'readwrite'
    });
  } catch {}
  if (p !== 'granted') return toast('Folder access was not granted');
  return scan(walk(S.root));
}

function onFallback(e) {
  const files = [...e.target.files];
  e.target.value = '';
  if (!files.length) return;
  S.root = null;
  DB.del('handles', 'root');
  scan(files.map((f) => ({
    path: f.webkitRelativePath || f.name,
    get: async () => f
  })));
}

const jobQ = [];
let jobBusy = 0;

function runQueued(fn, front) {
  return new Promise((res, rej) => {
    const job = {
      fn,
      res,
      rej
    };
    if (front) jobQ.unshift(job);
    else jobQ.push(job);
    pumpJobs();
  });
}

function pumpJobs() {
  while (jobBusy < THUMB_JOBS && jobQ.length) {
    const j = jobQ.shift();
    jobBusy++;
    Promise.resolve().then(j.fn).then(j.res, j.rej).finally(() => {
      jobBusy--;
      pumpJobs();
    });
  }
}

const thumbURL = new Map();
const thumbPending = new Map();

function urlFor(it, front = false) {
  if (thumbURL.has(it.key)) return Promise.resolve(thumbURL.get(it.key));
  if (!thumbPending.has(it.key)) {
    const p = loadThumb(it, front).finally(() => thumbPending.delete(it.key));
    thumbPending.set(it.key, p);
  }
  return thumbPending.get(it.key);
}

async function loadThumb(it, front) {
  let rec = await DB.get('thumbs', it.key);
  if (!rec) {
    const f = await fileOf(it);
    if (!f) return null;
    rec = await runQueued(() => (it.isVideo ? videoFrame(f) : bitmapThumb(f)), front).catch(() => null);
    if (!rec) return null;
    await DB.put('thumbs', it.key, rec);
  }
  if (!it.width && rec.w) learnSize(it, rec.w, rec.h);
  const u = URL.createObjectURL(rec.blob);
  thumbURL.set(it.key, u);
  return u;
}

function fitSize(w, h, max = THUMB_MAX) {
  const s = Math.min(1, max / Math.max(w, h));
  return [Math.max(1, Math.round(w * s)), Math.max(1, Math.round(h * s))];
}

function drawTo(src, w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  c.getContext('2d').drawImage(src, 0, 0, w, h);
  return c;
}

async function bitmapThumb(f) {
  const bmp = await createImageBitmap(f);
  const [w, h] = fitSize(bmp.width, bmp.height);
  const canvas = drawTo(bmp, w, h);
  bmp.close?.();
  const blob = await new Promise((res) => canvas.toBlob(res, 'image/webp', 0.84));
  if (!blob) throw new Error('encode failed');
  return {
    blob
  };
}

/* Loads a video element for a file. `run` attaches the handlers; it must call ok or fail. */
function useVideo(f, ms, run) {
  return new Promise((resolve, reject) => {
    const v = document.createElement('video');
    const url = URL.createObjectURL(f);
    let timer = 0;
    const finish = (ok, value) => {
      clearTimeout(timer);
      URL.revokeObjectURL(url);
      v.removeAttribute('src');
      v.load();
      if (ok) resolve(value);
      else reject(value);
    };
    timer = setTimeout(() => finish(false, new Error('timeout')), ms);
    v.muted = true;
    v.playsInline = true;
    v.preload = 'auto';
    v.onerror = () => finish(false, new Error('video'));
    run(v, (value) => finish(true, value), (err) => finish(false, err));
    v.src = url;
  });
}

function videoFrame(f) {
  return useVideo(f, 8000, (v, ok, fail) => {
    v.onloadeddata = () => {
      v.currentTime = 0.1;
    };
    v.onseeked = () => {
      const [w, h] = [v.videoWidth, v.videoHeight];
      if (!w || !h) return fail(new Error('no frame'));
      const [tw, th] = fitSize(w, h);
      drawTo(v, tw, th).toBlob((blob) => (blob ? ok({
        blob,
        w,
        h
      }) : fail(new Error('encode'))), 'image/webp', 0.8);
    };
  });
}

/* Each day is a section with its own sticky date bar. */
const DAY_H = 44;
const DAY_GAP = 20;

function groupByDay(list) {
  const out = [];
  let cur = null;
  for (const it of list) {
    const k = it.ts ? ymd(it.ts) : 'none';
    if (!cur || cur.key !== k) {
      cur = {
        key: k,
        label: k === 'none' ? 'No date' : fmtDayLong(k),
        items: []
      };
      out.push(cur);
    }
    cur.items.push(it);
  }
  return out;
}

function layoutBlocks(list, W) {
  const blocks = [];
  let y = 0;
  for (const g of groupByDay(list)) {
    const top = y;
    const lay = layoutGroup(g.items, W);
    const contentTop = top + DAY_H;
    blocks.push({
      kind: 'day',
      y: top,
      bottom: contentTop + lay.height,
      label: g.label,
      n: g.items.length
    });
    for (const b of lay.blocks) {
      const yy = contentTop + b.y;
      blocks.push({
        kind: 'block',
        it: b.it,
        x: b.x,
        y: yy,
        w: b.w,
        imgH: b.imgH,
        bottom: yy + b.imgH + CAP_H
      });
    }
    y = contentTop + lay.height + DAY_GAP;
  }
  return {
    blocks,
    height: Math.max(0, y - DAY_GAP)
  };
}

function layoutGroup(list, W) {
  if (S.layout === 'grid') return layoutGrid(list, W);
  if (S.layout === 'mixed') return layoutMixed(list, W);
  return layoutColumns(list, W);
}

function layoutColumns(list, W) {
  const {
    n,
    w
  } = colsFor(W);
  const bottoms = new Array(n).fill(0);
  const blocks = [];
  for (const it of list) {
    let c = 0;
    for (let k = 1; k < n; k++)
      if (bottoms[k] < bottoms[c]) c = k;
    const imgH = w / it.ratio;
    blocks.push({
      it,
      x: c * (w + GAP),
      y: bottoms[c],
      w,
      imgH
    });
    bottoms[c] += imgH + CAP_H + GAP_ROW;
  }
  return {
    blocks,
    height: Math.max(0, Math.max(...bottoms) - GAP_ROW)
  };
}

function layoutGrid(list, W) {
  const {
    n,
    w
  } = colsFor(W);
  const rowH = w + CAP_H + GAP_ROW;
  const blocks = list.map((it, k) => ({
    it,
    x: (k % n) * (w + GAP),
    y: Math.floor(k / n) * rowH,
    w,
    imgH: w
  }));
  const rows = Math.ceil(list.length / n);
  return {
    blocks,
    height: rows ? rows * rowH - GAP_ROW : 0
  };
}

/* How many shared columns a block spans: wide photos span more. */
function colsFor(W) {
  const n = Math.max(1, Math.floor((W + GAP) / (S.size + GAP)));
  return {
    n,
    w: (W - GAP * (n - 1)) / n
  };
}

function spanFor(ratio, n) {
  const s = ratio >= 2.1 ? 3 : ratio >= 1.3 ? 2 : 1;
  return Math.min(s, n);
}

/* Skyline packing on a shared column grid: each block goes to the spot where it
   sits highest, so edges line up like a grid but heights stay masonry-like. */
function layoutMixed(list, W) {
  const n = Math.max(3, Math.min(10, Math.floor((W + GAP) / (S.size + GAP))));
  const u = (W - GAP * (n - 1)) / n;
  const tops = new Array(n).fill(0);
  const blocks = [];
  for (const it of list) {
    const span = spanFor(it.ratio, n);
    const w = span * u + GAP * (span - 1);
    const imgH = w / it.ratio;
    let best = 0,
      bestY = Infinity;
    for (let c = 0; c + span <= n; c++) {
      let y = 0;
      for (let k = c; k < c + span; k++) y = Math.max(y, tops[k]);
      if (y < bestY - 0.5) {
        bestY = y;
        best = c;
      }
    }
    blocks.push({
      it,
      x: best * (u + GAP),
      y: bestY,
      w,
      imgH
    });
    for (let k = best; k < best + span; k++) tops[k] = bestY + imgH + CAP_H + GAP_ROW;
  }
  return {
    blocks,
    height: Math.max(0, Math.max(...tops) - GAP_ROW)
  };
}

function measureStickyBar() {
  const sb = $('#stickybar');
  if (sb) document.documentElement.style.setProperty('--tb-h', `${sb.offsetHeight}px`);
}

function relayout() {
  const wall = $('#wall');
  if (!wall || !S.base) return;
  measureStickyBar();
  const lay = layoutBlocks(S.list, wall.clientWidth || 800);
  LAY.blocks = lay.blocks;
  LAY.bands = new Map();
  LAY.blocks.forEach((b, i) => {
    const b0 = Math.floor(b.y / BAND),
      b1 = Math.floor(b.bottom / BAND);
    for (let k = b0; k <= b1; k++) {
      if (!LAY.bands.has(k)) LAY.bands.set(k, []);
      LAY.bands.get(k).push(i);
    }
  });
  wall.style.height = `${lay.height}px`;
  for (const el of LAY.mounted.values()) el.remove();
  LAY.mounted.clear();
  update();
}

function update() {
  const wall = $('#wall');
  if (!wall || !LAY.blocks.length) return;
  const top = -wall.getBoundingClientRect().top;
  const a = top - 1000,
    b = top + window.innerHeight + 1200;
  const want = new Set();
  const first = Math.max(0, Math.floor(a / BAND)),
    last = Math.max(0, Math.floor(b / BAND));
  for (let k = first; k <= last; k++) {
    for (const i of LAY.bands.get(k) || []) {
      const bl = LAY.blocks[i];
      if (bl.y <= b && bl.bottom >= a) want.add(i);
    }
  }
  for (const [i, el] of LAY.mounted) {
    if (!want.has(i)) {
      el.remove();
      LAY.mounted.delete(i);
    }
  }
  for (const i of want)
    if (!LAY.mounted.has(i)) mount(i, wall);
  LAY.visible = new Set();
  for (const i of want)
    if (LAY.blocks[i].kind === 'block') LAY.visible.add(LAY.blocks[i].it.id);
}

function mount(i, wall) {
  const bl = LAY.blocks[i];
  let el;
  if (bl.kind === 'day') {
    el = document.createElement('div');
    el.className = 'dgroup';
    el.style.top = `${bl.y}px`;
    el.style.height = `${bl.bottom - bl.y}px`;
    el.innerHTML = `<div class="datebar">${esc(bl.label)}<span class="n">${bl.n}</span></div>`;
  } else {
    el = document.createElement('figure');
    el.className = `block${S.sel.has(bl.it.id) ? ' is-sel' : ''}`;
    el.dataset.id = bl.it.id;
    el.style.left = `${bl.x}px`;
    el.style.top = `${bl.y}px`;
    el.style.width = `${bl.w}px`;
    el.innerHTML = blockHTML(bl.it, bl.imgH);
  }
  wall.appendChild(el);
  LAY.mounted.set(i, el);
  if (bl.kind === 'block') showFrame(el.querySelector('.frame'), bl.it);
}

function blockHTML(it, imgH) {
  const id = esc(it.id),
    title = esc(it.prompt || it.file),
    sel = S.sel.has(it.id);
  const meta = [fmtDate(it.ts), it.model].filter(Boolean).join(' · ');
  return `<div class="frame" style="height:${imgH.toFixed(1)}px">
      <img alt="" decoding="async">
      <button class="open" type="button" data-open="${id}" aria-label="Open ${title}"></button>
      <button class="pick" type="button" data-pick="${id}" aria-pressed="${sel}" aria-label="Select ${title}">${icon('check')}</button>
      ${it.isVideo ? `<span class="badge">${icon('play')}</span>` : ''}
    </div>
    <figcaption class="cap"><span class="t">${isFav(it) ? '★ ' : ''}${title}</span><span class="m">${esc(meta)}</span></figcaption>`;
}

async function showFrame(frame, it) {
  if (!frame) return;
  const img = frame.querySelector('img');
  img.addEventListener('load', () => frame.classList.add('ready'), {
    once: true
  });
  img.addEventListener('error', () => frame.classList.add('nofile'), {
    once: true
  });
  const cached = thumbURL.get(it.key);
  if (cached) {
    img.src = cached;
    return;
  }
  let u = await urlFor(it, true);
  if (!u && !it.isVideo) u = await originalURL(it);
  if (!frame.isConnected) return;
  if (!u) return frame.classList.add('nofile');
  img.src = u;
}

const originals = new Map();
async function originalURL(it) {
  if (originals.has(it.id)) return originals.get(it.id);
  const f = await fileOf(it);
  if (!f) return null;
  const u = URL.createObjectURL(f);
  originals.set(it.id, u);
  return u;
}

let scrollRaf = 0;

function onScroll() {
  if (scrollRaf || !S.base) return;
  scrollRaf = requestAnimationFrame(() => {
    scrollRaf = 0;
    update();
  });
}

function progress(label, n, total) {
  const p = $('#progress');
  p.hidden = false;
  p.innerHTML = `<div class="pl"><span>${esc(label)}</span>${total ? `<span>${n} / ${total}</span>` : ''}</div>${total ? `<div class="pb"><i style="width:${Math.round((100 * n) / total)}%"></i></div>` : ''}`;
}
const progressDone = () => {
  $('#progress').hidden = true;
};

const hasPopover = 'popover' in HTMLElement.prototype;
const showPop = (el) => {
  if (hasPopover) {
    try {
      el.showPopover();
    } catch {}
  } else el.hidden = false;
};
const hidePop = (el) => {
  if (hasPopover) {
    try {
      el.hidePopover();
    } catch {}
  } else el.hidden = true;
};

let toastT = 0;

function toast(msg, action) {
  const t = $('#toast');
  t.innerHTML = `<span>${esc(msg)}</span>${action ? `<button type="button">${esc(action.label)}</button>` : ''}`;
  showPop(t);
  if (action) t.querySelector('button').onclick = () => {
    action.fn();
    hidePop(t);
  };
  clearTimeout(toastT);
  toastT = setTimeout(() => hidePop(t), action ? 6000 : 2600);
}

const fieldHTML = (f) => `<label class="field"><span>${esc(f.label)}</span>${f.type === 'select'
  ? `<select name="${esc(f.name)}">${optsOf(f.options, f.value)}</select>`
  : `<input name="${esc(f.name)}" value="${esc(f.value || '')}" autocomplete="off">`}</label>`;

function dialog({
  title,
  html = '',
  fields = [],
  actions
}) {
  const d = $('#dialog');
  actions = actions || [{
    label: 'Cancel',
    value: ''
  }, {
    label: 'OK',
    value: 'ok',
    solid: true
  }];
  return new Promise((resolve) => {
    d.innerHTML = `<form method="dialog" class="dbody">
      <h2 id="dialog-title">${esc(title)}</h2>${html}
      ${fields.map(fieldHTML).join('')}
      <div class="dact">${actions.map((a) => `<button class="btn${a.solid ? ' solid' : a.danger ? ' danger' : ' quiet'}" value="${esc(a.value)}">${esc(a.label)}</button>`).join('')}</div>
    </form>`;
    const form = d.querySelector('form');
    d.addEventListener('close', () => resolve({
      action: d.returnValue,
      data: Object.fromEntries(new FormData(form))
    }), {
      once: true
    });
    d.showModal();
    (form.querySelector('input,select') || form.querySelector('.solid'))?.focus();
  });
}

async function askText(title, label) {
  const r = await dialog({
    title,
    fields: [{
      name: 'v',
      label,
      value: ''
    }],
    actions: [{
      label: 'Cancel',
      value: ''
    }, {
      label: 'Save',
      value: 'ok',
      solid: true
    }]
  });
  return r.action === 'ok' ? (r.data.v || '').trim() || null : null;
}

async function addToAlbum(ids) {
  const r = await dialog({
    title: 'Add to album',
    fields: [{
        name: 'album',
        label: 'Album',
        type: 'select',
        options: [
          ['', 'New album…'], ...S.albums.map((a) => [a.id, a.name])
        ]
      },
      {
        name: 'name',
        label: 'New album name',
        value: ''
      },
    ],
    actions: [{
      label: 'Cancel',
      value: ''
    }, {
      label: 'Add',
      value: 'ok',
      solid: true
    }],
  });
  if (r.action !== 'ok') return null;
  let album = S.albums.find((a) => a.id === r.data.album);
  if (!album) {
    const name = (r.data.name || '').trim();
    if (!name) return null;
    album = {
      id: uid(),
      name,
      ids: []
    };
    S.albums.push(album);
  }
  album.ids = uniq([...album.ids, ...ids]);
  await saveAlbums();
  toast(`Added to ${album.name}`);
  return album;
}

function openMenu() {
  $('#dialog').innerHTML = `<div class="dbody">
    <h2 id="dialog-title">Data and help</h2>
    <ul class="menu">
      <li><button type="button" data-menu="keys">${icon('info')}Keyboard shortcuts</button></li>
      <li><button type="button" data-menu="forget">${icon('trash')}Forget folder and previews</button></li>
    </ul>
  </div>`;
  $('#dialog').showModal();
}

function openKeys() {
  return dialog({
    title: 'Keyboard shortcuts',
    html: `<dl class="keys">
      <dt>/</dt><dd>Search</dd>
      <dt>← →</dt><dd>Previous and next block</dd>
      <dt>F</dt><dd>Favourite (viewer)</dd>
      <dt>H</dt><dd>Hide (viewer)</dd>
      <dt>I</dt><dd>Details (viewer)</dd>
      <dt>Z</dt><dd>Actual size (viewer)</dd>
      <dt>Ctrl/⌘ A</dt><dd>Select all shown</dd>
      <dt>Esc</dt><dd>Clear selection</dd>
    </dl>`,
    actions: [{
      label: 'Done',
      value: '',
      solid: true
    }],
  });
}

function download(blob, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

async function forget() {
  await Promise.all([DB.clear('meta'), DB.clear('thumbs'), DB.clear('handles')]);
  for (const u of thumbURL.values()) URL.revokeObjectURL(u);
  thumbURL.clear();
  S.files.clear();
  S.items = [];
  S.byId = new Map();
  S.root = null;
  S.needsPerm = false;
  S.sel.clear();
  hayCache.clear();
  render();
  toast('Folder and previews forgotten. Notes, tags and albums stay.');
}

const THEMES = ['auto', 'light', 'dark'];

function setTheme(t) {
  if (t === 'auto') delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = t;
  S.prefs = {
    theme: t
  };
  DB.put('user', '__prefs', S.prefs);
}

function cycleTheme() {
  const cur = S.prefs.theme || 'auto';
  const next = THEMES[(THEMES.indexOf(cur) + 1) % THEMES.length];
  setTheme(next);
  toast(`Theme: ${next}`);
}

function route() {
  const raw = location.hash.replace(/^#\/?/, '');
  const [name, ...rest] = raw.split('/');
  let arg = rest.join('/');
  try {
    arg = decodeURIComponent(arg);
  } catch {}
  S.page = {
    name: name || 'photos',
    arg
  };
  S.sel.clear();
  window.scrollTo(0, 0);
  render();
}

function navFor(name) {
  return ['album', 'takeout', 'smart'].includes(name) ? 'albums' : name;
}

function render() {
  const v = $('#view');
  const name = S.page.name;
  $$('[data-nav]').forEach((a) => {
    if (a.dataset.nav === navFor(name)) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  if (!S.items.length && name !== 'albums') {
    S.base = null;
    v.innerHTML = introHTML();
    return;
  }
  if (name === 'albums') {
    S.base = null;
    v.innerHTML = albumsHTML();
  } else if (name === 'smart') {
    const arg = S.page.arg;
    S.base = null;
    if (!arg) v.innerHTML = smartPageHTML();
    else if (arg === 'dups') v.innerHTML = dupsPageHTML();
    else if (arg.startsWith('f:')) v.innerHTML = folderPageHTML(arg);
    else openSmart();
  } else if (name === 'album') {
    openAlbum();
  } else if (name === 'takeout') {
    gallery(S.page.arg, S.items.filter((i) => i.collection === S.page.arg), 'From Google Takeout');
  } else if (name === 'favs') {
    gallery('Favourites', S.items.filter(isFav), '');
  } else if (name === 'videos') {
    gallery('Videos', S.items.filter((i) => i.isVideo), '');
  } else {
    gallery('Photos', S.items, '');
  }
  $$('.cell[data-cell]').forEach(loadMosaicCell);
}

function introHTML() {
  return `<section class="intro">
    <h1>Open your Google Flow Takeout.</h1>
    <p>Choose the folder that holds <span class="mono">Flow/media</span>, or the media folder itself. Everything stays in this browser. Nothing uploads.</p>
    <button class="btn solid" type="button" data-act="${S.root ? 'reconnect' : 'pick'}">${S.root ? 'Reconnect folder' : 'Choose folder'}</button>
    <p class="small muted">Chrome and Edge remember the folder and can delete files. Firefox and Brave can only read.</p>
  </section>`;
}

function gallery(title, base, extra) {
  S.base = base;
  S.metaExtra = extra || '';
  const reconnectBtn = S.needsPerm ? '<button type="button" class="btn" data-act="reconnect">Reconnect folder</button>' : '';
  const deleteBtn = S.page.name === 'album' ? `<button type="button" class="btn quiet" data-act="delete-album" data-id="${esc(S.page.arg)}">Delete album</button>` : '';
  $('#view').innerHTML = `
    ${channelHead(title, '', reconnectBtn + deleteBtn, 'meta')}
    <div class="stickybar" id="stickybar">
      <div class="toolbar" id="toolbar">${toolbarHTML(base)}</div>
      <div class="selbar" id="selbar" hidden></div>
    </div>
    <div class="wall" id="wall"></div>`;
  refreshList();
}

function openAlbum() {
  const album = S.albums.find((a) => a.id === S.page.arg);
  if (!album) {
    toast('That album no longer exists.');
    location.hash = '#/albums';
    return;
  }
  const ids = new Set(album.ids);
  gallery(album.name, S.items.filter((i) => ids.has(i.id)), 'Album');
}

function albumsHTML() {
  const takeout = uniq(S.items.map((i) => i.collection).filter(Boolean)).sort()
    .map((name) => ({
      name,
      items: S.items.filter((i) => i.collection === name)
    }));
  const albumTiles = S.albums.map((a) => tile(`#/album/${encodeURIComponent(a.id)}`,
    a.ids.map((id) => S.byId.get(id)).filter(Boolean), a.name, `${a.ids.length} blocks`)).join('');
  const meta = `${S.albums.length} albums${takeout.length ? ` · ${takeout.length} from Takeout` : ''}`;
  const actions = '<a class="btn quiet" href="#/smart">Smart albums</a><button type="button" class="btn solid" data-act="new-album">New album</button>';
  return `${channelHead('Albums', esc(meta), actions)}
    <div class="page">
      ${groupHTML('Albums', S.albums.length ? `<div class="tiles">${albumTiles}</div>` : '<p class="muted">No albums yet. Select blocks and choose Add to album.</p>')}
      ${takeout.length ? groupHTML('From Google Takeout', `<div class="tiles">${takeout.map((c) => tile(`#/takeout/${encodeURIComponent(c.name)}`, c.items, c.name, `${c.items.length} blocks`)).join('')}</div>`) : ''}
    </div>`;
}

function mosaicHTML(items) {
  const xs = items.slice(0, 4);
  const cells = xs.map((it) => `<div class="cell" data-cell="${esc(it.id)}"><img alt=""></div>`);
  while (cells.length < (xs.length === 1 ? 1 : 4)) cells.push('<div class="cell"></div>');
  return `<div class="mosaic${xs.length === 1 ? ' one' : ''}">${cells.join('')}</div>`;
}

async function loadMosaicCell(cell) {
  const it = S.byId.get(cell.dataset.cell);
  if (!it) return;
  const u = await urlFor(it, true);
  if (!u || !cell.isConnected) return;
  cell.querySelector('img').src = u;
  cell.classList.add('ready');
}

function toolbarHTML(base) {
  const vals = (k) => uniq(base.map((i) => i[k]).filter(Boolean)).sort();
  const sel = (name, label, first, pairs) => `<label class="select"><span class="sr-only">${label}</span><select data-f="${name}">${optsOf([['', first], ...pairs], S.f[name])}</select></label>`;
  const pct = ((S.size - 120) / (420 - 120)) * 100;
  return `
    <div class="seg" role="group" aria-label="Layout">${[['columns', 'Columns'], ['grid', 'Grid'], ['mixed', 'Mixed']].map(([v, l]) =>
      `<button type="button" data-layout="${v}" aria-pressed="${S.layout === v}">${l}</button>`).join('')}</div>
    <div class="seg" role="group" aria-label="Order">${[['newest', 'Newest'], ['oldest', 'Oldest']].map(([v, l]) =>
      `<button type="button" data-sort="${v}" aria-pressed="${S.sort === v}">${l}</button>`).join('')}</div>
    ${sel('type', 'Type', 'All types', [['photo', 'Photos'], ['video', 'Videos']])}
    ${sel('model', 'Model', 'All models', vals('model').map((v) => [v, v]))}
    <button type="button" class="txt" id="datebtn" data-act="calendar">${esc(dateLabel())}</button>
    <label class="range"><span>Size</span><input class="slider" type="range" min="120" max="420" step="10" value="${S.size}" data-k="size" aria-label="Block size" style="--p:${pct.toFixed(1)}%"></label>
    <label class="toggle"><input type="checkbox" data-k="hidden"${S.showHidden ? ' checked' : ''}> Hidden</label>
    <span class="grow"></span>
    <button type="button" class="txt" data-act="select-all">Select all</button>`;
}

function refreshList() {
  if (!S.base) return;
  S.list = sortItems(applyFilters(S.base));
  S.lastList = S.list.map((i) => i.id);
  const n = S.list.length;
  const meta = $('#meta');
  if (meta) meta.textContent = [`${n.toLocaleString()} ${n === 1 ? 'block' : 'blocks'}`, S.metaExtra].filter(Boolean).join(' · ');
  const wall = $('#wall');
  LAY.mounted = new Map();
  LAY.blocks = [];
  wall.querySelectorAll('.block, .dgroup, .empty').forEach((e) => e.remove());
  if (!n) {
    wall.style.height = 'auto';
    wall.insertAdjacentHTML('beforeend', '<div class="empty"><p>Nothing matches.</p><button type="button" class="btn quiet" data-act="reset">Clear filters</button></div>');
  } else {
    relayout();
  }
  renderSelbar();
}

function setLayout(v) {
  S.layout = v;
  S.size = SIZE[v];
  const tb = $('#toolbar');
  if (tb && S.base) tb.innerHTML = toolbarHTML(S.base);
  relayout();
}

function renderSelbar() {
  const bar = $('#selbar');
  document.body.classList.toggle('selecting', S.sel.size > 0);
  if (bar) {
    bar.hidden = !S.sel.size;
    if (S.sel.size) {
      bar.innerHTML = `<span class="sel-count">${S.sel.size} selected</span>
        <button type="button" class="txt" data-bulk="fav">Favourite</button>
        <button type="button" class="txt" data-bulk="album">Add to album</button>
        <button type="button" class="txt" data-bulk="copy">Copy prompts</button>
        <button type="button" class="txt" data-bulk="hide">Hide</button>
        <button type="button" class="txt danger" data-bulk="delete">Delete</button>
        <span class="grow"></span>
        <button type="button" class="txt" data-bulk="clear">Cancel</button>`;
    }
  }
  measureStickyBar();
}

function toggleSel(id, on = !S.sel.has(id)) {
  if (on) S.sel.add(id);
  else S.sel.delete(id);
  const el = $(`.block[data-id="${CSS.escape(id)}"]`);
  if (el) {
    el.classList.toggle('is-sel', on);
    el.querySelector('.pick')?.setAttribute('aria-pressed', String(on));
  }
  renderSelbar();
}

function repaintSelection() {
  for (const el of LAY.mounted.values()) {
    const on = S.sel.has(el.dataset.id);
    el.classList.toggle('is-sel', on);
    el.querySelector('.pick')?.setAttribute('aria-pressed', String(on));
  }
  renderSelbar();
}

async function bulk(act) {
  const ids = [...S.sel];
  if (act === 'clear') {
    S.sel.clear();
    return repaintSelection();
  }
  if (!ids.length) return;
  if (act === 'fav') {
    const all = ids.every((id) => isFav(S.byId.get(id)));
    ids.forEach((id) => setU(id, {
      fav: !all
    }));
    toast(all ? 'Removed from favourites' : 'Added to favourites');
    return render();
  }
  if (act === 'album') {
    await addToAlbum(ids);
    return;
  }
  if (act === 'copy') {
    const txt = ids.map((id) => S.byId.get(id).prompt).filter(Boolean).join('\n\n');
    try {
      await navigator.clipboard.writeText(txt);
      toast('Prompts copied');
    } catch {
      toast('Clipboard blocked');
    }
    return;
  }
  if (act === 'hide') {
    ids.forEach((id) => setU(id, {
      hidden: true
    }));
    S.sel.clear();
    toast(`Hid ${ids.length}`, {
      label: 'Undo',
      fn: () => {
        ids.forEach((id) => setU(id, {
          hidden: false
        }));
        render();
      }
    });
    return render();
  }
  if (act === 'delete') {
    if (await deleteItems(ids)) {
      S.sel.clear();
      render();
    }
  }
}

const curId = () => V.ids[V.i];

function openViewer(id, ids) {
  V.ids = ids && ids.includes(id) ? ids : [id];
  V.i = V.ids.indexOf(id);
  V.zoom = false;
  const d = $('#viewer');
  if (!d.open) {
    d.innerHTML = `<div class="vwrap">
        <div class="vstage">
          <div class="vtop" id="vtop"></div>
          <div class="vmedia" id="vmedia"></div>
          <button type="button" class="icon-btn vnav prev" data-v="prev" aria-label="Previous">${icon('left')}</button>
          <button type="button" class="icon-btn vnav next" data-v="next" aria-label="Next">${icon('right')}</button>
        </div>
        <aside class="vside" id="vside" aria-label="Details"></aside>
      </div>`;
    d.classList.toggle('side-open', window.matchMedia('(min-width: 761px)').matches);
    d.showModal();
  }
  paintViewer();
  loadViewerMedia();
}

function closeViewer() {
  $('#viewer').close();
}

function paintViewer() {
  const it = S.byId.get(curId());
  if (!it) return closeViewer();
  const d = $('#viewer');
  const fav = isFav(it),
    hidden = !!U(it.id).hidden,
    side = d.classList.contains('side-open');
  const b = (v, label, ic, extra = '', pressed) => `<button type="button" class="icon-btn${extra}" data-v="${v}" title="${label}" aria-label="${label}"${pressed === undefined ? '' : ` aria-pressed="${pressed}"`}>${icon(ic)}</button>`;
  $('#vtop').innerHTML = [
    b('close', 'Close', 'close'),
    `<span class="vcount">${V.i + 1} of ${V.ids.length}</span>`,
    b('fav', fav ? 'Remove from favourites' : 'Favourite', fav ? 'starOn' : 'star', fav ? ' on' : '', fav),
    b('album', 'Add to album', 'album'),
    b('zoom', V.zoom ? 'Fit to screen' : 'Actual size', V.zoom ? 'shrink' : 'expand', '', V.zoom),
    b('info', 'Details', 'info', '', side),
    b('copy', 'Copy image', 'copy'),
    b('download', 'Download', 'download'),
    b('hide', hidden ? 'Show again' : 'Hide', 'hide', hidden ? ' on' : '', hidden),
    b('delete', 'Delete', 'trash', ' danger'),
  ].join('');
  $('.vnav.prev').disabled = V.i === 0;
  $('.vnav.next').disabled = V.i >= V.ids.length - 1;
  const peers = promptPeers(it);
  V.side = {
    same: peers.map((o) => o.id),
    dup: []
  };
  $('#vside').innerHTML = sideHTML(it, peers);
  $$('#vside [data-cell]').forEach(loadMosaicCell);
  fillDuplicates(it);
}

function sideHTML(it, peers) {
  const u = U(it.id);
  const tags = u.tags || [];
  const albums = S.albums.filter((a) => a.ids.includes(it.id));
  const source = it.source ? it.source[0].toUpperCase() + it.source.slice(1) : '—';
  return `
    <h2>${it.prompt ? esc(it.prompt) : '<span class="muted">No prompt in the info file.</span>'}</h2>
    <div class="vactions"><button type="button" class="btn quiet" data-v="copy-prompt"${it.prompt ? '' : ' disabled'}>Copy prompt</button></div>
    <div class="vsec">
      <dl class="kv">
        <dt>Date</dt><dd>${esc(it.ts ? new Date(it.ts).toLocaleString() : 'No date')}</dd>
        <dt>Source</dt><dd>${esc(source)}</dd>
        <dt>Model</dt><dd>${esc(it.model || '—')}</dd>
        <dt>Size</dt><dd>${it.width ? `${it.width} × ${it.height}` : '—'} · ${fmtBytes(it.size)}</dd>
        <dt>Project</dt><dd>${esc(it.project || '—')}</dd>
        <dt>File</dt><dd class="mono">${esc(it.file)}</dd>
      </dl>
    </div>
    ${it.prompt ? `
    <div class="vsec">
      <h3>Duplicates</h3>
      <div id="sidedup"><p class="muted small">Checking…</p></div>
    </div>
    <div class="vsec">
      <h3>Same prompt · ${peers.length}</h3>
      ${peers.length ? `<div class="strip">${peers.map((o) => miniHTML(o, 'same')).join('')}</div>` : '<p class="muted small">No other photos with this prompt.</p>'}
    </div>` : ''}
    <div class="vsec">
      <h3>Tags</h3>
      <div class="chips">
        ${tags.map((t) => `<span class="chip">${esc(t)}<button type="button" data-untag="${esc(t)}" aria-label="Remove ${esc(t)}">×</button></span>`).join('')}
        ${it.smart.map((t) => `<span class="chip auto" title="Colour from the prompt">${esc(t)}</span>`).join('')}
      </div>
      <form class="tagform" data-tagform><input name="tag" aria-label="Add a tag" placeholder="Add a tag" autocomplete="off"></form>
    </div>
    <div class="vsec">
      <h3>Notes</h3>
      <textarea class="vnote" rows="3" aria-label="Notes" data-notes>${esc(u.notes || '')}</textarea>
    </div>
    ${albums.length ? `<div class="vsec"><h3>Albums</h3><div class="chips">${albums.map((a) => `<span class="chip">${esc(a.name)}</span>`).join('')}</div></div>` : ''}`;
}

async function loadViewerMedia() {
  const it = S.byId.get(curId());
  if (!it) return;
  const token = {};
  V.token = token;
  const m = $('#vmedia');
  m.classList.toggle('zoomed', V.zoom);
  m.innerHTML = '<p class="vmsg">Loading…</p>';
  const f = await fileOf(it);
  if (V.token !== token || !$('#viewer').open) return;
  if (V.url) {
    URL.revokeObjectURL(V.url);
    V.url = null;
  }
  if (!f) {
    m.innerHTML = '<p class="vmsg">The original file is not connected. Reconnect the folder to view it.</p>';
    return;
  }
  V.url = URL.createObjectURL(f);
  m.innerHTML = it.isVideo ?
    `<video src="${V.url}" controls playsinline></video>` :
    `<img src="${V.url}" alt="${esc(it.prompt || it.file)}">`;
}

function move(d) {
  const i = Math.min(V.ids.length - 1, Math.max(0, V.i + d));
  if (i === V.i) return;
  V.i = i;
  paintViewer();
  loadViewerMedia();
}

async function viewerAct(a) {
  const id = curId(),
    it = S.byId.get(id);
  if (!it) return;
  switch (a) {
    case 'close':
      return closeViewer();
    case 'prev':
      return move(-1);
    case 'next':
      return move(1);
    case 'fav':
      setU(id, {
        fav: !isFav(it)
      });
      return paintViewer();
    case 'album':
      await addToAlbum([id]);
      return paintViewer();
    case 'zoom':
      V.zoom = !V.zoom;
      $('#vmedia').classList.toggle('zoomed', V.zoom);
      return paintViewer();
    case 'info':
      $('#viewer').classList.toggle('side-open');
      return paintViewer();
    case 'copy':
      return copyImage(it);
    case 'copy-prompt':
      try {
        await navigator.clipboard.writeText(it.prompt);
        toast('Prompt copied');
      } catch {
        toast('Clipboard blocked');
      }
      return;
    case 'download': {
      const f = await fileOf(it);
      return f ? download(f, it.file) : toast('Reconnect the folder to download');
    }
    case 'hide': {
      const h = !U(id).hidden;
      setU(id, {
        hidden: h
      });
      paintViewer();
      if (h) toast('Hidden', {
        label: 'Undo',
        fn: () => {
          setU(id, {
            hidden: false
          });
          paintViewer();
        }
      });
      return;
    }
    case 'delete': {
      if (!(await deleteItems([id]))) return;
      V.ids = V.ids.filter((x) => x !== id);
      if (!V.ids.length) return closeViewer();
      V.i = Math.min(V.i, V.ids.length - 1);
      paintViewer();
      return loadViewerMedia();
    }
  }
}

async function copyImage(it) {
  if (it.isVideo) return toast('Videos cannot be copied as images');
  const f = await fileOf(it);
  if (!f) return toast('Reconnect the folder to copy');
  try {
    const bmp = await createImageBitmap(f);
    const c = document.createElement('canvas');
    c.width = bmp.width;
    c.height = bmp.height;
    c.getContext('2d').drawImage(bmp, 0, 0);
    bmp.close?.();
    const blob = await new Promise((res) => c.toBlob(res, 'image/png'));
    await navigator.clipboard.write([new ClipboardItem({
      'image/png': blob
    })]);
    toast('Image copied');
  } catch {
    toast('The browser blocked copying the image');
  }
}

async function deleteItems(ids) {
  const r = await dialog({
    title: ids.length === 1 ? 'Delete this block?' : `Delete ${ids.length} blocks?`,
    html: '<p>This removes the file from disk. There is no trash for this.</p>',
    actions: [{
      label: 'Cancel',
      value: ''
    }, {
      label: 'Delete',
      value: 'ok',
      danger: true
    }],
  });
  if (r.action !== 'ok') return false;
  if (!S.root) {
    ids.forEach((id) => setU(id, {
      hidden: true
    }));
    toast('Read-only here. Hidden instead.');
    return false;
  }
  let perm = 'denied';
  try {
    perm = await S.root.requestPermission({
      mode: 'readwrite'
    });
  } catch {}
  if (perm !== 'granted') {
    toast('Write access was not granted');
    return false;
  }

  const gone = new Set();
  for (const id of ids) {
    const it = S.byId.get(id);
    if (!it) continue;
    try {
      const dir = await dirOf(it);
      await dir.removeEntry(it.file);
      await dir.removeEntry(`${it.id}_metadata.json`).catch(() => {});
      gone.add(id);
    } catch {}
  }
  S.items = S.items.filter((i) => !gone.has(i.id));
  gone.forEach((id) => {
    S.byId.delete(id);
    S.files.delete(id);
    S.sel.delete(id);
    S.user.delete(id);
    DB.del('user', id);
  });
  S.albums.forEach((a) => {
    a.ids = a.ids.filter((x) => !gone.has(x));
  });
  await Promise.all([saveAlbums(), DB.put('meta', 'index', S.items)]);
  toast(`Deleted ${gone.size}`);
  return gone.size > 0;
}

async function newAlbum() {
  const name = await askText('New album', 'Album name');
  if (!name) return;
  S.albums.push({
    id: uid(),
    name,
    ids: []
  });
  await saveAlbums();
  render();
}

async function deleteAlbum(id) {
  const r = await dialog({
    title: 'Delete this album?',
    html: '<p>The blocks stay in your library. Only the album goes.</p>',
    actions: [{
      label: 'Cancel',
      value: ''
    }, {
      label: 'Delete',
      value: 'ok',
      danger: true
    }],
  });
  if (r.action !== 'ok') return;
  S.albums = S.albums.filter((a) => a.id !== id);
  await saveAlbums();
  location.hash = '#/albums';
}

function setSelectionFromEvent(e, id) {
  if (S.sel.size || e.shiftKey || e.metaKey || e.ctrlKey) {
    toggleSel(id);
    return true;
  }
  return false;
}

function onClick(e) {
  const t = e.target;
  let el;
  if ((el = t.closest('[data-menu]'))) {
    $('#dialog').close();
    return runMenu(el.dataset.menu);
  }
  if ((el = t.closest('[data-jump]'))) return openViewer(el.dataset.jump, V.side[el.dataset.kind] || [el.dataset.jump]);
  if ((el = t.closest('#viewer [data-v]'))) return viewerAct(el.dataset.v);
  if ((el = t.closest('[data-untag]'))) {
    const id = curId();
    setU(id, {
      tags: (U(id).tags || []).filter((x) => x !== el.dataset.untag)
    });
    return paintViewer();
  }
  if ((el = t.closest('[data-bulk]'))) return bulk(el.dataset.bulk);
  if ((el = t.closest('[data-pick]'))) return toggleSel(el.dataset.pick);
  if ((el = t.closest('[data-open]'))) {
    const id = el.dataset.open;
    if (setSelectionFromEvent(e, id)) return;
    return openViewer(id, S.lastList);
  }
  if ((el = t.closest('[data-layout]'))) return setLayout(el.dataset.layout);
  if ((el = t.closest('[data-sort]'))) {
    S.sort = el.dataset.sort;
    $$('[data-sort]').forEach((b) => b.setAttribute('aria-pressed', String(b === el)));
    return refreshList();
  }
  if ((el = t.closest('[data-act="calendar"]'))) return openCalendar(el);
  if ((el = t.closest('[data-act]'))) return runAct(el.dataset.act, el.dataset);
}

function onChange(e) {
  const t = e.target;
  if (t.dataset.f) {
    S.f[t.dataset.f] = t.value;
    return refreshList();
  }
  if (t.dataset.k === 'size') {
    S.size = +t.value;
    return relayout();
  }
  if (t.dataset.k === 'hidden') {
    S.showHidden = t.checked;
    return refreshList();
  }
}

function onInput(e) {
  if (e.target.dataset.k === 'size') {
    S.size = +e.target.value;
    e.target.style.setProperty('--p', `${((S.size - 120) / 300 * 100).toFixed(1)}%`);
    relayout();
  }
}

function onSubmit(e) {
  if (!e.target.matches('[data-tagform]')) return;
  e.preventDefault();
  const val = String(new FormData(e.target).get('tag') || '').trim().toLowerCase();
  if (!val) return;
  const id = curId();
  setU(id, {
    tags: uniq([...(U(id).tags || []), val])
  });
  paintViewer();
}

function onSearch(e) {
  S.q = e.target.value;
  if (!S.base) {
    if (S.q.trim()) location.hash = '#/photos';
    return;
  }
  refreshList();
}

function onKey(e) {
  if ($('#viewer').open || $('#dialog').open) return;
  if (e.target.closest && e.target.closest('input,textarea,select')) {
    if (e.key === 'Escape') e.target.blur();
    return;
  }
  if (e.key === '/') {
    e.preventDefault();
    $('#q').focus();
    return;
  }
  if (e.key === '?') {
    openKeys();
    return;
  }
  if (e.key === 'Escape' && S.sel.size) {
    S.sel.clear();
    repaintSelection();
    return;
  }
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'a' && S.list.length) {
    e.preventDefault();
    S.list.forEach((i) => S.sel.add(i.id));
    repaintSelection();
  }
}

function onViewerKey(e) {
  if (e.target.closest('input,textarea')) return;
  const keys = {
    ArrowRight: () => move(1),
    ArrowLeft: () => move(-1),
    f: () => viewerAct('fav'),
    h: () => viewerAct('hide'),
    i: () => viewerAct('info'),
    z: () => viewerAct('zoom'),
  };
  const fn = keys[e.key];
  if (fn) {
    e.preventDefault();
    fn();
  }
}

function runAct(act, ds) {
  switch (act) {
    case 'pick':
      return pickFolder();
    case 'reconnect':
      return reconnect();
    case 'theme':
      return cycleTheme();
    case 'menu':
      return openMenu();
    case 'select-all':
      if (!S.list.length) return;
      S.list.forEach((i) => S.sel.add(i.id));
      return repaintSelection();
    case 'reset':
      S.f = {
        ...FILTER0
      };
      S.q = '';
      $('#q').value = '';
      S.showHidden = false;
      return render();
    case 'new-album':
      return newAlbum();
    case 'delete-album':
      return deleteAlbum(ds.id);
    case 'find-dups':
      return findDupesNow();
    default:
      return undefined;
  }
}

async function runMenu(v) {
  if (v === 'keys') return openKeys();
  if (v === 'forget') {
    const r = await dialog({
      title: 'Forget folder and previews?',
      html: '<p>Removes the saved folder and cached previews. Notes, tags and albums stay.</p>',
      actions: [{
        label: 'Cancel',
        value: ''
      }, {
        label: 'Forget',
        value: 'ok',
        danger: true
      }],
    });
    if (r.action === 'ok') forget();
  }
}

function bindEvents() {
  document.addEventListener('click', onClick);
  document.addEventListener('change', onChange);
  document.addEventListener('input', onInput);
  document.addEventListener('submit', onSubmit);
  document.addEventListener('keydown', onKey);
  $('#q').addEventListener('input', debounce(onSearch, 150));
  $('#fileFallback').addEventListener('change', onFallback);
  const vw = $('#viewer');
  vw.addEventListener('keydown', onViewerKey);
  vw.addEventListener('change', (e) => {
    if (e.target.matches('[data-notes]')) setU(curId(), {
      notes: e.target.value
    });
  });
  vw.addEventListener('close', () => {
    if (V.url) {
      URL.revokeObjectURL(V.url);
      V.url = null;
    }
  });
  let touchX = null;
  vw.addEventListener('touchstart', (e) => {
    touchX = e.touches[0].clientX;
  }, {
    passive: true
  });
  vw.addEventListener('touchend', (e) => {
    if (touchX == null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    touchX = null;
    if (Math.abs(dx) > 60) move(dx < 0 ? 1 : -1);
  }, {
    passive: true
  });
  window.addEventListener('hashchange', route);
  window.addEventListener('scroll', onScroll, {
    passive: true
  });
  window.addEventListener('resize', debounce(() => {
    if (S.base) relayout();
  }, 150));
}

const CAL = {
  year: 0,
  month: 0
};
const pad2 = (n) => String(n).padStart(2, '0');

function fmtPeriod(p) {
  if (p.length === 10) return new Date(`${p}T12:00`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  return `${monthName(p)} ${p.slice(0, 4)}`;
}
const dateLabel = () => (S.f.period ? fmtPeriod(S.f.period) : 'Any date');
const fmtDayLong = (key) => new Date(`${key}T12:00`).toLocaleDateString(undefined, {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric'
});

function openCalendar(anchor) {
  let pop = $('#calendar');
  if (!pop) {
    pop = document.createElement('div');
    pop.id = 'calendar';
    pop.className = 'calendar';
    pop.setAttribute('popover', 'auto');
    if (!hasPopover) pop.hidden = true;
    pop.addEventListener('click', onCalendarClick);
    document.body.appendChild(pop);
  }
  const newest = S.items.reduce((m, i) => Math.max(m, i.ts || 0), 0);
  const shown = S.f.period ? new Date(`${S.f.period.length === 10 ? S.f.period : `${S.f.period}-01`}T12:00`) : new Date(newest || Date.now());
  CAL.year = shown.getFullYear();
  CAL.month = shown.getMonth();
  paintCalendar();
  const r = anchor.getBoundingClientRect();
  pop.style.top = `${r.bottom + 8}px`;
  pop.style.left = `${Math.max(12, Math.min(r.left, window.innerWidth - 300))}px`;
  showPop(pop);
}

function hideCalendar() {
  const pop = $('#calendar');
  if (pop) hidePop(pop);
}

function paintCalendar() {
  const pop = $('#calendar');
  if (!pop) return;
  const counts = new Map();
  for (const it of S.items)
    if (it.ts) counts.set(ymd(it.ts), (counts.get(ymd(it.ts)) || 0) + 1);
  const days = new Date(CAL.year, CAL.month + 1, 0).getDate();
  const lead = (new Date(CAL.year, CAL.month, 1).getDay() + 6) % 7;
  const selKey = S.f.period.length === 10 ? S.f.period : '';
  const cells = [];
  for (let i = 0; i < lead; i++) cells.push('<span class="cal-day pad" aria-hidden="true"></span>');
  for (let d = 1; d <= days; d++) {
    const key = `${CAL.year}-${pad2(CAL.month + 1)}-${pad2(d)}`;
    const n = counts.get(key) || 0;
    cells.push(`<button type="button" class="cal-day${n ? ' has' : ''}${key === selKey ? ' sel' : ''}" data-day="${key}"${n ? '' : ' disabled'} aria-label="${esc(fmtDayLong(key))}, ${n} blocks">${d}</button>`);
  }
  const title = new Date(CAL.year, CAL.month, 1).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric'
  });
  pop.innerHTML = `
    <div class="cal-head">
      <button type="button" class="icon-btn" data-cal="-1" aria-label="Previous month">${icon('left')}</button>
      <span class="cal-title">${esc(title)}</span>
      <button type="button" class="icon-btn" data-cal="1" aria-label="Next month">${icon('right')}</button>
    </div>
    <div class="cal-week" aria-hidden="true">${['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((w) => `<span>${w}</span>`).join('')}</div>
    <div class="cal-grid">${cells.join('')}</div>
    <div class="cal-foot"><button type="button" class="txt" data-day="">Any date</button></div>`;
}

function onCalendarClick(e) {
  const t = e.target.closest('[data-cal], [data-day]');
  if (!t) return;
  if (t.dataset.cal !== undefined) {
    const dt = new Date(CAL.year, CAL.month + Number(t.dataset.cal), 1);
    CAL.year = dt.getFullYear();
    CAL.month = dt.getMonth();
    return paintCalendar();
  }
  S.f.period = t.dataset.day || '';
  hideCalendar();
  const btn = $('#datebtn');
  if (btn) btn.textContent = dateLabel();
  refreshList();
}


const normPrompt = (p) => (p || '').trim().toLowerCase().replace(/\s+/g, ' ');

function promptPeers(it) {
  const k = normPrompt(it.prompt);
  if (!k) return [];
  return S.items.filter((o) => o.id !== it.id && normPrompt(o.prompt) === k && !U(o.id).hidden);
}

/* Smart albums are rebuilt from the library on every visit and never saved. */

async function probeVideos() {
  for (const it of S.items) {
    if (!it.isVideo || it.width) continue;
    const f = await fileOf(it);
    if (!f) continue;
    const d = await probeVideo(f).catch(() => null);
    if (d) learnSize(it, d.w, d.h);
  }
}

function probeVideo(f) {
  return useVideo(f, 2500, (v, ok, fail) => {
    v.preload = 'metadata';
    v.onloadedmetadata = () => (v.videoWidth ? ok({
      w: v.videoWidth,
      h: v.videoHeight
    }) : fail(new Error('no size')));
  });
}

let saveT = 0;

function saveIndexSoon() {
  clearTimeout(saveT);
  saveT = setTimeout(() => DB.put('meta', 'index', S.items), 1500);
}

let relT = 0;

function relayoutSoon() {
  clearTimeout(relT);
  relT = setTimeout(() => {
    if (S.base) relayout();
  }, 500);
}

/* A video's real size, learned from its thumbnail when the index had none. */
function learnSize(it, w, h) {
  it.width = w;
  it.height = h;
  derive(it);
  saveIndexSoon();
  relayoutSoon();
}

function promptGroups() {
  const visible = S.items.filter((i) => !U(i.id).hidden);
  const byPrompt = new Map();
  for (const it of visible) {
    const k = normPrompt(it.prompt);
    if (!k) continue;
    if (!byPrompt.has(k)) byPrompt.set(k, []);
    byPrompt.get(k).push(it);
  }
  return [...byPrompt]
    .filter(([, xs]) => xs.length > 1)
    .sort((a, b) => b[1].length - a[1].length)
    .map(([k, xs]) => ({
      key: `p:${k}`,
      title: xs[0].prompt.trim().slice(0, 90),
      items: xs
    }));
}

const FOLDERS = [{
    key: 'f:2-4',
    title: '2–4 blocks',
    test: (n) => n >= 2 && n <= 4
  },
  {
    key: 'f:5-9',
    title: '5–9 blocks',
    test: (n) => n >= 5 && n <= 9
  },
  {
    key: 'f:10-19',
    title: '10–19 blocks',
    test: (n) => n >= 10 && n <= 19
  },
  {
    key: 'f:20+',
    title: '20 or more',
    test: (n) => n >= 20
  },
];

function checkGroups() {
  const visible = S.items.filter((i) => !U(i.id).hidden);
  return [{
      key: 'noinfo',
      title: 'No info file',
      items: visible.filter((i) => !i.hasInfo)
    },
    {
      key: 'noprompt',
      title: 'No prompt',
      items: visible.filter((i) => !i.prompt)
    },
    {
      key: 'nodims',
      title: 'No dimensions',
      items: visible.filter((i) => !i.width)
    },
    {
      key: 'noproject',
      title: 'No project',
      items: visible.filter((i) => !i.project)
    },
  ].filter((g) => g.items.length);
}


function smartPageHTML() {
  const checks = checkGroups();
  const sources = sourceGroups();
  const prompts = promptGroups();
  const folders = FOLDERS.map((f) => {
    const inside = prompts.filter((p) => f.test(p.items.length));
    return {
      ...f,
      prompts: inside,
      blocks: inside.reduce((n, p) => n + p.items.length, 0)
    };
  }).filter((f) => f.prompts.length);
  const dupes = S.dupGroups;
  const dupesBody = dupes === null ?
    '<p class="muted small">Duplicates are checked on demand, by comparing the photos themselves.</p><div class="page-actions"><button type="button" class="btn solid" data-act="find-dups">Find duplicates</button></div>' :
    dupes.length ?
    `<div class="tiles">${dupes.map((g, i) => stackTile(`#/smart/g:${i}`, g.ids.map((id) => S.byId.get(id)).filter(Boolean),
          g.kind === 'exact' ? 'Exact copies' : 'Looks the same',
          `${g.ids.length} blocks · ${g.kind === 'exact' ? 'identical files' : 'visually the same'}`)).join('')}</div>` :
    '<p class="muted">No duplicates found.</p>';
  const plain = (groups) => groups.map((g) => stackTile(`#/smart/${g.key}`, g.items, g.title, `${g.items.length} blocks`)).join('');
  return `${channelHead('Smart albums', 'Built from your library. Nothing is saved.', '<a class="btn quiet" href="#/albums">Back to albums</a>')}
    <div class="page">
      ${groupHTML('Checks', checks.length ? `<div class="tiles">${plain(checks)}</div>` : '<p class="muted">Nothing to check. Every block has its info.</p>')}
      ${groupHTML('Duplicates', dupesBody)}
      ${groupHTML('Sources', sources.length ? `<div class="tiles">${plain(sources)}</div>` : '<p class="muted">No uploaded blocks.</p>')}
      ${groupHTML('Repeated prompts', folders.length
        ? `<div class="tiles">${folders.map((f) => stackTile(`#/smart/${f.key}`, f.prompts.flatMap((p) => p.items), f.title, `${f.prompts.length} prompts · ${f.blocks} blocks`)).join('')}</div>`
        : '<p class="muted">No prompt is used more than once.</p>')}
    </div>`;
}

function folderPageHTML(key) {
  const f = FOLDERS.find((x) => x.key === key);
  if (!f) return smartPageHTML();
  const prompts = promptGroups().filter((p) => f.test(p.items.length));
  const meta = `${prompts.length} prompts, each used by ${f.title.replace(' blocks', '')} blocks`;
  return `${channelHead(f.title, esc(meta), '<a class="btn quiet" href="#/smart">Back to smart albums</a>')}
    <div class="page"><div class="tiles">${prompts.map((p) => stackTile(`#/smart/${encodeURIComponent(p.key)}`, p.items, p.title, `${p.items.length} blocks`)).join('')}</div></div>`;
}

function dupsPageHTML() {
  return `
    <header class="channel">
      <div class="channel-head">
        <div>
          <h1 class="channel-title">Duplicates</h1>
          <p class="channel-meta">Groups of blocks with the same prompt and size whose files are identical or look the same.</p>
        </div>
        <div class="channel-actions"><a class="btn quiet" href="#/smart">Back to smart albums</a></div>
      </div>
    </header>
    <div class="page">
      ${S.dupGroups && S.dupGroups.length
        ? `<div class="tiles">${S.dupGroups.map((g, i) => stackTile(`#/smart/g:${i}`, g.ids.map((id) => S.byId.get(id)).filter(Boolean),
            g.kind === 'exact' ? 'Exact copies' : 'Looks the same', `${g.ids.length} blocks`)).join('')}</div>`
        : '<p class="muted">No duplicates found.</p>'}
    </div>`;
}

function openSmart() {
  const arg = S.page.arg;
  if (arg.startsWith('g:')) {
    const g = S.dupGroups && S.dupGroups[Number(arg.slice(2))];
    if (!g) {
      toast('Run the duplicate check again.');
      location.hash = '#/smart';
      return;
    }
    const items = g.ids.map((id) => S.byId.get(id)).filter(Boolean);
    return gallery(g.kind === 'exact' ? 'Exact copies' : 'Looks the same', items,
      `${items.length} blocks · same prompt and size`);
  }
  const group = [...promptGroups(), ...checkGroups(), ...sourceGroups()].find((x) => x.key === arg);
  if (!group) {
    toast('That smart album has no blocks now.');
    location.hash = '#/smart';
    return;
  }
  gallery(group.title, group.items, 'Smart album · not saved');
}



async function metaOnce(key, compute) {
  const hit = await DB.get('meta', key);
  if (hit) return hit;
  const value = await compute();
  if (value) DB.put('meta', key, value);
  return value;
}

const hexOf = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');

const sha256Of = (it) => metaOnce(`h:${it.key}`, async () => {
  const f = await fileOf(it);
  if (!f || !globalThis.crypto?.subtle) return null;
  return hexOf(await crypto.subtle.digest('SHA-256', await f.arrayBuffer()));
});

const dhashOf = (it) => metaOnce(`d:${it.key}`, async () => {
  const u = await urlFor(it, false);
  if (!u) return null;
  const img = new Image();
  img.src = u;
  try {
    await img.decode();
  } catch {
    return null;
  }
  const g = drawTo(img, 9, 8).getContext('2d');
  const px = g.getImageData(0, 0, 9, 8).data;
  const lum = (x, y) => {
    const i = (y * 9 + x) * 4;
    return px[i] * 0.3 + px[i + 1] * 0.59 + px[i + 2] * 0.11;
  };
  let bits = '';
  for (let y = 0; y < 8; y++)
    for (let x = 0; x < 8; x++) bits += lum(x, y) > lum(x + 1, y) ? '1' : '0';
  return BigInt(`0b${bits}`).toString(16).padStart(16, '0');
});

function hamming(a, b) {
  let x = BigInt(`0x${a}`) ^ BigInt(`0x${b}`),
    n = 0;
  while (x) {
    n += Number(x & 1n);
    x >>= 1n;
  }
  return n;
}

/* 'exact' when the files are identical, 'similar' when the pictures look the same, else null. */
async function relation(a, b) {
  const sa = await sha256Of(a),
    sb = await sha256Of(b);
  if (sa && sb && sa === sb) return 'exact';
  if (a.isVideo || b.isVideo) return null;
  const da = await dhashOf(a),
    db = await dhashOf(b);
  if (da && db && hamming(da, db) <= 4) return 'similar';
  return null;
}

/* Candidates share the prompt and the pixel size. Anything else is not a duplicate. */
const sameShape = (a, b) => a.id !== b.id && normPrompt(a.prompt) && normPrompt(a.prompt) === normPrompt(b.prompt) && a.width && a.width === b.width && a.height === b.height;

async function dupsFor(it) {
  const out = [];
  for (const o of S.items.filter((x) => !U(x.id).hidden && sameShape(it, x)).slice(0, 30)) {
    const r = await relation(it, o);
    if (r) out.push({
      item: o,
      kind: r
    });
  }
  return out;
}

async function findDupGroups(onProgress) {
  const buckets = new Map();
  for (const it of S.items) {
    if (!it.prompt || !it.width || U(it.id).hidden) continue;
    const k = `${normPrompt(it.prompt)}|${it.width}x${it.height}`;
    if (!buckets.has(k)) buckets.set(k, []);
    buckets.get(k).push(it);
  }
  const groups = [];
  let done = 0;
  const todo = [...buckets.values()].filter((xs) => xs.length > 1);
  for (const xs of todo) {
    const parent = xs.map((_, i) => i);
    const find = (i) => (parent[i] === i ? i : (parent[i] = find(parent[i])));
    const kinds = new Map();
    for (let i = 0; i < xs.length; i++) {
      for (let j = i + 1; j < xs.length; j++) {
        const r = await relation(xs[i], xs[j]);
        if (r) {
          parent[find(i)] = find(j);
          kinds.set(`${i}-${j}`, r);
        }
      }
    }
    const clusters = new Map();
    xs.forEach((it, i) => {
      const r = find(i);
      if (!clusters.has(r)) clusters.set(r, []);
      clusters.get(r).push(i);
    });
    for (const members of clusters.values()) {
      if (members.length < 2) continue;
      const links = [];
      for (const a of members)
        for (const b of members)
          if (a < b && kinds.has(`${a}-${b}`)) links.push(kinds.get(`${a}-${b}`));
      const kind = links.every((k) => k === 'exact') ? 'exact' : 'similar';
      groups.push({
        kind,
        ids: members.map((i) => xs[i].id)
      });
    }
    done++;
    onProgress?.(done, todo.length);
  }
  return groups.sort((a, b) => b.ids.length - a.ids.length);
}

async function findDupesNow() {
  S.dupGroups = [];
  const groups = await findDupGroups((n, total) => progress('Checking duplicates', n, total));
  progressDone();
  S.dupGroups = groups;
  render();
  toast(groups.length ? `${groups.length} duplicate groups found` : 'No duplicates found');
}

async function fillDuplicates(it) {
  const box = $('#sidedup');
  if (!box) return;
  const list = await dupsFor(it);
  if (curId() !== it.id || !$('#sidedup')) return;
  V.side.dup = list.map((r) => r.item.id);
  const label = (k) => (k === 'exact' ? 'Identical file' : 'Looks the same');
  box.innerHTML = list.length ?
    `<div class="strip">${list.map((r) => `<div class="dupcell">${miniHTML(r.item, 'dup', label(r.kind))}<span class="small muted">${label(r.kind)}</span></div>`).join('')}</div>` :
    '<p class="muted small">None. Duplicates share the prompt and the pixel size, and their files or pictures match.</p>';
  $$('#sidedup [data-cell]').forEach(loadMosaicCell);
}

const miniHTML = (o, kind, title = '') => {
  const h = 96;
  const w = Math.round(Math.min(160, Math.max(56, h * o.ratio)));
  return `<button type="button" class="cell mini" data-cell="${esc(o.id)}" data-jump="${esc(o.id)}" data-kind="${kind}" style="width:${w}px;height:${h}px" aria-label="Open ${esc(o.file)}${title ? `, ${esc(title)}` : ''}" title="${esc(title || o.file)}"><img alt=""></button>`;
};

function sourceGroups() {
  const visible = S.items.filter((i) => !U(i.id).hidden);
  return [{
      key: 'uploaded',
      title: 'Uploaded',
      items: visible.filter((i) => i.source === 'uploaded')
    }]
    .filter((g) => g.items.length);
}

const channelHead = (title, meta, actions = '', metaId = '') => `
    <header class="channel">
      <div class="channel-head">
        <div>
          <h1 class="channel-title">${esc(title)}</h1>
          <p class="channel-meta"${metaId ? ` id="${metaId}"` : ''}>${meta}</p>
        </div>
        <div class="channel-actions">${actions}</div>
      </div>
    </header>`;

const groupHTML = (title, body) => `<section class="group"><h2 class="group-title">${esc(title)}</h2>${body}</section>`;

const tileLink = (href, inner, title, meta) => `<a class="tile" href="${href}">${inner}<span class="tile-name">${esc(title)}</span><span class="tile-meta">${esc(meta)}</span></a>`;
const tile = (href, items, title, meta) => tileLink(href, mosaicHTML(items), title, meta);

function stackTile(href, items, title, meta) {
  const layers = [0, 1, 2].map((k) => {
    const it = items[k];
    const cell = it ? `<div class="cell" data-cell="${esc(it.id)}"><img alt=""></div>` : '<div class="cell"></div>';
    return `<div class="layer l${k}">${cell}</div>`;
  }).join('');
  return tileLink(href, `<div class="stack">${layers}</div>`, title, meta);
}

async function boot() {
  $$('[data-icon]').forEach((el) => {
    el.innerHTML = icon(el.dataset.icon);
  });
  bindEvents();
  try {
    await DB.open();
    S.items = ((await DB.get('meta', 'index')) || []).map(derive);
    S.byId = new Map(S.items.map((i) => [i.id, i]));
    const keys = await DB.keys('user');
    const vals = await DB.all('user');
    keys.forEach((k, n) => {
      if (k === '__albums') S.albums = vals[n] || [];
      else if (k === '__prefs') S.prefs = vals[n] || {};
      else S.user.set(k, vals[n]);
    });
    setTheme(S.prefs.theme || 'auto');
    S.root = (await DB.get('handles', 'root')) || null;
    if (S.root && HAS_PICKER) {
      try {
        S.needsPerm = (await S.root.queryPermission({
          mode: 'read'
        })) !== 'granted';
      } catch {
        S.needsPerm = true;
      }
    }
  } catch (err) {
    console.error(err);
    toast('Saved data could not be opened. Private browsing can block storage.');
  }
  route();
  probeVideos();
}

boot().catch((err) => console.error(err));