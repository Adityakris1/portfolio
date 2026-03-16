/* =============================================
   ADITYA KRISHNA — LEGENDARY v5
   ✦ Cinematic Loader with Glitch
   ✦ Raymarching GLSL Hero Background
   ✦ Three.js: Morphing DNA Helix + Galaxy
   ✦ About: Rotating Skill Constellation
   ✦ Per-project: Custom 3D Scenes
   ✦ Contact: Aurora Field
   ✦ Magnetic cursor, tilt, parallax
============================================= */

// ══════════════════════════════════════════
// LOADER
// ══════════════════════════════════════════
(function(){
  const loader=document.getElementById('loader'),
        fill=document.getElementById('loFill'),
        pct=document.getElementById('loPct'),
        msg=document.getElementById('loMsg');
  const msgs=['Initialising','Loading shaders','Building 3D scene','Sculpting geometry','Igniting particles','Ready'];
  let p=0,mi=0;
  const iv=setInterval(()=>{
    p+=Math.random()*3.5+.5;
    if(p>100)p=100;
    fill.style.width=p+'%';
    pct.textContent=Math.floor(p);
    const ni=Math.floor(p/20);
    if(ni!==mi&&msgs[ni]){mi=ni;msg.textContent=msgs[ni]}
    if(p>=100){
      clearInterval(iv);
      setTimeout(()=>{loader.classList.add('out');setTimeout(()=>loader.style.display='none',900)},400);
    }
  },40);
})();

// ══════════════════════════════════════════
// CURSOR
// ══════════════════════════════════════════
const C=document.getElementById('cur'),R=document.getElementById('curRing');
let mx=0,my=0,rx=0,ry=0;
document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;C.style.left=mx+'px';C.style.top=my+'px'});
(function ar(){rx+=(mx-rx)*.1;ry+=(my-ry)*.1;R.style.left=rx+'px';R.style.top=ry+'px';requestAnimationFrame(ar)})();
document.querySelectorAll('a,button,.bstat,.cert-card,.c-card,.proj-screen,.award-xl').forEach(el=>{
  el.addEventListener('mouseenter',()=>{C.classList.add('big');R.classList.add('big')});
  el.addEventListener('mouseleave',()=>{C.classList.remove('big');R.classList.remove('big')});
});

// ══════════════════════════════════════════
// NAV + HAMBURGER
// ══════════════════════════════════════════
const nav=document.getElementById('nav'),hbg=document.getElementById('hbg'),mob=document.getElementById('mob');
let mo=false;
window.addEventListener('scroll',()=>nav.classList.toggle('scrolled',scrollY>55),{passive:true});
hbg&&hbg.addEventListener('click',()=>{mo=!mo;hbg.classList.toggle('open',mo);if(mo){mob.style.display='flex';requestAnimationFrame(()=>mob.classList.add('open'))}else{mob.classList.remove('open');setTimeout(()=>mob.style.display='none',420)}});
mob&&mob.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{mo=false;hbg.classList.remove('open');mob.classList.remove('open');setTimeout(()=>mob.style.display='none',420)}));

// ══════════════════════════════════════════
// NAV ACTIVE
// ══════════════════════════════════════════
const navAs=document.querySelectorAll('.nlinks a');
document.querySelectorAll('section[id]').forEach(s=>{
  new IntersectionObserver(e=>{if(e[0].isIntersecting)navAs.forEach(a=>a.classList.toggle('act',a.getAttribute('href')==='#'+s.id))},{threshold:.35}).observe(s);
});

// ══════════════════════════════════════════
// SMOOTH SCROLL
// ══════════════════════════════════════════
document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const t=document.querySelector(a.getAttribute('href'));if(t){e.preventDefault();t.scrollIntoView({behavior:'smooth'})}}));

// ══════════════════════════════════════════
// REVEAL
// ══════════════════════════════════════════
const ro=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){setTimeout(()=>e.target.classList.add('in'),parseInt(e.target.dataset.d||0));ro.unobserve(e.target)}})},{threshold:.06,rootMargin:'0px 0px -40px 0px'});
document.querySelectorAll('.rev').forEach(el=>ro.observe(el));
function stag(p,c,s=80){document.querySelectorAll(p).forEach(par=>par.querySelectorAll(c).forEach((ch,i)=>ch.dataset.d=i*s))}
stag('.big-stats','.bstat',100);stag('.proj-grid','.proj-item',120);
stag('.cert-grid','.cert-card',75);stag('.c-cards','.c-card',80);
stag('.exp-tl','.exp-item',100);stag('.edu-timeline','.edu-row',80);

// ══════════════════════════════════════════
// STAT COUNTERS
// ══════════════════════════════════════════
function cnt(el){const v=parseFloat(el.dataset.val),sfx=el.dataset.sfx||'',dec=el.dataset.dec?parseInt(el.dataset.dec):0;if(isNaN(v))return;const dur=1800,st=performance.now();(function tk(now){const t=Math.min((now-st)/dur,1),e=1-Math.pow(1-t,4),c=v*e;el.textContent=(dec?c.toFixed(dec):Math.round(c))+sfx;if(t<1)requestAnimationFrame(tk);else el.textContent=(dec?v.toFixed(dec):v)+sfx})(performance.now())}
new IntersectionObserver(e=>{if(e[0].isIntersecting)document.querySelectorAll('[data-val]').forEach(cnt)},{threshold:.4}).observe(document.getElementById('about'));

