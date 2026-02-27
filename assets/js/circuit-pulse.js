/**
 * Circuit Pulse – canvas PCB-style paths with moving glowing pulses.
 * Targets [data-circuit-pulse] containers. Respects prefers-reduced-motion.
 * Site colors: rgba(34,211,238,...) (#22d3ee).
 */
(function () {
  if (typeof document === 'undefined' || !document.querySelector) return;

  var REDUCED = false;
  try {
    REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e) {}

  function rnd(min, max) {
    return Math.random() * (max - min) + min;
  }

  function makePath(width, height) {
    var x = rnd(60, width - 60);
    var y = rnd(60, height - 60);
    var pts = [{ x: x, y: y }];
    for (var i = 0; i < 6; i++) {
      if (Math.random() > 0.5) {
        x += (Math.random() > 0.5 ? 1 : -1) * rnd(60, 160);
      } else {
        y += (Math.random() > 0.5 ? 1 : -1) * rnd(60, 160);
      }
      x = Math.max(40, Math.min(width - 40, x));
      y = Math.max(40, Math.min(height - 40, y));
      pts.push({ x: x, y: y });
    }
    return pts;
  }

  function preparePath(pts) {
    var segs = [];
    var total = 0;
    for (var i = 0; i < pts.length - 1; i++) {
      var a = pts[i];
      var b = pts[i + 1];
      var len = Math.hypot(b.x - a.x, b.y - a.y);
      segs.push({ a: a, b: b, len: len });
      total += len;
    }
    return { pts: pts, segs: segs, total: total };
  }

  function pointOn(prep, dist) {
    var total = prep.total;
    var d = ((dist % total) + total) % total;
    for (var s = 0; s < prep.segs.length; s++) {
      var seg = prep.segs[s];
      if (d <= seg.len) {
        var t = seg.len === 0 ? 0 : d / seg.len;
        return {
          x: seg.a.x + (seg.b.x - seg.a.x) * t,
          y: seg.a.y + (seg.b.y - seg.a.y) * t
        };
      }
      d -= seg.len;
    }
    var last = prep.pts[prep.pts.length - 1];
    return { x: last.x, y: last.y };
  }

  function initContainer(container, index) {
    var canvas = container.querySelector('canvas');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var width = 0;
    var height = 0;
    var prepared = [];
    var pathCount = 8;
    var timeOffset = index * 80;

    function resize() {
      var dpr = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
      var cw = container.clientWidth;
      var ch = container.clientHeight;
      var newPathCount = cw < 768 ? 6 : 8;
      if (cw === width && ch === height && pathCount === newPathCount) return;
      pathCount = newPathCount;
      width = cw;
      height = ch;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      var paths = [];
      for (var p = 0; p < pathCount; p++) {
        paths.push(makePath(width, height));
      }
      prepared = paths.map(function (pts) {
        return preparePath(pts);
      });
    }

    function drawBackground() {
      var g = ctx.createLinearGradient(0, 0, 0, height);
      g.addColorStop(0, 'rgba(11, 26, 53, 0.1)');
      g.addColorStop(1, 'rgba(7, 16, 33, 0.06)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, width, height);
    }

    function drawPaths() {
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.07)';
      ctx.shadowColor = 'rgba(34, 211, 238, 0.12)';
      ctx.shadowBlur = 4;
      for (var i = 0; i < prepared.length; i++) {
        var p = prepared[i];
        ctx.beginPath();
        ctx.moveTo(p.pts[0].x, p.pts[0].y);
        for (var j = 0; j < p.pts.length; j++) {
          ctx.lineTo(p.pts[j].x, p.pts[j].y);
        }
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
    }

    function drawNodes() {
      ctx.shadowBlur = 6;
      ctx.shadowColor = 'rgba(34, 211, 238, 0.25)';
      for (var i = 0; i < prepared.length; i++) {
        var p = prepared[i];
        for (var j = 0; j < p.pts.length; j++) {
          var pt = p.pts[j];
          ctx.beginPath();
          ctx.fillStyle = 'rgba(34, 211, 238, 0.18)';
          ctx.arc(pt.x, pt.y, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.shadowBlur = 0;
    }

    function drawPulse(x, y, r, fill) {
      ctx.beginPath();
      ctx.fillStyle = fill;
      ctx.shadowColor = fill;
      ctx.shadowBlur = 8;
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    var lastTime = performance.now();
    var t = 0;
    var speed = 85;
    var rafId = null;
    var visible = true;

    function loop(now) {
      rafId = null;
      if (!visible) return;
      var dt = (now - lastTime) / 1000;
      lastTime = now;
      t += dt;

      drawBackground();
      drawPaths();
      drawNodes();

      for (var i = 0; i < prepared.length; i++) {
        var p = prepared[i];
        var base = t * speed + i * 80 + timeOffset;
        var a = pointOn(p, base);
        var b = pointOn(p, base - 140);
        drawPulse(a.x, a.y, 3.2, 'rgba(34, 211, 238, 0.28)');
        drawPulse(b.x, b.y, 2.2, 'rgba(80, 255, 200, 0.2)');
      }

      rafId = requestAnimationFrame(loop);
    }

    function drawStatic() {
      drawBackground();
      drawPaths();
      drawNodes();
    }

    function start() {
      visible = true;
      lastTime = performance.now();
      if (!rafId) rafId = requestAnimationFrame(loop);
    }

    function stop() {
      visible = false;
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    }

    resize();
    window.addEventListener('resize', resize);

    if (REDUCED) {
      drawStatic();
    } else {
      var obs = new IntersectionObserver(
        function (entries) {
          for (var e = 0; e < entries.length; e++) {
            if (entries[e].target === container) {
              if (entries[e].isIntersecting) start();
              else stop();
              break;
            }
          }
        },
        { rootMargin: '50px', threshold: 0 }
      );
      obs.observe(container);
      start();
    }
  }

  function init() {
    var containers = document.querySelectorAll('[data-circuit-pulse]');
    for (var i = 0; i < containers.length; i++) {
      initContainer(containers[i], i);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
