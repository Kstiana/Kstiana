(function () {
  'use strict';

  const isTouch = () =>
    window.matchMedia('(hover: none) and (pointer: coarse)').matches ||
    window.innerWidth <= 1024;

  if (isTouch()) return;

  const outer = document.getElementById('cursor-outer');
  const inner = document.getElementById('cursor-inner');
  const body  = document.body;

  if (!outer || !inner) return;

  let mouseX = -200, mouseY = -200; 
  let outerX = -200, outerY = -200;
  let rafId  = null;
  let isVisible = false;

  function showCursors() {
    if (isVisible) return;
    isVisible = true;
    outer.style.opacity = '1';
    inner.style.opacity = '1';
  }

  function onMouseMove(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;

    inner.style.left = mouseX + 'px';
    inner.style.top  = mouseY + 'px';
    showCursors();
  }

  function lerp(a, b, t) { return a + (b - a) * t; }

  function animateOuter() {
    outerX = lerp(outerX, mouseX, 0.12);
    outerY = lerp(outerY, mouseY, 0.12);
    outer.style.left = outerX + 'px';
    outer.style.top  = outerY + 'px';
    rafId = requestAnimationFrame(animateOuter);
  }

  const hoverSelectors = [
    'a', 'button', '[role="button"]',
    '.btn-primary', '.btn-ghost', '.btn-outline',
    '.nav-link', '.mobile-nav-link',
    '.project-card', '.skill-card', '.wid-card',
    '.contact-link-item', '.filter-btn', '.filter-btn',
    '.skill-tab', '.theme-btn', '.hamburger',
    '.back-to-top', '.scroll-indicator',
    '.tech-pill', '.project-link', '.project-link-gh',
    'label[for]',
  ].join(', ');

  const textSelectors = 'input, textarea, [contenteditable]';

  function onMouseOver(e) {
    const target = e.target;
    if (target.matches(textSelectors) || target.closest(textSelectors)) {

      body.classList.remove('cursor-hovering');
      body.classList.add('cursor-text');
      outer.style.width  = '3px';
      outer.style.height = '28px';
      outer.style.borderRadius = '2px';
      outer.style.opacity = '0.5';
      return;
    }
    if (target.matches(hoverSelectors) || target.closest(hoverSelectors)) {
      body.classList.add('cursor-hovering');
      body.classList.remove('cursor-text');
      outer.style.width  = '';
      outer.style.height = '';
      outer.style.borderRadius = '';
      outer.style.opacity = '';
    }
  }

  function onMouseOut(e) {
    const to = e.relatedTarget;
    if (
      !to ||
      (!to.matches(hoverSelectors) && !to.closest(hoverSelectors) &&
       !to.matches(textSelectors)  && !to.closest(textSelectors))
    ) {
      body.classList.remove('cursor-hovering', 'cursor-text');
      outer.style.width  = '';
      outer.style.height = '';
      outer.style.borderRadius = '';
      outer.style.opacity = '';
    }
  }

  function spawnBurst(x, y) {
    const burst = document.createElement('div');
    burst.style.cssText = `
      position: fixed;
      left: ${x}px;
      top:  ${y}px;
      width: 8px;
      height: 8px;
      transform: translate(-50%, -50%) scale(1);
      border-radius: 50%;
      background: transparent;
      border: 2px solid var(--brand);
      pointer-events: none;
      z-index: 9996;
      animation: cursorBurst 0.5s ease-out forwards;
    `;
    document.body.appendChild(burst);
    setTimeout(() => burst.remove(), 520);
  }

  if (!document.getElementById('cursor-burst-style')) {
    const style = document.createElement('style');
    style.id = 'cursor-burst-style';
    style.textContent = `
      @keyframes cursorBurst {
        0%   { transform: translate(-50%,-50%) scale(0.5); opacity: 1; }
        100% { transform: translate(-50%,-50%) scale(3.5); opacity: 0; }
      }
      .cursor-text #cursor-inner {
        width: 2px;
        height: 18px;
        border-radius: 2px;
        background: var(--brand);
        animation: blink 1s step-end infinite;
      }
    `;
    document.head.appendChild(style);
  }

  function onMouseDown(e) {
    body.classList.add('cursor-clicking');
    spawnBurst(e.clientX, e.clientY);
  }
  function onMouseUp() {
    body.classList.remove('cursor-clicking');
  }

  function onMouseLeave() {
    outer.style.opacity = '0';
    inner.style.opacity = '0';
    isVisible = false;
  }
  function onMouseEnter() {
    if (isVisible) {
      outer.style.opacity = '';
      inner.style.opacity = '';
    }
  }

  outer.style.opacity = '0';
  inner.style.opacity = '0';

  document.addEventListener('mousemove',  onMouseMove,  { passive: true });
  document.addEventListener('mouseover',  onMouseOver,  { passive: true });
  document.addEventListener('mouseout',   onMouseOut,   { passive: true });
  document.addEventListener('mousedown',  onMouseDown,  { passive: true });
  document.addEventListener('mouseup',    onMouseUp,    { passive: true });
  document.addEventListener('mouseleave', onMouseLeave, { passive: true });
  document.addEventListener('mouseenter', onMouseEnter, { passive: true });

  rafId = requestAnimationFrame(animateOuter);

  window.addEventListener('beforeunload', () => {
    cancelAnimationFrame(rafId);
  });

  window.addEventListener('resize', () => {
    if (isTouch()) {
      cancelAnimationFrame(rafId);
      outer.style.display = 'none';
      inner.style.display = 'none';
      body.classList.remove('cursor-hovering', 'cursor-text', 'cursor-clicking');
    }
  }, { passive: true });

})();