// ══════════════════════════════════════════
// HERO: RAYMARCHING GLSL BACKGROUND
// ══════════════════════════════════════════
(function(){
  const canvas=document.getElementById('bgCanvas');if(!canvas)return;
  const gl=canvas.getContext('webgl')||canvas.getContext('experimental-webgl');if(!gl)return;
  const dpr=Math.min(devicePixelRatio,2);
  function resize(){canvas.width=canvas.clientWidth*dpr;canvas.height=canvas.clientHeight*dpr;gl.viewport(0,0,canvas.width,canvas.height)}
  resize();window.addEventListener('resize',resize);
  const V=`attribute vec2 p;void main(){gl_Position=vec4(p,0,1);}`;
  const F=`precision highp float;
uniform float T;uniform vec2 R;uniform vec2 M;
#define PI 3.14159265
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<6;i++){v+=a*noise(p);p=p*2.+vec2(1.7,9.2);a*=.5;}return v;}
vec3 pal(float t){
  return vec3(.5)+vec3(.5)*cos(6.28318*(vec3(.8,.4,.2)*t+vec3(.0,.33,.67)));
}
void main(){
  vec2 uv=(gl_FragCoord.xy/R)*2.-1.;uv.x*=R.x/R.y;
  vec2 m=(M/R)*2.-1.;m.x*=R.x/R.y;
  float md=length(uv-m);float mi=exp(-md*md*1.4)*.3;
  // Warp
  vec2 q=vec2(fbm(uv+vec2(0,T*.07)),fbm(uv+vec2(5.2,1.3)+T*.06));
  vec2 r=vec2(fbm(uv+2.*q+vec2(1.7,9.2)+T*.04),fbm(uv+2.*q+vec2(8.3,2.8)+T*.03));
  float f=fbm(uv+2.*r+mi);
  vec3 col=pal(f*.5+T*.025+.5);
  // Stars
  float gr=noise(uv*80.)*noise(uv*120.);
  col+=vec3(gr>0.92?pow(gr,.5)*0.6:0.);
  // Dark overlay
  col=mix(vec3(.015,.01,.03),col,.4);
  // Vignette
  float vig=1.-smoothstep(.3,1.3,length(uv)*.65);
  col*=vig;
  gl_FragColor=vec4(col,1.);
}`;
  function sh(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);return s}
  const prog=gl.createProgram();
  gl.attachShader(prog,sh(gl.VERTEX_SHADER,V));gl.attachShader(prog,sh(gl.FRAGMENT_SHADER,F));
  gl.linkProgram(prog);gl.useProgram(prog);
  const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
  const pl=gl.getAttribLocation(prog,'p');gl.enableVertexAttribArray(pl);gl.vertexAttribPointer(pl,2,gl.FLOAT,false,0,0);
  const uT=gl.getUniformLocation(prog,'T'),uR=gl.getUniformLocation(prog,'R'),uM=gl.getUniformLocation(prog,'M');
  let t=0,hmx=0,hmy=0;
  document.addEventListener('mousemove',e=>{hmx=e.clientX;hmy=e.clientY});
  function frame(){t+=.006;gl.uniform1f(uT,t);gl.uniform2f(uR,canvas.width,canvas.height);gl.uniform2f(uM,hmx*dpr,(window.innerHeight-hmy)*dpr);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);requestAnimationFrame(frame)}
  frame();
  window.addEventListener('scroll',()=>{const p=Math.min(scrollY/(innerHeight*.55),1);canvas.style.opacity=1-p*.9},{passive:true});
})();

