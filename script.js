/* ============================================================
   SR&Sons Jewellers — shared site logic
   Used by: index.html, shop.html, services.html, about.html
   Cart + theme are persisted in localStorage so they carry
   across every page of the site.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
  initTheme();
  updateCartUI();
  if (document.getElementById('productGrid')) {
    const params = new URLSearchParams(location.search);
    const catFromUrl = params.get('cat');
    if (catFromUrl) currentFilter = catFromUrl;
    renderFilterChips();
    renderProducts();
  }
  highlightActiveNav();
});

/* ---------------- Product data ---------------- */
const products = [
  {id:1, name:"Nazneen Solitaire Ring", cat:"Rings", price:185000, desc:"18K gold band with a hand-set centre stone.", icon:'ring'},
  {id:2, name:"Zarreen Halo Ring", cat:"Rings", price:142000, desc:"Rose gold halo setting, everyday elegance.", icon:'ring'},
  {id:3, name:"Meherbaan Band", cat:"Rings", price:64000, desc:"Minimal 22K gold band, brushed finish.", icon:'ring'},
  {id:4, name:"Shahkaar Statement Ring", cat:"Rings", price:210000, desc:"Bold cocktail ring with layered goldwork.", icon:'ring'},

  {id:5, name:"Sitara Chain Necklace", cat:"Necklaces", price:230000, desc:"Fine 22K link chain, hallmarked.", icon:'necklace'},
  {id:6, name:"Gulnaar Choker", cat:"Necklaces", price:310000, desc:"Traditional choker with kundan work.", icon:'necklace'},
  {id:7, name:"Zoya Pendant Set", cat:"Necklaces", price:98000, desc:"Delicate pendant on a rope chain.", icon:'necklace'},
  {id:8, name:"Anaya Bridal Set", cat:"Necklaces", price:520000, desc:"Full bridal necklace, earrings & tikka.", icon:'necklace'},

  {id:9, name:"Kiran Kada", cat:"Bangles", price:175000, desc:"Solid 22K kada, engraved edges.", icon:'bangle'},
  {id:10, name:"Rani Bangles (Pair)", cat:"Bangles", price:260000, desc:"Matching pair, traditional motif work.", icon:'bangle'},
  {id:11, name:"Simplicity Bracelet", cat:"Bangles", price:88000, desc:"Slim 18K bracelet for daily wear.", icon:'bangle'},
  {id:12, name:"Noor Charm Bangle", cat:"Bangles", price:132000, desc:"Adjustable bangle with hanging charms.", icon:'bangle'},

  {id:13, name:"Jhumar Jhumkas", cat:"Earrings", price:96000, desc:"Classic gold jhumkas with fine detailing.", icon:'earring'},
  {id:14, name:"Chand Studs", cat:"Earrings", price:52000, desc:"Everyday 18K studs, polished finish.", icon:'earring'},
  {id:15, name:"Laila Drop Earrings", cat:"Earrings", price:118000, desc:"Long drop earrings for formal wear.", icon:'earring'},
  {id:16, name:"Meena Hoop Earrings", cat:"Earrings", price:74000, desc:"Enamel-accented gold hoops.", icon:'earring'},
];

const icons = {
  ring:'<svg viewBox="0 0 60 60"><circle cx="30" cy="36" r="16"/><path d="M23 21 L30 9 L37 21 Z"/></svg>',
  necklace:'<svg viewBox="0 0 60 60"><path d="M12 16 Q30 44 48 16"/><circle cx="30" cy="42" r="4" fill="#e8c468"/></svg>',
  bangle:'<svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="19"/><circle cx="30" cy="30" r="12"/></svg>',
  earring:'<svg viewBox="0 0 60 60"><circle cx="30" cy="13" r="4.5"/><path d="M30 18 L30 29"/><path d="M21 29 Q30 50 39 29 Z"/></svg>'
};

let currentFilter = 'All';

/* ---------------- Cart (persisted) ---------------- */
function loadCart(){
  try{ return JSON.parse(localStorage.getItem('srSonsCart') || '{}'); }catch(e){ return {}; }
}
function saveCart(){
  try{ localStorage.setItem('srSonsCart', JSON.stringify(cart)); }catch(e){}
}
let cart = loadCart(); // id -> qty

