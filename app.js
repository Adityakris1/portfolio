/* =============================================
   ADITYA KRISHNA — APP.JS v4
   Cinematic Loader · Liquid WebGL Shader
   Three.js Hero · Per-project Mini Scenes
   All Interactions · Ultra Smooth
============================================= */

// ══════════════════════════════════════════
// 1. CINEMATIC LOADER
// ══════════════════════════════════════════
(function initLoader() {
  const loader = document.getElementById('loader');
  const bar    = document.getElementById('loaderBar');
  const pct    = document.getElementById('loaderPct');
  if (!loader) return;

  let progress = 0;
  const target = 100;
  const tick = setInterval(() => {
    progress += Math.random() * 4 + 1;
    if (progress >= target) { progress = 100; clearInterval(tick); }
    bar.style.width = progress + '%';
    pct.textContent = Math.floor(progress);
    if (progress >= 100) {
      setTimeout(() => {
        loader.classList.add('out');
        setTimeout(() => { loader.style.display = 'none'; }, 900);
      }, 300);
    }
  }, 35);
})();


// ══════════════════════════════════════════
// 2. LIQUID WebGL HERO SHADER
// ══════════════════════════════════════════
(function initLiquid() {
  const canvas = document.getElementById('liquidCanvas');
  if (!canvas) return;
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) return;

  function resize() {
    canvas.width  = canvas.clientWidth  * Math.min(devicePixelRatio, 2);
    canvas.height = canvas.clientHeight * Math.min(devicePixelRatio, 2);
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  resize();
  window.addEventListener('resize', resize);

  const vert = `attribute vec2 a_pos;void main(){gl_Position=vec4(a_pos,0,1);}`;
  const frag = `
precision highp float;
uniform float u_t;
uniform vec2  u_res;
uniform vec2  u_mouse;

#define PI 3.14159265

float noise(vec2 p){
  return sin(p.x*1.5+u_t*.4)*cos(p.y*1.3+u_t*.3)
       + sin(p.x*.8+p.y*1.2+u_t*.5)*.5
       + cos(p.x*2.1-p.y*.9+u_t*.25)*.3;
}

vec3 palette(float t){
  vec3 a=vec3(.08,.06,.12);
  vec3 b=vec3(.12,.05,.08);
  vec3 c=vec3(.3,.25,.5);
  vec3 d=vec3(.0,.33,.67);
  return a+b*cos(6.28318*(c*t+d));
}

void main(){
  vec2 uv=(gl_FragCoord.xy/u_res)*2.-1.;
  uv.x*=u_res.x/u_res.y;

  // Mouse influence
  vec2 m=(u_mouse/u_res)*2.-1.;
  m.x*=u_res.x/u_res.y;
  float md=length(uv-m);
  float mInf=exp(-md*md*1.8)*.25;

  // Layered noise
  float n  = noise(uv*1.5+vec2(u_t*.05,u_t*.07));
  float n2 = noise(uv*2.5+vec2(-u_t*.04,u_t*.06))*0.5;
  float n3 = noise(uv*4.0+vec2(u_t*.03,-u_t*.05))*0.25;
  float f  = n+n2+n3+mInf;

  // Domain warp
  vec2 warp=vec2(
    noise(uv+vec2(f*.3,u_t*.1)),
    noise(uv+vec2(u_t*.08,f*.3))
  );
  float final=noise(uv+warp*.4+vec2(u_t*.06));

  vec3 col=palette(final*.5+.5+u_t*.03);

  // Vignette
  float vig=1.-smoothstep(.4,1.4,length(uv)*0.7);
  col*=vig;

  // Keep it dark
  col=mix(vec3(.02,.02,.05),col,.45);

  gl_FragColor=vec4(col,1.);
}`;

  function compile(type, src) {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src); gl.compileShader(sh); return sh;
  }
  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, vert));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, frag));
  gl.linkProgram(prog); gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'a_pos');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const uT     = gl.getUniformLocation(prog, 'u_t');
  const uRes   = gl.getUniformLocation(prog, 'u_res');
  const uMouse = gl.getUniformLocation(prog, 'u_mouse');

  let mx = 0, my = 0, t = 0;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  function frame() {
    t += 0.008;
    gl.uniform1f(uT, t);
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform2f(uMouse, mx * devicePixelRatio, (window.innerHeight - my) * devicePixelRatio);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(frame);
  }
  frame();

  // Fade out on scroll
  window.addEventListener('scroll', () => {
    const p = Math.min(window.scrollY / (window.innerHeight * 0.6), 1);
    canvas.style.opacity = 1 - p * 0.85;
  }, { passive: true });
})();


