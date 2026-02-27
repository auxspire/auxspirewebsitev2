/**
 * Cursor Effects - Glow trail, magnetic buttons, spotlight tracking
 * Respects prefers-reduced-motion and disables on touch devices
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

  // Skip cursor effects on touch devices or reduced motion
  if (IS_TOUCH || REDUCED_MOTION) return;

  /* ============================================
     1. GLOW TRAIL EFFECT
     ============================================ */

  var GlowTrail = {
    canvas: null,
    ctx: null,
    container: null,
    points: [],
    maxPoints: 20,
    rafId: null,
    isActive: false,
    mouseX: 0,
    mouseY: 0,
    containerRect: null,

    init: function (container) {
      this.container = container;
      if (!this.container) return;

      // Create canvas if not exists
      var existingCanvas = this.container.querySelector('.glow-trail-canvas');
      if (!existingCanvas) {
        existingCanvas = document.createElement('div');
        existingCanvas.className = 'glow-trail-canvas';
        existingCanvas.setAttribute('aria-hidden', 'true');
        existingCanvas.innerHTML = '<canvas></canvas>';
        this.container.appendChild(existingCanvas);
      }

      this.canvas = existingCanvas.querySelector('canvas');
      if (!this.canvas) return;

      this.ctx = this.canvas.getContext('2d');
      if (!this.ctx) return;

      this.resize();
      this.bindEvents();
    },

    resize: function () {
      if (!this.container || !this.canvas) return;
      
      var dpr = Math.min(2, window.devicePixelRatio || 1);
      this.containerRect = this.container.getBoundingClientRect();
      var width = this.containerRect.width;
      var height = this.containerRect.height;

      this.canvas.width = Math.floor(width * dpr);
      this.canvas.height = Math.floor(height * dpr);
      this.canvas.style.width = width + 'px';
      this.canvas.style.height = height + 'px';
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    },

    bindEvents: function () {
      var self = this;

      this.container.addEventListener('mouseenter', function () {
        self.isActive = true;
        self.containerRect = self.container.getBoundingClientRect();
        self.start();
      });

      this.container.addEventListener('mouseleave', function () {
        self.isActive = false;
        self.points = [];
        self.stop();
        self.clear();
      });

      this.container.addEventListener('mousemove', function (e) {
        if (!self.isActive) return;
        self.containerRect = self.container.getBoundingClientRect();
        self.mouseX = e.clientX - self.containerRect.left;
        self.mouseY = e.clientY - self.containerRect.top;
      });

      window.addEventListener('resize', function () {
        self.resize();
      });
    },

    start: function () {
      if (this.rafId) return;
      this.loop();
    },

    stop: function () {
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
    },

    clear: function () {
      if (!this.ctx || !this.containerRect) return;
      this.ctx.clearRect(0, 0, this.containerRect.width, this.containerRect.height);
    },

    loop: function () {
      var self = this;
      
      if (!this.isActive) {
        this.stop();
        return;
      }

      // Add new point
      this.points.push({
        x: this.mouseX,
        y: this.mouseY,
        age: 0
      });

      // Limit points
      if (this.points.length > this.maxPoints) {
        this.points.shift();
      }

      // Clear and draw
      this.clear();
      this.draw();

      this.rafId = requestAnimationFrame(function () {
        self.loop();
      });
    },

    draw: function () {
      if (!this.ctx || this.points.length < 2) return;

      for (var i = 0; i < this.points.length; i++) {
        var point = this.points[i];
        var progress = i / this.points.length;
        var size = 4 + progress * 12;
        var opacity = progress * 0.3;

        this.ctx.beginPath();
        this.ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
        
        // Gradient fill
        var gradient = this.ctx.createRadialGradient(
          point.x, point.y, 0,
          point.x, point.y, size
        );
        gradient.addColorStop(0, 'rgba(34, 211, 238, ' + opacity + ')');
        gradient.addColorStop(0.5, 'rgba(56, 189, 248, ' + (opacity * 0.5) + ')');
        gradient.addColorStop(1, 'rgba(56, 189, 248, 0)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
      }
    }
  };

  /* ============================================
     2. MAGNETIC BUTTONS
     ============================================ */

  var MagneticButtons = {
    buttons: [],
    maxDistance: 100,
    maxMove: 8,

    init: function () {
      this.buttons = document.querySelectorAll('.btn-primary, .btn-accent, [data-magnetic]');
      if (!this.buttons.length) return;

      this.bindEvents();
    },

    bindEvents: function () {
      var self = this;

      this.buttons.forEach(function (btn) {
        btn.addEventListener('mousemove', function (e) {
          self.handleMove(btn, e);
        });

        btn.addEventListener('mouseleave', function () {
          self.handleLeave(btn);
        });
      });
    },

    handleMove: function (btn, e) {
      var rect = btn.getBoundingClientRect();
      var centerX = rect.left + rect.width / 2;
      var centerY = rect.top + rect.height / 2;

      var deltaX = e.clientX - centerX;
      var deltaY = e.clientY - centerY;

      var distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      var maxDist = Math.max(rect.width, rect.height);

      if (distance < maxDist) {
        var strength = 1 - (distance / maxDist);
        var moveX = deltaX * strength * 0.3;
        var moveY = deltaY * strength * 0.3;

        // Clamp movement
        moveX = Math.max(-this.maxMove, Math.min(this.maxMove, moveX));
        moveY = Math.max(-this.maxMove, Math.min(this.maxMove, moveY));

        btn.style.transform = 'translate(' + moveX + 'px, ' + moveY + 'px)';
      }
    },

    handleLeave: function (btn) {
      btn.style.transform = '';
      btn.style.transition = 'transform 0.3s ease-out';
      
      setTimeout(function () {
        btn.style.transition = '';
      }, 300);
    }
  };

  /* ============================================
     3. SPOTLIGHT EFFECT ON CARDS
     ============================================ */

  var SpotlightCards = {
    cards: [],

    init: function () {
      this.cards = document.querySelectorAll('.card, [data-spotlight]');
      if (!this.cards.length) return;

      this.bindEvents();
    },

    bindEvents: function () {
      var self = this;

      this.cards.forEach(function (card) {
        // Add spotlight overlay if not exists
        if (!card.querySelector('.spotlight-overlay')) {
          var overlay = document.createElement('div');
          overlay.className = 'spotlight-overlay';
          overlay.setAttribute('aria-hidden', 'true');
          card.style.position = card.style.position || 'relative';
          card.appendChild(overlay);
        }

        card.addEventListener('mousemove', function (e) {
          self.handleMove(card, e);
        });

        card.addEventListener('mouseleave', function () {
          self.handleLeave(card);
        });
      });
    },

    handleMove: function (card, e) {
      var rect = card.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;

      card.style.setProperty('--mouse-x', x + 'px');
      card.style.setProperty('--mouse-y', y + 'px');
    },

    handleLeave: function (card) {
      card.style.setProperty('--mouse-x', '50%');
      card.style.setProperty('--mouse-y', '50%');
    }
  };

  /* ============================================
     4. CURSOR GLOW (Page-wide subtle effect)
     ============================================ */

  var CursorGlow = {
    glow: null,
    mouseX: 0,
    mouseY: 0,
    currentX: 0,
    currentY: 0,
    rafId: null,
    isVisible: false,

    init: function () {
      // Create glow element
      this.glow = document.createElement('div');
      this.glow.className = 'cursor-glow';
      this.glow.setAttribute('aria-hidden', 'true');
      this.glow.style.cssText = [
        'position: fixed',
        'width: 400px',
        'height: 400px',
        'border-radius: 50%',
        'pointer-events: none',
        'z-index: 9998',
        'opacity: 0',
        'transition: opacity 0.3s ease',
        'background: radial-gradient(circle, rgba(56, 189, 248, 0.06) 0%, transparent 70%)',
        'transform: translate(-50%, -50%)',
        'mix-blend-mode: screen'
      ].join(';');
      
      document.body.appendChild(this.glow);
      this.bindEvents();
    },

    bindEvents: function () {
      var self = this;

      document.addEventListener('mousemove', function (e) {
        self.mouseX = e.clientX;
        self.mouseY = e.clientY;
        
        if (!self.isVisible) {
          self.isVisible = true;
          self.glow.style.opacity = '1';
          self.start();
        }
      });

      document.addEventListener('mouseleave', function () {
        self.isVisible = false;
        self.glow.style.opacity = '0';
        self.stop();
      });
    },

    start: function () {
      if (this.rafId) return;
      this.loop();
    },

    stop: function () {
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
    },

    loop: function () {
      var self = this;

      // Smooth interpolation
      this.currentX += (this.mouseX - this.currentX) * 0.1;
      this.currentY += (this.mouseY - this.currentY) * 0.1;

      this.glow.style.left = this.currentX + 'px';
      this.glow.style.top = this.currentY + 'px';

      if (this.isVisible) {
        this.rafId = requestAnimationFrame(function () {
          self.loop();
        });
      }
    }
  };

  /* ============================================
     INITIALIZATION
     ============================================ */

  function init() {
    // Initialize glow trail on hero sections
    var heroSections = document.querySelectorAll('.hero, [data-glow-trail]');
    heroSections.forEach(function (section) {
      var trail = Object.create(GlowTrail);
      trail.init(section);
    });

    // Initialize magnetic buttons
    MagneticButtons.init();

    // Initialize spotlight cards
    SpotlightCards.init();

    // Initialize page-wide cursor glow
    CursorGlow.init();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for external use
  window.CursorEffects = {
    GlowTrail: GlowTrail,
    MagneticButtons: MagneticButtons,
    SpotlightCards: SpotlightCards,
    CursorGlow: CursorGlow
  };
})();