// ══════════════════════════════════════════
// HERO: THREE.JS — DNA HELIX + GALAXY RING
// ══════════════════════════════════════════
(function(){
  if(typeof THREE==='undefined')return;
  const canvas=document.getElementById('heroCanvas');if(!canvas)return;
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0,0);
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(55,1,.1,200);
  camera.position.set(0,0,7);
  function resize(){const w=canvas.clientWidth,h=canvas.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
  resize();window.addEventListener('resize',resize);
  const G=new THREE.Group();G.position.set(3.5,.2,0);scene.add(G);

  // ── DNA DOUBLE HELIX ──
  const dnaGroup=new THREE.Group();G.add(dnaGroup);
  const helixPts1=[],helixPts2=[];
  const N=80,height=4.5,turns=4;
  for(let i=0;i<N;i++){
    const t=i/(N-1),a=t*Math.PI*2*turns,y=(t-.5)*height;
    const r=.8;
    helixPts1.push(new THREE.Vector3(Math.cos(a)*r,y,Math.sin(a)*r));
    helixPts2.push(new THREE.Vector3(Math.cos(a+Math.PI)*r,y,Math.sin(a+Math.PI)*r));
  }
  const mkCurve=(pts,col)=>{
    const c=new THREE.CatmullRomCurve3(pts);
    const geo=new THREE.TubeGeometry(c,200,0.018,8,false);
    const mat=new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.7});
    return new THREE.Mesh(geo,mat);
  };
  dnaGroup.add(mkCurve(helixPts1,0xe8c547));
  dnaGroup.add(mkCurve(helixPts2,0x2dd4bf));

  // Cross-rungs
  const rungMat=new THREE.MeshBasicMaterial({color:0xa78bfa,transparent:true,opacity:.4});
  for(let i=0;i<N;i+=4){
    const p1=helixPts1[i],p2=helixPts2[i];
    const geo=new THREE.BufferGeometry().setFromPoints([p1,p2]);
    dnaGroup.add(new THREE.Line(geo,rungMat));
    // Spheres at nodes
    const sm=new THREE.Mesh(new THREE.SphereGeometry(.055,8,8),new THREE.MeshBasicMaterial({color:i%8===0?0xe8c547:0x2dd4bf,transparent:true,opacity:.85}));
    sm.position.copy(p1);dnaGroup.add(sm);
    const sm2=sm.clone();sm2.position.copy(p2);
    sm2.material=new THREE.MeshBasicMaterial({color:i%8===0?0x2dd4bf:0xa78bfa,transparent:true,opacity:.85});
    dnaGroup.add(sm2);
  }

  // ── GALAXY RING OF PARTICLES ──
  const galN=1200,galPos=new Float32Array(galN*3),galCol=new Float32Array(galN*3);
  const galPals=[[0.91,0.77,0.28],[0.18,0.83,0.75],[0.65,0.55,0.98],[0.98,0.44,0.51],[0.38,0.64,0.98]];
  for(let i=0;i<galN;i++){
    const angle=Math.random()*Math.PI*2;
    const radius=2.2+Math.random()*2.2;
    const spread=(Math.random()-.5)*.35;
    galPos[i*3]=Math.cos(angle)*radius+(Math.random()-.5)*.4;
    galPos[i*3+1]=spread;
    galPos[i*3+2]=Math.sin(angle)*radius+(Math.random()-.5)*.4;
    const c=galPals[Math.floor(Math.random()*galPals.length)];
    galCol[i*3]=c[0];galCol[i*3+1]=c[1];galCol[i*3+2]=c[2];
  }
  const galGeo=new THREE.BufferGeometry();
  galGeo.setAttribute('position',new THREE.BufferAttribute(galPos,3));
  galGeo.setAttribute('color',new THREE.BufferAttribute(galCol,3));
  G.add(new THREE.Points(galGeo,new THREE.PointsMaterial({size:.028,vertexColors:true,transparent:true,opacity:.7})));

  // ── OUTER GLOWING RINGS ──
  const mkRing=(r,tube,col,op)=>{const m=new THREE.Mesh(new THREE.TorusGeometry(r,tube,12,120),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:op}));G.add(m);return m};
  const ring1=mkRing(2.1,.012,0xe8c547,.4);ring1.rotation.x=Math.PI*.3;
  const ring2=mkRing(2.8,.008,0x2dd4bf,.25);ring2.rotation.x=Math.PI*.6;ring2.rotation.y=.5;
  const ring3=mkRing(3.5,.006,0xa78bfa,.18);ring3.rotation.z=.8;ring3.rotation.x=Math.PI*.15;

  // ── FLOATING PARTICLES AROUND SCENE ──
  const ambN=300,ambPos=new Float32Array(ambN*3),ambSpd=[];
  for(let i=0;i<ambN;i++){
    ambPos[i*3]=(Math.random()-.5)*20;ambPos[i*3+1]=(Math.random()-.5)*14;ambPos[i*3+2]=(Math.random()-.5)*8-2;
    ambSpd.push({x:(Math.random()-.5)*.0012,y:(Math.random()-.5)*.0016});
  }
  const ambGeo=new THREE.BufferGeometry();ambGeo.setAttribute('position',new THREE.BufferAttribute(ambPos,3));
  scene.add(new THREE.Points(ambGeo,new THREE.PointsMaterial({size:.022,color:0xe8c547,transparent:true,opacity:.3})));

  // Lights
  scene.add(new THREE.AmbientLight(0x111122,2));
  const pl1=new THREE.PointLight(0xe8c547,8,15);pl1.position.set(5,3,4);scene.add(pl1);
  const pl2=new THREE.PointLight(0x2dd4bf,5,12);pl2.position.set(-4,-2,3);scene.add(pl2);
  const pl3=new THREE.PointLight(0xa78bfa,4,10);pl3.position.set(2,-4,1);scene.add(pl3);

  // Interaction
  let isDrag=false,pvx=0,pvy=0,velX=0,velY=0,rotX=0,rotY=0,t=0;
  let cmx=0,cmy=0;
  canvas.addEventListener('mousemove',e=>{
    const r=canvas.getBoundingClientRect();
    cmx=((e.clientX-r.left)/r.width-.5)*2;
    cmy=-((e.clientY-r.top)/r.height-.5)*2;
    if(isDrag){velY+=(e.clientX-pvx)*.009;velX+=(e.clientY-pvy)*.009;pvx=e.clientX;pvy=e.clientY}
  });
  canvas.addEventListener('mousedown',e=>{isDrag=true;pvx=e.clientX;pvy=e.clientY});
  canvas.addEventListener('mouseup',()=>isDrag=false);
  canvas.addEventListener('mouseleave',()=>isDrag=false);
  let ltx=0,lty=0;
  canvas.addEventListener('touchstart',e=>{ltx=e.touches[0].clientX;lty=e.touches[0].clientY},{passive:true});
  canvas.addEventListener('touchmove',e=>{velY+=(e.touches[0].clientX-ltx)*.012;velX+=(e.touches[0].clientY-lty)*.012;ltx=e.touches[0].clientX;lty=e.touches[0].clientY},{passive:true});

  function frame(){
    requestAnimationFrame(frame);t+=.008;
    velX*=.92;velY*=.92;rotX+=velX;rotY+=velY;
    // DNA Helix rotates
    dnaGroup.rotation.y=rotY+t*.3;
    dnaGroup.rotation.x=rotX+cmx*.08;
    // Galaxy ring orbits
    G.rotation.y=t*.08+cmx*.05;
    G.position.y=.2+Math.sin(t*.5)*.2;
    // Torus rings
    ring1.rotation.z=t*.18;ring2.rotation.z=-t*.12;ring3.rotation.y=t*.09;
    // Particle drift
    const ap=ambGeo.attributes.position.array;
    for(let i=0;i<ambN;i++){ap[i*3]+=ambSpd[i].x;ap[i*3+1]+=ambSpd[i].y;if(ap[i*3]>10)ap[i*3]=-10;if(ap[i*3]<-10)ap[i*3]=10;if(ap[i*3+1]>7)ap[i*3+1]=-7;if(ap[i*3+1]<-7)ap[i*3+1]=7}
    ambGeo.attributes.position.needsUpdate=true;
    // Camera
    camera.position.x+=(cmx*.4-camera.position.x)*.04;
    camera.position.y+=(cmy*.25-camera.position.y)*.04;
    camera.lookAt(3.5,0,0);
    // Light pulse
    pl1.intensity=7+Math.sin(t*1.3)*2;pl2.intensity=4+Math.cos(t*.9)*1.5;
    renderer.render(scene,camera);
  }
  frame();
  window.addEventListener('scroll',()=>{const p=Math.min(scrollY/(innerHeight*.5),1);canvas.style.opacity=1-p*.9},{passive:true});
})();