// ══════════════════════════════════════════
// 3. THREE.JS HERO — CRYSTALLINE SPHERE
// ══════════════════════════════════════════
(function initHeroThree() {
  const canvas = document.getElementById('threeCanvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = false;

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
  camera.position.set(0, 0, 5.5);

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  resize(); window.addEventListener('resize', resize);

  // ── CENTRAL CRYSTAL: geodesic sphere with custom material ──
  const group = new THREE.Group();
  group.position.set(3.2, 0.3, 0);
  scene.add(group);

  // Inner solid sphere
  const innerGeo = new THREE.IcosahedronGeometry(1.0, 2);
  const innerMat = new THREE.MeshPhysicalMaterial({
    color: 0x1a1a2e, metalness: 0.8, roughness: 0.05,
    transmission: 0.4, transparent: true, opacity: 0.85,
    envMapIntensity: 2
  });
  const inner = new THREE.Mesh(innerGeo, innerMat);
  group.add(inner);

  // Outer wireframe – gold
  const outerWire = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.08, 2),
    new THREE.MeshBasicMaterial({ color: 0xe8c547, wireframe: true, transparent: true, opacity: 0.18 })
  );
  group.add(outerWire);

  // Outer wireframe – teal
  const outerWire2 = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.22, 1),
    new THREE.MeshBasicMaterial({ color: 0x2dd4bf, wireframe: true, transparent: true, opacity: 0.1 })
  );
  group.add(outerWire2);

  // Glowing ring #1
  const mkRing = (radius, tube, color, opacity) => {
    const m = new THREE.Mesh(
      new THREE.TorusGeometry(radius, tube, 12, 100),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity })
    );
    group.add(m); return m;
  };
  const ring1 = mkRing(1.65, 0.012, 0xe8c547, 0.35);
  const ring2 = mkRing(2.0,  0.008, 0x2dd4bf,  0.2);
  const ring3 = mkRing(2.4,  0.006, 0xa78bfa,  0.15);
  ring1.rotation.x = Math.PI * 0.35;
  ring2.rotation.x = Math.PI * 0.6; ring2.rotation.y = 0.4;
  ring3.rotation.x = Math.PI * 0.2; ring3.rotation.z = 0.7;

  // Orbiting spheres
  const orbits = [
    { r: 2.0, speed: 0.5, phase: 0,    size: 0.07, color: 0xe8c547 },
    { r: 2.5, speed: -0.3, phase: 2,   size: 0.05, color: 0x2dd4bf  },
    { r: 3.0, speed: 0.22, phase: 4.5, size: 0.055, color: 0xa78bfa },
    { r: 1.7, speed: -0.4, phase: 1,   size: 0.04, color: 0xfb7185  },
  ];
  const orbitMeshes = orbits.map(d => {
    const m = new THREE.Mesh(
      new THREE.SphereGeometry(d.size, 8, 8),
      new THREE.MeshBasicMaterial({ color: d.color, transparent: true, opacity: 0.85 })
    );
    m.userData = d; scene.add(m); return m;
  });

  // Floating particles
  const PC = 250;
  const pPos = new Float32Array(PC * 3);
  const pCol = new Float32Array(PC * 3);
  const palSrc = [[0.91,0.77,0.28],[0.18,0.83,0.75],[0.65,0.55,0.98],[0.98,0.44,0.51]];
  const pSpd = [];
  for (let i = 0; i < PC; i++) {
    pPos[i*3]   = (Math.random()-.5)*18;
    pPos[i*3+1] = (Math.random()-.5)*12;
    pPos[i*3+2] = (Math.random()-.5)*6-1;
    const c = palSrc[Math.floor(Math.random()*palSrc.length)];
    pCol[i*3]=c[0]; pCol[i*3+1]=c[1]; pCol[i*3+2]=c[2];
    pSpd.push({ x:(Math.random()-.5)*.0015, y:(Math.random()-.5)*.002 });
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
  const pMat = new THREE.PointsMaterial({ size: 0.028, vertexColors: true, transparent: true, opacity: 0.65 });
  scene.add(new THREE.Points(pGeo, pMat));

  // Lights
  scene.add(new THREE.AmbientLight(0x111122, 2));
  const pl1 = new THREE.PointLight(0xe8c547, 6, 12); pl1.position.set(5, 4, 4); scene.add(pl1);
  const pl2 = new THREE.PointLight(0x2dd4bf,  4, 12); pl2.position.set(-4, -2, 3); scene.add(pl2);
  const pl3 = new THREE.PointLight(0xa78bfa,  3, 10); pl3.position.set(2, -4, 1); scene.add(pl3);

  // Interaction
  let mx=0, my=0, isDrag=false, px=0, py=0, vx=0, vy=0, rotX=0, rotY=0, t=0;
  canvas.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    mx = ((e.clientX-r.left)/r.width-.5)*2;
    my = -((e.clientY-r.top)/r.height-.5)*2;
    if (isDrag) { vy+=(e.clientX-px)*.009; vx+=(e.clientY-py)*.009; px=e.clientX; py=e.clientY; }
  });
  canvas.addEventListener('mousedown', e => { isDrag=true; px=e.clientX; py=e.clientY; canvas.style.cursor='grabbing'; });
  canvas.addEventListener('mouseup',   () => { isDrag=false; canvas.style.cursor='grab'; });
  canvas.addEventListener('mouseleave',() => { isDrag=false; });
  canvas.style.cursor = 'grab';
  let ltx=0, lty=0;
  canvas.addEventListener('touchstart', e => { ltx=e.touches[0].clientX; lty=e.touches[0].clientY; }, {passive:true});
  canvas.addEventListener('touchmove',  e => { vy+=(e.touches[0].clientX-ltx)*.012; vx+=(e.touches[0].clientY-lty)*.012; ltx=e.touches[0].clientX; lty=e.touches[0].clientY; }, {passive:true});

  function frame() {
    requestAnimationFrame(frame); t += 0.009;
    vx *= .9; vy *= .9; rotX += vx; rotY += vy;

    group.rotation.x = rotX + t * 0.15 + my * 0.1;
    group.rotation.y = rotY + t * 0.22 + mx * 0.13;

    const bob = Math.sin(t*.65)*.22;
    group.position.y = 0.3 + bob;

    ring1.rotation.z = t * 0.25;
    ring2.rotation.z = -t * 0.18;
    ring3.rotation.y = t * 0.12;

    // Orbits
    orbitMeshes.forEach(m => {
      const d = m.userData;
      const a = t * d.speed + d.phase;
      m.position.set(
        group.position.x + Math.cos(a) * d.r,
        group.position.y + Math.sin(a) * d.r * 0.45,
        Math.sin(a * 1.4) * 0.55
      );
    });

    // Particles drift
    const pa = pGeo.attributes.position.array;
    for (let i = 0; i < PC; i++) {
      pa[i*3]   += pSpd[i].x;
      pa[i*3+1] += pSpd[i].y;
      if (pa[i*3] >  9) pa[i*3] = -9;
      if (pa[i*3] < -9) pa[i*3] =  9;
      if (pa[i*3+1] >  6) pa[i*3+1] = -6;
      if (pa[i*3+1] < -6) pa[i*3+1] =  6;
    }
    pGeo.attributes.position.needsUpdate = true;

    // Camera parallax
    camera.position.x += (mx * 0.35 - camera.position.x) * 0.04;
    camera.position.y += (my * 0.25 - camera.position.y) * 0.04;
    camera.lookAt(3.2, 0, 0);

    // Pulsing lights
    pl1.intensity = 5 + Math.sin(t * 1.2) * 1.5;
    pl2.intensity = 3.5 + Math.cos(t * 0.9) * 1.2;

    renderer.render(scene, camera);
  }
  frame();

  window.addEventListener('scroll', () => {
    const p = Math.min(window.scrollY / (window.innerHeight * 0.55), 1);
    canvas.style.opacity = 1 - p * 0.9;
  }, { passive: true });
})();


