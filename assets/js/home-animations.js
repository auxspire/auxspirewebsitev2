/**
 * Homepage scroll-triggered animations
 * Uses Intersection Observer to add .animate-in when sections enter viewport
 * Respects prefers-reduced-motion
 */
(function () {
  if (typeof document === 'undefined' || !document.addEventListener) return;

  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function initSectionAnimations() {
    if (prefersReducedMotion()) return;

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
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSectionAnimations);
  } else {
    initSectionAnimations();
  }
})();
