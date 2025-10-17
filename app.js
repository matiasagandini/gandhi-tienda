// =========================================
// Configuración
// =========================================
const WHATSAPP_NUMBER = '5491161972026'; // 👈 Reemplazá por tu número (sin +)

// Catálogo (podés reemplazar por fetch/JSON)
const PRODUCTS = [
  {
    id: 1, name: 'Pañales Huggies Dermacare G x48', price: 20430, category: 'Pañales', tag: 'Promo',
    img: 'https://www.huggies.com.ar/dw/image/v2/BFDX_PRD/on/demandware.static/-/Sites-MasAbrazos_AR-storefront/default/dw44258f70/images/Dermacare/7809604031495__0.jpg?sw=550&sh=550&sm=fit'
  },
  {
    id: 2, name: 'Pañales Huggies Natural Care G x60', price: 25400, category: 'Pañales', tag: '',
    img: 'https://www.huggies.com.ar/dw/image/v2/BFDX_PRD/on/demandware.static/-/Sites-MasAbrazos_AR-storefront/default/dwb594eff6/images/Natural%20Care%202024/7794626013423.jpg?sw=280&sh=280&sm=fit'
  },
  {
    id: 3, name: 'Pañales Pampers Splashers XG x10', price: 12000, category: 'Pañales', tag: '',
    img: 'https://http2.mlstatic.com/D_NQ_NP_2X_948862-MLA75703590580_042024-F.webp'
  },
  {
    id: 4, name: 'Pañales Pampers Deluxe P x36', price: 15700, category: 'Pañales', tag: '',
    img: 'https://pedidosfarma.vtexassets.com/arquivos/ids/206153-800-800?v=638521527696800000&width=800&height=800&aspect=true'
  },
  {
    id: 5, name: 'Pañales Pampers BabyDry G x72', price: 26670, category: 'Pañales', tag: '',
    img: 'https://http2.mlstatic.com/D_NQ_NP_726235-MLA92899286583_092025-O.webp'
  },
  {
    id: 6, name: 'Toallas Húmedas Huggies Triple Protección x80', price: 2568, category: 'Toallitas', tag: '',
    img: 'https://www.huggies.com.ar/dw/image/v2/BFDX_PRD/on/demandware.static/-/Sites-MasAbrazos_AR-storefront/default/dw78329d9e/images/Wipes/Triple%20Protecci%C3%B3n/7794626011030_1.jpg?sw=550&sh=550&sm=fit'
  },
  {
    id: 7, name: 'Shampoo Johnson Manzanilla 200ml', price: 4990, category: 'Higiene', tag: '',
    img: 'https://farmacityar.vtexassets.com/arquivos/ids/279766-1200-auto?v=638899190959900000&width=1200&height=auto&aspect=true'
  },
  {
    id: 8, name: 'Algodón Doncella 500gr', price: 4120, category: 'Higiene', tag: '',
    img: 'https://acdn-us.mitiendanube.com/stores/016/311/products/d_nq_np_976202-mla46434140088_062021-o1-72307780eeae06df0516478688944583-640-0.jpg'
  },
];

// Estado global
const state = {
  cart: JSON.parse(localStorage.getItem('gandhi_cart') || '[]'),
  filter: { q: '', cat: 'Todos' },
  ui: { cartOpen: false }
};

// Helpers
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const fmt = n => n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });
const saveCart = () => localStorage.setItem('gandhi_cart', JSON.stringify(state.cart));
const cartCount = () => state.cart.reduce((a, i) => a + i.qty, 0);
const debounce = (fn, ms = 200) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };

// =========================================
// UI: Categorías
// =========================================
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

// =========================================
/* UI: Grid de productos */
// =========================================
function renderGrid() {
  const grid = $('#grid'); grid.innerHTML = '';
  const tpl = $('#tpl-card');
  const q = state.filter.q.toLowerCase();
  const cat = state.filter.cat;

  const items = PRODUCTS.filter(p =>
    (cat === 'Todos' || p.category === cat) &&
    (q === '' || p.name.toLowerCase().includes(q))
  );

  if (!items.length) {
    grid.innerHTML = '<div class="muted">No encontramos productos con esos filtros.</div>';
    return;
  }

  items.forEach(p => {
    const node = tpl.content.cloneNode(true);

    node.querySelector('.product__img').src = p.img;
    node.querySelector('.product__img').alt = p.name;

    // Badge sólo si es oferta
    const badgeEl = node.querySelector('.badge');
    const isOffer = /promo|oferta|descuento|sale|%/i.test(p.tag || '');
    if (isOffer) { badgeEl.textContent = p.tag; badgeEl.hidden = false; badgeEl.classList.add('badge--offer'); }
    else { badgeEl.hidden = true; badgeEl.classList.remove('badge--offer'); }

    node.querySelector('.cat').textContent = p.category;

    // Highlight de búsqueda
    const rx = q ? new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig') : null;
    node.querySelector('.title').innerHTML = rx ? p.name.replace(rx, '<mark>$1</mark>') : p.name;

    node.querySelector('.price').textContent = fmt(p.price);
    node.querySelector('.add').addEventListener('click', () => addToCart(p.id));

    grid.appendChild(node);
  });
}