// ══════════════════════════════════════════
// 4. PROJECT MINI-SCENES (per canvas)
// ══════════════════════════════════════════
(function initProjScenes() {
  const configs = [
    // 0: Fake reviews — data points orbiting a core
    (scene, group) => {
      const core = new THREE.Mesh(new THREE.SphereGeometry(.6,16,16), new THREE.MeshStandardMaterial({color:0xe8c547,metalness:.9,roughness:.1}));
      group.add(core);
      const pts = [];
      for (let i=0;i<60;i++){
        const m=new THREE.Mesh(new THREE.SphereGeometry(.03+Math.random()*.03,6,6),new THREE.MeshBasicMaterial({color:Math.random()>.5?0xe8c547:0x2dd4bf,transparent:true,opacity:.7+Math.random()*.3}));
        const r=1+Math.random()*.9, a=Math.random()*Math.PI*2, b=Math.random()*Math.PI;
        m.userData={r,a,b,spd:(.3+Math.random()*.4)*(Math.random()>.5?1:-1)};
        group.add(m); pts.push(m);
      }
      scene.add(new THREE.PointLight(0xe8c547,4,6));
      return (t) => {
        core.rotation.y=t*.5;
        pts.forEach(p=>{p.userData.a+=p.userData.spd*.01;const{r,a,b}=p.userData;p.position.set(Math.cos(a)*r*Math.sin(b),Math.cos(b)*r*.5,Math.sin(a)*r*Math.sin(b));});
      };
    },
    // 1: MIDI — wave/hand gesture
    (scene, group) => {
      const pts=[];
      for(let i=0;i<8;i++){
        const m=new THREE.Mesh(new THREE.SphereGeometry(.08,8,8),new THREE.MeshBasicMaterial({color:[0xa78bfa,0x2dd4bf,0xfb7185,0xe8c547][i%4],transparent:true,opacity:.9}));
        m.userData={i};group.add(m);pts.push(m);
      }
      const geo=new THREE.BufferGeometry();
      const linePos=new Float32Array(8*3);
      geo.setAttribute('position',new THREE.BufferAttribute(linePos,3));
      const line=new THREE.Line(geo,new THREE.LineBasicMaterial({color:0xa78bfa,transparent:true,opacity:.5}));
      group.add(line);
      scene.add(new THREE.PointLight(0xa78bfa,5,7));
      return (t)=>{
        const pos=geo.attributes.position.array;
        pts.forEach((p,i)=>{const x=-1.4+i*.4,y=Math.sin(t*2+i*.8)*.6+Math.cos(t*.5+i*.3)*.3;p.position.set(x,y,Math.sin(t+i)*.3);pos[i*3]=x;pos[i*3+1]=y;pos[i*3+2]=Math.sin(t+i)*.3;});
        geo.attributes.position.needsUpdate=true;
      };
    },
    // 2: AWS — cloud/network topology
    (scene, group) => {
      const nodes=[];
      const colors=[0x4fa3e0,0x2dd4bf,0xe8c547,0xa78bfa,0xfb7185];
      for(let i=0;i<7;i++){
        const m=new THREE.Mesh(new THREE.OctahedronGeometry(.12+Math.random()*.08,0),new THREE.MeshStandardMaterial({color:colors[i%colors.length],metalness:.8,roughness:.2}));
        m.position.set((Math.random()-.5)*2.2,(Math.random()-.5)*1.5,(Math.random()-.5)*.5);
        m.userData={ox:m.position.x,oy:m.position.y,phase:Math.random()*Math.PI*2};
        group.add(m);nodes.push(m);
      }
      scene.add(new THREE.PointLight(0x4fa3e0,5,8));
      scene.add(new THREE.AmbientLight(0x112233,2));
      return (t)=>{
        nodes.forEach(n=>{n.position.y=n.userData.oy+Math.sin(t*.8+n.userData.phase)*.18;n.rotation.y=t*.6;n.rotation.x=t*.4;});
      };
    }
  ];

  document.querySelectorAll('.proj-canvas').forEach((canvas,idx) => {
    if (idx >= configs.length) return;
    if (typeof THREE === 'undefined') return;

    const renderer = new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
    renderer.setPixelRatio(Math.min(devicePixelRatio,2));
    renderer.setClearColor(0x000000,0);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55,1,.1,20);
    camera.position.set(0,0,3.5);

    function resize(){
      renderer.setSize(canvas.clientWidth,canvas.clientHeight,false);
      camera.aspect=canvas.clientWidth/canvas.clientHeight;
      camera.updateProjectionMatrix();
    }
    resize(); window.addEventListener('resize',resize);

    scene.add(new THREE.AmbientLight(0x222233,1.5));
    const group=new THREE.Group();
    scene.add(group);
    const animate=configs[idx](scene,group);
    let t=0,visible=false;

    const obs=new IntersectionObserver(e=>{visible=e[0].isIntersecting;},{threshold:.1});
    obs.observe(canvas);

    // Parallax on hover
    let hx=0,hy=0;
    canvas.closest('.proj-visual').addEventListener('mousemove',e=>{
      const r=canvas.getBoundingClientRect();
      hx=((e.clientX-r.left)/r.width-.5)*2;
      hy=-((e.clientY-r.top)/r.height-.5)*2;
    });
    canvas.closest('.proj-visual').addEventListener('mouseleave',()=>{hx=0;hy=0;});

    function frame(){
      requestAnimationFrame(frame);
      if(!visible)return;
      t+=.012;
      group.rotation.y+=(.08*hx-group.rotation.y)*.06;
      group.rotation.x+=(.05*hy-group.rotation.x)*.06;
      animate(t);
      renderer.render(scene,camera);
    }
    frame();
  });
})();


