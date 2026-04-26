(function () {
  var toggle = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('[data-nav]');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var reduceMotion = false;
  try {
    reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (_) {
    reduceMotion = false;
  }

  var header = document.querySelector('[data-header]');
  function onScrollUi() {
    var y = window.scrollY || document.documentElement.scrollTop;
    if (header) {
      if (y > 12) header.classList.add('is-scrolled');
      else header.classList.remove('is-scrolled');
    }
    var bar = document.querySelector('[data-scroll-progress]');
    if (bar && !reduceMotion) {
      var doc = document.documentElement;
      var max = doc.scrollHeight - doc.clientHeight;
      var p = max > 0 ? (y / max) * 100 : 0;
      bar.style.width = Math.min(100, Math.max(0, p)) + '%';
    }
  }

  window.addEventListener('scroll', onScrollUi, { passive: true });
  onScrollUi();

  if (reduceMotion) {
    document.querySelectorAll('[data-reveal]').forEach(function (el) {
      el.classList.add('is-visible');
    });
    return;
  }

  var nodes = document.querySelectorAll('[data-reveal]');
  if (!nodes.length || !('IntersectionObserver' in window)) {
    nodes.forEach(function (el) {
      el.classList.add('is-visible');
    });
  } else {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var target = entry.target;
          var delay = target.style.getPropertyValue('--delay').trim();
          if (delay) {
            target.style.transitionDelay = delay;
          }
          target.classList.add('is-visible');
          io.unobserve(target);
        });
      },
      { root: null, rootMargin: '0px 0px -6% 0px', threshold: 0.08 }
    );
    nodes.forEach(function (el) {
      io.observe(el);
    });
  }

  /* Parallax for decorative layers */
  var parallaxEls = document.querySelectorAll('[data-parallax]');
  if (parallaxEls.length && !reduceMotion) {
    var ticking = false;
    function parallaxFrame() {
      var y = window.scrollY || document.documentElement.scrollTop;
      parallaxEls.forEach(function (el) {
        var mode = el.getAttribute('data-parallax') || 'slow';
        var factor = mode === 'subtle' ? 0.04 : 0.12;
        var offset = y * factor;
        el.style.transform = 'translate3d(0, ' + offset + 'px, 0)';
      });
      ticking = false;
    }
    window.addEventListener(
      'scroll',
      function () {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(parallaxFrame);
        }
      },
      { passive: true }
    );
    parallaxFrame();
  }
})();