// ══════════════════════════════════════════
// ABOUT: FLOATING SKILL CONSTELLATION
// ══════════════════════════════════════════
(function(){
  if(typeof THREE==='undefined')return;
  const canvas=document.getElementById('aboutCanvas');if(!canvas)return;
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setClearColor(0,0);
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(60,1,.1,50);
  camera.position.z=5;
  function resize(){const w=canvas.clientWidth,h=canvas.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
  resize();window.addEventListener('resize',resize);
  const skills=[
    {label:'Python',col:0x2dd4bf,sz:.12},{label:'Java',col:0xe8c547,sz:.1},
    {label:'AWS',col:0xfb7185,sz:.13},{label:'ML',col:0xa78bfa,sz:.14},
    {label:'Agile',col:0x60a5fa,sz:.1},{label:'SQL',col:0xe8c547,sz:.09},
    {label:'OpenCV',col:0x2dd4bf,sz:.1},{label:'Git',col:0xfb7185,sz:.08},
    {label:'NodeJS',col:0xa78bfa,sz:.09},{label:'Jira',col:0x60a5fa,sz:.09},
    {label:'NLP',col:0xe8c547,sz:.1},{label:'DevOps',col:0x2dd4bf,sz:.11},
    {label:'Scrum',col:0xfb7185,sz:.1},{label:'KPI',col:0xa78bfa,sz:.08},
  ];
  const nodes=[];
  skills.forEach((s,i)=>{
    const a=(i/skills.length)*Math.PI*2,r=1.2+Math.random()*.9;
    const m=new THREE.Mesh(new THREE.SphereGeometry(s.sz+.03,16,16),new THREE.MeshPhongMaterial({color:s.col,emissive:s.col,emissiveIntensity:.3,transparent:true,opacity:.85}));
    m.position.set(Math.cos(a)*r,Math.sin(a)*r,(Math.random()-.5)*.8);
    m.userData={ox:m.position.x,oy:m.position.y,oz:m.position.z,a,r,spd:Math.random()*.4+.2,phase:Math.random()*Math.PI*2};
    scene.add(m);nodes.push(m);
    // Glow halo
    const halo=new THREE.Mesh(new THREE.SphereGeometry(s.sz+.1,16,16),new THREE.MeshBasicMaterial({color:s.col,transparent:true,opacity:.12,side:THREE.BackSide}));
    m.add(halo);
  });
  // Connect lines
  const lineMat=new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:.06});
  for(let i=0;i<nodes.length;i++){
    for(let j=i+1;j<nodes.length;j++){
      if(nodes[i].position.distanceTo(nodes[j].position)<1.6){
        const geo=new THREE.BufferGeometry().setFromPoints([nodes[i].position,nodes[j].position]);
        scene.add(new THREE.Line(geo,lineMat));
      }
    }
  }
  // Central orb
  const core=new THREE.Mesh(new THREE.IcosahedronGeometry(.35,2),new THREE.MeshPhongMaterial({color:0xe8c547,emissive:0xe8c547,emissiveIntensity:.4,transparent:true,opacity:.9}));
  scene.add(core);
  scene.add(new THREE.PointLight(0xe8c547,6,8));
  scene.add(new THREE.PointLight(0x2dd4bf,4,8));
  scene.add(new THREE.AmbientLight(0x112233,2));
  let t=0,vis=false;
  new IntersectionObserver(e=>{vis=e[0].isIntersecting},{threshold:.1}).observe(canvas);
  let hx=0,hy=0;
  canvas.addEventListener('mousemove',e=>{const r=canvas.getBoundingClientRect();hx=((e.clientX-r.left)/r.width-.5)*2;hy=-((e.clientY-r.top)/r.height-.5)*2});
  function frame(){
    requestAnimationFrame(frame);if(!vis)return;t+=.01;
    core.rotation.y=t*.5;core.rotation.x=t*.3;
    nodes.forEach(n=>{const d=n.userData;n.position.set(Math.cos(d.a+t*d.spd*.1)*d.r+hx*.1,Math.sin(d.a+t*d.spd*.1)*d.r+Math.sin(t*d.spd+d.phase)*.15+hy*.1,d.oz+Math.cos(t*d.spd+d.phase)*.15);n.rotation.y=t*.8;});
    camera.position.x+=(hx*.5-camera.position.x)*.04;
    camera.position.y+=(hy*.3-camera.position.y)*.04;
    camera.lookAt(0,0,0);
    renderer.render(scene,camera);
  }
  frame();
})();

