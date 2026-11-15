/**
 * KONG Tattoo Care — Shopify Headless Analytics Bridge
 * Sends page view, add-to-cart, and checkout events to Shopify
 * so Shopify's Live View, analytics, and abandoned cart emails work.
 *
 * Uses Shopify's Web Pixel / Customer Events API via the Buy SDK analytics
 * endpoint: https://monorail-edge.shopifysvc.com/unstable/produce_batch
 */
(function () {
  'use strict';

  const SHOP_DOMAIN = 'kongtattoocareuk.myshopify.com';
  const SHOP_ID = 'gid://shopify/Shop/'; // filled by Shopify; leave blank for headless

  // ── Helpers ──────────────────────────────────────────────────────────────
  function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  function getCookie(name) {
    return document.cookie.split('; ').find(r => r.startsWith(name + '='))?.split('=')[1] || null;
  }

  function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + days * 86400000);
    document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/;SameSite=Lax`;
  }

  // Session / visitor IDs (Shopify-compatible cookie names)
  let visitorToken = getCookie('_shopify_y');
  if (!visitorToken) { visitorToken = uuid(); setCookie('_shopify_y', visitorToken, 365); }

  let sessionToken = getCookie('_shopify_s');
  if (!sessionToken) { sessionToken = uuid(); setCookie('_shopify_s', sessionToken, 1); }

  // ── Send event to Shopify Monorail ───────────────────────────────────────
  function sendEvent(schema, payload) {
    const body = JSON.stringify({
      events: [{
        schema_id: schema,
        payload: {
          ...payload,
          shop_id: SHOP_DOMAIN,
          currency: 'GBP',
          page_url: location.href,
          referrer: document.referrer,
          visitor_token: visitorToken,
          session_token: sessionToken,
          navigation_type: performance?.getEntriesByType?.('navigation')?.[0]?.type || 'navigate',
          timestamp: new Date().toISOString(),
        },
        metadata: { event_created_at_ms: Date.now() },
      }],
    });

    // Use beacon when available; fall back to fetch
    const url = 'https://monorail-edge.shopifysvc.com/unstable/produce_batch';
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, new Blob([body], { type: 'text/plain' }));
    } else {
      fetch(url, { method: 'POST', body, keepalive: true }).catch(() => {});
    }
  }

  // ── Shopify Customer Privacy / Pixel compatible events ───────────────────
  window.ShopifyAnalytics = window.ShopifyAnalytics || {};

  // Page viewed
  function trackPageView() {
    sendEvent('web_pixels_manager_page_viewed/1.0', {
      page_type: getPageType(),
      resource_type: getPageType(),
      resource_id: null,
    });
  }

  function getPageType() {
    const p = location.pathname;
    if (p === '/' || p === '/index.html') return 'home';
    if (p.includes('shop-all') || p.includes('/shop-all')) return 'collection';
    if (p.includes('product') || p.includes('/products/')) return 'product';
    if (p.includes('cart') || p.includes('checkout')) return 'cart';
    if (p.includes('blog')) return 'article';
    if (p.includes('about')) return 'page';
    return 'page';
  }

  // Product viewed
  window.ShopifyAnalytics.trackProductView = function (product) {
    sendEvent('web_pixels_manager_product_viewed/1.0', {
      product_id: product.id || '',
      product_title: product.title || '',
      product_price: String(product.price || 0),
      product_type: product.type || '',
      variant_id: product.variantId || '',
      variant_title: product.variantTitle || '',
      sku: product.sku || '',
      quantity: 1,
    });
  };

  // Add to cart
  window.ShopifyAnalytics.trackAddToCart = function (item) {
    sendEvent('web_pixels_manager_product_added_to_cart/1.0', {
      cart_id: getCookie('kong_cart_id') || uuid(),
      product_id: item.id || '',
      product_title: item.name || '',
      product_price: String(item.price || 0),
      variant_id: item.variantId || '',
      quantity: item.qty || 1,
      currency: 'GBP',
      value: String((item.price || 0) * (item.qty || 1)),
    });
  };

  // Checkout started
  window.ShopifyAnalytics.trackCheckoutStart = function (cart) {
    sendEvent('web_pixels_manager_checkout_started/1.0', {
      cart_id: getCookie('kong_cart_id') || uuid(),
      total_price: String(cart.total || 0),
      total_tax: '0',
      currency: 'GBP',
      item_count: cart.count || 0,
      line_items: (cart.items || []).map(i => ({
        product_id: i.id || '',
        variant_id: i.variantId || '',
        title: i.name || '',
        price: String(i.price || 0),
        quantity: i.qty || 1,
      })),
    });
  };

  // Order completed
  window.ShopifyAnalytics.trackPurchase = function (order) {
    sendEvent('web_pixels_manager_order_placed/1.0', {
      order_id: order.id || '',
      total_price: String(order.total || 0),
      currency: 'GBP',
      item_count: order.count || 0,
    });
  };

  // ── Auto-fire page view ───────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', trackPageView);
  } else {
    trackPageView();
  }

  // ── Intercept cart adds (listen for custom kong-atc event) ───────────────
  document.addEventListener('kong:add-to-cart', function (e) {
    if (e.detail) window.ShopifyAnalytics.trackAddToCart(e.detail);
  });

  document.addEventListener('kong:checkout-start', function (e) {
    if (e.detail) window.ShopifyAnalytics.trackCheckoutStart(e.detail);
  });

  // ── Patch cardATC globally (called by shop-all.html / product.html) ───────
  const _origATC = window.cardATC;
  window._patchCardATC = function () {
    if (window.cardATC && window.cardATC !== window._patchedCardATC) {
      const original = window.cardATC;
      window.cardATC = window._patchedCardATC = function (btn) {
        const name = btn?.dataset?.name || btn?.closest?.('[data-name]')?.dataset?.name || '';
        const price = parseFloat(btn?.dataset?.price || btn?.closest?.('[data-price]')?.dataset?.price || 0);
        window.ShopifyAnalytics.trackAddToCart({ name, price, qty: 1 });
        return original.call(this, btn);
      };
    }
  };
  // Retry patching after page scripts load
  setTimeout(window._patchCardATC, 500);
  setTimeout(window._patchCardATC, 1500);

  console.log('[KONG] Shopify analytics bridge loaded');
})();
