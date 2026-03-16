/* =============================================
   ADITYA KRISHNA PORTFOLIO — APP.JS v3
   Three.js 3D Hero · Smooth everything
============================================= */

// ══════════════════════════════════════════
// THREE.JS HERO SCENE
// ══════════════════════════════════════════
(function initHero() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
  camera.position.set(0, 0, 5);

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  // ── CENTRAL OBJECT: Floating icosahedron ──
  const icoGeo = new THREE.IcosahedronGeometry(1.1, 1);
  const icoMat = new THREE.MeshStandardMaterial({
    color: 0xe8c547, metalness: 0.9, roughness: 0.15,
    wireframe: false
  });
  const ico = new THREE.Mesh(icoGeo, icoMat);
  ico.position.set(3.2, 0, 0);
  scene.add(ico);

  // Wireframe overlay on icosahedron
  const wireMat = new THREE.MeshBasicMaterial({ color: 0xe8c547, wireframe: true, transparent: true, opacity: 0.12 });
  const wireIco = new THREE.Mesh(new THREE.IcosahedronGeometry(1.12, 1), wireMat);
  wireIco.position.copy(ico.position);
  scene.add(wireIco);

  // ── RING TORUS ──
  const torusGeo = new THREE.TorusGeometry(1.8, 0.012, 8, 80);
  const torusMat = new THREE.MeshBasicMaterial({ color: 0xe8c547, transparent: true, opacity: 0.25 });
  const torus = new THREE.Mesh(torusGeo, torusMat);
  torus.position.copy(ico.position);
  torus.rotation.x = Math.PI * 0.35;
  scene.add(torus);

  const torus2 = new THREE.Mesh(
    new THREE.TorusGeometry(2.15, 0.008, 8, 80),
    new THREE.MeshBasicMaterial({ color: 0xe8c547, transparent: true, opacity: 0.12 })
  );
  torus2.position.copy(ico.position);
  torus2.rotation.x = Math.PI * 0.6;
  torus2.rotation.y = Math.PI * 0.2;
  scene.add(torus2);

  // ── FLOATING PARTICLES ──
  const particleCount = 180;
  const pPositions = new Float32Array(particleCount * 3);
  const pSpeeds = [];
  for (let i = 0; i < particleCount; i++) {
    pPositions[i*3]   = (Math.random() - 0.5) * 14;
    pPositions[i*3+1] = (Math.random() - 0.5) * 10;
    pPositions[i*3+2] = (Math.random() - 0.5) * 6 - 1;
    pSpeeds.push({ x: (Math.random()-0.5)*0.002, y: (Math.random()-0.5)*0.003 });
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
  const pMat = new THREE.PointsMaterial({ color: 0xe8c547, size: 0.025, transparent: true, opacity: 0.55 });
  const particles = new THREE.Points(pGeo, pMat);
  scene.add(particles);

  // ── SMALL ORBITING SPHERES ──
  const orbitSpheres = [];
  const orbitData = [
    { r: 2.2, speed: 0.4, phase: 0,    size: 0.06 },
    { r: 2.6, speed: -0.28, phase: 2,  size: 0.04 },
    { r: 3.0, speed: 0.18, phase: 4.5, size: 0.05 },
  ];
  orbitData.forEach(d => {
    const s = new THREE.Mesh(
      new THREE.SphereGeometry(d.size, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xe8c547, transparent: true, opacity: 0.7 })
    );
    s.userData = d;
    scene.add(s);
    orbitSpheres.push(s);
  });

  // ── LIGHTS ──
  const ambLight = new THREE.AmbientLight(0x222222, 1);
  scene.add(ambLight);
  const pointLight = new THREE.PointLight(0xe8c547, 3, 10);
  pointLight.position.set(5, 3, 4);
  scene.add(pointLight);
  const pointLight2 = new THREE.PointLight(0x4fa3e0, 1.5, 10);
  pointLight2.position.set(-4, -2, 3);
  scene.add(pointLight2);

  // ── MOUSE INTERACTION ──
  let mouseX = 0, mouseY = 0;
  let isDragging = false, prevX = 0, prevY = 0;
  let rotX = 0, rotY = 0, velX = 0, velY = 0;

  canvas.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    mouseX = ((e.clientX - r.left) / r.width - 0.5) * 2;
    mouseY = -((e.clientY - r.top) / r.height - 0.5) * 2;
    if (isDragging) {
      velY += (e.clientX - prevX) * 0.008;
      velX += (e.clientY - prevY) * 0.008;
      prevX = e.clientX; prevY = e.clientY;
    }
  });
  canvas.addEventListener('mousedown', e => { isDragging = true; prevX = e.clientX; prevY = e.clientY; canvas.style.cursor = 'grabbing'; });
  canvas.addEventListener('mouseup', () => { isDragging = false; canvas.style.cursor = 'grab'; });
  canvas.addEventListener('mouseleave', () => { isDragging = false; });
  canvas.style.cursor = 'grab';

  // Touch support
  let lastTouchX = 0, lastTouchY = 0;
  canvas.addEventListener('touchstart', e => { lastTouchX = e.touches[0].clientX; lastTouchY = e.touches[0].clientY; });
  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    velY += (e.touches[0].clientX - lastTouchX) * 0.01;
    velX += (e.touches[0].clientY - lastTouchY) * 0.01;
    lastTouchX = e.touches[0].clientX; lastTouchY = e.touches[0].clientY;
  }, { passive: false });

  // ── ANIMATION LOOP ──
  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.01;

    // Smooth velocity
    velX *= 0.88; velY *= 0.88;
    rotX += velX; rotY += velY;

    // Ico rotation: auto + mouse parallax + drag
    ico.rotation.x = rotX + t * 0.18 + mouseY * 0.12;
    ico.rotation.y = rotY + t * 0.26 + mouseX * 0.15;
    wireIco.rotation.copy(ico.rotation);

    // Torus
    torus.rotation.z = t * 0.2;
    torus2.rotation.z = -t * 0.14;
    torus2.rotation.x = Math.PI * 0.6 + Math.sin(t * 0.3) * 0.1;

    // Floating bob
    ico.position.y = Math.sin(t * 0.7) * 0.18;
    torus.position.y = ico.position.y;
    torus2.position.y = ico.position.y;
    wireIco.position.y = ico.position.y;

    // Orbiting spheres
    orbitSpheres.forEach(s => {
      const d = s.userData;
      const angle = t * d.speed + d.phase;
      s.position.x = ico.position.x + Math.cos(angle) * d.r;
      s.position.y = ico.position.y + Math.sin(angle) * d.r * 0.4;
      s.position.z = Math.sin(angle * 1.3) * 0.4;
    });

    // Particles drift
    const pos = pGeo.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
      pos[i*3]   += pSpeeds[i].x;
      pos[i*3+1] += pSpeeds[i].y;
      if (pos[i*3] >  7) pos[i*3] = -7;
      if (pos[i*3] < -7) pos[i*3] =  7;
      if (pos[i*3+1] >  5) pos[i*3+1] = -5;
      if (pos[i*3+1] < -5) pos[i*3+1] =  5;
    }
    pGeo.attributes.position.needsUpdate = true;

    // Camera subtle parallax
    camera.position.x += (mouseX * 0.3 - camera.position.x) * 0.04;
    camera.position.y += (mouseY * 0.2 - camera.position.y) * 0.04;
    camera.lookAt(3.2, 0, 0);

    renderer.render(scene, camera);
  }
  animate();

  // ── HIDE 3D ON SCROLL ──
  const heroSection = document.getElementById('hero');
  function onScroll() {
    const heroH = heroSection.offsetHeight;
    const scrolled = window.scrollY;
    const progress = Math.min(scrolled / (heroH * 0.5), 1);
    canvas.style.opacity = 1 - progress * 0.8;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
})();