// ══════════════════════════════════════════
// 5. CONTACT CANVAS — aurora particles
// ══════════════════════════════════════════
(function initContactCanvas() {
  const canvas = document.getElementById('contactCanvas');
  if (!canvas || typeof THREE === 'undefined') return;
  const renderer=new THREE.WebGLRenderer({canvas,antialias:false,alpha:true});
  renderer.setPixelRatio(1); renderer.setClearColor(0x000000,0);
  const scene=new THREE.Scene(), camera=new THREE.PerspectiveCamera(70,1,.1,50);
  camera.position.z=4;
  function resize(){renderer.setSize(canvas.clientWidth,canvas.clientHeight,false);camera.aspect=canvas.clientWidth/canvas.clientHeight;camera.updateProjectionMatrix();}
  resize(); window.addEventListener('resize',resize);
  const N=120, pos=new Float32Array(N*3), col=new Float32Array(N*3), spds=[];
  const pal=[[0.91,0.77,0.28],[0.18,0.83,0.75],[0.65,0.55,0.98]];
  for(let i=0;i<N;i++){pos[i*3]=(Math.random()-.5)*12;pos[i*3+1]=(Math.random()-.5)*8;pos[i*3+2]=(Math.random()-.5)*4;const c=pal[i%pal.length];col[i*3]=c[0];col[i*3+1]=c[1];col[i*3+2]=c[2];spds.push({x:(Math.random()-.5)*.006,y:(Math.random()-.5)*.008});}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('color',new THREE.BufferAttribute(col,3));
  scene.add(new THREE.Points(geo,new THREE.PointsMaterial({size:.06,vertexColors:true,transparent:true,opacity:.7})));
  let t=0;
  function frame(){requestAnimationFrame(frame);t+=.006;const p=geo.attributes.position.array;for(let i=0;i<N;i++){p[i*3]+=spds[i].x;p[i*3+1]+=spds[i].y+Math.sin(t+i)*.001;if(p[i*3]>6)p[i*3]=-6;if(p[i*3]<-6)p[i*3]=6;if(p[i*3+1]>4)p[i*3+1]=-4;if(p[i*3+1]<-4)p[i*3+1]=4;}geo.attributes.position.needsUpdate=true;renderer.render(scene,camera);}
  frame();
})();


