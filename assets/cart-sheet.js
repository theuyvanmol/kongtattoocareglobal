/* ── KONG Cart Sheet — works on every page ── */
(function () {
  'use strict';

  /* ── 1. Inject CSS ── */
  var style = document.createElement('style');
  style.textContent = `
  #kong-sheet-overlay{position:fixed;z-index:1200;inset:0;background:rgba(0,0,0,.55);backdrop-filter:blur(8px);opacity:0;pointer-events:none;transition:.3s}
  #kong-sheet-overlay.open{opacity:1;pointer-events:auto}
  #kong-sheet{position:absolute;right:0;top:0;bottom:0;width:min(470px,100%);background:#0d1118;border-left:1px solid rgba(255,255,255,.1);padding:26px 22px;transform:translateX(100%);transition:.4s cubic-bezier(.2,.8,.2,1);display:flex;flex-direction:column;overflow-y:auto}
  #kong-sheet-overlay.open #kong-sheet{transform:none}
  #kong-sheet h2{font:800 34px/1 'Barlow Condensed',sans-serif;text-transform:uppercase;flex:1}
  #kong-sheet-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px}
  #kong-sheet-close{border:0;background:rgba(255,255,255,.1);color:#fff;width:34px;height:34px;border-radius:50%;font-size:20px;cursor:pointer;line-height:1;display:grid;place-items:center}
  #kong-cart-items{display:grid;gap:12px;flex:1}
  .kong-cart-item{display:grid;grid-template-columns:70px 1fr auto;align-items:center;gap:12px;padding:10px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:16px}
  .kong-cart-item img{width:70px;height:70px;object-fit:cover;border-radius:10px}
  .kong-cart-item b{font:700 18px/1 'Barlow Condensed',sans-serif;text-transform:uppercase;display:block}
  .kong-cart-item small{color:rgba(247,248,251,.5);margin-top:5px;display:block}
  .kong-cart-remove{border:0;background:none;color:rgba(255,255,255,.35);font-size:20px;cursor:pointer;padding:4px}
  .kong-empty{margin:auto;text-align:center;color:rgba(247,248,251,.5);line-height:1.8;padding:40px 0}
  #kong-sheet-footer{padding-top:18px}
  #kong-subtotal-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;color:rgba(247,248,251,.55)}
  #kong-subtotal{font:800 28px/1 'Barlow Condensed',sans-serif;color:#fff}
  #kong-checkout-btn{width:100%;height:54px;border:0;border-radius:16px;background:#fff;color:#080a0e;font:700 15px/1 Inter,sans-serif;cursor:pointer;letter-spacing:.03em;transition:.15s}
  #kong-checkout-btn:hover{background:#b8f34b}
  #kong-checkout-btn:disabled{opacity:.6;cursor:not-allowed}
  #kong-pay-element-wrap{display:none;margin-top:16px;border-top:1px solid rgba(255,255,255,.1);padding-top:18px}
  #kong-pay-element-wrap.visible{display:block}
  #kong-pay-element{min-height:120px}
  #kong-pay-submit{width:100%;height:52px;margin-top:14px;border:0;border-radius:16px;background:#b8f34b;color:#080a0e;font:700 15px/1 Inter,sans-serif;cursor:pointer;display:none}
  #kong-pay-submit.visible{display:block}
  #kong-pay-submit:disabled{opacity:.6;cursor:not-allowed}
  #kong-pay-error{color:#ff6b6b;font-size:13px;margin-top:10px;display:none}
  .kong-sheet-note{font-size:12px;color:rgba(247,248,251,.38);text-align:center;margin-top:12px}
  `;
  document.head.appendChild(style);

  /* ── 2. Inject HTML ── */
  var overlay = document.createElement('div');
  overlay.id = 'kong-sheet-overlay';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.innerHTML = `
    <div id="kong-sheet" role="dialog" aria-label="Your bag">
      <div id="kong-sheet-head">
        <h2>Your Bag</h2>
        <button id="kong-sheet-close" aria-label="Close">×</button>
      </div>
      <div id="kong-cart-items"></div>
      <div id="kong-sheet-footer">
        <div id="kong-subtotal-row"><span>Subtotal</span><span id="kong-subtotal">£0.00</span></div>
        <button id="kong-checkout-btn">Secure Checkout →</button>
        <div id="kong-pay-element-wrap">
          <div id="kong-pay-element"></div>
          <p id="kong-pay-error"></p>
          <button id="kong-pay-submit">Pay Now</button>
        </div>
        <p class="kong-sheet-note">🔒 Secure payment · Free UK delivery over £30</p>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  /* ── 3. Cart logic ── */
  var CART_KEY = 'kong-cart-v2';

  function getCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch (e) { return []; }
  }
  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateAllBadges();
  }
  function totalPence(cart) {
    return Math.round(cart.reduce(function (sum, x) {
      var p = x.price < 100 ? x.price * 100 : x.price;
      return sum + p * (x.qty || 1);
    }, 0));
  }
  function itemName(x) {
    return x.name || (x.line1 && x.line2 ? x.line1 + ' ' + x.line2 : x.id || 'KONG Product');
  }

  function renderCart() {
    var cart = getCart();
    var el = document.getElementById('kong-cart-items');
    if (!cart.length) {
      el.innerHTML = '<div class="kong-empty"><b>Your bag is empty.</b><br>Explore the range and find your routine.</div>';
    } else {
      el.innerHTML = cart.map(function (x, i) {
        var img = x.image ? '<img src="' + x.image + '" alt="">' : '<div style="width:70px;height:70px;background:rgba(255,255,255,.05);border-radius:10px"></div>';
        return '<div class="kong-cart-item">' + img + '<div><b>' + itemName(x) + '</b><small>' + x.qty + ' × £' + (x.price < 100 ? x.price : x.price / 100).toFixed(2) + '</small></div><button class="kong-cart-remove" data-i="' + i + '" aria-label="Remove">×</button></div>';
      }).join('');
      el.querySelectorAll('.kong-cart-remove').forEach(function (btn) {
        btn.onclick = function () {
          var cart = getCart();
          cart.splice(+btn.dataset.i, 1);
          saveCart(cart);
          resetPaymentPanel();
          renderCart();
          updateSubtotal();
        };
      });
    }
    updateSubtotal();
  }

  function updateSubtotal() {
    var cart = getCart();
    document.getElementById('kong-subtotal').textContent = '£' + (totalPence(cart) / 100).toFixed(2);
  }

  function updateAllBadges() {
    var cart = getCart();
    var count = cart.reduce(function (n, x) { return n + (x.qty || 0); }, 0);
    document.querySelectorAll('.dock-cart-count, #bagCount, .bag-count, #navBagCount, #count').forEach(function (el) {
      el.textContent = count;
      el.style.display = count > 0 ? '' : 'none';
    });
  }

  /* ── 4. Open / Close ── */
  function openSheet() {
    renderCart();
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
  }
  function closeSheet() {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    resetPaymentPanel();
  }

  document.getElementById('kong-sheet-close').onclick = closeSheet;
  overlay.onclick = function (e) { if (e.target === overlay) closeSheet(); };

  /* ── 5. Wire ALL Bag dock buttons on this page ── */
  function wireBagButtons() {
    document.querySelectorAll('[href="#bag"], [data-open-bag], #bag, .dock-bag-btn').forEach(function (el) {
      el.onclick = function (e) { e.preventDefault(); openSheet(); };
    });
    /* Also intercept dock Bag <a> by href pattern */
    document.querySelectorAll('.app-dock-item').forEach(function (a) {
      if (a.textContent.trim().toLowerCase().includes('bag')) {
        a.onclick = function (e) { e.preventDefault(); openSheet(); };
      }
    });
  }
  wireBagButtons();
  /* Re-wire after any dynamic content */
  document.addEventListener('DOMContentLoaded', wireBagButtons);

  /* ── 6. Stripe Payment Element ── */
  var stripeInstance = null;
  var elements = null;

  function resetPaymentPanel() {
    document.getElementById('kong-pay-element-wrap').classList.remove('visible');
    document.getElementById('kong-pay-submit').classList.remove('visible');
    document.getElementById('kong-pay-error').style.display = 'none';
    document.getElementById('kong-checkout-btn').style.display = '';
    document.getElementById('kong-checkout-btn').disabled = false;
    document.getElementById('kong-checkout-btn').textContent = 'Secure Checkout →';
    elements = null;
  }

  document.getElementById('kong-checkout-btn').onclick = async function () {
    var cart = getCart();
    if (!cart.length) return;
    var btn = document.getElementById('kong-checkout-btn');
    btn.disabled = true;
    btn.textContent = 'Loading payment…';

    try {
      var res = await fetch('/api/payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart }),
      });
      var data = await res.json();
      if (!data.clientSecret) throw new Error(data.error || 'Could not start payment.');

      /* Load Stripe.js if not already loaded */
      if (!window.Stripe) {
        await new Promise(function (resolve, reject) {
          var s = document.createElement('script');
          s.src = 'https://js.stripe.com/v3/';
          s.onload = resolve;
          s.onerror = reject;
          document.head.appendChild(s);
        });
      }

      stripeInstance = Stripe('pk_live_51UHzxYCwf19rs1Jj0HOhJ2X079LM14Tf4dLAd6DEMvpbD5lRID3k6jyWcI8308NltxTSEsdcXCJeaw4dRDLbXeKJ00Uxdt32NV');
      elements = stripeInstance.elements({
        clientSecret: data.clientSecret,
        appearance: {
          theme: 'night',
          variables: {
            colorPrimary: '#b8f34b',
            colorBackground: '#0d1118',
            colorText: '#f7f8fb',
            colorDanger: '#ff6b6b',
            fontFamily: 'Inter, system-ui, sans-serif',
            borderRadius: '12px',
          },
        },
      });

      var payEl = elements.create('payment', {
        layout: 'tabs',
        wallets: { applePay: 'auto', googlePay: 'auto' },
      });
      document.getElementById('kong-pay-element').innerHTML = '';
      payEl.mount('#kong-pay-element');

      btn.style.display = 'none';
      document.getElementById('kong-pay-element-wrap').classList.add('visible');
      document.getElementById('kong-pay-submit').classList.add('visible');
    } catch (err) {
      var errEl = document.getElementById('kong-pay-error');
      errEl.textContent = err.message || 'Something went wrong. Please try again.';
      errEl.style.display = 'block';
      btn.disabled = false;
      btn.textContent = 'Secure Checkout →';
    }
  };

  document.getElementById('kong-pay-submit').onclick = async function () {
    if (!stripeInstance || !elements) return;
    var submitBtn = document.getElementById('kong-pay-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing…';
    var errEl = document.getElementById('kong-pay-error');
    errEl.style.display = 'none';

    var result = await stripeInstance.confirmPayment({
      elements: elements,
      confirmParams: {
        return_url: 'https://www.kongtattoocareglobal.com/success',
      },
    });

    if (result.error) {
      errEl.textContent = result.error.message;
      errEl.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Pay Now';
    }
    /* On success Stripe redirects to return_url automatically */
  };

  /* ── 7. Init badges ── */
  updateAllBadges();

  /* Expose openSheet globally for inline onclick use */
  window.kongOpenCart = openSheet;

})();
