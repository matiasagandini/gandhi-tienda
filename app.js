// =========================================================
// Config
// =========================================================
const WHATSAPP_NUMBER = '5491161972026';

const PRODUCTS = [
  { id: 1, name: 'Pañales Huggies Dermacare G x48', price: 20430, category: 'Pañales', tag: 'Promo', img: 'https://www.huggies.com.ar/dw/image/v2/BFDX_PRD/on/demandware.static/-/Sites-MasAbrazos_AR-storefront/default/dw44258f70/images/Dermacare/7809604031495__0.jpg?sw=550&sh=550&sm=fit' },
  { id: 2, name: 'Pañales Huggies Natural Care G x60', price: 25400, category: 'Pañales', tag: '', img: 'https://www.huggies.com.ar/dw/image/v2/BFDX_PRD/on/demandware.static/-/Sites-MasAbrazos_AR-storefront/default/dwb594eff6/images/Natural%20Care%202024/7794626013423.jpg?sw=280&sh=280&sm=fit' },
  { id: 3, name: 'Pañales Pampers Splashers XG x10', price: 12000, category: 'Pañales', tag: '', img: 'https://http2.mlstatic.com/D_NQ_NP_2X_948862-MLA75703590580_042024-F.webp' },
  { id: 4, name: 'Pañales Pampers Deluxe P x36', price: 15700, category: 'Pañales', tag: '', img: 'https://pedidosfarma.vtexassets.com/arquivos/ids/206153-800-800?v=638521527696800000&width=800&height=800&aspect=true' },
  { id: 5, name: 'Pañales Pampers BabyDry G x72', price: 26670, category: 'Pañales', tag: '', img: 'https://http2.mlstatic.com/D_NQ_NP_726235-MLA92899286583_092025-O.webp' },
  { id: 6, name: 'Toallas Húmedas Huggies Triple Protección x80', price: 2568, category: 'Toallitas', tag: '', img: 'https://www.huggies.com.ar/dw/image/v2/BFDX_PRD/on/demandware.static/-/Sites-MasAbrazos_AR-storefront/default/dw78329d9e/images/Wipes/Triple%20Protección/7794626011030_1.jpg?sw=550&sh=550&sm=fit' },
  { id: 7, name: 'Shampoo Johnson Manzanilla 200ml', price: 4990, category: 'Higiene', tag: '', img: 'https://farmacityar.vtexassets.com/arquivos/ids/279766-1200-auto?v=638899190959900000&width=1200&height=auto&aspect=true' },
  { id: 8, name: 'Algodón Doncella 500gr', price: 4120, category: 'Higiene', tag: '', img: 'https://acdn-us.mitiendanube.com/stores/016/311/products/d_nq_np_976202-mla46434140088_062021-o1-72307780eeae06df0516478688944583-640-0.jpg' },
];

// =========================================================
// State / helpers
// =========================================================
const state = {
  cart: JSON.parse(localStorage.getItem('gandhi_cart') || '[]'),
  filter: { q: '', cat: 'Todos' }
};
const $ = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));
const fmt = n => n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });
const saveCart = () => localStorage.setItem('gandhi_cart', JSON.stringify(state.cart));
const cartCount = () => state.cart.reduce((a, i) => a + i.qty, 0);
const debounce = (fn, ms = 200) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };

// =========================================================
// UI: Categorías
// =========================================================
function renderCats() {
  const cats = ['Todos', ...new Set(PRODUCTS.map(p => p.category))];
  const wrap = $('#cats'); wrap.innerHTML = '';
  cats.forEach(c => {
    const b = document.createElement('button');
    b.textContent = c; b.className = 'cat';
    if (c === state.filter.cat) b.classList.add('active');
    b.addEventListener('click', () => { state.filter.cat = c; renderCats(); renderGrid(); });
    wrap.appendChild(b);
  });
}

// =========================================================
// UI: Grid de productos
// =========================================================
function renderGrid() {
  const grid = $('#grid'); grid.innerHTML = '';
  const tpl = $('#tpl-card');
  const q = state.filter.q.toLowerCase();
  const cat = state.filter.cat;

  const items = PRODUCTS.filter(p =>
    (cat === 'Todos' || p.category === cat) && (q === '' || p.name.toLowerCase().includes(q))
  );
  if (!items.length) { grid.innerHTML = '<div class="muted">No encontramos productos con esos filtros.</div>'; return; }

  items.forEach(p => {
    const node = tpl.content.cloneNode(true);
    node.querySelector('.product__img').src = p.img;
    node.querySelector('.product__img').alt = p.name;

    // Badge de oferta
    const badge = node.querySelector('.badge');
    const isOffer = /promo|oferta|descuento|sale|%/i.test(p.tag || '');
    badge.hidden = !isOffer;
    badge.textContent = isOffer ? p.tag : '';

    node.querySelector('.cat').textContent = p.category;
    const rx = q ? new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig') : null;
    node.querySelector('.title').innerHTML = rx ? p.name.replace(rx, '<mark>$1</mark>') : p.name;

    node.querySelector('.price').textContent = fmt(p.price);
    node.querySelector('.add').addEventListener('click', () => addToCart(p.id));
    grid.appendChild(node);
  });
}

