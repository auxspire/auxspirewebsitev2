/**
 * Particle Field - Canvas-based star/particle system
 * Creates subtle drifting particles for hero and dark sections
 * Respects prefers-reduced-motion
 */
(function () {
  'use strict';

  if (typeof document === 'undefined' || !document.querySelector) return;

  var REDUCED_MOTION = false;
  try {
    REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e) {}

  var IS_MOBILE = window.innerWidth < 768;
  var PARTICLE_COUNT = IS_MOBILE ? 50 : 100;
  var COLORS = [
    { r: 255, g: 255, b: 255 },    // White
    { r: 56, g: 189, b: 248 },     // Cyan #38bdf8
    { r: 34, g: 211, b: 238 },     // Lighter cyan #22d3ee
    { r: 99, g: 102, b: 241 },     // Indigo #6366f1
  ];

  function random(min, max) {
    return Math.random() * (max - min) + min;
  }

  function randomColor() {
    return COLORS[Math.floor(Math.random() * COLORS.length)];
  }

  function Particle(width, height) {
    this.reset(width, height, true);
  }

  Particle.prototype.reset = function (width, height, initial) {
    this.x = random(0, width);
    this.y = initial ? random(0, height) : height + 10;
    this.size = random(1, 3);
    this.speedY = random(0.1, 0.4);
    this.speedX = random(-0.15, 0.15);
    this.opacity = random(0.1, 0.5);
    this.color = randomColor();
    this.twinkleSpeed = random(0.005, 0.015);
    this.twinkleOffset = random(0, Math.PI * 2);
  };

  Particle.prototype.update = function (width, height, time) {
    this.y -= this.speedY;
    this.x += this.speedX;

    // Twinkle effect
    this.currentOpacity = this.opacity + Math.sin(time * this.twinkleSpeed + this.twinkleOffset) * 0.15;
    this.currentOpacity = Math.max(0.05, Math.min(0.6, this.currentOpacity));

    // Reset if off screen
    if (this.y < -10 || this.x < -10 || this.x > width + 10) {
      this.reset(width, height, false);
    }
  };

  Particle.prototype.draw = function (ctx) {
    var c = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + this.currentOpacity + ')';
    ctx.fill();
  };

  function ParticleSystem(container) {
    this.container = container;
    this.canvas = container.querySelector('canvas');
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    if (!this.ctx) return;

    this.particles = [];
    this.width = 0;
    this.height = 0;
    this.rafId = null;
    this.visible = false;
    this.lastTime = 0;
    this.time = 0;

    this.resize = this.resize.bind(this);
    this.loop = this.loop.bind(this);
    this.handleVisibility = this.handleVisibility.bind(this);

    this.init();
  }

  ParticleSystem.prototype.init = function () {
    this.resize();
    window.addEventListener('resize', this.resize);

    // Create particles
    for (var i = 0; i < PARTICLE_COUNT; i++) {
      this.particles.push(new Particle(this.width, this.height));
    }

    // Use IntersectionObserver to start/stop when visible
    if ('IntersectionObserver' in window) {
      var self = this;
      this.observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.target === self.container) {
              if (entry.isIntersecting) {
                self.start();
              } else {
                self.stop();
              }
            }
          });
        },
        { rootMargin: '50px', threshold: 0 }
      );
      this.observer.observe(this.container);
    } else {
      // Fallback: always run if visible in viewport
      this.start();
    }

    // Handle page visibility
    document.addEventListener('visibilitychange', this.handleVisibility);
  };

  ParticleSystem.prototype.handleVisibility = function () {
    if (document.hidden) {
      this.stop();
    } else if (this.visible) {
      this.start();
    }
  };

  ParticleSystem.prototype.resize = function () {
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    var rect = this.container.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;

    this.canvas.width = Math.floor(this.width * dpr);
    this.canvas.height = Math.floor(this.height * dpr);
    this.canvas.style.width = this.width + 'px';
    this.canvas.style.height = this.height + 'px';
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Update particle count based on screen size
    var targetCount = window.innerWidth < 768 ? 50 : 100;
    while (this.particles.length < targetCount) {
      this.particles.push(new Particle(this.width, this.height));
    }
    while (this.particles.length > targetCount) {
      this.particles.pop();
    }
  };

  ParticleSystem.prototype.start = function () {
    if (this.rafId || REDUCED_MOTION) return;
    this.visible = true;
    this.lastTime = performance.now();
    this.rafId = requestAnimationFrame(this.loop);
  };

  ParticleSystem.prototype.stop = function () {
    this.visible = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  };

  ParticleSystem.prototype.loop = function (now) {
    if (!this.visible) return;

    var dt = (now - this.lastTime) / 1000;
    this.lastTime = now;
    this.time += dt;

    // Clear canvas
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Update and draw particles
    for (var i = 0; i < this.particles.length; i++) {
      this.particles[i].update(this.width, this.height, this.time);
      this.particles[i].draw(this.ctx);
    }

    this.rafId = requestAnimationFrame(this.loop);
  };

  ParticleSystem.prototype.drawStatic = function () {
    this.ctx.clearRect(0, 0, this.width, this.height);
    for (var i = 0; i < this.particles.length; i++) {
      this.particles[i].currentOpacity = this.particles[i].opacity;
      this.particles[i].draw(this.ctx);
    }
  };

  ParticleSystem.prototype.destroy = function () {
    this.stop();
    window.removeEventListener('resize', this.resize);
    document.removeEventListener('visibilitychange', this.handleVisibility);
    if (this.observer) {
      this.observer.disconnect();
    }
  };

  // Initialize all particle containers
  function init() {
    var containers = document.querySelectorAll('[data-particles]');
    containers.forEach(function (container) {
      var system = new ParticleSystem(container);
      
      // If reduced motion, draw static frame
      if (REDUCED_MOTION && system.ctx) {
        system.drawStatic();
      }
    });
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for external use
  window.ParticleSystem = ParticleSystem;
})();
