/* ═══════════════════════════════════════════════════════
   CDE FUENLABRADA FALCONS — main.js
   ═══════════════════════════════════════════════════════ */

// ─── NAV SCROLL & ACTIVE LINK ───
const nav = document.getElementById('nav');
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav__links a');

window.addEventListener('scroll', () => {
  // scrolled class
  nav.classList.toggle('scrolled', window.scrollY > 30);

  // active link
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
  });
  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
  });
});

// ─── BURGER MENU ───
const burger = document.getElementById('burger');
const navLinksList = document.getElementById('navLinks');

burger.addEventListener('click', () => {
  burger.classList.toggle('open');
  navLinksList.classList.toggle('open');
});

navLinksList.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    burger.classList.remove('open');
    navLinksList.classList.remove('open');
  });
});

// ─── SMOOTH SCROLL ───
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = nav.offsetHeight + 8;
    window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
  });
});

// ─── REVEAL ON SCROLL ───
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ─── COUNTER ANIMATION ───
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 2000;
  const start = performance.now();

  function update(time) {
    const elapsed = Math.min((time - start) / duration, 1);
    const ease = 1 - Math.pow(1 - elapsed, 3); // ease-out cubic
    el.textContent = Math.floor(ease * target);
    if (elapsed < 1) requestAnimationFrame(update);
    else el.textContent = target;
  }
  requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('[data-target]').forEach(el => {
        if (!el.dataset.animated) {
          el.dataset.animated = 'true';
          animateCounter(el);
        }
      });
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

const heroStats = document.querySelector('.hero__stats');
if (heroStats) counterObserver.observe(heroStats);

// Trigger hero counters after a short delay if already visible
setTimeout(() => {
  document.querySelectorAll('[data-target]').forEach(el => {
    if (!el.dataset.animated) {
      el.dataset.animated = 'true';
      animateCounter(el);
    }
  });
}, 600);

// ─── PARTICLES ───
(function createParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  const count = 30;

  for (let i = 0; i < count; i++) {
    const p = document.createElement('span');
    const size = Math.random() * 3 + 1;
    const x = Math.random() * 100;
    const delay = Math.random() * 8;
    const duration = Math.random() * 10 + 8;
    const opacity = Math.random() * 0.3 + 0.05;

    p.style.cssText = `
      position: absolute;
      left: ${x}%;
      bottom: -10px;
      width: ${size}px;
      height: ${size}px;
      background: ${Math.random() > 0.6 ? '#C9A84C' : '#BFC8D8'};
      border-radius: 50%;
      opacity: ${opacity};
      animation: particle-rise ${duration}s ${delay}s infinite linear;
    `;
    container.appendChild(p);
  }

  const style = document.createElement('style');
  style.textContent = `
    @keyframes particle-rise {
      0%   { transform: translateY(0) translateX(0); opacity: 0; }
      10%  { opacity: 1; }
      90%  { opacity: 0.3; }
      100% { transform: translateY(-110vh) translateX(${Math.random() > 0.5 ? '+' : '-'}${Math.random() * 100 + 20}px); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
})();

// ─── SQUAD FILTER ───
const tabs = document.querySelectorAll('.squad__tab');
const playerCards = document.querySelectorAll('.player-card');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const filter = tab.dataset.filter;

    tabs.forEach(t => t.classList.remove('squad__tab--active'));
    tab.classList.add('squad__tab--active');

    playerCards.forEach((card, i) => {
      const show = filter === 'todos' || card.dataset.pos === filter;
      if (show) {
        card.classList.remove('hidden');
        card.style.animationDelay = `${i * 50}ms`;
        card.classList.remove('visible');
        setTimeout(() => card.classList.add('visible'), 10 + i * 50);
      } else {
        card.classList.add('hidden');
      }
    });
  });
});

// ─── CONTACT FORM ───
const form = document.getElementById('contactForm');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const original = btn.textContent;

    btn.textContent = '✓ Mensaje enviado';
    btn.style.background = '#22c55e';
    btn.style.borderColor = '#22c55e';
    btn.disabled = true;

    setTimeout(() => {
      btn.textContent = original;
      btn.style.background = '';
      btn.style.borderColor = '';
      btn.disabled = false;
      form.reset();
    }, 3500);
  });
}

// ─── GALLERY LIGHTBOX (simple) ───
document.querySelectorAll('.gallery__item').forEach(item => {
  item.addEventListener('click', () => {
    item.style.transform = 'scale(1.04)';
    setTimeout(() => item.style.transform = '', 200);
  });
});