// =========================================================
/* Cart helpers */
// =========================================================
function isCartOpen() { return $('#cart').classList.contains('open'); }
function lockScroll(lock) { document.documentElement.style.overflow = lock ? 'hidden' : ''; }
function openCart() { $('#cart').classList.add('open'); $('#backdrop').hidden = false; lockScroll(true); }
function closeCart() { $('#cart').classList.remove('open'); $('#backdrop').hidden = true; lockScroll(false); }
function toggleCart() { isCartOpen() ? closeCart() : openCart(); }

function updateCartCount() {
  const n = cartCount();
  const badge = $('#cart-count'); badge.textContent = n; badge.toggleAttribute('hidden', n === 0);
  const fab = $('#fab-count'); if (fab) { fab.textContent = n; fab.toggleAttribute('hidden', n === 0); }
}

function addToCart(id) {
  const p = PRODUCTS.find(x => x.id === id);
  const f = state.cart.find(x => x.id === id);
  f ? f.qty++ : state.cart.push({ id: p.id, name: p.name, price: p.price, img: p.img, qty: 1 });
  saveCart(); renderCart(); updateCartCount();

  // Toast centrado
  const t = $('#toast');
  t.hidden = false; t.classList.add('show');
  clearTimeout(t._h);
  t._h = setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.hidden = true, 280); }, 1400);
}

function removeFromCart(id) {
  state.cart = state.cart.filter(i => i.id !== id);
  saveCart(); renderCart(); updateCartCount();
}

function renderCart() {
  const list = $('#cart-items'); list.innerHTML = '';
  const tpl = $('#tpl-cart-item');
  let total = 0;

  state.cart.forEach(item => {
    const node = tpl.content.cloneNode(true);
    node.querySelector('.cartline__img').src = item.img;
    node.querySelector('.cartline__img').alt = item.name;
    node.querySelector('.name').textContent = item.name;
    node.querySelector('.qty').textContent = item.qty;
    node.querySelector('.lineprice').textContent = fmt(item.price * item.qty);

    node.querySelector('.minus').addEventListener('click', () => {
      if (item.qty > 1) { item.qty--; } else { removeFromCart(item.id); return; }
      saveCart(); renderCart(); updateCartCount();
    });
    node.querySelector('.plus').addEventListener('click', () => { item.qty++; saveCart(); renderCart(); updateCartCount(); });
    node.querySelector('.remove').addEventListener('click', () => removeFromCart(item.id));

    total += item.price * item.qty;
    list.appendChild(node);
  });

  $('#cart-total').textContent = fmt(total);
}

// =========================================================
// WhatsApp
// =========================================================
function buildWhatsAppMessage() {
  if (!state.cart.length) return 'Hola! Quiero hacer un pedido en *Gandhi* pero el carrito está vacío :(';
  const lines = state.cart.map(i => `• ${i.name} x${i.qty} — ${fmt(i.price * i.qty)}`);
  const total = fmt(state.cart.reduce((a, i) => a + i.price * i.qty, 0));
  return `Hola! Quiero realizar este pedido en *Gandhi*:%0A%0A${lines.join('%0A')}%0A%0A*Total:* ${total}%0A%0AForma de entrega: (envío / retiro)%0ADirección / Barrio:%0AForma de pago:`;
}

// =========================================================
// Init
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
  $('#y').textContent = new Date().getFullYear();

  // Menú mobile
  const burger = $('#burger'), links = $('.nav__links');
  burger.addEventListener('click', () => links.classList.toggle('open'));

  // Catálogo
  renderCats(); renderGrid(); renderCart(); updateCartCount();

  // Buscador
  const search = $('#search'), wrap = search.closest('.search'), clearBtn = $('#searchClear');
  search.addEventListener('input', debounce(e => {
    state.filter.q = e.target.value.trim();
    wrap.classList.toggle('has-value', !!state.filter.q);
    renderGrid();
  }, 200));
  clearBtn.addEventListener('click', () => { search.value = ''; state.filter.q = ''; wrap.classList.remove('has-value'); renderGrid(); search.focus(); });
  search.addEventListener('keydown', e => { if (e.key === 'Escape') clearBtn.click(); });

  // Atajos
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); search.focus(); search.select(); }
    if (e.key === 'Escape' && isCartOpen()) closeCart();
  });

  // Carrito
  $('#open-cart').addEventListener('click', toggleCart);
  $('#close-cart').addEventListener('click', closeCart);
  $('#backdrop').addEventListener('click', closeCart);
  $('#checkout').addEventListener('click', () => window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${buildWhatsAppMessage()}`, '_blank'));
  $('#clear').addEventListener('click', () => {
    if (!state.cart.length) return;
    if (confirm('¿Estás seguro de que querés vaciar el carrito?')) { state.cart = []; saveCart(); renderCart(); updateCartCount(); }
  });

  // WhatsApp contacto
  const msg = encodeURIComponent('Hola! Quería consultar por productos de Gandhi.');
  $('#btn-whatsapp').href = `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;

  // FAB: mostrar solo si el botón del header no está visible
  const headerCartBtn = $('#open-cart');
  const fabCartBtn = $('#fab-cart');
  if (headerCartBtn && fabCartBtn) {
    const io = new IntersectionObserver(([entry]) => {
      entry.isIntersecting ? fabCartBtn.classList.remove('show')
        : fabCartBtn.classList.add('show');
    }, { threshold: 0.1 });
    io.observe(headerCartBtn);
    fabCartBtn.addEventListener('click', toggleCart);
  }
});