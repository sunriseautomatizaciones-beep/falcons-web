/* ═══════════════════════════════════════════════════════
   CDE FUENLABRADA FALCONS — main.js
   ═══════════════════════════════════════════════════════ */

// ─── NAV SCROLL & ACTIVE LINK ───
const nav = document.getElementById('nav');
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav__links a');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 30);
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
    window.scrollTo({ top: target.offsetTop - nav.offsetHeight - 8, behavior: 'smooth' });
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

function observeReveal() {
  document.querySelectorAll('.reveal:not(.visible)').forEach(el => revealObserver.observe(el));
}
observeReveal();

// ─── COUNTER ANIMATION ───
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const start = performance.now();
  const duration = 2000;
  function update(time) {
    const t = Math.min((time - start) / duration, 1);
    const ease = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.floor(ease * target);
    if (t < 1) requestAnimationFrame(update);
    else el.textContent = target;
  }
  requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('[data-target]').forEach(el => {
        if (!el.dataset.animated) { el.dataset.animated = 'true'; animateCounter(el); }
      });
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

const heroStats = document.querySelector('.hero__stats');
if (heroStats) counterObserver.observe(heroStats);
setTimeout(() => {
  document.querySelectorAll('[data-target]').forEach(el => {
    if (!el.dataset.animated) { el.dataset.animated = 'true'; animateCounter(el); }
  });
}, 600);

// ─── PARTICLES ───
(function createParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('span');
    const size = Math.random() * 3 + 1;
    p.style.cssText = `position:absolute;left:${Math.random()*100}%;bottom:-10px;width:${size}px;height:${size}px;background:${Math.random()>0.6?'#C9A84C':'#BFC8D8'};border-radius:50%;opacity:${Math.random()*0.3+0.05};animation:particle-rise ${Math.random()*10+8}s ${Math.random()*8}s infinite linear`;
    container.appendChild(p);
  }
  const style = document.createElement('style');
  style.textContent = `@keyframes particle-rise{0%{transform:translateY(0);opacity:0}10%{opacity:1}90%{opacity:.3}100%{transform:translateY(-110vh) translateX(${Math.random()>0.5?'':'-'}${Math.random()*100+20}px);opacity:0}}`;
  document.head.appendChild(style);
})();

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
      btn.style.background = btn.style.borderColor = '';
      btn.disabled = false;
      form.reset();
    }, 3500);
  });
}

// ─── SQUAD FILTER (reasignable tras render dinámico) ───
function initSquadFilter() {
  const tabs = document.querySelectorAll('.squad__tab');
  const cards = document.querySelectorAll('.player-card');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const filter = tab.dataset.filter;
      tabs.forEach(t => t.classList.remove('squad__tab--active'));
      tab.classList.add('squad__tab--active');
      cards.forEach((card, i) => {
        const show = filter === 'todos' || card.dataset.pos === filter;
        card.classList.toggle('hidden', !show);
        if (show) { card.classList.remove('visible'); setTimeout(() => card.classList.add('visible'), 10 + i * 50); }
      });
    });
  });
}

// ═══════════════════════════════════════════════════════
//   CONTENIDO DINÁMICO — carga desde JSON
// ═══════════════════════════════════════════════════════

// Icono placeholder de jugador (SVG inline)
const PLAYER_SVG = `<svg viewBox="0 0 80 90" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="40" cy="28" r="18" fill="#1A2B4A"/><path d="M8 85c0-17.673 14.327-32 32-32s32 14.327 32 32" fill="#1A2B4A"/></svg>`;

// ── NOTICIAS ──
async function loadNoticias() {
  const container = document.getElementById('noticiasGrid');
  if (!container) return;
  try {
    const res = await fetch('/content/noticias.json', { cache: 'no-cache' });
    const { items } = await res.json();
    container.innerHTML = items.map(n => `
      <article class="news-card reveal">
        <div class="news-card__img">
          ${n.imagen
            ? `<img src="${n.imagen}" alt="${n.titulo}" style="width:100%;height:100%;object-fit:cover;" />`
            : `<div class="news-card__placeholder"><span>${n.categoria === 'Partido' ? '⚽' : n.categoria === 'Campo' ? '🏟️' : '🦅'}</span></div>`
          }
          <span class="news-card__cat">${n.categoria}</span>
        </div>
        <div class="news-card__body">
          <time class="news-card__date">${n.fecha}</time>
          <h3 class="news-card__title">${n.titulo}</h3>
          <p class="news-card__excerpt">${n.extracto}</p>
          <a href="#" class="news-card__link">Leer más →</a>
        </div>
      </article>
    `).join('');
    observeReveal();
  } catch {
    container.innerHTML = '<p style="color:var(--text-muted);text-align:center">No hay noticias disponibles.</p>';
  }
}