// ══════════════════════════════════════════
// 6. CURSOR
// ══════════════════════════════════════════
const curEl   = document.getElementById('cursor');
const ringEl  = document.getElementById('cursorRing');
const curText = document.getElementById('cursorText');
let mx=0,my=0,rx=0,ry=0;

document.addEventListener('mousemove', e => {
  mx=e.clientX; my=e.clientY;
  curEl.style.left=mx+'px'; curEl.style.top=my+'px';
});
(function animRing(){
  rx+=(mx-rx)*.1; ry+=(my-ry)*.1;
  ringEl.style.left=rx+'px'; ringEl.style.top=ry+'px';
  requestAnimationFrame(animRing);
})();

document.querySelectorAll('[data-cursor]').forEach(el => {
  el.addEventListener('mouseenter', () => {
    curEl.classList.add('expanded');
    if (curText) curText.textContent = el.dataset.cursor;
    ringEl.style.width='80px'; ringEl.style.height='80px';
    ringEl.style.borderColor='rgba(232,197,71,.55)';
  });
  el.addEventListener('mouseleave', () => {
    curEl.classList.remove('expanded');
    ringEl.style.width='40px'; ringEl.style.height='40px';
    ringEl.style.borderColor='rgba(232,197,71,.35)';
  });
});
document.querySelectorAll('a:not([data-cursor]),button:not([data-cursor]),.bento-card,.cert-pill').forEach(el => {
  el.addEventListener('mouseenter', () => { ringEl.style.width='56px'; ringEl.style.height='56px'; ringEl.style.borderColor='rgba(232,197,71,.5)'; });
  el.addEventListener('mouseleave', () => { ringEl.style.width='40px'; ringEl.style.height='40px'; ringEl.style.borderColor='rgba(232,197,71,.35)'; });
});