// ══════════════════════════════════════════
// CURSOR
// ══════════════════════════════════════════
const cursor = document.getElementById('cursor');
const ring   = document.getElementById('cursorRing');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cursor.style.left = mx + 'px';
  cursor.style.top  = my + 'px';
});

(function animRing() {
  rx += (mx - rx) * 0.1;
  ry += (my - ry) * 0.1;
  ring.style.left = rx + 'px';
  ring.style.top  = ry + 'px';
  requestAnimationFrame(animRing);
})();

const hoverEls = document.querySelectorAll('a, button, .proj-card, .stat-card, .skill-card, .cert-card, .c-card, .award-card');
hoverEls.forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.style.transform = 'translate(-50%,-50%) scale(2.5)';
    ring.style.width = '58px'; ring.style.height = '58px';
    ring.style.borderColor = 'rgba(232,197,71,.6)';
  });
  el.addEventListener('mouseleave', () => {
    cursor.style.transform = 'translate(-50%,-50%) scale(1)';
    ring.style.width = '36px'; ring.style.height = '36px';
    ring.style.borderColor = 'rgba(232,197,71,.35)';
  });
});


// ══════════════════════════════════════════
// NAV + HAMBURGER
// ══════════════════════════════════════════
const nav       = document.getElementById('nav');
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
let menuOpen = false;

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 55);
}, { passive: true });

