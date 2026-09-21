/* ═══════════════════════════════════════════════
   KONG — Shared JavaScript
   Nav, Cart, Language, Reveal animations
═══════════════════════════════════════════════ */

// ── CART STATE ──
var CART = JSON.parse(localStorage.getItem('kong_cart') || '[]');
function saveCart(){ localStorage.setItem('kong_cart', JSON.stringify(CART)); }

function addToCart(product){
  var existing = CART.find(function(i){ return i.id === product.id; });
  if(existing){ existing.qty++; }
  else{ CART.push(Object.assign({qty:1}, product)); }
  saveCart();
  renderCart();
  openCart();
  // Badge
  updateCartBadge();
}

function removeFromCart(id){
  CART = CART.filter(function(i){ return i.id !== id; });
  saveCart(); renderCart(); updateCartBadge();
}

function changeQty(id, delta){
  var item = CART.find(function(i){ return i.id === id; });
  if(!item) return;
  item.qty = Math.max(1, item.qty + delta);
  if(item.qty === 0) removeFromCart(id);
  else { saveCart(); renderCart(); updateCartBadge(); }
}

function updateCartBadge(){
  var total = CART.reduce(function(s,i){ return s + i.qty; }, 0);
  document.querySelectorAll('.cart-badge').forEach(function(b){
    b.textContent = total;
    b.style.display = total > 0 ? 'flex' : 'none';
  });
}

function openCart(){ document.getElementById('cart-sidebar').classList.add('open'); }
function closeCart(){ document.getElementById('cart-sidebar').classList.remove('open'); }

function renderCart(){
  var el = document.getElementById('cart-items');
  if(!el) return;
  if(CART.length === 0){
    el.innerHTML = '<div class="cart-empty"><span style="font-size:32px;opacity:.3">🛒</span><span>Your cart is empty</span></div>';
    document.getElementById('cart-total').textContent = '£0.00';
    return;
  }
  el.innerHTML = CART.map(function(item){
    return '<div class="cart-item">'+
      '<div class="cart-item-img"><img src="'+item.img+'" alt="'+item.name+'" loading="lazy"/></div>'+
      '<div class="cart-item-info">'+
        '<div class="cart-item-name">'+item.name+'</div>'+
        '<div class="cart-item-col">'+item.col+' Collection</div>'+
        '<div class="cart-item-qty">'+
          '<button class="cq-btn" onclick="changeQty(\''+item.id+'\',-1)">&#8722;</button>'+
          '<span class="cq-val">'+item.qty+'</span>'+
          '<button class="cq-btn" onclick="changeQty(\''+item.id+'\',1)">&#43;</button>'+
          '<button class="cq-btn" onclick="removeFromCart(\''+item.id+'\')" style="margin-left:4px;color:rgba(255,100,100,.6)">&#10005;</button>'+
        '</div>'+
      '</div>'+
      '<div class="cart-item-price">'+item.price+'</div>'+
    '</div>';
  }).join('');
  var total = CART.reduce(function(s,i){
    var p = parseFloat(i.price.replace(/[^0-9.]/g,'')) || 0;
    return s + p * i.qty;
  }, 0);
  document.getElementById('cart-total').textContent = '£'+total.toFixed(2);
}

// ── LANGUAGE SWITCHER ──
var LANGUAGES = [
  {code:'en', flag:'🇬🇧', label:'English',    url:'/'},
  {code:'sv', flag:'🇸🇪', label:'Svenska',    url:'/lang/sv.html'},
  {code:'fi', flag:'🇫🇮', label:'Suomi',      url:'/lang/fi.html'},
  {code:'no', flag:'🇳🇴', label:'Norsk',      url:'/lang/no.html'},
  {code:'nl', flag:'🇳🇱', label:'Nederlands', url:'/lang/nl.html'},
  {code:'de', flag:'🇩🇪', label:'Deutsch',    url:'/lang/de.html'},
  {code:'pt', flag:'🇵🇹', label:'Português',  url:'/lang/pt.html'},
  {code:'cs', flag:'🇨🇿', label:'Čeština',    url:'/lang/cs.html'},
  {code:'ru', flag:'🇷🇺', label:'Русский',    url:'/lang/ru.html'},
  {code:'kk', flag:'🇰🇿', label:'Қазақ',      url:'/lang/kk.html'},
  {code:'sr', flag:'🇷🇸', label:'Srpski',     url:'/lang/sr.html'},
  {code:'hr', flag:'🇭🇷', label:'Hrvatski',   url:'/lang/hr.html'},
  {code:'bs', flag:'🇧🇦', label:'Bosanski',   url:'/lang/bs.html'},
];

function buildLangDropdown(currentCode){
  var dd = document.getElementById('lang-dropdown');
  if(!dd) return;
  dd.innerHTML = LANGUAGES.map(function(l){
    return '<div class="lang-opt'+(l.code===currentCode?' active':'')+'" onclick="location.href=\''+l.url+'\'">'+
      '<span style="font-size:16px">'+l.flag+'</span>'+
      '<span>'+l.label+'</span>'+
    '</div>';
  }).join('');
}

function toggleLang(){
  var dd = document.getElementById('lang-dropdown');
  if(dd) dd.classList.toggle('open');
}

document.addEventListener('click',function(e){
  if(!e.target.closest('#lang-btn')){
    var dd = document.getElementById('lang-dropdown');
    if(dd) dd.classList.remove('open');
  }
});

// ── MOBILE NAV ──
function initNav(){
  var ham = document.getElementById('ham');
  var mob = document.getElementById('mob-nav');
  var cls = document.getElementById('mob-close');
  if(ham) ham.onclick = function(){ mob.classList.add('on'); document.body.style.overflow='hidden'; };
  if(cls) cls.onclick = function(){ mob.classList.remove('on'); document.body.style.overflow=''; };
  if(mob) mob.querySelectorAll('a').forEach(function(a){
    a.onclick = function(){ mob.classList.remove('on'); document.body.style.overflow=''; };
  });
  // Cart
  var cartBtn = document.getElementById('cart-btn');
  if(cartBtn) cartBtn.onclick = openCart;
  var cartClose = document.getElementById('cart-close-btn');
  if(cartClose) cartClose.onclick = closeCart;
  // Close cart on overlay click
  document.addEventListener('click',function(e){
    var sidebar = document.getElementById('cart-sidebar');
    if(sidebar && sidebar.classList.contains('open') && !e.target.closest('#cart-sidebar') && !e.target.closest('#cart-btn')){
      closeCart();
    }
  });
  renderCart();
  updateCartBadge();
}

// ── SCROLL REVEAL ──
function initReveal(){
  var obs = new IntersectionObserver(function(entries){
    entries.forEach(function(e){ if(e.isIntersecting) e.target.classList.add('ok'); });
  },{threshold:0.06, rootMargin:'0px 0px -28px 0px'});
  document.querySelectorAll('.rv').forEach(function(el){ obs.observe(el); });
}

// ── INIT ──
document.addEventListener('DOMContentLoaded', function(){
  initNav();
  initReveal();
});