// ══════════════════════════════════════════
// 7. NAV + HAMBURGER
// ══════════════════════════════════════════
const nav = document.getElementById('nav');
const hbg = document.getElementById('hamburger');
const mob = document.getElementById('mobileMenu');
let menuOpen = false;

window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 55), {passive:true});

hbg && hbg.addEventListener('click', () => {
  menuOpen = !menuOpen;
  hbg.classList.toggle('open', menuOpen);
  if (menuOpen) { mob.style.display='flex'; requestAnimationFrame(() => mob.classList.add('open')); }
  else { mob.classList.remove('open'); setTimeout(() => mob.style.display='none', 420); }
});
mob && mob.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    menuOpen=false; hbg.classList.remove('open');
    mob.classList.remove('open'); setTimeout(() => mob.style.display='none', 420);
  });
});


// ══════════════════════════════════════════
// 8. SCROLL REVEAL
// ══════════════════════════════════════════
const revObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('in'), parseInt(e.target.dataset.delay || 0));
      revObs.unobserve(e.target);
    }
  });
}, { threshold: 0.07, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.rev').forEach(el => revObs.observe(el));

function stagger(pSel, cSel, step=85) {
  document.querySelectorAll(pSel).forEach(p => p.querySelectorAll(cSel).forEach((c,i) => c.dataset.delay = i*step));
}
stagger('.about-stats',  '.astat',     80);
stagger('.skills-bento', '.bento-card',80);
stagger('.proj-showcase','.proj-item', 120);
stagger('.cert-row',     '.cert-pill', 80);
stagger('.contact-cards','.contact-card', 80);
stagger('.exp-timeline', '.exp-item',  100);


// ══════════════════════════════════════════
// 9. STAT COUNTERS
// ══════════════════════════════════════════
function countUp(el) {
  const raw=parseFloat(el.dataset.val), sfx=el.dataset.sfx||'', dec=el.dataset.dec?parseInt(el.dataset.dec):0;
  if (isNaN(raw)) return;
  const dur=1800, st=performance.now();
  function tick(now) {
    const t=Math.min((now-st)/dur,1), ease=1-Math.pow(1-t,4), cur=(raw)*ease;
    el.textContent=(dec?cur.toFixed(dec):Math.round(cur))+sfx;
    if(t<1) requestAnimationFrame(tick); else el.textContent=(dec?raw.toFixed(dec):raw)+sfx;
  }
  requestAnimationFrame(tick);
}
new IntersectionObserver(entries => {
  entries.forEach(e => { if(e.isIntersecting){e.target.querySelectorAll('[data-val]').forEach(countUp); } });
},{threshold:.4}).observe(document.getElementById('about'));


// ══════════════════════════════════════════
// 10. 3D TILT ON BENTO + CERT CARDS
// ══════════════════════════════════════════
function addTilt(sel, maxR=6) {
  document.querySelectorAll(sel).forEach(card => {
    let raf;
    card.addEventListener('mousemove', e => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r=card.getBoundingClientRect(), x=e.clientX-r.left, y=e.clientY-r.top;
        card.style.transform=`translateY(-6px) perspective(800px) rotateX(${((y-r.height/2)/r.height)*-maxR}deg) rotateY(${((x-r.width/2)/r.width)*maxR}deg)`;
        card.style.transition='border-color .3s,box-shadow .3s,transform .05s';
      });
    });
    card.addEventListener('mouseleave', () => {
      cancelAnimationFrame(raf);
      card.style.transition='transform .7s cubic-bezier(.16,1,.3,1),border-color .3s,box-shadow .3s';
      card.style.transform='';
    });
  });
}
addTilt('.bento-card', 5);
addTilt('.cert-pill',  5);
addTilt('.contact-card', 6);
addTilt('.award-mega', 4);


