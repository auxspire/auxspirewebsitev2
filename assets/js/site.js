/**
 * Site-wide UI: mobile nav, scroll progress, sticky header, section animations
 */
(function () {
  'use strict';

  if (typeof document === 'undefined' || !document.addEventListener) return;

  var REDUCED_MOTION = false;
  try {
    REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e) {}

  function initMobileNav() {
    var toggle = document.getElementById('navToggle');
    var links = document.getElementById('navLinks');
    var overlay = document.getElementById('navOverlay');
    if (!toggle || !links) return;

    function open() {
      links.classList.add('is-open');
      if (overlay) overlay.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      var icon = toggle.querySelector('.material-symbols-outlined');
      if (icon) icon.textContent = 'close';
    }

    function close() {
      links.classList.remove('is-open');
      if (overlay) overlay.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      var icon = toggle.querySelector('.material-symbols-outlined');
      if (icon) icon.textContent = 'menu';
    }

    toggle.addEventListener('click', function () {
      links.classList.contains('is-open') ? close() : open();
    });
    if (overlay) overlay.addEventListener('click', close);
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', close);
    });
  }

  var ScrollProgress = {
    element: null,
    ticking: false,

    init: function () {
      this.element = document.querySelector('.scroll-progress');
      if (!this.element) {
        this.element = document.createElement('div');
        this.element.className = 'scroll-progress';
        this.element.setAttribute('aria-hidden', 'true');
        document.body.insertBefore(this.element, document.body.firstChild);
      }
      this.bindEvents();
      this.update();
    },

    bindEvents: function () {
      var self = this;
      window.addEventListener('scroll', function () {
        if (!self.ticking) {
          requestAnimationFrame(function () {
            self.update();
            self.ticking = false;
          });
          self.ticking = true;
        }
      }, { passive: true });
    },

    update: function () {
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var progress = docHeight > 0 ? scrollTop / docHeight : 0;
      this.element.style.setProperty('--scroll-progress', progress);
    }
  };

  var StickyHeader = {
    header: null,
    scrollThreshold: 50,

    init: function () {
      this.header = document.querySelector('.site-header');
      if (!this.header) return;
      this.bindEvents();
      this.check();
    },

    bindEvents: function () {
      var self = this;
      var ticking = false;
      window.addEventListener('scroll', function () {
        if (!ticking) {
          requestAnimationFrame(function () {
            self.check();
            ticking = false;
          });
          ticking = true;
        }
      }, { passive: true });
    },

    check: function () {
      if (!this.header) return;
      var scrollY = window.pageYOffset;
      if (scrollY > this.scrollThreshold) {
        this.header.classList.add('is-scrolled');
      } else {
        this.header.classList.remove('is-scrolled');
      }
    }
  };

  function initSectionAnimations() {
    if (REDUCED_MOTION) return;
    var sections = document.querySelectorAll('.animate-section');
    if (!sections.length) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  function initPageHeroReveal() {
    if (REDUCED_MOTION) return;
    var hero = document.querySelector('.page-hero .container');
    if (!hero) return;
    hero.style.opacity = '0';
    hero.style.transform = 'translateY(12px)';
    hero.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    requestAnimationFrame(function () {
      hero.style.opacity = '1';
      hero.style.transform = 'translateY(0)';
    });
  }

  function init() {
    try { initMobileNav(); } catch (err) { /* noop */ }
    try { ScrollProgress.init(); } catch (err) { /* noop */ }
    try { StickyHeader.init(); } catch (err) { /* noop */ }
    try { initSectionAnimations(); } catch (err) { /* noop */ }
    try { initPageHeroReveal(); } catch (err) { /* noop */ }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
