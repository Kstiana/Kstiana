(function () {
  'use strict';
  const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

  function debounce(fn, delay) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  const easeOutCubic = t => 1 - Math.pow(1 - t, 3);

  function initLoader() {
    const loader = $('#page-loader');
    if (!loader) return;

    const MIN_TIME = 1800;
    const startTime = performance.now();

    function hideLoader() {
      const elapsed = performance.now() - startTime;
      const remaining = Math.max(0, MIN_TIME - elapsed);

      setTimeout(() => {
        loader.classList.add('loaded');
        document.body.style.overflow = '';

        setTimeout(() => {
          loader.style.display = 'none';
        }, 600);
      }, remaining);
    }

    document.body.style.overflow = 'hidden';

    if (document.readyState === 'complete') {
      hideLoader();
    } else {
      window.addEventListener('load', hideLoader, { once: true });
      
      setTimeout(hideLoader, 3500);
    }
  }

  
  function initScrollProgress() {
    const bar = $('#scroll-progress');
    if (!bar) return;

    function update() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? clamp((scrollTop / docHeight) * 100, 0, 100) : 0;
      bar.style.width = pct + '%';
    }

    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  function initNavbar() {
    const navbar = $('#navbar');
    if (!navbar) return;

    const navSections = $$('section[id]');
    const navLinks    = $$('.nav-link[data-section]');

    function onScroll() {
      if (window.scrollY > 20) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
      highlightActiveLink();
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    function highlightActiveLink() {
      const scrollMid = window.scrollY + window.innerHeight / 2.5;
      let currentId = '';

      navSections.forEach(sec => {
        if (sec.offsetTop <= scrollMid) {
          currentId = sec.id;
        }
      });

      navLinks.forEach(link => {
        link.classList.toggle('active', link.dataset.section === currentId);
      });

      $$('.mobile-nav-link[data-section]').forEach(link => {
        link.classList.toggle('active', link.dataset.section === currentId);
      });
    }
  }

  function initMobileMenu() {
    const toggle = $('#menu-toggle');
    const menu   = $('#mobile-menu');
    if (!toggle || !menu) return;

    let isOpen = false;

    function openMenu() {
      isOpen = true;
      menu.classList.add('open');
      menu.setAttribute('aria-hidden', 'false');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
  
      const firstLink = menu.querySelector('.mobile-nav-link');
      if (firstLink) setTimeout(() => firstLink.focus(), 50);
    }

    function closeMenu() {
      isOpen = false;
      menu.classList.remove('open');
      menu.setAttribute('aria-hidden', 'true');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      toggle.focus();
    }

    toggle.addEventListener('click', () => {
      isOpen ? closeMenu() : openMenu();
    });

    $$('.mobile-nav-link').forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && isOpen) closeMenu();
    });

    menu.addEventListener('click', e => {
      if (e.target === menu) closeMenu();
    });
  }

  function initTheme() {
    const btn  = $('#theme-toggle');
    const html = document.documentElement;
    if (!btn) return;

    const STORAGE_KEY = 'ks-portfolio-theme';
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

    function getInitialTheme() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'light' || saved === 'dark') return saved;
  return 'light'; 
}

    function applyTheme(theme) {
      html.setAttribute('data-theme', theme);
      btn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
      localStorage.setItem(STORAGE_KEY, theme);
    }

    applyTheme(getInitialTheme());

    btn.addEventListener('click', () => {
      const current = html.getAttribute('data-theme');
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });

    prefersDark.addEventListener('change', e => {
      if (!localStorage.getItem(STORAGE_KEY)) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  function initScrollAnimations() {
    const elements = $$('[data-animate]');
    if (!elements.length) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      elements.forEach(el => el.classList.add('in-view'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const el    = entry.target;
          const delay = parseInt(el.dataset.delay || '0', 10);
          setTimeout(() => el.classList.add('in-view'), delay);
          observer.unobserve(el);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    elements.forEach(el => observer.observe(el));

    window.__portfolioObserver = observer;
  }

function initTypedText() {
  const el = $('#typed-role');
  if (!el) return;

  const words = [
    'Developer',
    'Designer',
    'Wizard',
    'Builder',
    'Creator',
  ];

  const longestWord = words.reduce((a, b) => a.length > b.length ? a : b);
  el.style.maxWidth = longestWord.length + 'ch';

  let wordIndex  = 0;
  let charIndex  = 0;
  let isDeleting = false;
  let isPaused   = false;

  const TYPE_SPEED   = 90;
  const DELETE_SPEED = 50;
  const PAUSE_AFTER  = 1800;
  const PAUSE_BEFORE = 300;

  function type() {
    const currentWord = words[wordIndex];

    if (isPaused) {
      isPaused = false;
      setTimeout(type, PAUSE_BEFORE);
      return;
    }

    if (!isDeleting) {
  
      el.textContent = currentWord.slice(0, charIndex + 1);
      charIndex++;

      if (charIndex === currentWord.length) {
        
        setTimeout(() => {
          isDeleting = true;
          type();
        }, PAUSE_AFTER);
        return;
      }
      setTimeout(type, TYPE_SPEED);
    } else {
   
      el.textContent = currentWord.slice(0, charIndex - 1);
      charIndex--;

      if (charIndex === 0) {
        isDeleting = false;
        isPaused   = true;
        wordIndex  = (wordIndex + 1) % words.length;
        setTimeout(type, TYPE_SPEED);
        return;
      }
      setTimeout(type, DELETE_SPEED);
    }
  }

  setTimeout(type, 1200);
}

  function initCounters() {
    const counters = $$('[data-count]');
    if (!counters.length) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function animateCounter(el) {
      const target   = parseInt(el.dataset.count, 10);
      const duration = 1800;
      const startTime = performance.now();

      if (reduced) { el.textContent = target; return; }

      function update(now) {
        const elapsed  = now - startTime;
        const progress = clamp(elapsed / duration, 0, 1);
        const value    = Math.round(easeOutCubic(progress) * target);
        el.textContent = value;
        if (progress < 1) requestAnimationFrame(update);
        else el.textContent = target;
      }

      requestAnimationFrame(update);
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.5 });

    counters.forEach(el => observer.observe(el));
  }

  function initSkillsTabs() {
    const tabs   = $$('.skill-tab');
    const panels = $$('.skills-panel');
    if (!tabs.length || !panels.length) return;

    function activateTab(tabEl) {
      const target = tabEl.dataset.tab;

      tabs.forEach(t => {
        t.classList.toggle('active', t === tabEl);
        t.setAttribute('aria-selected', t === tabEl ? 'true' : 'false');
        t.setAttribute('tabindex', t === tabEl ? '0' : '-1');
      });

      panels.forEach(panel => {
        const isActive = panel.dataset.tab === target;
        panel.classList.toggle('active', isActive);

        if (isActive) {
          setTimeout(() => animateSkillBars(panel), 80);
        }
      });
    }

    tabs.forEach(tab => {
      tab.addEventListener('click', () => activateTab(tab));

      tab.addEventListener('keydown', e => {
        const idx     = tabs.indexOf(tab);
        let newIdx    = idx;

        if (e.key === 'ArrowRight') newIdx = (idx + 1) % tabs.length;
        if (e.key === 'ArrowLeft')  newIdx = (idx - 1 + tabs.length) % tabs.length;
        if (e.key === 'Home')       newIdx = 0;
        if (e.key === 'End')        newIdx = tabs.length - 1;

        if (newIdx !== idx) {
          e.preventDefault();
          tabs[newIdx].focus();
          activateTab(tabs[newIdx]);
        }
      });
    });

    if (tabs[0]) activateTab(tabs[0]);
  }

  
  function animateSkillBars(container = document) {
    const bars = $$('.skill-fill', container);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    bars.forEach(bar => {
      const pct = bar.dataset.pct || '0';
      if (reduced) {
        bar.style.width = pct + '%';
        return;
      }
     
      bar.style.width = '0%';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          bar.style.width = pct + '%';
        });
      });
    });
  }

  function initSkillBarObserver() {
    const firstPanel = $('.skills-panel.active');
    if (!firstPanel) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        animateSkillBars(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.2 });

    observer.observe(firstPanel);
  }

  
  function initContactForm() {
    const form        = $('#contact-form');
    const submitBtn   = $('#form-submit');
    const successDiv  = $('#form-success');
    const resetBtn    = $('#form-reset');
    const charCounter = $('#char-count');
    const msgField    = $('#message');
    if (!form) return;

    const MAX_CHARS = 500;

    if (msgField && charCounter) {
      msgField.addEventListener('input', () => {
        const len = msgField.value.length;
        charCounter.textContent = `${len} / ${MAX_CHARS}`;
        charCounter.style.color = len > MAX_CHARS * 0.9
          ? 'var(--brand)'
          : 'var(--text-faint)';
        if (len > MAX_CHARS) {
          msgField.value = msgField.value.slice(0, MAX_CHARS);
          charCounter.textContent = `${MAX_CHARS} / ${MAX_CHARS}`;
        }
      });
    }

    const rules = {
      name:    { required: true, minLen: 2, label: 'Name' },
      email:   { required: true, isEmail: true, label: 'Email' },
      subject: { required: true, minLen: 3, label: 'Subject' },
      message: { required: true, minLen: 10, label: 'Message' },
    };

    function validateField(name, value) {
      const rule = rules[name];
      if (!rule) return '';
      const v = value.trim();

      if (rule.required && !v)
        return `${rule.label} is required.`;

      if (rule.minLen && v.length < rule.minLen)
        return `${rule.label} must be at least ${rule.minLen} characters.`;

      if (rule.isEmail) {
        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRe.test(v)) return 'Please enter a valid email address.';
      }

      return ''; 
    }

    function showError(fieldName, msg) {
      const input = form.elements[fieldName];
      const errEl = $(`#${fieldName}-error`);
      if (input) input.classList.toggle('error', !!msg);
      if (errEl) errEl.textContent = msg;
    }

    function clearError(fieldName) {
      showError(fieldName, '');
    }

    Object.keys(rules).forEach(name => {
      const field = form.elements[name];
      if (!field) return;

      field.addEventListener('blur', () => {
        const msg = validateField(name, field.value);
        showError(name, msg);
      });

      field.addEventListener('input', () => {
        
        if (field.classList.contains('error')) {
          const msg = validateField(name, field.value);
          showError(name, msg);
        }
      });
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      let valid = true;
      Object.keys(rules).forEach(name => {
        const field = form.elements[name];
        if (!field) return;
        const msg = validateField(name, field.value);
        showError(name, msg);
        if (msg) valid = false;
      });

      if (!valid) {
       
        const firstError = form.querySelector('.form-input.error');
        if (firstError) firstError.focus();
        return;
      }

      const btnText    = submitBtn.querySelector('.btn-text');
      const btnSending = submitBtn.querySelector('.btn-sending');
      const btnIcon    = submitBtn.querySelector('.btn-icon');

      submitBtn.disabled = true;
      if (btnText)    btnText.style.display    = 'none';
      if (btnSending) btnSending.style.display = 'inline-flex';
      if (btnIcon)    btnIcon.style.display    = 'none';

      try {
        
        const formData = new FormData(form);
        const response = await fetch('/', {
          method:  'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body:    new URLSearchParams(formData).toString(),
        });

        if (response.ok) {
      
          form.style.display       = 'none';
          successDiv.style.display = 'flex';
   
          Object.keys(rules).forEach(name => clearError(name));
        } else {
          throw new Error('Network response was not ok');
        }
      } catch (err) {
    
        submitBtn.disabled = false;
        if (btnText)    btnText.style.display    = '';
        if (btnSending) btnSending.style.display = 'none';
        if (btnIcon)    btnIcon.style.display    = '';

        let networkErr = form.querySelector('.network-error');
        if (!networkErr) {
          networkErr = document.createElement('p');
          networkErr.className = 'network-error form-error';
          networkErr.style.textAlign = 'center';
          networkErr.style.marginTop = '8px';
          form.appendChild(networkErr);
        }
        networkErr.textContent =
          'Oops! Something went wrong. Please try emailing kstiana1@gmail.com directly.';
      }
    });

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        form.reset();
        form.style.display       = '';
        successDiv.style.display = 'none';
        if (charCounter) charCounter.textContent = `0 / ${MAX_CHARS}`;
        Object.keys(rules).forEach(name => clearError(name));
      
        if (submitBtn) {
          submitBtn.disabled = false;
          const btnText    = submitBtn.querySelector('.btn-text');
          const btnSending = submitBtn.querySelector('.btn-sending');
          const btnIcon    = submitBtn.querySelector('.btn-icon');
          if (btnText)    btnText.style.display    = '';
          if (btnSending) btnSending.style.display = 'none';
          if (btnIcon)    btnIcon.style.display    = '';
        }
      });
    }
  }

  
  function initSmoothScroll() {
    document.addEventListener('click', e => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;

      const targetId = link.getAttribute('href').slice(1);
      if (!targetId) {
    
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      const target = document.getElementById(targetId);
      if (!target) return;

      e.preventDefault();
      const navH   = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 70;
      const top    = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  }

  function initHeroParallax() {
    const card = $('#profile-card');
    const hero = $('.hero-section');
    if (!card || !hero) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    hero.addEventListener('mousemove', debounce((e) => {
      const rect = hero.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      const dx   = (e.clientX - cx) / (rect.width  / 2);
      const dy   = (e.clientY - cy) / (rect.height / 2);

      card.style.transform  = `perspective(600px) rotateY(${dx * 5}deg) rotateX(${dy * -5}deg)`;
      card.style.transition = 'transform 0.08s linear';
    }, 10), { passive: true });

    hero.addEventListener('mouseleave', () => {
      card.style.transform  = '';
      card.style.transition = 'transform 0.6s cubic-bezier(0.34,1.56,0.64,1)';
    });
  }

  function initFooterYear() {
    const el = $('#footer-year');
    if (el) el.textContent = new Date().getFullYear();
  }

  
  function applyStoredThemeEarly() {
  try {
    const saved = localStorage.getItem('ks-portfolio-theme');
    const theme = saved || 'light';
    document.documentElement.setAttribute('data-theme', theme);
  } catch (_) {}
}
  
  function initSectionObserver() {
    const sections = $$('section[id]');
    const navLinks = $$('.nav-link[data-section], .mobile-nav-link[data-section]');
    if (!sections.length || !navLinks.length) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.dataset.section === entry.target.id);
        });
      });
    }, { rootMargin: '-40% 0px -50% 0px' });

    sections.forEach(sec => observer.observe(sec));
  }

  function initFocusTrap() {
    const menu = $('#mobile-menu');
    if (!menu) return;

    menu.addEventListener('keydown', e => {
      if (e.key !== 'Tab') return;
      if (!menu.classList.contains('open')) return;

      const focusable = $$('a, button, input, [tabindex]:not([tabindex="-1"])', menu)
        .filter(el => !el.disabled && el.offsetParent !== null);

      if (!focusable.length) return;

      const first = focusable[0];
      const last  = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  }

  function init() {
    applyStoredThemeEarly();
    initLoader();
    initScrollProgress();
    initNavbar();
    initMobileMenu();
    initTheme();
    initScrollAnimations();
    initSectionObserver();
    initTypedText();
    initCounters();
    initSkillsTabs();
    initSkillBarObserver();
    initContactForm();
    initSmoothScroll();
    initHeroParallax();
    initFocusTrap();
    initFooterYear();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