// ══════════════════════════════════════════
// 11. ACTIVE NAV
// ══════════════════════════════════════════
const navAs = document.querySelectorAll('.nav-links a');
document.querySelectorAll('section[id]').forEach(sec => {
  new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) navAs.forEach(a => a.classList.toggle('active', a.getAttribute('href')==='#'+e.target.id));
    });
  }, { threshold: 0.35 }).observe(sec);
});


// ══════════════════════════════════════════
// 12. SMOOTH ANCHOR
// ══════════════════════════════════════════
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (t) { e.preventDefault(); t.scrollIntoView({ behavior:'smooth' }); }
  });
});


// ══════════════════════════════════════════
// 13. WHATSAPP
// ══════════════════════════════════════════
document.getElementById('waBtn') && document.getElementById('waBtn').addEventListener('click', () => {
  window.open('https://wa.me/917985930166?text='+encodeURIComponent("Hi Aditya! I came across your portfolio and would love to connect."),'_blank');
});


// ══════════════════════════════════════════
// 14. SECTION PARALLAX TEXT
// ══════════════════════════════════════════
let ticking = false;
window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      const sy = window.scrollY;
      document.querySelectorAll('.section-eyebrow').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          el.style.transform = `translateX(${(rect.top / window.innerHeight) * 10}px)`;
        }
      });
      ticking = false;
    });
    ticking = true;
  }
}, { passive: true });
