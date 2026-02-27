/**
 * Interactive Cards - 3D tilt, ripple effects, glowing borders
 * Respects prefers-reduced-motion
 */
(function () {
  'use strict';

  if (typeof document === 'undefined' || !document.querySelector) return;

  var REDUCED_MOTION = false;
  try {
    REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e) {}

  // Detect touch device
  var IS_TOUCH = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  /* ============================================
     1. 3D TILT EFFECT
     ============================================ */

  var TiltEffect = {
    cards: [],
    maxTilt: 8,
    perspective: 1000,
    scale: 1.02,
    speed: 400,

    init: function () {
      if (IS_TOUCH || REDUCED_MOTION) return;

      this.cards = document.querySelectorAll('.card, [data-tilt]');
      if (!this.cards.length) return;

      this.bindEvents();
    },

    bindEvents: function () {
      var self = this;

      this.cards.forEach(function (card) {
        // Store original transform
        card.dataset.originalTransform = card.style.transform || '';

        card.addEventListener('mouseenter', function () {
          self.handleEnter(card);
        });

        card.addEventListener('mousemove', function (e) {
          self.handleMove(card, e);
        });

        card.addEventListener('mouseleave', function () {
          self.handleLeave(card);
        });
      });
    },

    handleEnter: function (card) {
      card.style.transition = 'transform ' + this.speed + 'ms ease-out';
    },

    handleMove: function (card, e) {
      var rect = card.getBoundingClientRect();
      var centerX = rect.width / 2;
      var centerY = rect.height / 2;

      var mouseX = e.clientX - rect.left;
      var mouseY = e.clientY - rect.top;

      var percentX = (mouseX - centerX) / centerX;
      var percentY = (mouseY - centerY) / centerY;

      var tiltX = -percentY * this.maxTilt;
      var tiltY = percentX * this.maxTilt;

      card.style.transition = 'transform 50ms ease-out';
      card.style.transform = 
        'perspective(' + this.perspective + 'px) ' +
        'rotateX(' + tiltX + 'deg) ' +
        'rotateY(' + tiltY + 'deg) ' +
        'scale3d(' + this.scale + ', ' + this.scale + ', ' + this.scale + ')';
    },

    handleLeave: function (card) {
      card.style.transition = 'transform ' + this.speed + 'ms ease-out';
      card.style.transform = card.dataset.originalTransform || '';
    }
  };

  /* ============================================
     2. RIPPLE EFFECT
     ============================================ */

  var RippleEffect = {
    init: function () {
      if (REDUCED_MOTION) return;

      var cards = document.querySelectorAll('.card, .btn, [data-ripple]');
      if (!cards.length) return;

      this.bindEvents(cards);
    },

    bindEvents: function (elements) {
      var self = this;

      elements.forEach(function (el) {
        // Add ripple container if not exists
        if (!el.querySelector('.ripple-container')) {
          var container = document.createElement('div');
          container.className = 'ripple-container';
          container.setAttribute('aria-hidden', 'true');
          el.style.position = el.style.position || 'relative';
          el.style.overflow = 'hidden';
          el.appendChild(container);
        }

        el.addEventListener('mousedown', function (e) {
          self.createRipple(el, e);
        });
      });
    },

    createRipple: function (el, e) {
      var container = el.querySelector('.ripple-container');
      if (!container) return;

      var rect = el.getBoundingClientRect();
      var size = Math.max(rect.width, rect.height);
      var x = e.clientX - rect.left - size / 2;
      var y = e.clientY - rect.top - size / 2;

      var ripple = document.createElement('div');
      ripple.className = 'ripple';
      ripple.style.cssText = [
        'width: ' + size + 'px',
        'height: ' + size + 'px',
        'left: ' + x + 'px',
        'top: ' + y + 'px'
      ].join(';');

      container.appendChild(ripple);

      // Remove ripple after animation
      ripple.addEventListener('animationend', function () {
        ripple.remove();
      });

      // Fallback removal
      setTimeout(function () {
        if (ripple.parentNode) {
          ripple.remove();
        }
      }, 700);
    }
  };

  /* ============================================
     3. GLOWING BORDER EFFECT
     ============================================ */

  var GlowBorder = {
    init: function () {
      if (REDUCED_MOTION) return;

      var cards = document.querySelectorAll('.card, [data-glow-border]');
      if (!cards.length) return;

      this.applyStyles(cards);
    },

    applyStyles: function (cards) {
      cards.forEach(function (card) {
        // Add glow-border class for CSS animation
        if (!card.classList.contains('glow-border')) {
          card.classList.add('glow-border');
        }
      });
    }
  };

  /* ============================================
     4. SHINE EFFECT (Gradient sweep on hover)
     ============================================ */

  var ShineEffect = {
    init: function () {
      if (IS_TOUCH || REDUCED_MOTION) return;

      var cards = document.querySelectorAll('.card, [data-shine]');
      if (!cards.length) return;

      this.bindEvents(cards);
    },

    bindEvents: function (cards) {
      var self = this;

      cards.forEach(function (card) {
        // Add shine overlay if not exists
        if (!card.querySelector('.shine-overlay')) {
          var shine = document.createElement('div');
          shine.className = 'shine-overlay';
          shine.setAttribute('aria-hidden', 'true');
          shine.style.cssText = [
            'position: absolute',
            'inset: 0',
            'pointer-events: none',
            'opacity: 0',
            'transition: opacity 0.3s ease',
            'background: linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.08) 50%, transparent 60%)',
            'background-size: 200% 200%',
            'background-position: -100% -100%'
          ].join(';');
          card.style.position = card.style.position || 'relative';
          card.appendChild(shine);
        }

        card.addEventListener('mouseenter', function () {
          self.handleEnter(card);
        });

        card.addEventListener('mouseleave', function () {
          self.handleLeave(card);
        });
      });
    },

    handleEnter: function (card) {
      var shine = card.querySelector('.shine-overlay');
      if (!shine) return;

      shine.style.opacity = '1';
      shine.style.transition = 'background-position 0.6s ease, opacity 0.3s ease';
      shine.style.backgroundPosition = '200% 200%';
    },

    handleLeave: function (card) {
      var shine = card.querySelector('.shine-overlay');
      if (!shine) return;

      shine.style.opacity = '0';
      // Reset position after fade out
      setTimeout(function () {
        shine.style.transition = 'opacity 0.3s ease';
        shine.style.backgroundPosition = '-100% -100%';
      }, 300);
    }
  };

  /* ============================================
     5. HOVER LIFT ENHANCEMENT
     ============================================ */

  var HoverLift = {
    init: function () {
      if (REDUCED_MOTION) return;

      var cards = document.querySelectorAll('.card:not([data-no-lift])');
      if (!cards.length) return;

      this.applyStyles(cards);
    },

    applyStyles: function (cards) {
      cards.forEach(function (card) {
        // Enhanced shadow on hover via CSS
        card.style.transition = card.style.transition 
          ? card.style.transition + ', box-shadow 0.3s ease'
          : 'box-shadow 0.3s ease';
      });
    }
  };

  /* ============================================
     6. CARD ENTRANCE ANIMATION
     ============================================ */

  var CardEntrance = {
    observer: null,

    init: function () {
      if (REDUCED_MOTION) return;

      var cards = document.querySelectorAll('.cards .card');
      if (!cards.length) return;

      this.setupObserver(cards);
    },

    setupObserver: function (cards) {
      var self = this;

      // Add initial hidden state
      cards.forEach(function (card, index) {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.dataset.cardIndex = index;
      });

      this.observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              self.animateIn(entry.target);
              self.observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.1,
          rootMargin: '0px 0px -50px 0px'
        }
      );

      cards.forEach(function (card) {
        self.observer.observe(card);
      });
    },

    animateIn: function (card) {
      var index = parseInt(card.dataset.cardIndex, 10) || 0;
      var delay = index * 100; // Stagger by 100ms per card

      setTimeout(function () {
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, delay);
    }
  };

  /* ============================================
     7. CONNECTION LINES BETWEEN CARDS
     ============================================ */

  var ConnectionLines = {
    svg: null,
    container: null,

    init: function () {
      var cardsContainer = document.querySelector('.cards[data-connected]');
      if (!cardsContainer) return;

      this.container = cardsContainer;
      this.createSVG();
      this.drawLines();

      var self = this;
      window.addEventListener('resize', function () {
        self.drawLines();
      });
    },

    createSVG: function () {
      this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      this.svg.setAttribute('class', 'connection-lines');
      this.svg.setAttribute('aria-hidden', 'true');
      this.svg.style.cssText = [
        'position: absolute',
        'top: 0',
        'left: 0',
        'width: 100%',
        'height: 100%',
        'pointer-events: none',
        'z-index: 0',
        'overflow: visible'
      ].join(';');

      this.container.style.position = 'relative';
      this.container.insertBefore(this.svg, this.container.firstChild);
    },

    drawLines: function () {
      if (!this.svg) return;

      // Clear existing lines
      this.svg.innerHTML = '';

      var cards = this.container.querySelectorAll('.card');
      if (cards.length < 2) return;

      var containerRect = this.container.getBoundingClientRect();

      // Draw lines between adjacent cards
      for (var i = 0; i < cards.length - 1; i++) {
        var card1 = cards[i].getBoundingClientRect();
        var card2 = cards[i + 1].getBoundingClientRect();

        var x1 = card1.left + card1.width / 2 - containerRect.left;
        var y1 = card1.top + card1.height / 2 - containerRect.top;
        var x2 = card2.left + card2.width / 2 - containerRect.left;
        var y2 = card2.top + card2.height / 2 - containerRect.top;

        var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        
        // Create curved path
        var midX = (x1 + x2) / 2;
        var midY = (y1 + y2) / 2;
        var curveOffset = 30;
        
        var d = 'M ' + x1 + ' ' + y1 + 
                ' Q ' + midX + ' ' + (midY - curveOffset) + 
                ' ' + x2 + ' ' + y2;

        path.setAttribute('d', d);
        path.setAttribute('class', 'connection-line');

        this.svg.appendChild(path);
      }
    }
  };

  /* ============================================
     INITIALIZATION
     ============================================ */

  function init() {
    TiltEffect.init();
    RippleEffect.init();
    GlowBorder.init();
    ShineEffect.init();
    HoverLift.init();
    CardEntrance.init();
    ConnectionLines.init();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for external use
  window.InteractiveCards = {
    TiltEffect: TiltEffect,
    RippleEffect: RippleEffect,
    GlowBorder: GlowBorder,
    ShineEffect: ShineEffect,
    ConnectionLines: ConnectionLines
  };
})();
