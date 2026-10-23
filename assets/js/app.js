/* =========================================================
   سمايل لتوريدات الأسنان — Storefront + admin (vanilla JS)
   Sections: helpers · icons · storage/state · catalog logic ·
   cart · layout · store pages · admin pages · events · router
   ========================================================= */
(function () {
  'use strict';

  const S = window.STORE;
  const app = document.getElementById('app');

  /* ---------- Helpers ---------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const esc = (v) => String(v == null ? '' : v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const nf = new Intl.NumberFormat('ar-EG');
  const fmt = (n) => nf.format(n);
  const money = (n) => `${fmt(n)} ج.م`;
  const toLatinDigits = (s) => String(s)
    .replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d))
    .replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d));
  const parseQty = (v) => {
    const s = toLatinDigits(v).replace(/[,\s٬]/g, '');
    if (!/^\d+$/.test(s)) return null;
    const n = Number(s);
    return n >= 1 && Number.isSafeInteger(n) ? n : null;
  };
  const parsePrice = (v) => {
    const s = toLatinDigits(v).replace(/[,\s٬]/g, '');
    if (s === '') return '';
    if (!/^\d+(\.\d{1,2})?$/.test(s)) return null;
    const n = Number(s);
    return n > 0 ? n : null;
  };
  const fmtDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' }) + '، ' +
      d.toLocaleTimeString('ar-EG', { hour: 'numeric', minute: '2-digit' });
  };

  /* ---------- Icons ---------- */
  const ICONS = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    cart: '<circle cx="9" cy="20" r="1.3"/><circle cx="18" cy="20" r="1.3"/><path d="M2.5 3.5h2.6l2.4 11.2a1.6 1.6 0 0 0 1.6 1.3h8.6a1.6 1.6 0 0 0 1.6-1.2L21 7.5H6"/>',
    gear: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
    arrowLeft: '<path d="M19 12H5M11 18l-6-6 6-6"/>',
    arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    chevLeft: '<path d="m15 18-6-6 6-6"/>',
    chevDown: '<path d="m6 9 6 6 6-6"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    truck: '<path d="M2.5 6.5h11v10h-11zM13.5 9.5h4.2l3.3 3.4v3.6h-7.5"/><circle cx="6.5" cy="18" r="1.9"/><circle cx="17" cy="18" r="1.9"/>',
    box: '<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="m3 8 9 5 9-5M12 13v8"/>',
    boxes: '<path d="M7.5 3 12 5.3v5L7.5 12.6 3 10.3v-5z"/><path d="M16.5 3 21 5.3v5l-4.5 2.3-4.5-2.3"/><path d="M12 13 16.5 10.7 21 13v5l-4.5 2.3L12 18"/><path d="M12 13v5l-4.5 2.3L3 18v-5l4.5-2.3z"/>',
    pin: '<path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 16v-5M12 8h.01"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    file: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>',
    undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/>',
    headset: '<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="2.5" y="14" width="4" height="6" rx="1.5"/><rect x="17.5" y="14" width="4" height="6" rx="1.5"/><path d="M20 20a3 3 0 0 1-3 2h-3"/>',
    shield: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
    store: '<path d="M3 9 4.5 4h15L21 9M3 9v11h18V9M3 9h18"/><path d="M9 20v-6h6v6"/>',
    grid: '<rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/>',
    hand: '<path d="M18 11V6a2 2 0 0 0-4 0v5M14 10V4a2 2 0 0 0-4 0v6M10 10.5V6a2 2 0 0 0-4 0v8a8 8 0 0 0 16 0v-2a2 2 0 0 0-4 0"/>',
    tooth: '<path d="M12 5.5C10 4 8.5 3.5 7 3.5 4.5 3.5 3 5.5 3 8.5c0 3 1.5 4.5 2 7 .5 3 1 5 2.5 5s1.8-2 2.3-4c.4-1.5 1-2.5 2.2-2.5s1.8 1 2.2 2.5c.5 2 .8 4 2.3 4s2-2 2.5-5c.5-2.5 2-4 2-7 0-3-1.5-5-4-5-1.5 0-3 .5-5 2z"/>',
    tool: '<path d="m16 3 5 5-9.5 9.5-5 1.5 1.5-5z"/><path d="m13.5 5.5 5 5M3 21l3.5-3.5"/>',
    tag: '<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
    sliders: '<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    edit: '<path d="M17 3a2.8 2.8 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5z"/>',
    clipboard: '<rect x="5" y="4" width="14" height="18" rx="2"/><path d="M9 2.5h6v3.5H9zM9 12h6M9 16h4"/>',
    bag: '<path d="M5.5 7.5h13l-1 13.5h-11z"/><path d="M9 7.5V6a3 3 0 0 1 6 0v1.5"/>',
    cube: '<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="m3 8 9 5 9-5M12 13v8"/>',
    external: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    printer: '<path d="M6 9V3h12v6M6 18H4a1 1 0 0 1-1-1v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a1 1 0 0 1-1 1h-2"/><rect x="6" y="14" width="12" height="7"/>',
    folder: '<path d="M3 6.5a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 17-5-5L5 20"/>',
    expand: '<path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>',
    reset: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>'
  };
  const I = (name, cls = '') => `<svg class="ico ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ''}</svg>`;
  const LOGO = `<svg class="brand-mark" viewBox="0 0 50 54" fill="none" aria-hidden="true"><defs><linearGradient id="lgT" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1aa597"/><stop offset="1" stop-color="#0b5f59"/></linearGradient></defs><path d="M25 9C21 5.5 17 4 13 4 7 4 3.5 8.5 3.5 15c0 6 2.6 9.8 3.8 15.5C8.7 37.5 9.6 50 14.6 50c4.3 0 4.6-9.6 6-15 .8-3 2.2-4.5 4.4-4.5s3.6 1.5 4.4 4.5c1.4 5.4 1.7 15 6 15 5 0 5.9-12.5 7.3-19.5C43.9 24.8 46.5 21 46.5 15 46.5 8.5 43 4 37 4c-4 0-8 1.5-12 5z" stroke="url(#lgT)" stroke-width="3.2" stroke-linejoin="round"/><path d="M15 11.5c3.5-.6 6.8.4 10 3" stroke="url(#lgT)" stroke-width="2.4" stroke-linecap="round"/></svg>`;

  /* ---------- Storage & state ---------- */
  let storageOK = true;
  const mem = {};
  const KEY = (k) => `${S.storageKey}:${k}`;
  const load = (k, fallback) => {
    try {
      const raw = localStorage.getItem(KEY(k));
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { storageOK = false; return k in mem ? mem[k] : fallback; }
  };
  const save = (k, v) => {
    mem[k] = v;
    try { localStorage.setItem(KEY(k), JSON.stringify(v)); }
    catch (e) { storageOK = false; toast('تعذر الحفظ على هذا الجهاز — التغييرات ستبقى لهذه الجلسة فقط', 'info'); }
  };

  const validProducts = (arr) => Array.isArray(arr) && arr.length && arr.every((p) => p && p.id && Array.isArray(p.variants) && p.variants.length);
  let products = load('products', null);
  if (!validProducts(products)) products = clone(window.DEFAULT_PRODUCTS);
  let cart = load('cart', []);
  if (!Array.isArray(cart)) cart = [];
  let orders = load('orders', []);
  if (!Array.isArray(orders)) orders = [];

  const ui = {
    catalog: { cat: 'all', q: '', offers: false, sort: 'default' },
    featSel: {},
    pd: { id: null, variant: null, qty: 1, img: 0 },
    offerSel: {},
    co: { method: 'delivery', values: {} },
    admin: { filter: 'all', q: '', openOrder: null, prodQ: '', editId: null, draft: null },
    policySec: 'returns'
  };

  /* ---------- Catalog logic ---------- */
  const getProduct = (id) => products.find((p) => p.id === id);
  const getVariant = (p, vid) => p && p.variants.find((v) => v.id === vid);
  const catName = (id) => (window.CATEGORIES.find((c) => c.id === id) || {}).name || '';
  const vPrice = (v) => (v.offerPrice != null && v.offerPrice < v.basePrice ? v.offerPrice : v.basePrice);
  const vHasOffer = (v) => v.offerPrice != null && v.offerPrice < v.basePrice;
  const pHasOffer = (p) => p.variants.some(vHasOffer);
  const pMin = (p) => Math.min(...p.variants.map(vPrice));
  const pMax = (p) => Math.max(...p.variants.map(vPrice));
  const pMinBase = (p) => Math.min(...p.variants.filter(vHasOffer).map((v) => v.basePrice));
  const pct = (v) => Math.round((1 - v.offerPrice / v.basePrice) * 100);
  const bestOffer = (p) => p.variants.filter(vHasOffer).sort((a, b) => pct(b) - pct(a))[0];
  const priceLabel = (p) => (pMin(p) === pMax(p) ? money(pMin(p)) : `<small class="muted">من</small> ${money(pMin(p))}`);
  const defaultVariant = (p) => (getVariant(p, p.defaultVariant) ? p.defaultVariant : p.variants[0].id);

  function filterProducts() {
    const c = ui.catalog;
    const q = toLatinDigits(c.q).trim().toLowerCase();
    let list = products.filter((p) => {
      if (c.cat !== 'all' && p.category !== c.cat) return false;
      if (c.offers && !pHasOffer(p)) return false;
      if (!q) return true;
      const hay = [p.name, p.brand, p.model, p.short, catName(p.category), ...p.variants.map((v) => v.label)].join(' ').toLowerCase();
      return q.split(/\s+/).every((t) => hay.includes(t));
    });
    if (c.sort === 'asc') list = list.slice().sort((a, b) => pMin(a) - pMin(b));
    if (c.sort === 'desc') list = list.slice().sort((a, b) => pMin(b) - pMin(a));
    return list;
  }

  /* ---------- Cart ---------- */
  const cartCount = () => cart.reduce((s, l) => s + l.qty, 0);
  const cartLines = () => cart.map((l) => {
    const p = getProduct(l.id); const v = getVariant(p, l.variant);
    return p && v ? { ...l, p, v, price: vPrice(v), total: vPrice(v) * l.qty } : null;
  }).filter(Boolean);
  const cartTotal = () => cartLines().reduce((s, l) => s + l.total, 0);
  const cartSavings = () => cartLines().reduce((s, l) => s + (vHasOffer(l.v) ? (l.v.basePrice - l.v.offerPrice) * l.qty : 0), 0);
  function persistCart() { save('cart', cart); updateBadge(); }
  function addToCart(id, variant, qty = 1) {
    const p = getProduct(id);
    if (!p || !getVariant(p, variant)) return;
    const line = cart.find((l) => l.id === id && l.variant === variant);
    if (line) line.qty += qty; else cart.push({ id, variant, qty });
    persistCart();
    toast(`تمت إضافة ${p.name} (${variant}) للعربة <a href="#/cart">عرض العربة</a>`, 'check');
  }
  function updateBadge() {
    const n = cartCount();
    $$('[data-cart-badge]').forEach((b) => { b.textContent = n > 99 ? '+99' : n; b.hidden = n === 0; });
  }

  /* ---------- Toasts ---------- */
  function toast(html, icon = 'check') {
    const box = document.getElementById('toasts');
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = `${I(icon)}<span>${html}</span>`;
    box.appendChild(el);
    setTimeout(() => { el.style.transition = '.3s'; el.style.opacity = '0'; }, 3200);
    setTimeout(() => el.remove(), 3600);
  }

  /* ---------- Layout ---------- */
  function header(active) {
    const nav = [['home', '#/', 'الرئيسية'], ['products', '#/products', 'المنتجات'], ['offers', '#/offers', 'العروض']];
    const links = nav.map(([k, h, t]) => `<a href="${h}" class="${active === k ? 'active' : ''}">${t}</a>`).join('');
    const searchForm = `<form class="header-search" data-form="search" role="search">
        <button type="submit" aria-label="بحث">${I('search', 'sm')}</button>
        <input name="q" type="search" placeholder="ابحث عن منتج أو رقم مرجعي ..." value="${esc(ui.catalog.q)}" aria-label="بحث في المنتجات">
      </form>`;
    return `<header class="site-header">
      <div class="container header-inner">
        <a class="brand" href="#/" aria-label="${esc(S.name)} — الرئيسية">${LOGO}
          <span class="brand-text"><span class="brand-name">${esc(S.name)}</span><span class="brand-sub">${esc(S.nameEn)}</span></span>
        </a>
        <nav class="main-nav" aria-label="القائمة الرئيسية">${links}</nav>
        <div class="header-actions">
          ${searchForm}
          <a class="icon-btn" href="#/cart" aria-label="العربة">${I('cart', 'lg')}<span class="cart-badge" data-cart-badge hidden>0</span></a>
          <a class="admin-btn" href="#/admin">${I('gear', 'sm')}<span>لوحة الإدارة</span></a>
          <button class="icon-btn menu-toggle" type="button" data-act="menu" aria-label="القائمة">${I('menu')}</button>
        </div>
      </div>
      <div class="mobile-nav" id="mobileNav">${links}<a href="#/admin">لوحة الإدارة</a>${searchForm}</div>
    </header>`;
  }

  function footer() {
    return `<footer class="site-footer"><div class="container footer-inner">
      <span class="footer-loc">${I('pin')}${esc(S.address)}</span>
      <nav class="footer-links" aria-label="روابط">
        <a href="#/products">المنتجات</a>
        <a href="#/offers">العروض</a>
        <a href="#/policy">سياسة الاستبدال خلال ${fmt(S.returnHours)} ساعة</a>
        <a href="#/policy/privacy">سياسة الخصوصية</a>
      </nav>
      <span class="footer-copy">© ${fmt(new Date().getFullYear())} ${esc(S.name)} — جميع الحقوق محفوظة</span>
    </div></footer>`;
  }

  const storePage = (active, body) => `${header(active)}<main class="fade-in" id="main">${body}</main>${footer()}`;

  /* ---------- Shared pieces ---------- */
  const chipsStatic = (p) => `<div class="chips">${p.variants.map((v) => `<span class="chip static">${esc(v.label)}</span>`).join('')}</div>`;
  const qtyControl = (val, act, extra = '', cls = '') => `<div class="qty ${cls}">
      <button type="button" data-act="${act}" data-dir="1" ${extra} aria-label="زيادة">${I('plus', 'sm')}</button>
      <input type="text" inputmode="numeric" value="${val}" data-qty-input="${act}" ${extra} aria-label="الكمية">
      <button type="button" data-act="${act}" data-dir="-1" ${extra} aria-label="تقليل">${I('minus', 'sm')}</button>
    </div>`;

  /* ---------- Home ---------- */
  function pageHome() {
    const nums = ['01', '02', '03'];
    const cats = window.CATEGORIES.map((c, i) => `
      <a class="cat-card" href="#/products?cat=${c.id}">
        <div class="cat-info">
          <span class="cat-num">${nums[i]}</span>
          <h3>${esc(c.name)}</h3>
          <p>${esc(c.desc)}</p>
          <span class="link-arrow">تصفح القسم ${I('arrowLeft', 'sm')}</span>
        </div>
        <img class="cat-img" src="${c.img}" alt="${esc(c.name)}" loading="lazy">
      </a>`).join('');

    const featured = products.map((p) => {
      const sel = ui.featSel[p.id] || defaultVariant(p);
      const v = getVariant(p, sel) || p.variants[0];
      return `<article class="feat-card">
        <div class="fc-info">
          <h3><a href="#/products/${p.id}">${esc(p.brand === '3M' ? p.model : p.brand + ' ' + p.model)}</a></h3>
          <span class="fc-sub">${esc(p.name)}${p.short ? ' — ' + esc(p.short) : ''}</span>
          <div class="chips" role="group" aria-label="${esc(p.variantLabel)}">${p.variants.map((x) =>
            `<button type="button" class="chip ${x.id === v.id ? 'active' : ''}" data-act="feat-var" data-id="${p.id}" data-v="${esc(x.id)}">${esc(x.label)}</button>`).join('')}</div>
          <div class="fc-foot">
            <div><div class="price">${money(vPrice(v))}</div>${vHasOffer(v) ? `<div class="price-old">${money(v.basePrice)}</div>` : `<div class="price-note">${esc(p.unit)}</div>`}</div>
            <button type="button" class="btn btn-primary btn-sm" data-act="add" data-id="${p.id}" data-v="${esc(v.id)}">${I('cart', 'sm')} أضف للطلب</button>
          </div>
        </div>
        <a class="fc-img" href="#/products/${p.id}"><img src="${p.featured || p.images[0]}" alt="${esc(p.name + ' ' + p.model)}" loading="lazy"></a>
      </article>`;
    }).join('');

    return storePage('home', `
      <section class="hero">
        <div class="hero-media" role="img" aria-label="كونترا أنجل NSK"></div>
        <div class="container hero-inner">
          <div class="hero-copy">
            <h1>مستلزمات عيادتك،<br>بمعيار جديد<span class="dot">.</span></h1>
            <p>اختار المواصفات. حدد الكمية. سجل طلبك.</p>
            <div class="hero-cta">
              <a class="btn btn-primary" href="#/products">تصفح المنتجات ${I('arrowLeft')}</a>
              <a class="link-arrow" href="#/offers">اكتشف العروض ${I('arrowLeft', 'sm')}</a>
            </div>
          </div>
        </div>
      </section>
      <div class="container features-strip">
        <div class="feat">${I('cube')}مقاسات فعلية</div>
        <div class="feat">${I('boxes')}كميات مفتوحة</div>
        <div class="feat">${I('truck')}استلام أو توصيل</div>
      </div>
      <section class="container"><div class="cat-grid">${cats}</div></section>
      <section class="container" style="margin-top:34px">
        <div class="section-head"><h2 class="section-title">منتجات مميزة</h2><a class="link-arrow" href="#/products">عرض كل المنتجات ${I('arrowLeft', 'sm')}</a></div>
        <div class="feat-grid">${featured}</div>
      </section>`);
  }

  /* ---------- Catalog ---------- */
  function productCard(p) {
    const offer = bestOffer(p);
    return `<article class="prod-card">
      <a class="pc-img" href="#/products/${p.id}">
        <img src="${p.images[0]}" alt="${esc(p.name + ' ' + p.model)}" loading="lazy">
        ${offer ? `<span class="badge-offer">${I('tag', 'sm')} خصم ${fmt(pct(offer))}٪</span>` : ''}
      </a>
      <div class="pc-body">
        <span class="tag">${esc(catName(p.category))}</span>
        <span class="pc-brand">${esc(p.brand)}</span>
        <h3><a href="#/products/${p.id}">${esc(p.name)}</a></h3>
        <span class="pc-model">${esc(p.model)}</span>
        ${chipsStatic(p)}
        <div class="pc-price">
          <div><div class="price">${priceLabel(p)}</div><div class="price-note">${esc(p.unit)}</div></div>
          ${offer ? `<span class="price-old">${money(pMinBase(p))}</span>` : ''}
        </div>
        <a class="btn btn-primary btn-block" href="#/products/${p.id}">${I('sliders', 'sm')} اختيار المواصفات</a>
      </div>
    </article>`;
  }

  function catalogGrid() {
    const list = filterProducts();
    if (!list.length) {
      return `<div class="empty">${I('search')}<p><strong>مفيش نتائج مطابقة</strong></p><p>جرّب كلمة بحث مختلفة أو امسح الفلاتر.</p>
        <button type="button" class="btn btn-ghost btn-sm" data-act="clear-filters" style="margin-top:14px">مسح الفلاتر</button></div>`;
    }
    return `<div class="prod-grid">${list.map(productCard).join('')}</div>`;
  }

  function pageCatalog() {
    const c = ui.catalog;
    const count = (id) => (id === 'all' ? products.length : products.filter((p) => p.category === id).length);
    const cats = [{ id: 'all', name: 'الكل', icon: 'grid' }, ...window.CATEGORIES.slice().reverse()].map((x) => `
      <li><button type="button" class="${c.cat === x.id ? 'active' : ''}" data-act="cat" data-id="${x.id}">${I(x.icon)}${esc(x.name)}<span class="cnt">${count(x.id)}</span></button></li>`).join('');
    return storePage('products', `
      <section class="catalog-banner"><div class="container">
        <nav class="breadcrumb" aria-label="مسار التنقل"><a href="#/">الرئيسية</a> / <span>المنتجات</span></nav>
        <h1 class="page-title">كل احتياجات العيادة<span class="dot">.</span></h1>
        <p class="count" id="resultCount">${fmt(filterProducts().length)} منتجات</p>
      </div></section>
      <div class="container catalog-layout">
        <aside class="side-card" aria-label="الأقسام">
          <h3>${I('folder')} الأقسام</h3>
          <ul class="cat-list">${cats}</ul>
          <div class="side-sep"></div>
          <label class="toggle-row">${I('tag')} العروض فقط
            <span class="switch"><input type="checkbox" data-act="offers-only" ${c.offers ? 'checked' : ''}><span></span></span>
          </label>
        </aside>
        <div>
          <div class="catalog-tools">
            <label class="search-box">${I('search')}<input type="search" id="catalogSearch" placeholder="ابحث عن منتج أو موديل" value="${esc(c.q)}" aria-label="ابحث عن منتج أو موديل"></label>
            <select class="select" id="sortSelect" aria-label="ترتيب">
              <option value="default" ${c.sort === 'default' ? 'selected' : ''}>الترتيب الافتراضي</option>
              <option value="asc" ${c.sort === 'asc' ? 'selected' : ''}>السعر: من الأقل للأعلى</option>
              <option value="desc" ${c.sort === 'desc' ? 'selected' : ''}>السعر: من الأعلى للأقل</option>
            </select>
          </div>
          <div id="catalogGrid">${catalogGrid()}</div>
          <div class="help-strip">
            <a href="#/products" data-act="clear-filters">${I('file', 'lg')}<span><strong>تصفح جميع المنتجات</strong><small>اكتشف كل أقسام مستلزمات الأسنان</small></span></a>
            <a href="#/policy">${I('headset', 'lg')}<span><strong>بحاجة إلى مساعدة؟</strong><small>اطلع على سياسة الاستبدال والاسترجاع</small></span></a>
          </div>
        </div>
      </div>`);
  }
  function refreshCatalog() {
    const g = $('#catalogGrid'); if (g) g.innerHTML = catalogGrid();
    const rc = $('#resultCount'); if (rc) rc.textContent = `${fmt(filterProducts().length)} منتجات`;
  }

  /* ---------- Product detail ---------- */
  function pageProduct(id) {
    const p = getProduct(id);
    if (!p) return pageNotFound();
    if (ui.pd.id !== id) ui.pd = { id, variant: defaultVariant(p), qty: 1, img: 0 };
    if (!getVariant(p, ui.pd.variant)) ui.pd.variant = defaultVariant(p);
    const v = getVariant(p, ui.pd.variant);
    const img = p.images[ui.pd.img] || p.images[0];
    const thumbs = p.images.length > 1 ? `<div class="pd-thumbs">${p.images.map((src, i) =>
      `<button type="button" class="${i === ui.pd.img ? 'active' : ''}" data-act="pd-img" data-i="${i}" aria-label="صورة ${i + 1}"><img src="${src}" alt=""></button>`).join('')}</div>` : '';
    return storePage('products', `
      <div class="container page">
        <div class="pd-layout">
          <div class="pd-info">
            <nav class="breadcrumb" aria-label="مسار التنقل"><a href="#/">الرئيسية</a>${I('chevLeft')}<a href="#/products?cat=${p.category}">${esc(catName(p.category))}</a>${I('chevLeft')}<span>${esc(p.name)}</span></nav>
            <span class="pd-brand">${esc(p.brand)}</span>
            <h1>${esc(p.name)}</h1>
            <div class="pd-model">${esc(p.brand + ' ' + p.model)}</div>
            <p class="pd-desc">${esc(p.description)}</p>
            <div class="pd-price"><span class="price">${money(vPrice(v))}</span>${vHasOffer(v) ? `<span class="price-old">${money(v.basePrice)}</span><span class="badge-offer" style="position:static">خصم ${fmt(pct(v))}٪</span>` : ''}</div>
            <div class="pd-unit">السعر لكل ${esc(p.unit)}</div>
            <span class="field-label">${esc(p.variantLabel)}</span>
            <div class="variant-row" role="radiogroup" aria-label="${esc(p.variantLabel)}">${p.variants.map((x) =>
              `<button type="button" role="radio" aria-checked="${x.id === v.id}" class="variant-btn ${x.id === v.id ? 'active' : ''}" data-act="pd-var" data-v="${esc(x.id)}">${esc(x.label)}</button>`).join('')}</div>
            ${v.note ? `<div class="variant-note">${esc(v.label)}: ${esc(v.note)}</div>` : ''}
            <div class="qty-row"><span class="field-label" style="margin:0">الكمية</span>${qtyControl(ui.pd.qty, 'pd-qty', '', 'lg')}</div>
            <button type="button" class="btn btn-primary btn-block btn-lg" style="margin-top:16px" data-act="pd-add">${I('cart')} أضف للعربة</button>
            <div class="note-box" style="margin-top:16px">${I('truck', 'lg')} التوافر والتوصيل يتم تأكيدهما بعد الطلب</div>
            <div class="accordion">
              <div class="acc-item"><button type="button" class="acc-head" data-act="acc">${I('file')} تفاصيل المنتج ${I('chevDown', 'chev')}</button>
                <div class="acc-body"><ul>${(p.details || []).map((d) => `<li>${esc(d)}</li>`).join('')}</ul></div></div>
              <div class="acc-item"><button type="button" class="acc-head" data-act="acc">${I('box')} وحدة البيع ${I('chevDown', 'chev')}</button>
                <div class="acc-body">يُباع هذا المنتج بالـ${esc(p.unit)}. يمكنك طلب أي كمية تناسب عيادتك، ويتم تأكيد التوافر بعد استلام الطلب.</div></div>
              <div class="acc-item"><button type="button" class="acc-head" data-act="acc">${I('undo')} الاستبدال والاسترجاع ${I('chevDown', 'chev')}</button>
                <div class="acc-body">يمكن استبدال أو استرجاع المنتج خلال ${fmt(S.returnHours)} ساعة من تاريخ الاستلام وفقاً لسياسة المتجر. <a href="#/policy" style="color:var(--teal);font-weight:600">اقرأ السياسة كاملة</a></div></div>
            </div>
          </div>
          <div class="pd-gallery">
            <div class="pd-main"><img src="${img}" alt="${esc(p.name + ' ' + p.model)}"></div>
            ${thumbs}
          </div>
        </div>
      </div>`);
  }

  /* ---------- Offers ---------- */
  const SHADE_COLORS = { A1: '#f3e9d6', A2: '#efdfc2', A3: '#e9d4ad', 'A3.5': '#e2c899' };
  function pageOffers() {
    const offerProducts = products.filter(pHasOffer);
    const hero = offerProducts[0];
    const heroOffer = hero && bestOffer(hero);
    const heroHtml = hero ? `
      <section class="offer-hero">
        <div class="oh-copy">
          <h1>عرض ${esc(hero.name.split(' ')[0])}</h1>
          <p>جودة تثق بها .. الآن بقيمة أفضل.</p>
          <span class="gold">${esc(hero.brand + ' ' + hero.model)}</span>
          <div class="oh-deal">
            <a class="btn btn-primary" href="#offer-${hero.id}">اختار ${esc(hero.variantLabel)} ${I('arrowLeft')}</a>
            <span class="oh-pct">${fmt(pct(heroOffer))}٪</span>
            <small>خصم<br>لفترة محدودة</small>
          </div>
        </div>
        <div class="oh-media" role="img" aria-label="${esc(hero.model)}"></div>
      </section>` : '';

    const cards = offerProducts.map((p) => {
      const offers = p.variants.filter(vHasOffer);
      const sel = getVariant(p, ui.offerSel[p.id]) && vHasOffer(getVariant(p, ui.offerSel[p.id])) ? ui.offerSel[p.id] : offers[0].id;
      const v = getVariant(p, sel);
      const shades = offers.map((x) => {
        const color = SHADE_COLORS[x.id];
        return `<button type="button" class="shade ${x.id === v.id ? 'active' : ''}" data-act="offer-var" data-id="${p.id}" data-v="${esc(x.id)}">
          ${color ? `<i class="shade-tooth" style="background:${color}"></i>` : I(p.category === 'protection' ? 'hand' : 'tool')}<span>${esc(x.label)}</span></button>`;
      }).join('');
      return `<article class="offer-card" id="offer-${p.id}">
        <div class="oc-price">
          <span class="lbl">السعر قبل الخصم</span>
          <span class="price-old">${money(v.basePrice)}</span>
          <span class="price">${money(v.offerPrice)}</span>
          <span class="price-note">لكل ${esc(p.unit)} • وفّر ${money(v.basePrice - v.offerPrice)}</span>
          <button type="button" class="btn btn-primary btn-block" data-act="add" data-id="${p.id}" data-v="${esc(v.id)}">${I('cart')} أضف للعربة</button>
        </div>
        <div>
          <span class="oc-brand ${p.brand === '3M' ? '' : 'plain'}">${esc(p.brand)}</span>
          <h3><a href="#/products/${p.id}">${esc(p.model)}</a></h3>
          <p class="oc-desc">${esc(p.name)} — ${esc(p.short)}</p>
          <div class="shade-row" role="group" aria-label="${esc(p.variantLabel)}">${shades}</div>
        </div>
        <a class="oc-img" href="#/products/${p.id}"><img src="${p.images[0]}" alt="${esc(p.name + ' ' + p.model)}" loading="lazy"></a>
      </article>`;
    }).join('');

    return storePage('offers', `
      <div class="container">
        ${heroHtml}
        <div class="center-head"><h2>اختيارات مميزة. بقيمة أفضل.</h2><div class="gold-line">عروض حصرية</div></div>
        ${cards || `<div class="empty">${I('tag')}<p><strong>لا توجد عروض حالياً</strong></p><p>تابعنا قريباً، وتصفح المنتجات في الوقت الحالي.</p><a class="btn btn-primary btn-sm" href="#/products" style="margin-top:14px">تصفح المنتجات</a></div>`}
        <div class="info-strip">
          <span class="circ">${I('info')}</span>
          <div><strong>الأسعار شاملة الخصم — التوافر يُؤكد بعد الطلب</strong><small>يتم تأكيد التوافر وتكلفة التوصيل بعد إتمام الطلب.</small></div>
        </div>
      </div>`);
  }

  /* ---------- Cart ---------- */
  function pageCart() {
    const lines = cartLines();
    if (!lines.length) {
      return storePage('', `<div class="container page">
        <nav class="breadcrumb"><a href="#/">الرئيسية</a>${I('chevLeft')}<span>عربة التسوق</span></nav>
        <h1 class="page-title">عربتك فاضية<span class="dot">.</span></h1>
        <div class="empty" style="margin-top:24px">${I('cart')}<p><strong>لسه ما ضفتش منتجات</strong></p><p>اختار المواصفات والكمية المناسبة لعيادتك.</p>
        <a class="btn btn-primary" href="#/products" style="margin-top:16px">تصفح المنتجات ${I('arrowLeft')}</a></div>
      </div>${trustStrip()}`);
    }
    const items = lines.map((l, i) => `
      <article class="cart-item">
        <a class="ci-img" href="#/products/${l.p.id}"><img src="${l.p.thumb || l.p.images[0]}" alt="${esc(l.p.name)}"></a>
        <div>
          <h3>${esc(l.p.name)} <span class="lat">${esc(l.p.brand + ' ' + l.p.model)}</span></h3>
          <div class="ci-sub">${esc(l.p.short)}</div>
          <div class="ci-row">
            <select class="select ci-variant" data-line="${i}" aria-label="${esc(l.p.variantLabel)}">
              ${l.p.variants.map((v) => `<option value="${esc(v.id)}" ${v.id === l.variant ? 'selected' : ''}>${esc(l.p.variantLabel)}: ${esc(v.label)}</option>`).join('')}
            </select>
            <div class="ci-unit"><small>سعر الوحدة</small><strong>${money(l.price)}</strong></div>
            ${qtyControl(l.qty, 'line-qty', `data-line="${i}"`, 'sm')}
            <div class="ci-total"><small>الإجمالي</small><strong>${money(l.total)}</strong></div>
          </div>
          <div class="ci-note">${esc(l.p.unit)}${l.v.note ? ' • ' + esc(l.v.note) : ''}${vHasOffer(l.v) ? ' • خصم ' + fmt(pct(l.v)) + '٪' : ''}</div>
        </div>
        <button type="button" class="remove-btn" data-act="remove" data-line="${i}" aria-label="حذف ${esc(l.p.name)}">${I('x')}</button>
      </article>`).join('');
    const savings = cartSavings();
    return storePage('', `
      <div class="container page">
        <nav class="breadcrumb"><a href="#/">الرئيسية</a>${I('chevLeft')}<span>عربة التسوق</span></nav>
        <div class="cart-layout">
          <div>
            <h1 class="page-title" style="margin-top:6px">عربتك، على راحتك<span class="dot">.</span></h1>
            <p class="cart-count">${fmt(lines.length)} منتجات</p>
            <div class="cart-list" style="margin-top:18px">${items}</div>
          </div>
          <aside class="summary-card">
            <h2>ملخص الطلب</h2>
            <div class="sum-row"><span>إجمالي المنتجات</span><strong>${money(cartTotal())}</strong></div>
            ${savings ? `<div class="sum-row"><span>وفّرت</span><strong style="color:var(--teal)">${money(savings)}</strong></div>` : ''}
            <div class="sum-row"><span>مصاريف التوصيل</span><span>تُحدد عند التأكيد</span></div>
            <div class="sum-row total"><span>الإجمالي التقريبي</span><strong>${money(cartTotal())}</strong></div>
            <a class="btn btn-primary btn-block btn-lg" href="#/checkout">إتمام الطلب ${I('arrowLeft')}</a>
            <div class="note-box mint">${I('info')} الكميات مفتوحة — الشركة تؤكد التوافر</div>
            <a class="continue" href="#/products">متابعة التسوق ${I('arrowLeft', 'sm')}</a>
          </aside>
        </div>
      </div>
      ${trustStrip()}`);
  }
  const trustStrip = () => `<section class="trust-strip"><div class="container">
      <div class="trust">${I('headset')}<div><strong>دعم متخصص</strong><small>مساعدة قبل وبعد الشراء</small></div></div>
      <div class="trust">${I('truck')}<div><strong>توريد سريع</strong><small>لجميع أنحاء مصر</small></div></div>
      <div class="trust">${I('box')}<div><strong>منتجات أصلية مختارة</strong><small>من علامات عالمية موثوقة</small></div></div>
      <div class="trust">${I('shield')}<div><strong>تعامل موثوق</strong><small>لعيادات ومراكز الأسنان</small></div></div>
    </div></section>`;

  /* ---------- Checkout ---------- */
  function stepper(stage) {
    const steps = [['cart', 'العربة'], ['truck', 'بيانات الطلب'], ['check', 'التأكيد']];
    return `<div class="stepper">${steps.map(([ic, t], i) => {
      const cls = i < stage ? 'done' : i === stage ? 'current' : '';
      const line = i < steps.length - 1 ? `<div class="step-line ${i < stage ? '' : 'pending'}"></div>` : '';
      return `<div class="step ${cls}"><span class="circle">${I(i < stage ? 'check' : ic, 'sm')}</span>${t}</div>${line}`;
    }).join('')}</div>`;
  }

  function pageCheckout() {
    const lines = cartLines();
    if (!lines.length) { location.hash = '#/cart'; return ''; }
    const val = ui.co.values;
    const m = ui.co.method;
    const items = lines.map((l) => `<div class="co-item">
        <span class="qtyx">${fmt(l.qty)} ×</span>
        <div><h4>${esc(l.p.name)} <span class="lat">${esc(l.p.brand + ' ' + l.p.model)}</span></h4>
          <div class="meta">${esc(l.p.variantLabel)}: <span class="lat">${esc(l.v.label)}</span></div>
          <div class="price">${money(l.total)}</div></div>
        <img src="${l.p.thumb || l.p.images[0]}" alt="">
      </div>`).join('');
    return storePage('', `
      <div class="container">
        <div class="checkout-top">
          <img class="checkout-tooth" src="assets/images/checkout-tooth.jpg" alt="">
          <p class="checkout-tag">مستلزمات موثوقة<br>لعيادة أكثر تميزاً.</p>
          <h1>خطوة أخيرة، وطلبك جاهز<span class="dot">.</span></h1>
          ${stepper(1)}
        </div>
        <div class="checkout-layout">
          <form class="panel" id="checkoutForm" novalidate>
            <h2>بيانات الطلب</h2>
            <div class="method-row" role="radiogroup" aria-label="طريقة الاستلام">
              <label class="method ${m === 'pickup' ? 'active' : ''}">${I('store')}<input type="radio" name="method" value="pickup" ${m === 'pickup' ? 'checked' : ''}>
                <span><strong>استلام من المكتب</strong><small>${esc(S.branch)}</small></span><span class="radio"></span></label>
              <label class="method ${m === 'delivery' ? 'active' : ''}">${I('truck')}<input type="radio" name="method" value="delivery" ${m === 'delivery' ? 'checked' : ''}>
                <span><strong>شحن وتوصيل</strong><small>إلى عنوانك</small></span><span class="radio"></span></label>
            </div>
            <div class="note-box mint" id="pickupNote" style="margin-bottom:18px;${m === 'pickup' ? '' : 'display:none'}">${I('pin')} عنوان الاستلام: ${esc(S.address)}</div>
            <div class="form-grid">
              <div class="field"><label for="f-name">الاسم بالكامل</label><input class="input" id="f-name" name="name" maxlength="80" autocomplete="name" placeholder="اكتب اسمك بالكامل" value="${esc(val.name)}"><div class="err">من فضلك اكتب الاسم</div></div>
              <div class="field"><label for="f-phone">رقم الموبايل</label><input class="input" id="f-phone" name="phone" dir="ltr" style="text-align:right" inputmode="tel" autocomplete="tel" placeholder="مثال: 01012345678" value="${esc(val.phone)}"><div class="err">رقم موبايل مصري صحيح يبدأ بـ 010 أو 011 أو 012 أو 015</div></div>
              <div class="field full addr" ${m === 'pickup' ? 'hidden' : ''}><label for="f-city">المدينة / المنطقة</label>
                <select class="select" id="f-city" name="city"><option value="">اختر المدينة / المنطقة</option>${window.CITIES.map((c) => `<option ${val.city === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select><div class="err">اختر المدينة / المنطقة</div></div>
              <div class="field full addr" ${m === 'pickup' ? 'hidden' : ''}><label for="f-address">العنوان بالتفصيل</label><textarea class="textarea" id="f-address" name="address" maxlength="300" placeholder="اكتب عنوانك بالتفصيل">${esc(val.address)}</textarea><div class="err">اكتب العنوان بالتفصيل</div></div>
              <div class="field full"><label for="f-notes">ملاحظات الطلب <small>(اختياري)</small></label><textarea class="textarea" id="f-notes" name="notes" maxlength="500" placeholder="مثال: وقت مناسب للتواصل أو أي ملاحظات إضافية">${esc(val.notes)}</textarea></div>
            </div>
            <label class="check-row" id="agreeRow"><input type="checkbox" name="agree" ${val.agree ? 'checked' : ''}> أقر بأنني قد اطلعت على <a href="#/policy" target="_blank">سياسة الاستبدال خلال ${fmt(S.returnHours)} ساعة</a> وأوافق عليها.</label>
            <button type="submit" class="btn btn-primary btn-block btn-lg">إرسال الطلب</button>
          </form>
          <aside class="panel">
            <h2>ملخص الطلب</h2>
            <div class="co-items">${items}</div>
            <div class="sum-row" style="margin-top:8px"><span>إجمالي المنتجات</span><strong>${money(cartTotal())}</strong></div>
            <div class="sum-row" style="border:0"><span>رسوم الشحن</span><span class="muted">يتم تحديدها لاحقاً</span></div>
            <div class="co-total"><span>الإجمالي الكلي (تقريبي)</span><strong>${money(cartTotal())}</strong></div>
          </aside>
        </div>
      </div>`);
  }

  function readCheckoutForm(form) {
    const fd = new FormData(form);
    ui.co.values = {
      name: (fd.get('name') || '').trim(), phone: (fd.get('phone') || '').trim(), city: fd.get('city') || '',
      address: (fd.get('address') || '').trim(), notes: (fd.get('notes') || '').trim(), agree: !!fd.get('agree')
    };
    return ui.co.values;
  }
  function normalizePhone(v) {
    let s = toLatinDigits(v).replace(/[\s\-()]/g, '');
    if (s.startsWith('+20')) s = '0' + s.slice(3);
    else if (s.startsWith('0020')) s = '0' + s.slice(4);
    return /^01[0125]\d{8}$/.test(s) ? s : null;
  }

  let submitting = false;
  function submitCheckout(form) {
    if (submitting) return;
    const v = readCheckoutForm(form);
    const m = ui.co.method;
    const errors = [];
    const setErr = (name, bad) => {
      const f = form.querySelector(`[name="${name}"]`).closest('.field');
      f.classList.toggle('error', bad);
      if (bad) errors.push(f);
    };
    setErr('name', v.name.length < 2);
    const phone = normalizePhone(v.phone);
    setErr('phone', !phone);
    if (m === 'delivery') { setErr('city', !v.city); setErr('address', v.address.length < 5); }
    else { setErr('city', false); setErr('address', false); }
    $('#agreeRow').classList.toggle('error', !v.agree);
    if (errors.length) { const inp = errors[0].querySelector('input,select,textarea'); inp && inp.focus(); return; }
    if (!v.agree) { toast('من فضلك وافق على سياسة الاستبدال', 'info'); return; }

    submitting = true;
    const next = orders.reduce((mx, o) => Math.max(mx, Number(String(o.id).replace(/\D/g, '')) || 1000), 1000) + 1;
    const order = {
      id: `ORD-${next}`, date: new Date().toISOString(), status: 'new', method: m,
      customer: { name: v.name, phone, city: m === 'delivery' ? v.city : '', address: m === 'delivery' ? v.address : '', notes: v.notes },
      items: cartLines().map((l) => ({
        id: l.p.id, name: l.p.name, brand: l.p.brand, model: l.p.model, variantLabel: l.p.variantLabel,
        variant: l.v.label, variantNote: l.v.note || '', unit: l.p.unit, qty: l.qty, price: l.price,
        basePrice: l.v.basePrice, img: l.p.thumb || l.p.images[0]
      })),
      total: cartTotal()
    };
    orders.unshift(order);
    save('orders', orders);
    cart = []; persistCart();
    ui.co.values = {};
    submitting = false;
    location.hash = `#/order/${order.id}`;
  }

  /* ---------- Order confirmation ---------- */
  function pageConfirm(id) {
    const o = orders.find((x) => x.id === id);
    if (!o) return pageNotFound();
    const rows = o.items.map((it) => `<tr>
        <td><div class="pcell"><img src="${it.img}" alt=""><div><strong>${esc(it.brand + ' ' + it.model)}</strong><small>${esc(it.name)}</small></div></div></td>
        <td class="num">${esc(it.variant)}</td><td class="num">${fmt(it.qty)}</td><td>${money(it.price * it.qty)}</td></tr>`).join('');
    const steps = [['تم تسجيل الطلب', 'تم استلام طلبك'], ['قيد المراجعة', 'نراجع التوافر والتكلفة'], ['التأكيد', 'هنتواصل معاك للتأكيد']];
    const stage = { new: 0, review: 1 }[o.status] ?? 2;
    return storePage('', `
      <section class="confirm-wrap">
        <img class="confirm-side left" src="assets/images/confirm-left.jpg" alt="">
        <img class="confirm-side right" src="assets/images/confirm-right.jpg" alt="">
        <div class="container confirm-center">
          <div class="check-badge"><div>${I('check')}</div></div>
          <h1>تم تسجيل طلبك بنجاح</h1>
          <p>هنتواصل معاك لتأكيد التوافر وتكلفة التوصيل</p>
          <div class="order-no">رقم الطلب: <span class="lat">${esc(o.id)}</span></div>
          <div class="confirm-card">
            <h2>ملخص الطلب</h2>
            <div style="overflow:auto"><table class="mini-table">
              <thead><tr><th>المنتج</th><th class="num">النوع / المقاس</th><th class="num">الكمية</th><th>السعر</th></tr></thead>
              <tbody>${rows}</tbody></table></div>
            <div class="total-bar"><span>إجمالي قيمة المنتجات</span><strong>${money(o.total)}</strong></div>
            <div class="method-line">${I(o.method === 'pickup' ? 'store' : 'truck', 'lg')}<div><strong>طريقة الاستلام</strong>
              <small>${o.method === 'pickup' ? 'استلام من المكتب — ' + esc(S.address) : 'شحن وتوصيل — ' + esc(o.customer.city + '، ' + o.customer.address)}</small></div></div>
            <div class="progress">${steps.map(([t, s], i) => `<div class="pstep ${i <= stage ? 'on' : ''}"><span class="pdot"></span><strong>${t}</strong><small>${s}</small></div>`).join('')}</div>
            <div class="confirm-actions">
              <a class="btn btn-primary" href="#/products">${I('arrowRight', 'sm')} متابعة التصفح</a>
              <button type="button" class="btn btn-outline" data-act="print">${I('printer', 'sm')} طباعة الملخص</button>
            </div>
          </div>
        </div>
      </section>`);
  }

  /* ---------- Policy ---------- */
  function pagePolicy(sec) {
    ui.policySec = sec || 'returns';
    const nav = [['returns', 'الاستبدال والاسترجاع'], ['terms', 'الشروط التفصيلية'], ['privacy', 'سياسة الخصوصية']];
    return storePage('', `
      <section class="policy-hero"><div class="container">
        <nav class="breadcrumb"><a href="#/">الرئيسية</a>${I('chevLeft')}<span>سياسة المتجر</span>${I('chevLeft')}<span>الاستبدال والاسترجاع</span></nav>
        <h1>الاستبدال والاسترجاع</h1>
        <p>نحرص على توفير تجربة شراء موثوقة ومريحة لعملائنا في ${esc(S.name)}.</p>
      </div></section>
      <div class="container policy-layout">
        <aside class="policy-nav"><h3>سياسة المتجر</h3>${nav.map(([id, t]) => `<a href="#/policy/${id}" class="${ui.policySec === id ? 'active' : ''}">${t}</a>`).join('')}</aside>
        <div>
          <section class="policy-sec" id="sec-returns">
            <div><h2>مدة الاستبدال والاسترجاع</h2>
              <p>يمكن استبدال أو استرجاع المنتج خلال ${fmt(S.returnHours)} ساعة من تاريخ الاستلام.</p>
              <p>يتم ذلك وفقاً للشروط الموضحة أدناه.</p></div>
            <div class="hours-card">
              <div><div class="h-lbl">الاستبدال والاسترجاع خلال</div><div class="h-num"><b>${fmt(S.returnHours)}</b><span>ساعة</span></div></div>
              <div class="h-icon"><svg class="policy-ill" viewBox="0 0 96 96" fill="none" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"><path d="M22 42a26 26 0 0 1 44-16l6 6" stroke="#117C74"/><path d="M74 18v15H59" stroke="#117C74"/><path d="M74 54a26 26 0 0 1-44 16l-6-6" stroke="#EABF9C"/><path d="M22 78V63h15" stroke="#EABF9C"/></svg></div>
            </div>
          </section>
          <section class="policy-sec simple" id="sec-terms">
            <div><h2>تفاصيل الشروط</h2>
              <ul><li>يتم الاستبدال أو الاسترجاع وفقاً لحالة المنتج كما تم استلامه، وبما يتوافق مع سياسة المتجر المعتمدة.</li>
              <li>يُرجى ذكر رقم الطلب عند التواصل معنا بخصوص الاستبدال أو الاسترجاع.</li>
              <li>يتم تأكيد التوافر وتكلفة التوصيل والإجمالي النهائي لكل طلب بعد مراجعته.</li></ul></div>
            <svg class="policy-ill" viewBox="0 0 96 96" fill="none" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><path d="M64 14H24a6 6 0 0 0-6 6v58a6 6 0 0 0 6 6h28" stroke="#117C74"/><path d="M32 34h28M32 46h28M32 58h14" stroke="#117C74"/><circle cx="68" cy="68" r="15" fill="#EABF9C" stroke="none"/><path d="m61 68 5 5 9-9" stroke="#fff"/></svg>
          </section>
          <section class="policy-sec simple" id="sec-privacy">
            <div><h2>سياسة الخصوصية</h2>
              <p>نستخدم البيانات التي تدخلها عند الطلب (الاسم، رقم الموبايل، العنوان) لمراجعة الطلب والتواصل معك وتوصيله فقط، ولا نشاركها مع أي طرف آخر لأغراض تسويقية.</p></div>
            <svg class="policy-ill" viewBox="0 0 96 96" fill="none" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"><path d="M48 12 20 22v22c0 18 12 30 28 36 16-6 28-18 28-36V22z" stroke="#117C74"/><path d="m36 48 8 8 16-16" stroke="#EABF9C"/></svg>
          </section>
        </div>
      </div>
      <div class="container policy-foot">
        <div class="note-box">${I('file')} لأي استفسار بخصوص طلبك، يُرجى ذكر رقم الطلب وسيتواصل معك فريقنا.</div>
        <a class="btn btn-primary" href="#/products">العودة إلى المنتجات ${I('arrowLeft')}</a>
      </div>`);
  }

  function pageNotFound() {
    return storePage('', `<div class="container page"><div class="empty" style="margin-top:40px">${I('search')}
      <p><strong>الصفحة دي مش موجودة</strong></p><p>ممكن الرابط اتغير أو المنتج اتشال.</p>
      <a class="btn btn-primary" href="#/products" style="margin-top:16px">تصفح المنتجات</a></div></div>`);
  }

  /* ---------- Admin ---------- */
  const statusLabel = (id) => (window.ORDER_STATUSES.find((s) => s.id === id) || {}).label || id;
  const statusPill = (id) => `<span class="status st-${esc(id)}">${esc(statusLabel(id))}</span>`;

  function adminShell(active, title, content, drawer) {
    return `<div class="admin-shell">
      <aside class="admin-side">
        <a class="brand" href="#/">${LOGO}<span class="brand-text"><span class="brand-name">${esc(S.name)}</span><span class="brand-sub">${esc(S.nameEn)}</span></span></a>
        <nav class="admin-nav">
          <a href="#/admin" class="${active === 'orders' ? 'active' : ''}">${I('clipboard')} الطلبات</a>
          <a href="#/admin/products" class="${active === 'products' ? 'active' : ''}">${I('cube')} المنتجات والعروض</a>
          <a href="#/" class="mobile-only">${I('store')} عرض المتجر</a>
        </nav>
        <div class="side-bottom"><nav class="admin-nav"><a href="#/" target="_blank">${I('external')} فتح المتجر</a></nav></div>
      </aside>
      <div class="admin-main">
        <div class="admin-top"><h2>لوحة الإدارة — ${esc(title)}</h2><a class="admin-btn" href="#/">${I('store', 'sm')}<span>عرض المتجر</span></a></div>
        <div class="admin-content fade-in ${drawer ? 'with-drawer' : ''}"><div>${content}</div>${drawer || ''}</div>
        <div class="admin-footer"><span>${I('pin', 'sm')} ${esc(S.address)}</span><span>${esc(S.name)}</span></div>
      </div>
    </div>`;
  }

  function adminOrdersRows() {
    const a = ui.admin;
    const q = toLatinDigits(a.q).trim().toLowerCase();
    const list = orders.filter((o) => (a.filter === 'all' || o.status === a.filter) &&
      (!q || [o.id, o.customer.name, o.customer.phone].join(' ').toLowerCase().includes(q)));
    if (!orders.length) return `<div class="empty">${I('clipboard')}<p><strong>لا توجد طلبات بعد</strong></p><p>أي طلب يتسجل من المتجر هيظهر هنا فوراً.</p></div>`;
    if (!list.length) return `<div class="empty">${I('search')}<p><strong>لا توجد طلبات مطابقة</strong></p></div>`;
    return `<div class="table-wrap"><table class="data-table">
      <thead><tr><th>رقم الطلب</th><th>العميل</th><th>طريقة الاستلام</th><th>إجمالي المنتجات</th><th>الحالة</th><th>الإجراء</th></tr></thead>
      <tbody>${list.map((o) => `<tr class="${a.openOrder === o.id ? 'selected' : ''}">
        <td class="ord" data-label="رقم الطلب"><div><bdi>#${esc(o.id)}</bdi><div class="muted" style="font-family:var(--f-body);font-weight:400;font-size:12.5px">${esc(fmtDate(o.date))}</div></div></td>
        <td data-label="العميل"><div>${esc(o.customer.name)}<div class="muted lat" style="font-size:13px">${esc(o.customer.phone)}</div></div></td>
        <td data-label="الاستلام">${o.method === 'pickup' ? 'استلام من الفرع' : 'توصيل للعنوان'}</td>
        <td class="amt" data-label="الإجمالي"><strong>${money(o.total)}</strong><small>${fmt(o.items.length)} منتجات</small></td>
        <td data-label="الحالة">${statusPill(o.status)}</td>
        <td><button type="button" class="view-btn" data-act="open-order" data-id="${esc(o.id)}">${I('eye', 'sm')} عرض</button></td>
      </tr>`).join('')}</tbody></table></div>`;
  }

  function orderDrawer(o) {
    if (!o) return '';
    return `<aside class="drawer" aria-label="تفاصيل الطلب">
      <div class="drawer-head"><h2>تفاصيل الطلب</h2><button type="button" class="close" data-act="close-order" aria-label="إغلاق">${I('x')}</button></div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:14px"><span class="ord lat" style="font-weight:700;font-size:20px">#${esc(o.id)}</span>${statusPill(o.status)}</div>
      <p class="muted" style="font-size:14px;margin-top:6px">تم الطلب في ${esc(fmtDate(o.date))}</p>
      <div class="sep"></div>
      <h3>المنتجات المطلوبة</h3>
      ${o.items.map((it) => `<div class="d-item"><div>
          <h4>${esc(it.name)}</h4><div class="lat" style="font-size:14px">${esc(it.brand + ' ' + it.model)}</div>
          <div class="meta">${esc(it.variantLabel)}: <span class="lat">${esc(it.variant)}</span></div>
          <div class="meta">الكمية: ${fmt(it.qty)} × ${money(it.price)}</div>
          <strong class="price">${money(it.price * it.qty)}</strong></div>
          <img src="${it.img}" alt=""></div>`).join('')}
      <div class="total-bar"><span>الإجمالي</span><strong>${money(o.total)}</strong></div>
      <div class="sep"></div>
      <h3>بيانات العميل</h3>
      <dl class="kv">
        <dt>الاسم</dt><dd>${esc(o.customer.name)}</dd>
        <dt>الموبايل</dt><dd><a class="lat" href="tel:${esc(o.customer.phone)}" style="color:var(--teal)">${esc(o.customer.phone)}</a></dd>
        <dt>الاستلام</dt><dd>${o.method === 'pickup' ? 'استلام من الفرع' : 'شحن وتوصيل'}</dd>
        ${o.method === 'delivery' ? `<dt>المنطقة</dt><dd>${esc(o.customer.city)}</dd><dt>العنوان</dt><dd>${esc(o.customer.address)}</dd>` : ''}
        ${o.customer.notes ? `<dt>ملاحظات</dt><dd>${esc(o.customer.notes)}</dd>` : ''}
      </dl>
      <div class="sep"></div>
      <h3>تحديث حالة الطلب</h3>
      <div class="field"><label>الحالة الحالية</label><input class="input" readonly value="${esc(statusLabel(o.status))}"></div>
      <div class="field"><label for="statusSelect">تغيير الحالة</label>
        <select class="select" id="statusSelect" style="width:100%">${window.ORDER_STATUSES.map((s) => `<option value="${s.id}" ${s.id === o.status ? 'selected' : ''}>${s.label}</option>`).join('')}</select></div>
      <button type="button" class="btn btn-primary btn-block" data-act="save-status" data-id="${esc(o.id)}">حفظ الحالة</button>
      <button type="button" class="btn btn-ghost btn-block btn-sm" style="margin-top:10px;color:var(--red)" data-act="delete-order" data-id="${esc(o.id)}">${I('trash', 'sm')} حذف الطلب</button>
    </aside>`;
  }

  function pageAdminOrders() {
    const a = ui.admin;
    const counts = (id) => (id === 'all' ? orders.length : orders.filter((o) => o.status === id).length);
    const filters = [{ id: 'all', label: 'الكل' }, ...window.ORDER_STATUSES].map((f) =>
      `<button type="button" class="filter-btn ${a.filter === f.id ? 'active' : ''}" data-act="order-filter" data-id="${f.id}">${f.label}<span class="n">${counts(f.id)}</span></button>`).join('');
    const content = `<div class="admin-head"><span class="admin-pill">${fmt(orders.length)} طلبات</span>
        <h1>طلباتك، في صورة واضحة<span class="dot">.</span></h1>
        <p>تابع جميع الطلبات من مكان واحد مع تحديث سريع للحالة.</p></div>
      <div class="admin-tools">
        <label class="search-box">${I('search')}<input type="search" id="orderSearch" placeholder="البحث برقم الطلب أو اسم العميل ..." value="${esc(a.q)}"></label>
        ${filters}
      </div>
      <div id="ordersTable">${adminOrdersRows()}</div>`;
    return adminShell('orders', 'الطلبات', content, orderDrawer(orders.find((o) => o.id === a.openOrder)));
  }

  function adminProductsRows() {
    const q = toLatinDigits(ui.admin.prodQ).trim().toLowerCase();
    const list = products.filter((p) => !q || [p.name, p.brand, p.model, catName(p.category)].join(' ').toLowerCase().includes(q));
    if (!list.length) return `<div class="empty">${I('search')}<p><strong>لا توجد منتجات مطابقة</strong></p></div>`;
    return `<div class="table-wrap"><table class="data-table">
      <thead><tr><th>الصورة</th><th>اسم المنتج</th><th>القسم</th><th>السعر الأصلي (ج.م)</th><th>سعر العرض (ج.م)</th><th>تعديل</th></tr></thead>
      <tbody>${list.map((p) => {
        const offer = bestOffer(p);
        const v = offer || p.variants[0];
        const range = pMin(p) !== pMax(p);
        return `<tr class="${ui.admin.editId === p.id ? 'selected' : ''}">
          <td class="cell-block" style="width:170px"><img src="${p.thumb || p.images[0]}" alt="" style="width:150px;height:100px;object-fit:cover;border-radius:8px"></td>
          <td class="cell-block"><strong class="lat" style="display:block">${esc(p.brand + ' ' + p.model)}</strong><span>${esc(p.name)}</span><div class="chips" style="margin-top:10px">${p.variants.map((x) => `<span class="chip static">${esc(x.label)}</span>`).join('')}</div></td>
          <td data-label="القسم">${esc(catName(p.category))}</td>
          <td data-label="السعر الأصلي">${offer ? `<span class="money-old">${fmt(v.basePrice)}</span>` : `<span>${range ? 'من ' : ''}${fmt(Math.min(...p.variants.map((x) => x.basePrice)))}</span>`}</td>
          <td data-label="سعر العرض">${offer ? `<span class="money-new">${fmt(v.offerPrice)}</span>` : '<span class="muted">—</span>'}</td>
          <td><button type="button" class="view-btn" data-act="edit-prod" data-id="${p.id}">${I('edit', 'sm')} تعديل</button></td>
        </tr>`;
      }).join('')}</tbody></table></div>`;
  }

  /* Placeholder shown for a product saved without photos */
  const PLACEHOLDER = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 320"><rect width="400" height="320" fill="#e7ebe3"/><path d="M200 120c-12-9-23-13-34-13-19 0-30 14-30 34 0 19 10 30 13 47 4 21 7 58 22 58 13 0 14-29 18-45 2-9 6-14 11-14s9 5 11 14c4 16 5 45 18 45 15 0 18-37 22-58 3-17 13-28 13-47 0-20-11-34-30-34-11 0-22 4-34 13z" fill="none" stroke="#117C74" stroke-width="8" stroke-linejoin="round" opacity=".55"/></svg>');

  const blankProduct = () => ({
    id: 'p-' + Date.now().toString(36), isNew: true,
    brand: '', name: '', model: '', short: '', description: '',
    category: window.CATEGORIES[0].id, variantLabel: 'المقاس',
    variants: [{ id: '', label: '', note: '', basePrice: '', offerPrice: null }],
    defaultVariant: '', unit: 'قطعة واحدة', details: [], images: [], thumb: ''
  });

  function productDrawer() {
    const d = ui.admin.draft;
    if (!d) return '';
    const imgs = d.images.length ? d.images : [PLACEHOLDER];
    return `<aside class="drawer" aria-label="${d.isNew ? 'إضافة منتج' : 'تعديل المنتج'}">
      <div class="drawer-head"><div><h2>${d.isNew ? 'إضافة منتج جديد' : 'تعديل المنتج'}</h2><p>معلومات المنتج والصور والأسعار</p></div><button type="button" class="close" data-act="close-prod" aria-label="إغلاق">${I('x')}</button></div>
      <div class="drawer-img"><img src="${imgs[0]}" alt="" id="draftImg"><label>${I('image', 'sm')} ${d.images.length ? 'إضافة صور' : 'رفع صور المنتج'}<input type="file" accept="image/*" multiple id="imgUpload"></label></div>
      ${d.images.length ? `<div class="gallery-edit">${d.images.map((src, i) => `<div class="g-item ${i === 0 ? 'main' : ''}">
          <img src="${src}" alt="">
          ${i === 0 ? '<span class="g-badge">الرئيسية</span>' : `<button type="button" class="g-main" data-act="img-main" data-i="${i}">رئيسية</button>`}
          <button type="button" class="g-del" data-act="img-del" data-i="${i}" aria-label="حذف الصورة">${I('x', 'sm')}</button>
        </div>`).join('')}</div>` : ''}
      <form id="prodForm" novalidate>
        <div class="field"><label for="p-name">اسم المنتج</label><input class="input" id="p-name" name="name" maxlength="80" placeholder="مثال: قفازات نيتريل" value="${esc(d.name)}"></div>
        <div class="field"><label>الماركة والموديل</label><div class="two-col"><input class="input lat" name="brand" placeholder="Brand" value="${esc(d.brand)}" aria-label="الماركة"><input class="input lat" name="model" placeholder="Model" value="${esc(d.model)}" aria-label="الموديل"></div></div>
        <div class="field"><label for="p-cat">القسم</label><select class="select" id="p-cat" name="category" style="width:100%">${window.CATEGORIES.map((c) => `<option value="${c.id}" ${c.id === d.category ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></div>
        <div class="field"><label for="p-short">وصف مختصر</label><textarea class="textarea" id="p-short" name="short" maxlength="200" placeholder="سطر واحد يظهر تحت اسم المنتج">${esc(d.short)}</textarea></div>
        <div class="field"><label for="p-desc">الوصف الكامل</label><textarea class="textarea" id="p-desc" name="description" maxlength="800">${esc(d.description)}</textarea></div>
        <div class="field"><label for="p-details">تفاصيل المنتج <small>(كل نقطة في سطر)</small></label><textarea class="textarea" id="p-details" name="details" maxlength="1200" placeholder="الخامة: نيتريل">${esc((d.details || []).join('\n'))}</textarea></div>
        <div class="two-col">
          <div class="field"><label for="p-unit">وحدة البيع</label><input class="input" id="p-unit" name="unit" maxlength="60" placeholder="مثال: علبة ١٠٠ قطعة" value="${esc(d.unit)}"></div>
          <div class="field"><label for="p-vlabel">اسم الاختيار</label><input class="input" id="p-vlabel" name="variantLabel" maxlength="20" placeholder="المقاس / اللون / الموديل" value="${esc(d.variantLabel)}"></div>
        </div>
        <h3>الاختيارات والأسعار</h3>
        <div class="var-grid muted" style="font-size:13px;margin-bottom:6px"><span>الاختيار</span><span>السعر الأصلي (ج.م)</span><span>سعر العرض (ج.م)</span><span></span></div>
        ${d.variants.map((v, i) => `<div class="var-grid" style="margin-bottom:10px">
          <input class="input lat" name="label-${i}" maxlength="20" placeholder="M" value="${esc(v._label ?? v.label)}" aria-label="اسم الاختيار ${i + 1}">
          <input class="input" name="base-${i}" inputmode="decimal" value="${esc(v._base ?? v.basePrice)}" aria-label="السعر الأصلي">
          <input class="input" name="offer-${i}" inputmode="decimal" value="${esc(v._offer ?? (v.offerPrice == null ? '' : v.offerPrice))}" placeholder="بدون عرض" aria-label="سعر العرض">
          <button type="button" class="remove-btn" data-act="del-variant" data-i="${i}" aria-label="حذف الاختيار" ${d.variants.length < 2 ? 'disabled' : ''}>${I('x', 'sm')}</button>
        </div>`).join('')}
        <button type="button" class="btn btn-ghost btn-sm" data-act="add-variant">${I('plus', 'sm')} إضافة اختيار</button>
        <div class="note-box" style="margin-top:16px">${I('info')} اترك سعر العرض فارغاً لو مفيش عرض. سعر العرض لازم يكون أقل من السعر الأصلي.</div>
        <button type="submit" class="btn btn-primary btn-block" style="margin-top:16px">${d.isNew ? 'إضافة المنتج للمتجر' : 'حفظ التعديلات'}</button>
        ${d.isNew ? '' : `<button type="button" class="btn btn-ghost btn-block btn-sm" style="margin-top:10px;color:var(--red)" data-act="delete-prod">${I('trash', 'sm')} حذف المنتج</button>`}
      </form>
    </aside>`;
  }

  function pageAdminProducts() {
    const content = `<div class="admin-head"><span class="admin-pill">${fmt(products.length)} منتجات</span>
        <h1>كتالوج واضح. إدارة أبسط<span class="dot">.</span></h1>
        <p>يمكنك إضافة وتعديل المنتجات والعروض بسهولة مع معاينة فورية في المتجر.</p></div>
      <div class="admin-tools">
        <label class="search-box">${I('search')}<input type="search" id="prodSearch" placeholder="ابحث عن منتج أو قسم ..." value="${esc(ui.admin.prodQ)}"></label>
        <button type="button" class="btn btn-primary" data-act="new-prod">${I('plus', 'sm')} إضافة منتج جديد</button>
        <button type="button" class="filter-btn" data-act="reset-products">${I('reset', 'sm')} استعادة البيانات الافتراضية</button>
      </div>
      <div id="productsTable">${adminProductsRows()}</div>`;
    return adminShell('products', 'المنتجات والعروض', content, productDrawer());
  }

  /* Pull typed values from the product form into the draft (so re-renders keep them) */
  const DRAFT_FIELDS = ['name', 'brand', 'model', 'category', 'short', 'description', 'unit', 'variantLabel'];
  function syncDraft() {
    const f = $('#prodForm'); const d = ui.admin.draft;
    if (!f || !d) return;
    DRAFT_FIELDS.forEach((k) => { d[k] = f.elements[k].value; });
    d.details = f.elements.details.value.split('\n').map((s) => s.trim()).filter(Boolean);
    d.variants.forEach((v, i) => {
      v._label = f.elements[`label-${i}`].value; v._base = f.elements[`base-${i}`].value; v._offer = f.elements[`offer-${i}`].value;
    });
  }

  /* Shrink uploaded photos so they fit comfortably in browser storage */
  function compressImage(file) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onerror = reject;
      r.onload = () => {
        const img = new Image();
        img.onerror = reject;
        img.onload = () => {
          const scale = Math.min(1, 1000 / Math.max(img.width, img.height));
          const c = document.createElement('canvas');
          c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
          resolve(c.toDataURL('image/jpeg', 0.82));
        };
        img.src = r.result;
      };
      r.readAsDataURL(file);
    });
  }

  function saveProduct() {
    syncDraft();
    const d = ui.admin.draft;
    DRAFT_FIELDS.forEach((k) => { d[k] = String(d[k] || '').trim(); });
    if (!d.name) { $('#p-name').focus(); return toast('اكتب اسم المنتج', 'info'); }
    if (!d.variantLabel) d.variantLabel = 'الاختيار';
    const seen = new Set();
    const variants = [];
    for (const v of d.variants) {
      const label = String(v._label ?? v.label).trim();
      const base = parsePrice(v._base ?? v.basePrice);
      const offer = parsePrice(v._offer ?? (v.offerPrice == null ? '' : v.offerPrice));
      if (!label) return toast('اكتب اسم كل اختيار (مثال: M أو A2)', 'info');
      if (seen.has(label.toLowerCase())) return toast(`الاختيار ${esc(label)} مكرر`, 'info');
      if (!base) return toast(`السعر الأصلي لـ ${esc(label)} غير صحيح`, 'info');
      if (offer === null) return toast(`سعر العرض لـ ${esc(label)} غير صحيح`, 'info');
      if (offer !== '' && offer >= base) return toast(`سعر العرض لـ ${esc(label)} لازم يكون أقل من السعر الأصلي`, 'info');
      seen.add(label.toLowerCase());
      variants.push({ id: label, label, note: label === v.label ? (v.note || '') : '', basePrice: base, offerPrice: offer === '' ? null : offer });
    }
    d.variants = variants;
    if (!getVariant(d, d.defaultVariant)) d.defaultVariant = d.variants[0].id;
    if (!d.images.length) d.images = [PLACEHOLDER];
    if (d.isNew || d._imagesEdited) { d.thumb = d.images[0]; d.featured = d.images[0]; }
    const wasNew = d.isNew;
    delete d.isNew; delete d._imagesEdited;
    const saved = clone(d);
    products = wasNew ? [...products, saved] : products.map((p) => (p.id === d.id ? saved : p));
    cart = cart.filter((l) => getVariant(getProduct(l.id), l.variant));
    save('products', products); persistCart();
    ui.admin.editId = null; ui.admin.draft = null;
    toast(wasNew ? `تمت إضافة ${esc(saved.name)} للمتجر <a href="#/products/${saved.id}">عرض المنتج</a>` : 'تم حفظ التعديلات وتحديث المتجر');
    render(true);
  }

  /* ---------- Events ---------- */
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-act]');
    if (!el) return;
    const act = el.dataset.act;
    const id = el.dataset.id;
    switch (act) {
      case 'menu': $('#mobileNav').classList.toggle('open'); break;
      case 'add': addToCart(id, el.dataset.v, 1); break;
      case 'feat-var': ui.featSel[id] = el.dataset.v; render(true); break;
      case 'offer-var': ui.offerSel[id] = el.dataset.v; render(true); break;
      case 'cat': ui.catalog.cat = id; $$('.cat-list button').forEach((b) => b.classList.toggle('active', b === el)); refreshCatalog(); break;
      case 'clear-filters': e.preventDefault(); ui.catalog = { cat: 'all', q: '', offers: false, sort: 'default' }; render(true); break;
      case 'pd-var': ui.pd.variant = el.dataset.v; render(true); break;
      case 'pd-img': ui.pd.img = Number(el.dataset.i); render(true); break;
      case 'pd-qty': ui.pd.qty = Math.max(1, ui.pd.qty + Number(el.dataset.dir)); $('[data-qty-input="pd-qty"]').value = ui.pd.qty; break;
      case 'pd-add': addToCart(ui.pd.id, ui.pd.variant, ui.pd.qty); break;
      case 'acc': el.parentElement.classList.toggle('open'); break;
      case 'line-qty': {
        const l = cart[Number(el.dataset.line)];
        if (l) { l.qty = Math.max(1, l.qty + Number(el.dataset.dir)); persistCart(); render(true); }
        break;
      }
      case 'remove': cart.splice(Number(el.dataset.line), 1); persistCart(); render(true); toast('تم حذف المنتج من العربة', 'trash'); break;
      case 'print': window.print(); break;
      case 'order-filter': ui.admin.filter = id; render(true); break;
      case 'open-order': ui.admin.openOrder = id; render(true); break;
      case 'close-order': ui.admin.openOrder = null; render(true); break;
      case 'save-status': {
        const o = orders.find((x) => x.id === id);
        if (o) { o.status = $('#statusSelect').value; save('orders', orders); toast(`تم تحديث حالة الطلب ${esc(o.id)}`); render(true); }
        break;
      }
      case 'delete-order':
        if (confirm(`حذف الطلب ${id} نهائياً؟`)) { orders = orders.filter((o) => o.id !== id); save('orders', orders); ui.admin.openOrder = null; render(true); toast('تم حذف الطلب', 'trash'); }
        break;
      case 'edit-prod': ui.admin.editId = id; ui.admin.draft = clone(getProduct(id)); render(true); break;
      case 'close-prod': ui.admin.editId = null; ui.admin.draft = null; render(true); break;
      case 'del-variant': syncDraft(); ui.admin.draft.variants.splice(Number(el.dataset.i), 1); render(true); break;
      case 'add-variant': {
        syncDraft();
        const d = ui.admin.draft;
        const ref = d.variants[d.variants.length - 1] || {};
        d.variants.push({ id: '', label: '', note: '', basePrice: ref.basePrice ?? '', offerPrice: ref.offerPrice ?? null, _label: '', _base: ref._base, _offer: ref._offer });
        render(true);
        const inputs = $$('#prodForm [name^="label-"]'); inputs[inputs.length - 1].focus();
        break;
      }
      case 'new-prod': ui.admin.editId = null; ui.admin.draft = blankProduct(); render(true); $('#p-name').focus(); break;
      case 'img-main': {
        syncDraft();
        const d = ui.admin.draft; const [img] = d.images.splice(Number(el.dataset.i), 1);
        d.images.unshift(img); d._imagesEdited = true; render(true);
        break;
      }
      case 'img-del': syncDraft(); ui.admin.draft.images.splice(Number(el.dataset.i), 1); ui.admin.draft._imagesEdited = true; render(true); break;
      case 'delete-prod': {
        const d = ui.admin.draft;
        if (confirm(`حذف "${d.name}" من المتجر نهائياً؟ الطلبات المسجلة لن تتأثر.`)) {
          products = products.filter((p) => p.id !== d.id); save('products', products);
          cart = cart.filter((l) => l.id !== d.id); persistCart();
          ui.admin.editId = null; ui.admin.draft = null; render(true); toast('تم حذف المنتج', 'trash');
        }
        break;
      }
      case 'reset-products':
        if (confirm('استعادة بيانات المنتجات الافتراضية؟ الطلبات المسجلة لن تتأثر.')) {
          products = clone(window.DEFAULT_PRODUCTS); save('products', products);
          cart = cart.filter((l) => getVariant(getProduct(l.id), l.variant)); persistCart();
          ui.admin.editId = null; ui.admin.draft = null; render(true); toast('تمت استعادة البيانات الافتراضية');
        }
        break;
    }
  });

  document.addEventListener('input', (e) => {
    const t = e.target;
    if (t.id === 'catalogSearch') { ui.catalog.q = t.value; refreshCatalog(); }
    else if (t.id === 'orderSearch') { ui.admin.q = t.value; $('#ordersTable').innerHTML = adminOrdersRows(); }
    else if (t.id === 'prodSearch') { ui.admin.prodQ = t.value; $('#productsTable').innerHTML = adminProductsRows(); }
  });

  document.addEventListener('change', (e) => {
    const t = e.target;
    if (t.matches('[data-act="offers-only"]')) { ui.catalog.offers = t.checked; refreshCatalog(); }
    else if (t.id === 'sortSelect') { ui.catalog.sort = t.value; refreshCatalog(); }
    else if (t.matches('.ci-variant')) {
      const i = Number(t.dataset.line); const l = cart[i];
      const dup = cart.find((x, j) => j !== i && x.id === l.id && x.variant === t.value);
      if (dup) { dup.qty += l.qty; cart.splice(i, 1); } else l.variant = t.value;
      persistCart(); render(true);
    } else if (t.matches('[data-qty-input]')) {
      const n = parseQty(t.value);
      const kind = t.dataset.qtyInput;
      if (n === null) {
        toast('الكمية لازم تكون رقم صحيح أكبر من صفر', 'info');
        t.value = kind === 'pd-qty' ? ui.pd.qty : cart[Number(t.dataset.line)].qty;
        return;
      }
      if (kind === 'pd-qty') { ui.pd.qty = n; t.value = n; }
      else { cart[Number(t.dataset.line)].qty = n; persistCart(); render(true); }
    } else if (t.name === 'method') {
      ui.co.method = t.value;
      $$('.method').forEach((m) => m.classList.toggle('active', m.contains(t)));
      $$('.addr').forEach((f) => { f.hidden = t.value === 'pickup'; f.classList.remove('error'); });
      $('#pickupNote').style.display = t.value === 'pickup' ? '' : 'none';
    } else if (t.id === 'imgUpload' && t.files.length) {
      const files = Array.from(t.files).filter((f) => f.type.startsWith('image/'));
      Promise.all(files.map(compressImage)).then((urls) => {
        syncDraft();
        const d = ui.admin.draft;
        d.images = [...d.images, ...urls]; d._imagesEdited = true;
        render(true);
      }).catch(() => toast('تعذر قراءة الصورة — جرّب صورة أخرى', 'info'));
    }
  });

  document.addEventListener('submit', (e) => {
    const f = e.target;
    if (f.dataset.form === 'search') {
      e.preventDefault();
      ui.catalog.q = f.elements.q.value.trim();
      ui.catalog.cat = 'all';
      if (location.hash.startsWith('#/products') && !location.hash.startsWith('#/products/')) render(true);
      else location.hash = '#/products';
    } else if (f.id === 'checkoutForm') { e.preventDefault(); submitCheckout(f); }
    else if (f.id === 'prodForm') { e.preventDefault(); saveProduct(); }
  });

  /* Keep checkout values when leaving the field */
  document.addEventListener('focusout', (e) => {
    const f = e.target.form;
    if (f && f.id === 'checkoutForm') readCheckoutForm(f);
  });

  window.addEventListener('storage', (e) => {
    if (!e.key || !e.key.startsWith(S.storageKey)) return;
    products = load('products', products); cart = load('cart', cart); orders = load('orders', orders);
    render(true);
  });

  /* ---------- Router ---------- */
  const TITLES = { home: '', products: 'المنتجات', offers: 'العروض', cart: 'عربة التسوق', checkout: 'إتمام الطلب', order: 'تأكيد الطلب', policy: 'سياسة الاستبدال والاسترجاع', admin: 'لوحة الإدارة' };

  function render(keepScroll) {
    const raw = location.hash.replace(/^#\/?/, '');
    const [path, query] = raw.split('?');
    const parts = path.split('/').filter(Boolean).map(decodeURIComponent);
    const params = new URLSearchParams(query || '');
    let html; let key = parts[0] || 'home';
    switch (key) {
      case 'home': html = pageHome(); break;
      case 'products':
        if (parts[1]) { html = pageProduct(parts[1]); break; }
        if (params.has('cat')) ui.catalog.cat = params.get('cat');
        html = pageCatalog(); break;
      case 'offers': html = pageOffers(); break;
      case 'cart': html = pageCart(); break;
      case 'checkout': html = pageCheckout(); break;
      case 'order': html = pageConfirm(parts[1]); break;
      case 'policy': html = pagePolicy(parts[1]); break;
      case 'admin': html = parts[1] === 'products' ? pageAdminProducts() : pageAdminOrders(); break;
      default: html = pageNotFound(); key = '';
    }
    if (!html) return;
    const y = window.scrollY;
    app.innerHTML = html;
    updateBadge();
    if (key === 'products' && parts[1]) { const p = getProduct(parts[1]); if (p) document.title = `${p.name} ${p.brand} ${p.model} | ${S.name}`; }
    else document.title = TITLES[key] ? `${TITLES[key]} | ${S.name}` : S.name;
    if (keepScroll) window.scrollTo(0, y);
    else if (key === 'policy' && parts[1]) { const s = document.getElementById(`sec-${parts[1]}`); s ? s.scrollIntoView() : window.scrollTo(0, 0); }
    else window.scrollTo(0, 0);
    if (!storageOK && !render.warned) { render.warned = true; toast('التخزين غير متاح — التغييرات ستبقى لهذه الجلسة فقط', 'info'); }
  }

  window.addEventListener('hashchange', () => render(false));
  render(false);
})();