// =========================================
// Carrito
// =========================================
function updateCartCount() {
  const count = cartCount();
  const badge = $('#cart-count');
  badge.textContent = count;
  badge.toggleAttribute('hidden', count === 0); // oculta si es 0
}

function openCart() { state.ui.cartOpen = true; $('#cart').classList.add('open'); $('#backdrop').hidden = false; }
function closeCart() { state.ui.cartOpen = false; $('#cart').classList.remove('open'); $('#backdrop').hidden = true; }

function addToCart(id) {
  const p = PRODUCTS.find(x => x.id === id);
  const f = state.cart.find(x => x.id === id);
  if (f) f.qty++; else state.cart.push({ id: p.id, name: p.name, price: p.price, img: p.img, qty: 1 });

  saveCart(); renderCart(); updateCartCount(); openCart();

  // animación del badge
  const badge = $('#cart-count');
  badge.classList.remove('bump'); void badge.offsetWidth; badge.classList.add('bump');
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
    node.querySelector('.plus').addEventListener('click', () => {
      item.qty++; saveCart(); renderCart(); updateCartCount();
    });
    node.querySelector('.remove').addEventListener('click', () => removeFromCart(item.id));

    list.appendChild(node);
    total += item.price * item.qty;
  });

  $('#cart-total').textContent = fmt(total);
}

// =========================================
// WhatsApp Checkout
// =========================================
function buildWhatsAppMessage() {
  if (!state.cart.length)
    return 'Hola! Quiero hacer un pedido en *Gandhi* pero el carrito está vacío :(';

  const lines = state.cart.map(i => `• ${i.name} x${i.qty} — ${fmt(i.price * i.qty)}`);
  const total = fmt(state.cart.reduce((a, i) => a + i.price * i.qty, 0));

  return `Hola! Quiero realizar este pedido en *Gandhi*:%0A%0A${lines.join('%0A')}%0A%0A*Total:* ${total}%0A%0AForma de entrega: (envío / retiro)%0ADirección / Barrio:%0AForma de pago:`;
}

// =========================================
// Init
// =========================================
document.addEventListener('DOMContentLoaded', () => {
  // Año footer
  $('#y').textContent = new Date().getFullYear();

  // Menú mobile
  const burger = $('#burger');
  const links = $('.nav__links');
  burger.addEventListener('click', () => links.classList.toggle('open'));

  // Catálogo / filtros
  renderCats(); renderGrid(); renderCart(); updateCartCount();

  // Buscador con debounce + limpiar + atajos
  const searchInput = $('#search');
  const searchWrap = searchInput.closest('.search');
  const searchClear = $('#searchClear');

  searchInput.addEventListener('input', debounce(e => {
    state.filter.q = e.target.value.trim();
    searchWrap.classList.toggle('has-value', !!state.filter.q);
    renderGrid();
  }, 200));

  searchClear.addEventListener('click', () => {
    searchInput.value = '';
    state.filter.q = '';
    searchWrap.classList.remove('has-value');
    renderGrid();
    searchInput.focus();
  });

  searchInput.addEventListener('keydown', e => { if (e.key === 'Escape') { searchClear.click(); } });
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault(); searchInput.focus(); searchInput.select();
    }
  });

  // Carrito
  $('#open-cart').addEventListener('click', openCart);
  $('#close-cart').addEventListener('click', closeCart);
  $('#backdrop').addEventListener('click', closeCart);

  $('#checkout').addEventListener('click', () => {
    const msg = buildWhatsAppMessage();
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank');
  });

  $('#clear').addEventListener('click', () => {
  if (!state.cart.length) return; // no hace nada si está vacío

  const confirmar = confirm('¿Estás seguro de que querés vaciar el carrito?');
  if (confirmar) {
    state.cart = [];
    saveCart();
    renderCart();
    updateCartCount();
  }
});

  // WhatsApp contacto general
  const contactMsg = encodeURIComponent('Hola! Quería consultar por productos de Gandhi.');
  $('#btn-whatsapp').href = `https://wa.me/${WHATSAPP_NUMBER}?text=${contactMsg}`;
});

// Scroll suave con offset del header (y cerrar menú mobile al navegar)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    window.scrollTo({ top: target.offsetTop - 60, behavior: 'smooth' });
  });
});
document.querySelectorAll('.nav__links a[href^="#"]').forEach(a => {
  a.addEventListener('click', () => $('.nav__links').classList.remove('open'));
});