// ══════════════════════════════════════════
// SKILLS: INTERACTIVE CONSTELLATION
// ══════════════════════════════════════════
(function(){
  const canvas=document.getElementById('skillsCanvas');if(!canvas)return;
  const ctx=canvas.getContext('2d');
  function resize(){canvas.width=canvas.clientWidth;canvas.height=canvas.clientHeight}
  resize();window.addEventListener('resize',resize);
  const skills=[
    {n:'Java',x:.15,y:.3,c:'#e8c547',r:22},{n:'Python',x:.25,y:.6,c:'#2dd4bf',r:24},
    {n:'AWS',x:.4,y:.2,c:'#fb7185',r:26},{n:'Machine Learning',x:.55,y:.5,c:'#a78bfa',r:28},
    {n:'SQL',x:.7,y:.25,c:'#e8c547',r:20},{n:'OpenCV',x:.82,y:.6,c:'#60a5fa',r:22},
    {n:'Agile/Scrum',x:.35,y:.78,c:'#2dd4bf',r:24},{n:'Git',x:.65,y:.75,c:'#fb7185',r:20},
    {n:'Roadmap Planning',x:.5,y:.3,c:'#60a5fa',r:22},{n:'KPI Tracking',x:.2,y:.5,c:'#a78bfa',r:20},
    {n:'Stakeholder Mgmt',x:.75,y:.45,c:'#e8c547',r:22},{n:'NodeJS',x:.45,y:.65,c:'#2dd4bf',r:20},
    {n:'NLP',x:.6,y:.4,c:'#fb7185',r:18},{n:'DevOps',x:.3,y:.4,c:'#a78bfa',r:21},
    {n:'Jira',x:.85,y:.35,c:'#60a5fa',r:18},{n:'Product Strategy',x:.55,y:.15,c:'#e8c547',r:23},
  ];
  let mx=canvas.width/2,my=canvas.height/2,t=0,vis=false;
  new IntersectionObserver(e=>{vis=e[0].isIntersecting},{threshold:.2}).observe(canvas);
  canvas.addEventListener('mousemove',e=>{const r=canvas.getBoundingClientRect();mx=e.clientX-r.left;my=e.clientY-r.top});
  let hovIdx=-1;
  function frame(){
    requestAnimationFrame(frame);if(!vis)return;t+=.008;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    const W=canvas.width,H=canvas.height;
    // Draw connections
    for(let i=0;i<skills.length;i++){
      for(let j=i+1;j<skills.length;j++){
        const a=skills[i],b=skills[j];
        const ax=a.x*W+Math.sin(t+i)*.01*W,ay=a.y*H+Math.cos(t+i)*.01*H;
        const bx=b.x*W+Math.sin(t+j)*.01*W,by=b.y*H+Math.cos(t+j)*.01*H;
        const dist=Math.hypot(ax-bx,ay-by);
        if(dist<W*.22){
          const alpha=(1-dist/(W*.22))*.12;
          ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(bx,by);
          ctx.strokeStyle=`rgba(255,255,255,${alpha})`;ctx.lineWidth=.8;ctx.stroke();
        }
      }
    }
    // Mouse influence lines
    skills.forEach((s,i)=>{
      const sx=s.x*W+Math.sin(t+i)*.015*W,sy=s.y*H+Math.cos(t+i)*.015*H;
      const d=Math.hypot(mx-sx,my-sy);
      if(d<120){
        const alpha=(1-d/120)*.25;
        ctx.beginPath();ctx.moveTo(mx,my);ctx.lineTo(sx,sy);
        ctx.strokeStyle=`rgba(232,197,71,${alpha})`;ctx.lineWidth=1;ctx.stroke();
      }
    });
    // Draw nodes
    hovIdx=-1;
    skills.forEach((s,i)=>{
      const px=s.x*W+Math.sin(t*.6+i*.8)*.018*W,py=s.y*H+Math.cos(t*.5+i*.7)*.018*H;
      const d=Math.hypot(mx-px,my-py);
      const hov=d<s.r+12;if(hov)hovIdx=i;
      const scale=hov?1.25:1;
      const pulse=1+Math.sin(t*1.5+i)*.06;
      // Glow
      const gr=ctx.createRadialGradient(px,py,0,px,py,s.r*2.5*scale*pulse);
      gr.addColorStop(0,s.c+'40');gr.addColorStop(1,s.c+'00');
      ctx.beginPath();ctx.arc(px,py,s.r*2.5*scale*pulse,0,Math.PI*2);
      ctx.fillStyle=gr;ctx.fill();
      // Core
      ctx.beginPath();ctx.arc(px,py,s.r*scale*pulse,0,Math.PI*2);
      const cg=ctx.createRadialGradient(px-s.r*.3,py-s.r*.3,0,px,py,s.r*scale*pulse);
      cg.addColorStop(0,s.c+'ff');cg.addColorStop(1,s.c+'99');
      ctx.fillStyle=cg;ctx.fill();
      // Ring
      ctx.beginPath();ctx.arc(px,py,s.r*scale*pulse+3,0,Math.PI*2);
      ctx.strokeStyle=s.c+'55';ctx.lineWidth=1.5;ctx.stroke();
      // Label
      const showLabel=hov||(s.r>=24);
      if(showLabel){
        ctx.font=`${hov?600:400} ${hov?13:11}px 'DM Mono',monospace`;
        ctx.fillStyle=hov?'#f0ede8':'rgba(240,237,232,.5)';
        ctx.textAlign='center';
        ctx.fillText(s.n,px,py+s.r*scale*pulse+16);
      }
    });
    canvas.style.cursor=hovIdx>=0?'pointer':'default';
  }
  frame();
})();