// ── GALERÍA ──
async function loadGaleria() {
  const container = document.getElementById('galeriaGrid');
  if (!container) return;
  try {
    const res = await fetch('/content/galeria.json', { cache: 'no-cache' });
    const { items } = await res.json();
    container.innerHTML = items.map(g => `
      <div class="gallery__item${g.destacada ? ' gallery__item--large' : ''} reveal">
        ${g.imagen
          ? `<img src="${g.imagen}" alt="${g.titulo}" style="width:100%;height:100%;object-fit:cover;border-radius:var(--radius);" />`
          : `<div class="gallery__placeholder"><span class="gallery__placeholder-icon">📸</span><span>${g.titulo}</span></div>`
        }
        <div class="gallery__overlay">${g.titulo}</div>
      </div>
    `).join('');
    observeReveal();
    container.querySelectorAll('.gallery__item').forEach(item => {
      item.addEventListener('click', () => {
        item.style.transform = 'scale(1.04)';
        setTimeout(() => item.style.transform = '', 200);
      });
    });
  } catch {
    container.innerHTML = '<p style="color:var(--text-muted);text-align:center">No hay fotos disponibles.</p>';
  }
}

// ── PLANTILLA ──
async function loadPlantilla() {
  const container = document.getElementById('squadGrid');
  if (!container) return;
  try {
    const res = await fetch('/content/plantilla.json', { cache: 'no-cache' });
    const { items } = await res.json();
    const posLabel = { portero: 'Portero', defensa: 'Defensa', centrocampista: 'Centrocampista', delantero: 'Delantero' };
    container.innerHTML = items.map(p => `
      <div class="player-card reveal" data-pos="${p.posicion}">
        <div class="player-card__img">
          ${p.foto
            ? `<img src="${p.foto}" alt="${p.nombre}" style="width:100%;height:100%;object-fit:cover;" />`
            : `<div class="player-card__placeholder">${PLAYER_SVG}</div>`
          }
          <span class="player-card__dorsal">${p.dorsal}</span>
        </div>
        <div class="player-card__info">
          <span class="player-card__pos">${posLabel[p.posicion] || p.posicion}</span>
          <h3 class="player-card__name">${p.nombre}</h3>
        </div>
      </div>
    `).join('');
    observeReveal();
    initSquadFilter();
  } catch {
    container.innerHTML = '<p style="color:var(--text-muted);text-align:center">No hay jugadores disponibles.</p>';
  }
}

// ── PARTIDOS ──
async function loadPartidos() {
  const proxContainer = document.getElementById('proximosGrid');
  const resContainer  = document.getElementById('resultadosGrid');
  if (!proxContainer && !resContainer) return;
  try {
    const res = await fetch('/content/partidos.json', { cache: 'no-cache' });
    const { proximos, resultados } = await res.json();

    if (proxContainer) {
      proxContainer.innerHTML = proximos.map(p => `
        <div class="match-card match-card--next">
          <div class="match-card__date">
            <span class="match-card__day">${p.dia}</span>
            <span class="match-card__month">${p.mes}</span>
          </div>
          <div class="match-card__info">
            <span class="match-card__comp">${p.comp}</span>
            <div class="match-card__teams">
              <span class="match-card__home">${p.condicion === 'Local' ? 'Fuenlabrada Falcons' : p.rival}</span>
              <span class="match-card__vs">VS</span>
              <span class="match-card__away">${p.condicion === 'Local' ? p.rival : 'Fuenlabrada Falcons'}</span>
            </div>
            <span class="match-card__venue">${p.lugar}</span>
          </div>
          <span class="match-card__badge match-card__badge--${p.condicion === 'Local' ? 'home' : 'away'}">${p.condicion}</span>
        </div>
      `).join('');
    }

    if (resContainer) {
      const labels = { victoria: 'Victoria', empate: 'Empate', derrota: 'Derrota' };
      resContainer.innerHTML = resultados.map(r => `
        <div class="result-card">
          <div class="result-card__teams">
            <span>${r.local}</span>
            <div class="result-card__score result-card__score--${r.resultado}">${r.goles_local} — ${r.goles_visitante}</div>
            <span>${r.visitante}</span>
          </div>
          <div class="result-card__meta">
            <span class="badge badge--${r.resultado}">${labels[r.resultado]}</span>
            <span>${r.fecha} · ${r.condicion}</span>
          </div>
        </div>
      `).join('');
    }
  } catch {
    if (proxContainer) proxContainer.innerHTML = '<p style="color:var(--text-muted)">No hay partidos disponibles.</p>';
  }
}

// ── PATROCINADORES ──
async function loadPatrocinadores() {
  const container = document.getElementById('patrocinadoresGrid');
  if (!container) return;
  try {
    const res = await fetch('/content/patrocinadores.json', { cache: 'no-cache' });
    const { items } = await res.json();
    if (!items.length) return; // mantener placeholders si no hay datos
    container.innerHTML = items.map(s => `
      <div class="sponsor-card">
        ${s.logo
          ? `<img src="${s.logo}" alt="${s.nombre}" style="max-width:140px;max-height:70px;object-fit:contain;" />`
          : `<span class="sponsor-card__placeholder">${s.nombre}</span>`
        }
        ${s.web ? `<a href="${s.web}" target="_blank" rel="noopener" style="position:absolute;inset:0" aria-label="${s.nombre}"></a>` : ''}
      </div>
    `).join('');
  } catch {}
}

// ── INICIALIZAR TODO ──
document.addEventListener('DOMContentLoaded', () => {
  loadNoticias();
  loadGaleria();
  loadPlantilla();
  loadPartidos();
  loadPatrocinadores();
});