function fmt(n){ return 'PKR ' + n.toLocaleString('en-PK'); }

function renderProducts(){
  const grid = document.getElementById('productGrid');
  if(!grid) return;
  const list = products.filter(p => currentFilter === 'All' || p.cat === currentFilter);
  grid.innerHTML = list.map(p => `
    <div class="product-card">
      <div class="product-media">${icons[p.icon] || icons.ring}</div>
      <div class="product-body">
        <span class="product-cat">${p.cat}</span>
        <span class="product-name">${p.name}</span>
        <p class="product-desc">${p.desc}</p>
        <div class="product-foot">
          <span class="product-price">${fmt(p.price)}</span>
          <button class="add-btn" onclick="addToCart(${p.id})">Add to Cart</button>
        </div>
      </div>
    </div>
  `).join('');
}

function renderFilterChips(){
  const bar = document.getElementById('filterBar');
  if(!bar) return;
  const cats = ['All', ...Array.from(new Set(products.map(p=>p.cat)))];
  bar.innerHTML = cats.map(c=>
    `<button class="filter-chip${c===currentFilter?' active':''}" data-cat="${c}" onclick="setFilter('${c}')">${c}</button>`
  ).join('');
}

function setFilter(cat){
  currentFilter = cat;
  document.querySelectorAll('.filter-chip').forEach(chip=>{
    chip.classList.toggle('active', chip.dataset.cat === cat);
  });
  renderProducts();
}

/* Used from the Home page category cards — sends the visitor to the Shop
   page pre-filtered to that category. */
function filterAndScroll(cat){
  location.href = 'shop.html?cat=' + encodeURIComponent(cat) + '#shop';
}

function addToCart(id){
  cart[id] = (cart[id] || 0) + 1;
  saveCart();
  updateCartUI();
  showToast('Added to cart');
}
function changeQty(id, delta){
  if(!cart[id]) return;
  cart[id] += delta;
  if(cart[id] <= 0) delete cart[id];
  saveCart();
  updateCartUI();
}
function removeItem(id){
  delete cart[id];
  saveCart();
  updateCartUI();
}
function cartCount(){
  return Object.values(cart).reduce((a,b)=>a+b,0);
}
function cartTotal(){
  return Object.entries(cart).reduce((sum,[id,qty])=>{
    const p = products.find(pr=>pr.id==id);
    return sum + (p ? p.price*qty : 0);
  },0);
}
function updateCartUI(){
  const countEl = document.getElementById('cartCount');
  if(countEl) countEl.textContent = cartCount();
  const body = document.getElementById('cartBody');
  const foot = document.getElementById('cartFoot');
  if(!body || !foot) return;
  const entries = Object.entries(cart);
  if(entries.length === 0){
    body.innerHTML = `<div class="empty-cart">
      <svg viewBox="0 0 24 24" fill="none" stroke-width="1.2"><path d="M3 3h2l1 12h13l1-8H6"/><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/></svg>
      Your cart is empty.<br>Explore the collection to add a piece.
    </div>`;
    foot.style.display = 'none';
    return;
  }
  body.innerHTML = entries.map(([id,qty])=>{
    const p = products.find(pr=>pr.id==id);
    if(!p) return '';
    return `<div class="cart-item">
      <div class="cart-item-media">${icons[p.icon]}</div>
      <div class="cart-item-info">
        <div class="name">${p.name}</div>
        <div class="cat">${p.cat}</div>
        <div class="qty-controls">
          <button onclick="changeQty(${p.id},-1)">−</button>
          <span>${qty}</span>
          <button onclick="changeQty(${p.id},1)">+</button>
        </div>
        <a class="remove-link" onclick="removeItem(${p.id})">Remove</a>
      </div>
      <div class="cart-item-price">${fmt(p.price*qty)}</div>
    </div>`;
  }).join('');
  foot.style.display = 'block';
  const totalEl = document.getElementById('cartTotal');
  if(totalEl) totalEl.textContent = fmt(cartTotal());
}