// ══════════════════════════════════════════
// PROJECT SCENES
// ══════════════════════════════════════════
(function(){
  if(typeof THREE==='undefined')return;
  // Scene 0: Neural Network visualization
  function makeScene0(canvas){
    const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
    renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0,0);
    const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(55,1,.1,20);camera.position.z=4.5;
    function resize(){renderer.setSize(canvas.clientWidth,canvas.clientHeight,false);camera.aspect=canvas.clientWidth/canvas.clientHeight;camera.updateProjectionMatrix()}
    resize();window.addEventListener('resize',resize);
    scene.add(new THREE.AmbientLight(0x223344,2));
    const pl=new THREE.PointLight(0xe8c547,5,8);pl.position.set(2,2,3);scene.add(pl);
    const pl2=new THREE.PointLight(0x2dd4bf,3,6);pl2.position.set(-2,-1,2);scene.add(pl2);
    // Layers of neural net
    const layers=[[3,[-1.5,0]],[5,[0,0]],[4,[1.5,0]]];
    const allNodes=[];
    layers.forEach(([count,cx],li)=>{
      const nodes=[];
      for(let i=0;i<count;i++){
        const y=(i-(count-1)/2)*0.65;
        const m=new THREE.Mesh(new THREE.SphereGeometry(.1,12,12),new THREE.MeshPhongMaterial({color:li===1?0xe8c547:0x2dd4bf,emissive:li===1?0xe8c547:0x2dd4bf,emissiveIntensity:.3}));
        m.position.set(cx[0],y,0);scene.add(m);nodes.push(m);
      }
      allNodes.push(nodes);
    });
    // Connections
    for(let l=0;l<allNodes.length-1;l++){
      allNodes[l].forEach(a=>{allNodes[l+1].forEach(b=>{
        const geo=new THREE.BufferGeometry().setFromPoints([a.position,b.position]);
        scene.add(new THREE.Line(geo,new THREE.LineBasicMaterial({color:0xa78bfa,transparent:true,opacity:.35})));
      })});
    }
    // Floating data particles
    const N=80,pos=new Float32Array(N*3),spd=[];
    for(let i=0;i<N;i++){pos[i*3]=(Math.random()-.5)*4;pos[i*3+1]=(Math.random()-.5)*3;pos[i*3+2]=(Math.random()-.5)*2;spd.push({x:(Math.random()-.5)*.02,y:(Math.random()-.5)*.02})}
    const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(pos,3));
    scene.add(new THREE.Points(pg,new THREE.PointsMaterial({color:0xe8c547,size:.035,transparent:true,opacity:.6})));
    let t=0,vis=false;
    new IntersectionObserver(e=>{vis=e[0].isIntersecting},{threshold:.1}).observe(canvas);
    let hx=0,hy=0;
    canvas.parentElement.addEventListener('mousemove',e=>{const r=canvas.getBoundingClientRect();hx=((e.clientX-r.left)/r.width-.5)*2;hy=-((e.clientY-r.top)/r.height-.5)*2});
    function frame(){requestAnimationFrame(frame);if(!vis)return;t+=.012;
      // Animate node pulses
      allNodes.flat().forEach((n,i)=>{const s=1+Math.sin(t*2+i)*.15;n.scale.set(s,s,s)});
      const p=pg.attributes.position.array;for(let i=0;i<N;i++){p[i*3]+=spd[i].x;p[i*3+1]+=spd[i].y;if(Math.abs(p[i*3])>2)spd[i].x*=-1;if(Math.abs(p[i*3+1])>1.5)spd[i].y*=-1}
      pg.attributes.position.needsUpdate=true;
      camera.position.x+=(hx*.5-camera.position.x)*.06;camera.position.y+=(hy*.3-camera.position.y)*.06;camera.lookAt(0,0,0);
      renderer.render(scene,camera)}
    frame();
  }

  // Scene 1: Hand gesture — wave particles
  function makeScene1(canvas){
    const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
    renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0,0);
    const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(55,1,.1,20);camera.position.z=5;
    function resize(){renderer.setSize(canvas.clientWidth,canvas.clientHeight,false);camera.aspect=canvas.clientWidth/canvas.clientHeight;camera.updateProjectionMatrix()}
    resize();window.addEventListener('resize',resize);
    scene.add(new THREE.AmbientLight(0x111133,2));
    scene.add(new THREE.PointLight(0xa78bfa,5,8));
    // Wave grid
    const ROWS=20,COLS=20,pts=[],sep=.2;
    const geo=new THREE.BufferGeometry();
    const pos=new Float32Array(ROWS*COLS*3);
    for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){const i=r*COLS+c;pos[i*3]=(c-(COLS-1)/2)*sep;pos[i*3+1]=0;pos[i*3+2]=(r-(ROWS-1)/2)*sep;pts.push([pos[i*3],pos[i*3+2]])}
    geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
    const colors=new Float32Array(ROWS*COLS*3);geo.setAttribute('color',new THREE.BufferAttribute(colors,3));
    const wavePts=new THREE.Points(geo,new THREE.PointsMaterial({size:.055,vertexColors:true,transparent:true,opacity:.9}));
    scene.add(wavePts);
    // Finger joints
    const fingers=[];
    for(let f=0;f<5;f++){
      const joints=[];
      for(let j=0;j<3;j++){
        const m=new THREE.Mesh(new THREE.SphereGeometry(.06,8,8),new THREE.MeshBasicMaterial({color:[0xe8c547,0x2dd4bf,0xa78bfa,0xfb7185,0x60a5fa][f],transparent:true,opacity:.8}));
        scene.add(m);joints.push(m);
      }
      fingers.push(joints);
    }
    let t=0,vis=false;
    new IntersectionObserver(e=>{vis=e[0].isIntersecting},{threshold:.1}).observe(canvas);
    let hx=0,hy=0;
    canvas.parentElement.addEventListener('mousemove',e=>{const r=canvas.getBoundingClientRect();hx=((e.clientX-r.left)/r.width-.5)*2;hy=-((e.clientY-r.top)/r.height-.5)*2});
    const pals=[[0.91,0.77,0.28],[0.18,0.83,0.75],[0.65,0.55,0.98]];
    function frame(){requestAnimationFrame(frame);if(!vis)return;t+=.015;
      const p=geo.attributes.position.array,co=geo.attributes.color.array;
      for(let r2=0;r2<ROWS;r2++)for(let c=0;c<COLS;c++){
        const i=r2*COLS+c,wave=Math.sin(pts[i][0]*3+t*2.5)*Math.cos(pts[i][1]*2.5+t*1.8)*.3+Math.sin(t+hx*2+pts[i][0]*2)*.1;
        p[i*3+1]=wave;
        const n=(wave+.4)/.8,cl=pals[Math.floor(n*pals.length)%pals.length];
        co[i*3]=cl[0];co[i*3+1]=cl[1];co[i*3+2]=cl[2];
      }
      geo.attributes.position.needsUpdate=true;geo.attributes.color.needsUpdate=true;
      // Animate finger positions
      fingers.forEach((f,fi)=>{
        const baseX=(fi-2)*.35,baseY=-1+hy*.3;
        f.forEach((j,ji)=>{
          const curl=Math.sin(t*.8+fi*.5+hy)*.3;
          j.position.set(baseX+(ji*.15)*Math.sin(curl+fi*.3),baseY+(ji+1)*.3*Math.cos(curl),.5);
        });
      });
      camera.lookAt(0,0,0);renderer.render(scene,camera)}
    frame();
  }

  // Scene 2: AWS — 3D topology map
  function makeScene2(canvas){
    const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
    renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0,0);
    const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(55,1,.1,20);camera.position.z=5;
    function resize(){renderer.setSize(canvas.clientWidth,canvas.clientHeight,false);camera.aspect=canvas.clientWidth/canvas.clientHeight;camera.updateProjectionMatrix()}
    resize();window.addEventListener('resize',resize);
    scene.add(new THREE.AmbientLight(0x111133,2));
    scene.add(new THREE.PointLight(0x60a5fa,6,10));
    scene.add(new THREE.PointLight(0x2dd4bf,4,8));
    const shapes=[
      {geo:new THREE.BoxGeometry(.3,.3,.3),col:0x60a5fa,pos:[0,0,0],speed:.7},
      {geo:new THREE.OctahedronGeometry(.22),col:0xe8c547,pos:[-1.2,.5,0],speed:.5},
      {geo:new THREE.OctahedronGeometry(.18),col:0x2dd4bf,pos:[1.2,.6,0],speed:.6},
      {geo:new THREE.OctahedronGeometry(.15),col:0xfb7185,pos:[-1.,.-.6,0],speed:.8},
      {geo:new THREE.OctahedronGeometry(.18),col:0xa78bfa,pos:[1.1,-.5,0],speed:.55},
      {geo:new THREE.OctahedronGeometry(.12),col:0x60a5fa,pos:[0,1.1,0],speed:.65},
    ];
    const meshes=shapes.map(s=>{
      const m=new THREE.Mesh(s.geo,new THREE.MeshPhongMaterial({color:s.col,emissive:s.col,emissiveIntensity:.3,metalness:.8,roughness:.2}));
      m.position.set(...s.pos);m.userData=s;scene.add(m);return m;
    });
    // Connection lines
    for(let i=1;i<meshes.length;i++){
      const geo=new THREE.BufferGeometry().setFromPoints([meshes[0].position,meshes[i].position]);
      scene.add(new THREE.Line(geo,new THREE.LineBasicMaterial({color:0x60a5fa,transparent:true,opacity:.3})));
    }
    // Orbiting particles
    const N=60,op=new Float32Array(N*3);
    for(let i=0;i<N;i++){const a=Math.random()*Math.PI*2,r=.3+Math.random()*1.8;op[i*3]=Math.cos(a)*r;op[i*3+1]=(Math.random()-.5)*2;op[i*3+2]=Math.sin(a)*r}
    const og=new THREE.BufferGeometry();og.setAttribute('position',new THREE.BufferAttribute(op,3));
    scene.add(new THREE.Points(og,new THREE.PointsMaterial({color:0x60a5fa,size:.04,transparent:true,opacity:.5})));
    let t=0,vis=false;
    new IntersectionObserver(e=>{vis=e[0].isIntersecting},{threshold:.1}).observe(canvas);
    let hx=0,hy=0;
    canvas.parentElement.addEventListener('mousemove',e=>{const r=canvas.getBoundingClientRect();hx=((e.clientX-r.left)/r.width-.5)*2;hy=-((e.clientY-r.top)/r.height-.5)*2});
    function frame(){requestAnimationFrame(frame);if(!vis)return;t+=.01;
      meshes.forEach(m=>{m.rotation.y=t*m.userData.speed;m.rotation.x=t*m.userData.speed*.5;const s=1+Math.sin(t*1.2+m.userData.speed)*.1;m.scale.set(s,s,s)});
      camera.position.x+=(hx*.6-camera.position.x)*.06;camera.position.y+=(hy*.4-camera.position.y)*.06;camera.lookAt(0,0,0);
      renderer.render(scene,camera)}
    frame();
  }

  const fns=[makeScene0,makeScene1,makeScene2];
  ['p0','p1','p2'].forEach((id,i)=>{const c=document.getElementById(id);if(c&&fns[i])fns[i](c)});
})();

