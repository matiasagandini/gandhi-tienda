// ==================== CONFIGURACIÓN ====================
const WHATSAPP_NUMBER = '54911XXXXXXX'; // 👈 Reemplazá por tu número (sin +)

// Catálogo inicial (podés reemplazarlo por tu JSON)
const PRODUCTS = [
  { id: 1, name: 'Huggies Natural Care XXG 50u + Toallitas', price: 24345, category: 'Pañales', tag: 'Más vendido', img: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=1200&auto=format&fit=crop' },
  { id: 2, name: 'Pampers Deluxe XG 50u', price: 31135, category: 'Pañales', tag: 'Nuevo', img: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop' },
  { id: 3, name: 'Toallitas Estrella 50u', price: 2568, category: 'Toallitas', tag: 'Oferta', img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop' },
  { id: 4, name: 'Shampoo Johnson Manzanilla 200ml', price: 4993, category: 'Higiene', tag: 'Top', img: 'https://images.unsplash.com/photo-1605731414532-6b26976cc153?q=80&w=1200&auto=format&fit=crop' },
  { id: 5, name: 'Pampers Baby-Dry M-G-XG', price: 26670, category: 'Pañales', tag: 'Promo', img: 'https://images.unsplash.com/photo-1562709462-9bb5ca1820f2?q=80&w=1200&auto=format&fit=crop' },
  { id: 6, name: 'Pampers Splashers G-XG', price: 13000, category: 'Pañales', tag: 'Verano', img: 'https://images.unsplash.com/photo-1615397349754-2105d3c2b654?q=80&w=1200&auto=format&fit=crop' },
  { id: 7, name: 'Pampers Pants XG 52u', price: 36260, category: 'Pañales', tag: 'Pack', img: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?q=80&w=1200&auto=format&fit=crop' },
  { id: 8, name: 'Gel de Baño Bebé 500ml', price: 7990, category: 'Higiene', tag: 'Suave', img: 'https://images.unsplash.com/photo-1609848427764-efb9d4d66a4b?q=80&w=1200&auto=format&fit=crop' }
];

const state = {
  cart: JSON.parse(localStorage.getItem('gandhi_cart') || '[]'),
  filter: { q: '', cat: 'Todos' },
  ui: { cartOpen: false }
};

// ==================== Helpers ====================
const $ = (sel, ctx=document) => ctx.querySelector(sel);
const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));
const fmt = n => n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });

function saveCart(){ localStorage.setItem('gandhi_cart', JSON.stringify(state.cart)); }
function cartCount(){ return state.cart.reduce((a,i)=>a+i.qty,0); }

// ==================== Categorías ====================
function renderCats(){
  const cats = ['Todos', ...new Set(PRODUCTS.map(p => p.category))];
  const wrap = $('#cats'); wrap.innerHTML = '';
  cats.forEach(c => {
    const b = document.createElement('button');
    b.textContent = c; b.className = 'cat';
    if(c === state.filter.cat) b.classList.add('active');
    b.addEventListener('click', ()=>{ state.filter.cat = c; renderCats(); renderGrid(); });
    wrap.appendChild(b);
  });
}

// ==================== Productos ====================
function renderGrid(){
  const grid = $('#grid'); grid.innerHTML = '';
  const tpl = $('#tpl-card');
  const q = state.filter.q.toLowerCase();
  const cat = state.filter.cat;

  const items = PRODUCTS.filter(p =>
    (cat === 'Todos' || p.category === cat) &&
    (q === '' || p.name.toLowerCase().includes(q))
  );

  if(!items.length){
    grid.innerHTML = '<div class="muted">No encontramos productos con esos filtros.</div>';
    return;
  }

  items.forEach(p => {
    const node = tpl.content.cloneNode(true);
    node.querySelector('.product__img').src = p.img;
    node.querySelector('.product__img').alt = p.name;
    node.querySelector('.badge').textContent = p.tag || '';
    node.querySelector('.cat').textContent = p.category;
    node.querySelector('.title').textContent = p.name;
    node.querySelector('.price').textContent = fmt(p.price);
    node.querySelector('.add').addEventListener('click', ()=> addToCart(p.id));
    grid.appendChild(node);
  });
}

// ==================== Carrito ====================
function updateCartCount(){ $('#cart-count').textContent = cartCount(); }
function openCart(){ state.ui.cartOpen = true; $('#cart').classList.add('open'); $('#backdrop').hidden = false; }
function closeCart(){ state.ui.cartOpen = false; $('#cart').classList.remove('open'); $('#backdrop').hidden = true; }

function addToCart(id){
  const p = PRODUCTS.find(x => x.id === id);
  const f = state.cart.find(x => x.id === id);
  if(f) f.qty++; else state.cart.push({ id:p.id, name:p.name, price:p.price, img:p.img, qty:1 });
  saveCart(); renderCart(); updateCartCount(); openCart();
}
function removeFromCart(id){ state.cart = state.cart.filter(i => i.id !== id); saveCart(); renderCart(); updateCartCount(); }

function renderCart(){
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
    node.querySelector('.minus').addEventListener('click', ()=>{ if(item.qty>1){ item.qty--; } else { removeFromCart(item.id); return; } saveCart(); renderCart(); updateCartCount(); });
    node.querySelector('.plus').addEventListener('click', ()=>{ item.qty++; saveCart(); renderCart(); updateCartCount(); });
    node.querySelector('.remove').addEventListener('click', ()=> removeFromCart(item.id));
    list.appendChild(node);
    total += item.price * item.qty;
  });
  $('#cart-total').textContent = fmt(total);
}

// ==================== WhatsApp Checkout ====================
function buildWhatsAppMessage(){
  if(!state.cart.length) return 'Hola! Quiero hacer un pedido en *Gandhi* pero el carrito está vacío :(';
  const lines = state.cart.map(i => `• ${i.name} x${i.qty} — ${fmt(i.price*i.qty)}`);
  const total = fmt(state.cart.reduce((a,i)=>a+i.price*i.qty,0));
  return `Hola! Quiero realizar este pedido en *Gandhi*:%0A%0A${lines.join('%0A')}%0A%0A*Total:* ${total}%0A%0AForma de entrega: (envío / retiro)%0ADirección / Barrio:%0AForma de pago:`;
}

// ==================== Listeners / Init ====================
document.addEventListener('DOMContentLoaded', () => {
  // Año footer
  $('#y').textContent = new Date().getFullYear();

  // Menú mobile
  const burger = $('#burger');
  const links = $('.nav__links');
  burger.addEventListener('click', ()=> links.classList.toggle('open'));

  // Filtros
  renderCats(); renderGrid(); renderCart(); updateCartCount();
  $('#search').addEventListener('input', e=>{ state.filter.q = e.target.value; renderGrid(); });
  $('#clearFilters').addEventListener('click', ()=>{ state.filter.q=''; state.filter.cat='Todos'; $('#search').value=''; renderCats(); renderGrid(); });

  // Carrito
  $('#open-cart').addEventListener('click', openCart);
  $('#close-cart').addEventListener('click', closeCart);
  $('#backdrop').addEventListener('click', closeCart);
  $('#checkout').addEventListener('click', ()=>{
    const msg = buildWhatsAppMessage();
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
    window.open(url, '_blank');
  });
  $('#clear').addEventListener('click', ()=>{ state.cart=[]; saveCart(); renderCart(); updateCartCount(); });

  // WhatsApp contacto general
  const contactMsg = encodeURIComponent('Hola! Quería consultar por productos de Gandhi.');
  $('#btn-whatsapp').href = `https://wa.me/${WHATSAPP_NUMBER}?text=${contactMsg}`;
});