/* ---------------- Drawer / Modal control ---------------- */
function openCart(){
  document.getElementById('cartDrawer').classList.add('open');
  document.getElementById('overlayBg').classList.add('show');
}
function closeCart(){
  document.getElementById('cartDrawer').classList.remove('open');
  document.getElementById('overlayBg').classList.remove('show');
}
function closeAllOverlays(){
  closeCart();
  closeCheckout();
}
function openCheckout(){
  if(cartCount() === 0){ showToast('Your cart is empty'); return; }
  document.getElementById('co-subtotal').textContent = fmt(cartTotal());
  document.getElementById('co-total').textContent = fmt(cartTotal());
  document.getElementById('checkoutModal').classList.add('open');
  document.getElementById('overlayBg').classList.add('show');
}
function closeCheckout(){
  const m = document.getElementById('checkoutModal');
  if(m) m.classList.remove('open');
}
function placeOrder(e){
  e.preventDefault();
  const orderId = 'SR' + Math.floor(100000 + Math.random()*899999);
  const name = document.getElementById('co-name').value;

  document.getElementById('checkoutBody').innerHTML = `
    <div class="confirm-box">
      <svg viewBox="0 0 24 24" fill="none" stroke-width="1.3"><path d="M4 12l5 5L20 6" stroke-linecap="round" stroke-linejoin="round"/></svg>
      <h3>Order received, ${name.split(' ')[0]}!</h3>
      <p>Your order has been placed and our team will confirm it shortly.</p>
      <div class="order-id">Order #${orderId}</div>
      <p>Total: ${fmt(cartTotal())}</p>
      <button class="btn btn-ghost" style="margin-top:20px;" onclick="finishOrder()">Continue Browsing</button>
    </div>`;
  cart = {};
  saveCart();
  updateCartUI();
}
function finishOrder(){
  location.href = 'shop.html';
}

/* ---------------- Forms ---------------- */
function submitDesignForm(e){
  e.preventDefault();
  showToast("Request submitted — we'll contact you within 24–48 hours.");
  e.target.reset();
}
function submitContactForm(e){
  e.preventDefault();
  showToast("Message sent — we'll get back to you shortly.");
  e.target.reset();
}

/* ---------------- Toast ---------------- */
let toastTimer;
function showToast(msg){
  const toast = document.getElementById('toast');
  if(!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> toast.classList.remove('show'), 2800);
}

/* ---------------- Mobile nav ---------------- */
function toggleMobileNav(){
  const nav = document.getElementById('mobileNav');
  nav.style.display = (nav.style.display === 'flex') ? 'none' : 'flex';
}

/* ---------------- Theme (light/dark) ---------------- */
function applyTheme(mode){
  const root = document.documentElement;
  const iconSun = document.getElementById('iconSun');
  const iconMoon = document.getElementById('iconMoon');
  const toggleBtn = document.getElementById('themeToggle');
  if(mode === 'light'){
    root.setAttribute('data-theme','light');
    if(iconSun) iconSun.style.display = 'block';
    if(iconMoon) iconMoon.style.display = 'none';
    if(toggleBtn) toggleBtn.setAttribute('aria-label','Switch to dark mode');
  } else {
    root.removeAttribute('data-theme');
    if(iconSun) iconSun.style.display = 'none';
    if(iconMoon) iconMoon.style.display = 'block';
    if(toggleBtn) toggleBtn.setAttribute('aria-label','Switch to light mode');
  }
}
function toggleTheme(){
  const current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  const next = current === 'light' ? 'dark' : 'light';
  applyTheme(next);
  try{ localStorage.setItem('srSonsTheme', next); }catch(e){}
}
function initTheme(){
  let saved = null;
  try{ saved = localStorage.getItem('srSonsTheme'); }catch(e){}
  if(saved === 'light' || saved === 'dark'){
    applyTheme(saved);
  } else {
    const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    applyTheme(prefersLight ? 'light' : 'dark');
  }
}

/* ---------------- Active nav highlight ---------------- */
function highlightActiveNav(){
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav.links a, #mobileNav a').forEach(a=>{
    const href = a.getAttribute('href') || '';
    if(href.split('#')[0] === path){
      a.classList.add('active');
    }
  });
}
