/* ============================================================
   CW Games Theme - Main JavaScript
   ============================================================ */

(function () {
  'use strict';

  /* --- Header scroll effect --- */
  const header = document.getElementById('site-header');
  if (header) {
    const onScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 10);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* --- Announcement bar hide on scroll (optional) --- */
  const announcementBar = document.getElementById('announcement-bar');

  /* --- Mobile Menu --- */
  const mobileMenuBtn = document.querySelector('.site-header__mobile-menu');
  const mobileNav     = document.getElementById('mobile-nav');

  if (mobileMenuBtn && mobileNav) {
    const toggleMenu = (open) => {
      const isOpen = open !== undefined ? open : mobileNav.getAttribute('aria-hidden') === 'true';
      mobileNav.setAttribute('aria-hidden', String(!isOpen));
      mobileMenuBtn.setAttribute('aria-expanded', String(isOpen));
      mobileMenuBtn.classList.toggle('is-open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    };

    mobileMenuBtn.addEventListener('click', () => toggleMenu());

    mobileNav.addEventListener('click', (e) => {
      if (e.target === mobileNav) toggleMenu(false);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') toggleMenu(false);
    });

    /* Mobile sub-menus */
    document.querySelectorAll('.mobile-nav__toggle').forEach((btn) => {
      btn.addEventListener('click', () => {
        const sub = btn.nextElementSibling;
        if (!sub) return;
        const isOpen = sub.classList.contains('is-open');
        document.querySelectorAll('.mobile-nav__sub.is-open').forEach((s) => s.classList.remove('is-open'));
        document.querySelectorAll('.mobile-nav__toggle.is-open').forEach((b) => b.classList.remove('is-open'));
        if (!isOpen) {
          sub.classList.add('is-open');
          btn.classList.add('is-open');
        }
      });
    });
  }

  /* --- Search Overlay --- */
  const searchToggle  = document.getElementById('search-toggle');
  const searchOverlay = document.getElementById('search-overlay');

  if (searchToggle && searchOverlay) {
    const openSearch = () => {
      searchOverlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      const input = searchOverlay.querySelector('.search-overlay__input');
      if (input) setTimeout(() => input.focus(), 100);
    };
    const closeSearch = () => {
      searchOverlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };

    searchToggle.addEventListener('click', openSearch);
    searchOverlay.querySelector('.search-overlay__close')?.addEventListener('click', closeSearch);
    searchOverlay.addEventListener('click', (e) => {
      if (e.target === searchOverlay) closeSearch();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && searchOverlay.getAttribute('aria-hidden') === 'false') closeSearch();
    });
  }

  /* --- Cart Drawer --- */
  const cartToggle = document.getElementById('cart-toggle');
  const cartDrawer = document.getElementById('cart-drawer');

  if (cartToggle && cartDrawer) {
    const openCart = () => {
      cartDrawer.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    };
    const closeCart = () => {
      cartDrawer.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };

    cartToggle.addEventListener('click', (e) => {
      e.preventDefault();
      openCart();
    });
    cartDrawer.querySelector('.cart-drawer__close')?.addEventListener('click', closeCart);
    cartDrawer.querySelector('.cart-drawer__overlay')?.addEventListener('click', closeCart);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && cartDrawer.getAttribute('aria-hidden') === 'false') closeCart();
    });
  }

  /* --- Hero Slider --- */
  const slider = document.getElementById('hero-slider');
  if (slider) {
    const slides   = slider.querySelectorAll('.hero-slide');
    const dotsWrap = document.getElementById('hero-dots');
    const dots     = dotsWrap ? dotsWrap.querySelectorAll('.hero-dot') : [];
    const prevBtn  = document.querySelector('.hero-prev');
    const nextBtn  = document.querySelector('.hero-next');

    if (slides.length <= 1) return;

    let current   = 0;
    let timer     = null;
    const DELAY   = 5000;

    const goTo = (index) => {
      slides[current].classList.remove('hero-slide--active');
      if (dots[current]) dots[current].classList.remove('hero-dot--active');
      current = (index + slides.length) % slides.length;
      slides[current].classList.add('hero-slide--active');
      if (dots[current]) dots[current].classList.add('hero-dot--active');
    };

    const startAuto = () => {
      timer = setInterval(() => goTo(current + 1), DELAY);
    };
    const stopAuto = () => clearInterval(timer);

    prevBtn?.addEventListener('click', () => { stopAuto(); goTo(current - 1); startAuto(); });
    nextBtn?.addEventListener('click', () => { stopAuto(); goTo(current + 1); startAuto(); });
    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => { stopAuto(); goTo(i); startAuto(); });
    });

    startAuto();

    /* Pause on hover */
    slider.addEventListener('mouseenter', stopAuto);
    slider.addEventListener('mouseleave', startAuto);

    /* Touch / swipe */
    let startX = 0;
    slider.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
    slider.addEventListener('touchend', (e) => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) { stopAuto(); goTo(current + (diff > 0 ? 1 : -1)); startAuto(); }
    }, { passive: true });
  }

  /* --- Quick Add to Cart --- */
  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('.product-card__quick-add');
    if (!btn) return;

    const variantId = btn.dataset.variantId;
    if (!variantId) return;

    btn.disabled = true;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="animation:spin 600ms linear infinite"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg> Adicionando...';

    try {
      const res = await fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ id: variantId, quantity: 1 }),
      });
      if (!res.ok) throw new Error('Cart error');

      const cart = await fetch('/cart.js').then((r) => r.json());
      const countEl = document.getElementById('cart-count');
      if (countEl) {
        countEl.textContent = cart.item_count;
        countEl.classList.add('bump');
        setTimeout(() => countEl.classList.remove('bump'), 350);
      }
      btn.innerHTML = '✓ Adicionado!';
      setTimeout(() => { btn.innerHTML = originalText; btn.disabled = false; }, 1800);
    } catch {
      btn.innerHTML = originalText;
      btn.disabled = false;
    }
  });

  /* --- Intersection Observer — fade-in cards --- */
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.animationDelay = entry.target.dataset.delay || '0ms';
            entry.target.classList.add('animate-fade-in-up');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.product-card, .category-card, .promo-card').forEach((el, i) => {
      el.style.opacity = '0';
      el.dataset.delay = `${Math.min(i * 60, 400)}ms`;
      observer.observe(el);
    });
  }

  /* --- CSS spin keyframe (for loading icon) --- */
  const spinStyle = document.createElement('style');
  spinStyle.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
  document.head.appendChild(spinStyle);
})();