// ══════════════════════════════════════════
// CONTACT: AURORA WAVE CANVAS
// ══════════════════════════════════════════
(function(){
  if(typeof THREE==='undefined')return;
  const canvas=document.getElementById('contactCanvas');if(!canvas)return;
  const renderer=new THREE.WebGLRenderer({canvas,antialias:false,alpha:true});
  renderer.setPixelRatio(1);renderer.setClearColor(0,0);
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(70,1,.1,50);camera.position.z=5;
  function resize(){renderer.setSize(canvas.clientWidth,canvas.clientHeight,false);camera.aspect=canvas.clientWidth/canvas.clientHeight;camera.updateProjectionMatrix()}
  resize();window.addEventListener('resize',resize);
  // Aurora ribbons
  const ribbons=[];
  const ribbonColors=[0xe8c547,0x2dd4bf,0xa78bfa,0xfb7185,0x60a5fa];
  for(let ri=0;ri<5;ri++){
    const pts=[];
    for(let i=0;i<=100;i++){const t=i/100;pts.push(new THREE.Vector3((t-.5)*14,(Math.random()-.5)*2,(Math.random()-.5)*2))}
    const curve=new THREE.CatmullRomCurve3(pts);
    const geo=new THREE.TubeGeometry(curve,120,.04,6,false);
    const mat=new THREE.MeshBasicMaterial({color:ribbonColors[ri],transparent:true,opacity:.2+ri*.05});
    const mesh=new THREE.Mesh(geo,mat);mesh.userData={ri,baseY:(ri-2)*.8};scene.add(mesh);ribbons.push(mesh);
  }
  // Star particles
  const N=150,sp=new Float32Array(N*3);
  for(let i=0;i<N;i++){sp[i*3]=(Math.random()-.5)*16;sp[i*3+1]=(Math.random()-.5)*10;sp[i*3+2]=(Math.random()-.5)*5-2}
  const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.BufferAttribute(sp,3));
  scene.add(new THREE.Points(sg,new THREE.PointsMaterial({size:.05,color:0xffffff,transparent:true,opacity:.4})));
  let t=0,vis=false;
  new IntersectionObserver(e=>{vis=e[0].isIntersecting},{threshold:.1}).observe(canvas);
  function frame(){requestAnimationFrame(frame);if(!vis)return;t+=.006;
    ribbons.forEach((m,i)=>{m.position.y=m.userData.baseY+Math.sin(t*.5+i*1.2)*.4;m.rotation.z=Math.sin(t*.3+i)*.05});
    camera.position.x=Math.sin(t*.15)*1.5;renderer.render(scene,camera)}
  frame();
})();

