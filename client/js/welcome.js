/**
 * ==========================================================================
 * GARDEN EMPIRE — WELCOME DASHBOARD JAVASCRIPT (welcome.js)
 * Skills Applied: charles-ux-animation, charles-polish, gpt-taste
 * ==========================================================================
 */

(function () {
  'use strict';

  // 1. Prefetch Target Interface (Zero-Latency Navigation)
  function initZeroLatencyPrefetch() {
    const prefetchTargets = ['play.html', '/play', 'index.html', '/index', '/api/rooms'];
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        prefetchTargets.forEach(url => {
          const link = document.createElement('link');
          link.rel = 'prefetch';
          link.href = url;
          document.head.appendChild(link);
        });
      });
    }
  }

  // 2. Ambient Firefly & Botanical Spore Canvas (Lightweight & Reduced Motion Aware)
  function initSporeParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const PARTICLE_COUNT = Math.min(45, Math.floor(width / 30));
    const particles = [];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2 + 1,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: -Math.random() * 0.5 - 0.2, // Drifting upwards like spores
        alpha: Math.random() * 0.6 + 0.2,
        pulseSpeed: Math.random() * 0.02 + 0.01,
        color: Math.random() > 0.4 ? '110, 231, 183' : '251, 191, 36' // Emerald or Gold
      });
    }

    let animationFrameId;

    function renderParticles() {
      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.alpha += Math.sin(Date.now() * p.pulseSpeed) * 0.005;

        // Wrap around boundaries
        if (p.y < -10) p.y = height + 10;
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${Math.max(0.1, Math.min(0.8, p.alpha))})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = `rgba(${p.color}, 0.5)`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(renderParticles);
    }

    // Pause rendering when tab is inactive to save battery & CPU
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(animationFrameId);
      } else {
        animationFrameId = requestAnimationFrame(renderParticles);
      }
    });

    animationFrameId = requestAnimationFrame(renderParticles);
  }

  // 3. Tactile 3D Card Hover Physics
  function init3DCardPhysics() {
    const cards = document.querySelectorAll('.bento-card, .preview-card');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    cards.forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -6; // Max 6 deg
        const rotateY = ((x - centerX) / centerX) * 6;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  // 4. Smooth Anchor Link Scrolling with Offset
  function initSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          const navOffset = 90;
          const elementPosition = targetEl.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - navOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  // 5. Seamless Navigation for Start Playing CTA Buttons (Anti-loop fix)
  function initPlayNavigation() {
    const playLinks = document.querySelectorAll(
      '#nav-btn-play, #hero-btn-start, #footer-btn-enter, a[href="play.html"], a[href="index.html"], a[href="/play"], a[href="/index"]'
    );
    playLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const isFileProto = window.location.protocol === 'file:';
        const isLocalHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const isLocalStatic = isFileProto || (isLocalHost && window.location.port !== '');

        window.location.href = isLocalStatic ? 'play.html' : '/play';
      });
    });
  }

  // Initialize all modules on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    initZeroLatencyPrefetch();
    initSporeParticles();
    init3DCardPhysics();
    initSmoothAnchors();
    initPlayNavigation();
  });
})();

