/* =============================================
   ADITYA KRISHNA PORTFOLIO — APP.JS
============================================= */

// ── CUSTOM CURSOR ──
const cursor    = document.getElementById('cursor');
const ring      = document.getElementById('cursorRing');
let mx=0,my=0,rx=0,ry=0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cursor.style.left = mx+'px';
  cursor.style.top  = my+'px';
});

(function animRing(){
  rx += (mx-rx)*.11;
  ry += (my-ry)*.11;
  ring.style.left = rx+'px';
  ring.style.top  = ry+'px';
  requestAnimationFrame(animRing);
})();

document.querySelectorAll('a,button,.proj-card,.stat-card,.skill-card,.cert-card,.c-card,.edu-row').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.style.transform = 'translate(-50%,-50%) scale(2.2)';
    ring.style.width = '56px'; ring.style.height = '56px';
    ring.style.borderColor = 'rgba(232,197,71,.55)';
  });
  el.addEventListener('mouseleave', () => {
    cursor.style.transform = 'translate(-50%,-50%) scale(1)';
    ring.style.width = '34px'; ring.style.height = '34px';
    ring.style.borderColor = 'rgba(232,197,71,.4)';
  });
});

// ── NAV SCROLL ──
const nav = document.getElementById('nav');
const scrollHandler = () => {
  nav.classList.toggle('scrolled', window.scrollY > 55);
};
window.addEventListener('scroll', scrollHandler, {passive:true});

// ── HAMBURGER ──
const hamburger   = document.getElementById('hamburger');
const mobileMenu  = document.getElementById('mobileMenu');
let menuOpen = false;

hamburger && hamburger.addEventListener('click', () => {
  menuOpen = !menuOpen;
  if(menuOpen){
    mobileMenu.style.display = 'flex';
    setTimeout(() => mobileMenu.classList.add('open'), 10);
  } else {
    mobileMenu.classList.remove('open');
    setTimeout(() => mobileMenu.style.display = 'none', 400);
  }
});

mobileMenu && mobileMenu.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    menuOpen = false;
    mobileMenu.classList.remove('open');
    setTimeout(() => mobileMenu.style.display = 'none', 400);
  });
});

// ── SCROLL REVEAL ──
const revObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if(e.isIntersecting){
      const delay = parseInt(e.target.dataset.delay || 0);
      setTimeout(() => e.target.classList.add('in'), delay);
      revObs.unobserve(e.target);
    }
  });
}, { threshold:.08, rootMargin:'0px 0px -50px 0px' });

document.querySelectorAll('.rev').forEach(el => revObs.observe(el));

// Stagger grid children
function stagger(parentSel, childSel, step=90){
  document.querySelectorAll(parentSel).forEach(p => {
    p.querySelectorAll(childSel).forEach((c,i) => { c.dataset.delay = i * step; });
  });
}
stagger('.stats-grid',   '.stat-card',  100);
stagger('.skills-grid',  '.skill-card', 80);
stagger('.proj-list',    '.proj-card',  110);
stagger('.certs-grid',   '.cert-card',  90);
stagger('.contact-grid', '.c-card',     80);
stagger('.edu-list',     '.edu-row',    80);

// ── HERO ENTRANCE ──
window.addEventListener('load', () => {
  document.querySelectorAll('#hero .rev').forEach((el,i) => {
    setTimeout(() => el.classList.add('in'), 180 + i*120);
  });
});

// ── STAT COUNTER ANIMATION ──
function countUp(el){
  const raw = parseFloat(el.dataset.val);
  const sfx = el.dataset.sfx || '';
  const dec = el.dataset.dec ? parseInt(el.dataset.dec) : 0;
  if(isNaN(raw)) return;
  const dur = 1500, start = performance.now(), from = raw * .25;
  function tick(now){
    const t = Math.min((now-start)/dur,1);
    const ease = 1-Math.pow(1-t,3);
    const cur = from + (raw-from)*ease;
    el.textContent = (dec ? cur.toFixed(dec) : Math.round(cur)) + sfx;
    if(t < 1) requestAnimationFrame(tick);
    else el.textContent = (dec ? raw.toFixed(dec) : raw) + sfx;
  }
  requestAnimationFrame(tick);
}

const cntObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if(e.isIntersecting){
      const v = e.target.querySelector('.stat-val');
      if(v) countUp(v);
      cntObs.unobserve(e.target);
    }
  });
}, { threshold:.5 });

document.querySelectorAll('.stat-card').forEach(c => cntObs.observe(c));

// ── PROJECT CARD 3D TILT ──
document.querySelectorAll('.proj-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = e.clientX-r.left, y = e.clientY-r.top;
    const mx2 = r.width/2, my2 = r.height/2;
    const rotX = ((y-my2)/my2)*-3;
    const rotY = ((x-mx2)/mx2)*3;
    card.style.transform = `translateY(-4px) perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transition = 'transform .6s cubic-bezier(.16,1,.3,1),border-color .4s';
    card.style.transform = '';
    setTimeout(() => card.style.transition = '', 600);
  });
});

// ── ACTIVE NAV HIGHLIGHT ──
const sections  = document.querySelectorAll('section[id]');
const navAs     = document.querySelectorAll('.nav-links a');

const secObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if(e.isIntersecting){
      navAs.forEach(a => {
        const active = a.getAttribute('href') === '#'+e.target.id;
        a.style.color = active ? 'var(--gold)' : '';
        a.classList.toggle('active', active);
      });
    }
  });
}, { threshold:.35 });

sections.forEach(s => secObs.observe(s));

// ── SMOOTH ANCHOR SCROLL ──
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if(target){ e.preventDefault(); target.scrollIntoView({behavior:'smooth'}); }
  });
});

// ── WHATSAPP BUTTON ──
const waBtn = document.getElementById('waBtn');
waBtn && waBtn.addEventListener('click', () => {
  const msg = encodeURIComponent("Hi Aditya! I came across your portfolio and would love to connect.");
  window.open('https://wa.me/917985930166?text='+msg, '_blank');
});

// ── SKILL CARD HOVER GLOW ──
document.querySelectorAll('.skill-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = ((e.clientX-r.left)/r.width)*100;
    const y = ((e.clientY-r.top)/r.height)*100;
    card.style.background = `radial-gradient(circle at ${x}% ${y}%, #1e1e1e, var(--bg2) 60%)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.background = '';
  });
});
