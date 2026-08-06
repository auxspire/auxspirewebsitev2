/**
 * Homepage Animations
 * Section animations, parallax, number counters, text reveals, scroll progress
 * Respects prefers-reduced-motion
 */
(function () {
  'use strict';

  if (typeof document === 'undefined' || !document.addEventListener) return;

  var REDUCED_MOTION = false;
  try {
    REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e) {}

  /* ============================================
     1. SECTION ANIMATIONS (Existing + Enhanced)
     ============================================ */

  function initSectionAnimations() {
    if (REDUCED_MOTION) return;

    var sections = document.querySelectorAll('.animate-section, .animate-fade-left, .animate-fade-right, .animate-scale-up');
    if (!sections.length) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  /* ============================================
     2. PARALLAX SCROLLING
     ============================================ */

  var Parallax = {
    elements: [],
    ticking: false,
    scrollY: 0,

    init: function () {
      if (REDUCED_MOTION) return;

      var orbs = document.querySelectorAll('.abstract-orb');
      var circuits = document.querySelectorAll('.page-circuit-bg, .animated-circuit-bg');
      var geoShapes = document.querySelectorAll('.geo-shape');
      
      // Assign parallax speeds
      orbs.forEach(function (el, i) {
        el.dataset.parallaxSpeed = (0.3 + (i % 3) * 0.1).toFixed(2);
        Parallax.elements.push(el);
      });

      circuits.forEach(function (el) {
        el.dataset.parallaxSpeed = '0.15';
        Parallax.elements.push(el);
      });

      geoShapes.forEach(function (el, i) {
        el.dataset.parallaxSpeed = (0.2 + (i % 4) * 0.05).toFixed(2);
        Parallax.elements.push(el);
      });

      if (this.elements.length === 0) return;

      this.bindEvents();
      this.update();
    },

    bindEvents: function () {
      var self = this;
      
      window.addEventListener('scroll', function () {
        self.scrollY = window.pageYOffset;
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
      var self = this;
      
      this.elements.forEach(function (el) {
        var speed = parseFloat(el.dataset.parallaxSpeed) || 0.3;
        var rect = el.getBoundingClientRect();
        var inView = rect.bottom > 0 && rect.top < window.innerHeight;
        
        if (inView) {
          var offset = self.scrollY * speed;
          var existingTransform = el.dataset.originalTransform || '';
          el.style.transform = existingTransform + ' translateY(' + (-offset) + 'px)';
        }
      });
    }
  };

  /* ============================================
     3. NUMBER COUNTER ANIMATION
     ============================================ */

  var NumberCounter = {
    duration: 2000,
    easeOutQuad: function (t) {
      return t * (2 - t);
    },

    init: function () {
      var stats = document.querySelectorAll('.stat-value');
      if (!stats.length) return;

      var self = this;

      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting && !entry.target.dataset.counted) {
              entry.target.dataset.counted = 'true';
              self.animate(entry.target);
            }
          });
        },
        { threshold: 0.5 }
      );

      stats.forEach(function (stat) {
        observer.observe(stat);
      });
    },

    parseValue: function (text) {
      var match = text.match(/^([\d,]+)/);
      if (!match) return { number: 0, suffix: text };
      
      var numberStr = match[1].replace(/,/g, '');
      var number = parseInt(numberStr, 10);
      var suffix = text.slice(match[0].length);
      
      return { number: number, suffix: suffix };
    },

    formatNumber: function (num) {
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },

    animate: function (el) {
      if (REDUCED_MOTION) return;

      var self = this;
      var originalText = el.textContent.trim();
      var parsed = this.parseValue(originalText);
      
      if (parsed.number === 0) return;

      var target = parsed.number;
      var suffix = parsed.suffix;
      var startTime = null;

      el.classList.add('counting');

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / self.duration, 1);
        var easedProgress = self.easeOutQuad(progress);
        var current = Math.floor(easedProgress * target);
        
        el.textContent = self.formatNumber(current) + suffix;

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = originalText;
          el.classList.remove('counting');
        }
      }

      requestAnimationFrame(step);
    }
  };

  /* ============================================
     4. TEXT REVEAL ANIMATION
     ============================================ */

  var TextReveal = {
    init: function () {
      if (REDUCED_MOTION) return;

      var elements = document.querySelectorAll('[data-reveal-text]:not(.gradient-headline)');
      if (!elements.length) return;

      var self = this;

      elements.forEach(function (el) {
        if (el.classList.contains('gradient-headline')) return;
        self.wrapWords(el);
      });

      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('animate-in');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.3 }
      );

      elements.forEach(function (el) {
        el.classList.add('reveal-text');
        observer.observe(el);
      });
    },

    wrapWords: function (el) {
      var text = el.textContent;
      var words = text.split(/\s+/);
      
      el.innerHTML = words.map(function (word, i) {
        var delay = i * 0.05;
        return '<span class="reveal-word" style="transition-delay: ' + delay + 's">' + word + '</span>';
      }).join(' ');
    }
  };

  /* ============================================
     5. SCROLL PROGRESS INDICATOR
     ============================================ */

  var ScrollProgress = {
    element: null,
    ticking: false,

    init: function () {
      this.element = document.querySelector('.scroll-progress');
      if (!this.element) {
        this.createElement();
      }
      
      this.bindEvents();
      this.update();
    },

    createElement: function () {
      this.element = document.createElement('div');
      this.element.className = 'scroll-progress';
      this.element.setAttribute('aria-hidden', 'true');
      document.body.insertBefore(this.element, document.body.firstChild);
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

  /* ============================================
     6. STICKY HEADER ENHANCEMENT
     ============================================ */

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
      var scrollY = window.pageYOffset;
      
      if (scrollY > this.scrollThreshold) {
        this.header.classList.add('is-scrolled');
      } else {
        this.header.classList.remove('is-scrolled');
      }
    }
  };

  /* ============================================
     7. HERO TEXT ANIMATION
     ============================================ */

  var HeroAnimation = {
    init: function () {
      if (REDUCED_MOTION) return;

      var heroTitle = document.querySelector('.hero h1');
      var heroDesc = document.querySelector('.hero p');
      var heroBtns = document.querySelector('.hero-btns');

      if (heroTitle) {
        heroTitle.style.opacity = '0';
        heroTitle.style.transform = 'translateY(20px)';
        
        setTimeout(function () {
          heroTitle.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
          heroTitle.style.opacity = '1';
          heroTitle.style.transform = 'translateY(0)';
        }, 100);
      }

      if (heroDesc) {
        heroDesc.style.opacity = '0';
        heroDesc.style.transform = 'translateY(20px)';
        
        setTimeout(function () {
          heroDesc.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
          heroDesc.style.opacity = '1';
          heroDesc.style.transform = 'translateY(0)';
        }, 300);
      }

      if (heroBtns) {
        heroBtns.style.opacity = '0';
        heroBtns.style.transform = 'translateY(20px)';
        
        setTimeout(function () {
          heroBtns.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
          heroBtns.style.opacity = '1';
          heroBtns.style.transform = 'translateY(0)';
        }, 500);
      }
    }
  };

  /* ============================================
     8. BADGE ANIMATION
     ============================================ */

  var BadgeAnimation = {
    init: function () {
      if (REDUCED_MOTION) return;

      var badge = document.querySelector('.hero-badge');
      if (!badge) return;

      badge.style.opacity = '0';
      badge.style.transform = 'translateY(-10px)';
      
      setTimeout(function () {
        badge.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        badge.style.opacity = '1';
        badge.style.transform = 'translateY(0)';
      }, 50);
    }
  };

  /* ============================================
     9. SMOOTH SCROLL FOR ANCHOR LINKS
     ============================================ */

  var SmoothScroll = {
    init: function () {
      var links = document.querySelectorAll('a[href^="#"]');
      
      links.forEach(function (link) {
        link.addEventListener('click', function (e) {
          var targetId = this.getAttribute('href');
          if (targetId === '#') return;
          
          var target = document.querySelector(targetId);
          if (!target) return;
          
          e.preventDefault();
          
          var headerHeight = document.querySelector('.site-header')?.offsetHeight || 0;
          var targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
          
          window.scrollTo({
            top: targetPosition,
            behavior: REDUCED_MOTION ? 'auto' : 'smooth'
          });
        });
      });
    }
  };

  /* ============================================
     10. LAZY LOAD IMAGES
     ============================================ */

  var LazyLoad = {
    init: function () {
      if ('loading' in HTMLImageElement.prototype) {
        var images = document.querySelectorAll('img[data-src]');
        images.forEach(function (img) {
          img.src = img.dataset.src;
        });
        return;
      }

      var images = document.querySelectorAll('img[data-src]');
      if (!images.length) return;

      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              var img = entry.target;
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              observer.unobserve(img);
            }
          });
        },
        { rootMargin: '50px' }
      );

      images.forEach(function (img) {
        observer.observe(img);
      });
    }
  };

  /* ============================================
     GLOBAL DELIVERY MAP – region card hover
     ============================================ */

  function initGlobalDeliveryMapHover() {
    var section = document.getElementById('impact');
    if (!section) return;
    var cards = section.querySelectorAll('.card--region');
    var regions = ['apac', 'mena', 'europe', 'nam'];
    cards.forEach(function (card, i) {
      var region = regions[i];
      if (!region) return;
      card.addEventListener('mouseenter', function () {
        section.setAttribute('data-hover-region', region);
      });
      card.addEventListener('mouseleave', function () {
        section.removeAttribute('data-hover-region');
      });
    });
  }

  /* ============================================
     INITIALIZATION
     ============================================ */

  function init() {
    try {
      initSectionAnimations();
    } catch (e) { console.warn('Section animations:', e); }
    try {
      Parallax.init();
    } catch (e) { console.warn('Parallax:', e); }
    try {
      NumberCounter.init();
    } catch (e) { console.warn('NumberCounter:', e); }
    try {
      TextReveal.init();
    } catch (e) { console.warn('TextReveal:', e); }
    try {
      HeroAnimation.init();
    } catch (e) { console.warn('HeroAnimation:', e); }
    try {
      BadgeAnimation.init();
    } catch (e) { console.warn('BadgeAnimation:', e); }
    try {
      SmoothScroll.init();
    } catch (e) { console.warn('SmoothScroll:', e); }
    try {
      LazyLoad.init();
    } catch (e) { console.warn('LazyLoad:', e); }
    try {
      initGlobalDeliveryMapHover();
    } catch (e) { console.warn('GlobalDeliveryMapHover:', e); }
  }

  // Run on DOM ready (avoid race with assets)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for external use
  window.HomeAnimations = {
    Parallax: Parallax,
    NumberCounter: NumberCounter,
    TextReveal: TextReveal,
    ScrollProgress: ScrollProgress,
    StickyHeader: StickyHeader
  };
})();
