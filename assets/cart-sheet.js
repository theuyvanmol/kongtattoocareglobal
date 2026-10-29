/* ── KONG Cart Sheet — works on every page ── */
(function () {
  'use strict';

  /* ── 1. Inject CSS ── */
  var style = document.createElement('style');
  style.textContent = `
  #kong-sheet-overlay{position:fixed;z-index:1200;inset:0;background:rgba(0,0,0,.55);backdrop-filter:blur(8px);opacity:0;pointer-events:none;transition:.3s}
  @media(max-width:800px){#kong-sheet-overlay{background:rgba(5,8,11,.97)!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important}}
  #kong-sheet-overlay.open{opacity:1;pointer-events:auto}
  #kong-sheet{position:absolute;right:0;top:0;bottom:0;width:min(470px,100%);background:#0d1118;border-left:1px solid rgba(255,255,255,.1);padding:26px 22px;transform:translateX(100%);transition:.4s cubic-bezier(.2,.8,.2,1);display:flex;flex-direction:column;overflow-y:auto}
  #kong-sheet-overlay.open #kong-sheet{transform:none}
  #kong-sheet h2{font:800 34px/1 'Barlow Condensed',sans-serif;text-transform:uppercase;flex:1}
  #kong-sheet-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px}
  #kong-sheet-close{border:0;background:rgba(255,255,255,.1);color:#fff;width:34px;height:34px;border-radius:50%;font-size:20px;cursor:pointer;line-height:1;display:grid;place-items:center}
  #kong-cart-items{display:grid;gap:12px}
  .kong-cart-item{display:grid;grid-template-columns:70px 1fr auto;align-items:center;gap:12px;padding:10px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:16px}
  .kong-cart-item img{width:70px;height:70px;object-fit:cover;border-radius:10px}
  .kong-cart-item b{font:700 18px/1 'Barlow Condensed',sans-serif;text-transform:uppercase;display:block}
  .kong-cart-item small{color:rgba(247,248,251,.5);margin-top:5px;display:block}
  .kong-cart-remove{border:0;background:none;color:rgba(255,255,255,.35);font-size:20px;cursor:pointer;padding:4px}
  .kong-empty{margin:auto;text-align:center;color:rgba(247,248,251,.5);line-height:1.8;padding:40px 0}
  #kong-sheet-footer{padding-top:18px;flex-shrink:0}
  #kong-subtotal-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;color:rgba(247,248,251,.55)}
  #kong-discount-row{display:none;justify-content:space-between;align-items:center;margin-bottom:6px;color:#4ade80;font-size:14px}
  #kong-total-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}
  #kong-subtotal,#kong-total-amount{font:800 28px/1 'Barlow Condensed',sans-serif;color:#fff}
  #kong-total-label{color:rgba(247,248,251,.55)}
  #kong-checkout-btn{width:100%;height:54px;border:0;border-radius:16px;background:#fff;color:#080a0e;font:700 15px/1 Inter,sans-serif;cursor:pointer;letter-spacing:.03em;transition:.15s}
  #kong-checkout-btn:hover{background:#b8f34b}
  #kong-checkout-btn:disabled{opacity:.6;cursor:not-allowed}

  /* Shipping & promo form */
  #kong-details-wrap{display:none;margin-top:16px;border-top:1px solid rgba(255,255,255,.1);padding-top:18px}
  #kong-details-wrap.visible{display:block}
  .kong-field-label{font-size:12px;color:rgba(247,248,251,.5);margin-bottom:4px;display:block;text-transform:uppercase;letter-spacing:.05em}
  .kong-input{width:100%;box-sizing:border-box;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.15);border-radius:10px;padding:10px 12px;color:#fff;font:14px/1.4 Inter,sans-serif;outline:none;margin-bottom:10px;transition:border .2s}
  .kong-input:focus{border-color:rgba(184,243,75,.6)}
  .kong-input::placeholder{color:rgba(247,248,251,.3)}
  .kong-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}
  .kong-promo-row{display:flex;gap:8px;margin-bottom:10px}
  .kong-promo-row .kong-input{margin-bottom:0;flex:1;text-transform:uppercase}
  #kong-promo-btn{border:1px solid rgba(255,255,255,.3);background:transparent;color:#fff;border-radius:10px;padding:0 14px;font:600 13px/1 Inter,sans-serif;cursor:pointer;white-space:nowrap;transition:background .2s}
  #kong-promo-btn:hover{background:rgba(255,255,255,.1)}
  #kong-promo-btn:disabled{opacity:.5;cursor:not-allowed}
  #kong-promo-msg{font-size:12px;margin-bottom:10px;display:none}
  #kong-promo-msg.valid{color:#4ade80;display:block}
  #kong-promo-msg.invalid{color:#f87171;display:block}
  #kong-details-submit{width:100%;height:52px;border:0;border-radius:16px;background:#b8f34b;color:#080a0e;font:700 15px/1 Inter,sans-serif;cursor:pointer;margin-top:4px;transition:opacity .2s}
  #kong-details-submit:disabled{opacity:.6;cursor:not-allowed}

  /* Payment element */
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
        <div id="kong-discount-row"><span id="kong-discount-label">Discount</span><span id="kong-discount-val">-£0.00</span></div>
        <div id="kong-total-row"><span id="kong-total-label">Total</span><span id="kong-total-amount">£0.00</span></div>
        <button id="kong-checkout-btn">Secure Checkout →</button>

        <!-- Step 2: Shipping + promo -->
        <div id="kong-details-wrap">
          <p style="font:700 15px/1 Inter,sans-serif;margin:0 0 14px;color:#fff">Delivery Details</p>
          <div class="kong-row">
            <div>
              <label class="kong-field-label">First name *</label>
              <input class="kong-input" id="kf-first" type="text" placeholder="First" required autocomplete="given-name">
            </div>
            <div>
              <label class="kong-field-label">Last name *</label>
              <input class="kong-input" id="kf-last" type="text" placeholder="Last" required autocomplete="family-name">
            </div>
          </div>
          <label class="kong-field-label">Email *</label>
          <input class="kong-input" id="kf-email" type="email" placeholder="you@email.com" required autocomplete="email">
          <label class="kong-field-label">Phone number *</label>
          <input class="kong-input" id="kf-phone" type="tel" placeholder="+44 7700 900000" required autocomplete="tel">
          <label class="kong-field-label">Address line 1 *</label>
          <input class="kong-input" id="kf-line1" type="text" placeholder="123 Street Name" required autocomplete="address-line1">
          <label class="kong-field-label">Address line 2</label>
          <input class="kong-input" id="kf-line2" type="text" placeholder="Flat / unit (optional)" autocomplete="address-line2">
          <div class="kong-row">
            <div>
              <label class="kong-field-label">City *</label>
              <input class="kong-input" id="kf-city" type="text" placeholder="London" required autocomplete="address-level2">
            </div>
            <div>
              <label class="kong-field-label">Postcode *</label>
              <input class="kong-input" id="kf-postcode" type="text" placeholder="EC1A 1BB" required autocomplete="postal-code">
            </div>
          </div>
          <label class="kong-field-label">Discount code</label>
          <div class="kong-promo-row">
            <input class="kong-input" id="kf-promo" type="text" placeholder="e.g. DanKong10" autocomplete="off">
            <button id="kong-promo-btn" type="button">Apply</button>
          </div>
          <div id="kong-promo-msg"></div>
          <button id="kong-details-submit">Continue to Payment →</button>
        </div>

        <!-- Step 3: Stripe Elements -->
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
  var _appliedPromo = null; // { code, discountPence }

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

  function updateTotals() {
    var cart = getCart();
    var sub = totalPence(cart);
    var disc = _appliedPromo ? _appliedPromo.discountPence : 0;
    var total = Math.max(0, sub - disc);
    document.getElementById('kong-subtotal').textContent = '£' + (sub / 100).toFixed(2);
    document.getElementById('kong-total-amount').textContent = '£' + (total / 100).toFixed(2);
    var discRow = document.getElementById('kong-discount-row');
    var totalRow = document.getElementById('kong-total-row');
    if (disc > 0) {
      document.getElementById('kong-discount-val').textContent = '-£' + (disc / 100).toFixed(2);
      discRow.style.display = 'flex';
      totalRow.style.display = 'flex';
    } else {
      discRow.style.display = 'none';
      totalRow.style.display = 'none';
    }
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
          _appliedPromo = null;
          resetPaymentPanel();
          renderCart();
          updateTotals();
        };
      });
    }
    updateTotals();
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
    _appliedPromo = null;
    renderCart();
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
  }
  function closeSheet() {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    resetPaymentPanel();
  }

  function resetPaymentPanel() {
    document.getElementById('kong-details-wrap').classList.remove('visible');
    document.getElementById('kong-pay-element-wrap').classList.remove('visible');
    document.getElementById('kong-pay-submit').classList.remove('visible');
    document.getElementById('kong-pay-error').style.display = 'none';
    document.getElementById('kong-checkout-btn').style.display = '';
    document.getElementById('kong-checkout-btn').disabled = false;
    document.getElementById('kong-checkout-btn').textContent = 'Secure Checkout →';
    _appliedPromo = null;
    // Reset promo UI
    var promoMsg = document.getElementById('kong-promo-msg');
    promoMsg.textContent = '';
    promoMsg.className = '';
    var promoInput = document.getElementById('kf-promo');
    if (promoInput) { promoInput.value = ''; promoInput.readOnly = false; }
    var promoBtn = document.getElementById('kong-promo-btn');
    if (promoBtn) { promoBtn.disabled = false; promoBtn.textContent = 'Apply'; }
    elements = null;
  }

  document.getElementById('kong-sheet-close').onclick = closeSheet;
  overlay.onclick = function (e) { if (e.target === overlay) closeSheet(); };

  /* ── 5. Wire ALL Bag dock buttons on this page ── */
  function wireBagButtons() {
    document.querySelectorAll('[href="#bag"], [data-open-bag], #bag, .dock-bag-btn').forEach(function (el) {
      el.onclick = function (e) { e.preventDefault(); openSheet(); };
    });
    document.querySelectorAll('.app-dock-item').forEach(function (a) {
      if (a.textContent.trim().toLowerCase().includes('bag')) {
        a.onclick = function (e) { e.preventDefault(); openSheet(); };
      }
    });
  }
  wireBagButtons();
  document.addEventListener('DOMContentLoaded', wireBagButtons);

  /* ── 6. Step 1: Checkout button → show details form ── */
  document.getElementById('kong-checkout-btn').onclick = function () {
    var cart = getCart();
    if (!cart.length) return;
    document.getElementById('kong-checkout-btn').style.display = 'none';
    document.getElementById('kong-details-wrap').classList.add('visible');
  };

  /* ── 7. Promo code Apply ── */
  document.getElementById('kong-promo-btn').onclick = async function () {
    var code = (document.getElementById('kf-promo').value || '').trim().toUpperCase();
    var promoMsg = document.getElementById('kong-promo-msg');
    var promoBtn = document.getElementById('kong-promo-btn');
    if (!code) { promoMsg.textContent = 'Enter a code first.'; promoMsg.className = 'invalid'; return; }
    promoBtn.disabled = true; promoBtn.textContent = 'Checking…';
    promoMsg.textContent = ''; promoMsg.className = '';
    try {
      var res = await fetch('/api/validate-promo', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code })
      });
      var data = await res.json();
      if (data.valid) {
        var cart = getCart();
        var sub = totalPence(cart);
        var discPence = 0;
        if (data.percentOff) discPence = Math.round(sub * data.percentOff / 100);
        else if (data.amountOff) discPence = Math.min(data.amountOff, sub);
        _appliedPromo = { code: data.code, discountPence: discPence };
        document.getElementById('kong-discount-label').textContent = (data.percentOff ? data.percentOff + '% off (' + data.code + ')' : 'Discount (' + data.code + ')');
        updateTotals();
        promoMsg.textContent = '✓ Code applied — you save £' + (discPence / 100).toFixed(2);
        promoMsg.className = 'valid';
        promoBtn.textContent = 'Applied ✓';
        document.getElementById('kf-promo').readOnly = true;
      } else {
        _appliedPromo = null;
        promoMsg.textContent = data.error || 'Invalid or expired code.';
        promoMsg.className = 'invalid';
        promoBtn.disabled = false; promoBtn.textContent = 'Apply';
      }
    } catch (err) {
      promoMsg.textContent = 'Could not check code. Try again.';
      promoMsg.className = 'invalid';
      promoBtn.disabled = false; promoBtn.textContent = 'Apply';
    }
  };

  /* ── 8. Step 2: Details submit → create PaymentIntent + mount Stripe Elements ── */
  var stripeInstance = null;
  var elements = null;

  document.getElementById('kong-details-submit').onclick = async function () {
    // Validate required fields
    var required = ['kf-first', 'kf-last', 'kf-email', 'kf-phone', 'kf-line1', 'kf-city', 'kf-postcode'];
    for (var i = 0; i < required.length; i++) {
      var inp = document.getElementById(required[i]);
      if (!inp.value.trim()) { inp.focus(); return; }
    }
    var cart = getCart();
    if (!cart.length) return;

    var submitBtn = document.getElementById('kong-details-submit');
    submitBtn.disabled = true; submitBtn.textContent = 'Loading payment…';

    var firstName = document.getElementById('kf-first').value.trim();
    var lastName  = document.getElementById('kf-last').value.trim();
    var email     = document.getElementById('kf-email').value.trim();
    var line1     = document.getElementById('kf-line1').value.trim();
    var line2     = document.getElementById('kf-line2').value.trim();
    var city      = document.getElementById('kf-city').value.trim();
    var postcode  = document.getElementById('kf-postcode').value.trim();

    var phone = document.getElementById('kf-phone').value.trim();
    var body = {
      items: cart,
      email: email,
      phone: phone,
      shipping: {
        name: firstName + ' ' + lastName,
        line1: line1, line2: line2,
        city: city, postcode: postcode, country: 'GB'
      }
    };
    if (_appliedPromo && _appliedPromo.code) body.promoCode = _appliedPromo.code;

    try {
      var res = await fetch('/api/payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      var data = await res.json();
      if (!data.clientSecret) throw new Error(data.error || 'Could not start payment.');

      /* Load Stripe.js if not already on page */
      if (!window.Stripe) {
        await new Promise(function (resolve, reject) {
          var s = document.createElement('script');
          s.src = 'https://js.stripe.com/v3/';
          s.onload = resolve; s.onerror = reject;
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

      document.getElementById('kong-details-wrap').classList.remove('visible');
      document.getElementById('kong-pay-element-wrap').classList.add('visible');
      document.getElementById('kong-pay-submit').classList.add('visible');

      // Store email for receipt
      document.getElementById('kong-pay-submit').dataset.email = email;
      document.getElementById('kong-pay-submit').dataset.phone = phone;
      document.getElementById('kong-pay-submit').dataset.name = firstName + ' ' + lastName;
      document.getElementById('kong-pay-submit').dataset.line1 = line1;
      document.getElementById('kong-pay-submit').dataset.line2 = line2;
      document.getElementById('kong-pay-submit').dataset.city = city;
      document.getElementById('kong-pay-submit').dataset.postcode = postcode;

    } catch (err) {
      var errEl = document.getElementById('kong-pay-error');
      errEl.textContent = err.message || 'Something went wrong. Please try again.';
      errEl.style.display = 'block';
      submitBtn.disabled = false; submitBtn.textContent = 'Continue to Payment →';
    }
  };

  /* ── 9. Step 3: Pay Now ── */
  document.getElementById('kong-pay-submit').onclick = async function () {
    if (!stripeInstance || !elements) return;
    var submitBtn = document.getElementById('kong-pay-submit');
    var ds = submitBtn.dataset;
    submitBtn.disabled = true; submitBtn.textContent = 'Processing…';
    var errEl = document.getElementById('kong-pay-error');
    errEl.style.display = 'none';

    var result = await stripeInstance.confirmPayment({
      elements: elements,
      confirmParams: {
        return_url: 'https://www.kongtattoocareglobal.com/success',
        receipt_email: ds.email || undefined,
        payment_method_data: {
          billing_details: {
            name: ds.name || '',
            email: ds.email || '',
            phone: ds.phone || '',
            address: {
              line1: ds.line1 || '', line2: ds.line2 || '',
              city: ds.city || '', postal_code: ds.postcode || '', country: 'GB'
            }
          }
        },
        shipping: {
          name: ds.name || '',
          address: {
            line1: ds.line1 || '', line2: ds.line2 || '',
            city: ds.city || '', postal_code: ds.postcode || '', country: 'GB'
          }
        }
      },
    });

    if (result.error) {
      errEl.textContent = result.error.message;
      errEl.style.display = 'block';
      submitBtn.disabled = false; submitBtn.textContent = 'Pay Now';
    }
    /* On success Stripe redirects automatically */
  };

  /* ── 10. Init ── */
  updateAllBadges();
  window.kongOpenCart = openSheet;

})();