// ══════════════════════════════════════════
// 3D TILT ON CARDS
// ══════════════════════════════════════════
function tilt(sel,maxR=6){
  document.querySelectorAll(sel).forEach(card=>{
    let raf;
    card.addEventListener('mousemove',e=>{
      cancelAnimationFrame(raf);
      raf=requestAnimationFrame(()=>{
        const r=card.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
        card.style.transform=`translateY(-6px) perspective(900px) rotateX(${((y-r.height/2)/r.height)*-maxR}deg) rotateY(${((x-r.width/2)/r.width)*maxR}deg)`;
        card.style.transition='border-color .3s,box-shadow .3s,transform .05s';
      });
    });
    card.addEventListener('mouseleave',()=>{
      cancelAnimationFrame(raf);
      card.style.transition='transform .7s cubic-bezier(.16,1,.3,1),border-color .3s,box-shadow .3s';
      card.style.transform='';
    });
  });
}
tilt('.cert-card',5);tilt('.bstat',7);tilt('.c-card',6);tilt('.award-xl',4);tilt('.proj-screen',5);

// ══════════════════════════════════════════
// WHATSAPP
// ══════════════════════════════════════════
document.getElementById('waBtn')&&document.getElementById('waBtn').addEventListener('click',()=>window.open('https://wa.me/917985930166?text='+encodeURIComponent("Hi Aditya! I came across your portfolio and would love to connect."),'_blank'));

// ══════════════════════════════════════════
// PARALLAX SECTION LABELS
// ══════════════════════════════════════════
let tk=false;
window.addEventListener('scroll',()=>{if(!tk){requestAnimationFrame(()=>{document.querySelectorAll('.eyebrow').forEach(el=>{const r=el.getBoundingClientRect();if(r.top<innerHeight&&r.bottom>0)el.style.transform=`translateX(${(r.top/innerHeight)*12}px)`});tk=false});tk=true}},{passive:true});