hamburger && hamburger.addEventListener('click', () => {
  menuOpen = !menuOpen;
  hamburger.classList.toggle('open', menuOpen);
  if (menuOpen) {
    mobileMenu.style.display = 'flex';
    requestAnimationFrame(() => mobileMenu.classList.add('open'));
  } else {
    mobileMenu.classList.remove('open');
    setTimeout(() => { mobileMenu.style.display = 'none'; }, 400);
  }
});

mobileMenu && mobileMenu.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    menuOpen = false;
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
    setTimeout(() => { mobileMenu.style.display = 'none'; }, 400);
  });
});


// ══════════════════════════════════════════
// SCROLL REVEAL
// ══════════════════════════════════════════
const revObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const d = parseInt(e.target.dataset.delay || 0);
      setTimeout(() => e.target.classList.add('in'), d);
      revObs.unobserve(e.target);
    }
  });
}, { threshold: 0.07, rootMargin: '0px 0px -45px 0px' });

document.querySelectorAll('.rev').forEach(el => revObs.observe(el));

function stagger(parent, child, step = 85) {
  document.querySelectorAll(parent).forEach(p => {
    p.querySelectorAll(child).forEach((c, i) => { c.dataset.delay = i * step; });
  });
}
stagger('.stats-grid',   '.stat-card',  100);
stagger('.skills-grid',  '.skill-card', 75);
stagger('.proj-list',    '.proj-card',  110);
stagger('.certs-grid',   '.cert-card',  80);
stagger('.contact-grid', '.c-card',     75);
stagger('.edu-list',     '.edu-row',    75);


// ══════════════════════════════════════════
// HERO ENTRANCE (words slide up)
// ══════════════════════════════════════════
window.addEventListener('load', () => {
  document.querySelectorAll('#hero .rev').forEach((el, i) => {
    setTimeout(() => el.classList.add('in'), 200 + i * 120);
  });
});


// ══════════════════════════════════════════
// STAT COUNTER
// ══════════════════════════════════════════
function countUp(el) {
  const raw = parseFloat(el.dataset.val);
  const sfx = el.dataset.sfx || '';
  const dec = el.dataset.dec ? parseInt(el.dataset.dec) : 0;
  if (isNaN(raw)) return;
  const dur = 1600, st = performance.now(), from = 0;
  function tick(now) {
    const t = Math.min((now - st) / dur, 1);
    const ease = 1 - Math.pow(1 - t, 4);
    const cur = from + (raw - from) * ease;
    el.textContent = (dec ? cur.toFixed(dec) : Math.round(cur)) + sfx;
    if (t < 1) requestAnimationFrame(tick);
    else el.textContent = (dec ? raw.toFixed(dec) : raw) + sfx;
  }
  requestAnimationFrame(tick);
}

const cntObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const v = e.target.querySelector('[data-val]');
      if (v) countUp(v);
      cntObs.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('.stat-card').forEach(c => cntObs.observe(c));


// ══════════════════════════════════════════
// PROJECT CARD 3D TILT
// ══════════════════════════════════════════
document.querySelectorAll('.proj-card').forEach(card => {
  let rafId;
  card.addEventListener('mousemove', e => {
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      const r = card.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      const rotX = ((y - r.height / 2) / r.height) * -6;
      const rotY = ((x - r.width  / 2) / r.width)  *  6;
      card.style.transform = `translateY(-5px) perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
      card.style.transition = 'border-color .4s, box-shadow .4s, transform 0.05s';
    });
  });
  card.addEventListener('mouseleave', () => {
    cancelAnimationFrame(rafId);
    card.style.transition = 'transform .7s cubic-bezier(.16,1,.3,1), border-color .4s, box-shadow .4s';
    card.style.transform = '';
  });
});


// ══════════════════════════════════════════
// SKILL CARD GLOW FOLLOW
// ══════════════════════════════════════════
document.querySelectorAll('.skill-card').forEach(card => {
  const glow = card.querySelector('.sk-glow');
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    if (glow) { glow.style.left = x + 'px'; glow.style.top = y + 'px'; }
    card.style.transform = `translateY(-5px) scale(1.01) perspective(600px) rotateX(${((y-r.height/2)/r.height)*-4}deg) rotateY(${((x-r.width/2)/r.width)*4}deg)`;
    card.style.transition = 'border-color .35s,box-shadow .4s,transform 0.05s';
  });
  card.addEventListener('mouseleave', () => {
    card.style.transition = 'border-color .35s,box-shadow .4s,transform .6s cubic-bezier(.16,1,.3,1)';
    card.style.transform = '';
  });
});


// ══════════════════════════════════════════
// ACTIVE NAV
// ══════════════════════════════════════════
const navAs = document.querySelectorAll('.nav-links a');
document.querySelectorAll('section[id]').forEach(sec => {
  new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navAs.forEach(a => {
          const match = a.getAttribute('href') === '#' + e.target.id;
          a.classList.toggle('active', match);
        });
      }
    });
  }, { threshold: 0.35 }).observe(sec);
});


// ══════════════════════════════════════════
// SMOOTH ANCHOR SCROLL
// ══════════════════════════════════════════
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
  });
});


// ══════════════════════════════════════════
// WHATSAPP
// ══════════════════════════════════════════
document.getElementById('waBtn') && document.getElementById('waBtn').addEventListener('click', () => {
  window.open('https://wa.me/917985930166?text=' + encodeURIComponent("Hi Aditya! I came across your portfolio and would love to connect."), '_blank');
});


// ══════════════════════════════════════════
// CERT CARD TILT
// ══════════════════════════════════════════
document.querySelectorAll('.cert-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    card.style.transform = `translateY(-5px) perspective(600px) rotateX(${((y-r.height/2)/r.height)*-5}deg) rotateY(${((x-r.width/2)/r.width)*5}deg)`;
    card.style.transition = 'border-color .35s,box-shadow .35s,transform 0.05s';
  });
  card.addEventListener('mouseleave', () => {
    card.style.transition = 'border-color .35s,box-shadow .35s,transform .6s cubic-bezier(.16,1,.3,1)';
    card.style.transform = '';
  });
});


// ══════════════════════════════════════════
// PARALLAX SECTION BACKGROUNDS
// ══════════════════════════════════════════
let ticking = false;
window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      const sy = window.scrollY;
      // Subtle parallax on section labels
      document.querySelectorAll('.sec-label').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          el.style.transform = `translateX(${(rect.top / window.innerHeight) * 8}px)`;
        }
      });
      ticking = false;
    });
    ticking = true;
  }
}, { passive: true });
