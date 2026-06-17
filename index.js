/* ══════════════════════════════════
     NAV — 스무스 스크롤
     (nav-item 클릭 시 섹션 이동)
  ══════════════════════════════════ */
  document.querySelectorAll('.nav-item').forEach(link => {
    link.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      // 페이지 내 앵커(#)일 때만 preventDefault
      if (href && href.startsWith('#')) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
      // 외부 링크라면 그냥 통과 → 기존 동작 유지
    });
  });


  /* ══════════════════════════════════
     ABOUT — 탭 버튼 클릭 → 이미지 전환
  ══════════════════════════════════ */
  const navBtns = document.querySelectorAll('.about-nav button');
  const slides  = document.querySelectorAll('.img-slide');

  if (navBtns.length && slides.length) {   // 요소가 있을 때만 실행
    navBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.target;

        navBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        slides.forEach(s => s.classList.remove('active'));
        document.getElementById('slide-' + target)?.classList.add('active');
      });
    });
  }


  /* ══════════════════════════════════
     PROJECT — 마우스 무브에 따른 3D 틸팅
  ══════════════════════════════════ */
  document.querySelectorAll('.project-item').forEach(item => {
    const thumb = item.querySelector('.thumb');
    if (!thumb) return;   // .thumb 없으면 스킵

    item.addEventListener('mousemove', e => {
      const rect = item.getBoundingClientRect();
      const cx = rect.left + rect.width  / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = (e.clientX - cx) / rect.width;
      const dy = (e.clientY - cy) / rect.height;

      thumb.style.transform = [
        `translateY(-12px)`,
        `rotate(${dx * 6 - 2}deg)`,
        `scale(1.06)`,
        `perspective(600px)`,
        `rotateX(${-dy * 8}deg)`,
        `rotateY(${dx * 8}deg)`
      ].join(' ');
    });

    item.addEventListener('mouseleave', () => {
      thumb.style.transform = '';
    });
  });

    /* ══════════════════════════════════
       WEBSITE SECTION — 스크롤 Reveal
       뷰포트에 진입하면 .in-view 추가
       → .project-info 와 .project-thumb-wrap 각각 관찰
    ══════════════════════════════════ */
    (function () {
      const revealEls = document.querySelectorAll('.project-info, .project-thumb-wrap');
      if (!revealEls.length) return;

      const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target); // 한 번만 실행
          }
        });
      }, {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
      });

      revealEls.forEach(function (el) {
        observer.observe(el);
      });
    })();

/* // 맨 아래로 스크롤하면 사이트 이동
window.onscroll = function() {
    // 스크롤이 맨 아래에 도달했는지 확인 (약간의 오차 보정)
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100) {
        // 이동할 사이트 URL
        window.location.href = "website-section.html";
    }
}; */

// 윈도우 화면보호기 기능

const canvas = document.getElementById('bouncingCanvas');
const ctx = canvas.getContext('2d');
let draggingItem = null; // 현재 드래그 중인 아이템

// 캔버스 크기 조정
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

const imgSources = [, // 실제 이미지 경로로 수정하세요
    'images/pop1.png',
    'images/pop2.png',
    'images/plastic_pop_01.png',
    'images/plastic_pop_02.png',
    'images/plastic_pop_03.png',
    'images/object.png'
];

class InteractiveImage {
    constructor(src, speedFactor) {
        this.img = new Image();
        this.img.src = src;
        this.ready = false;
        this.isDragging = false;

        this.img.onload = () => {
            this.ready = true;
            this.w = this.img.naturalWidth;
            this.h = this.img.naturalHeight;
            this.x = Math.random() * (canvas.width - this.w);
            this.y = Math.random() * (canvas.height - this.h);
        };

        this.dx = 2 * speedFactor;
        this.dy = 3 * speedFactor;
    }

    update() {
        if (!this.ready) return;

        // 드래그 중이 아닐 때만 이동 로직 실행
        if (!this.isDragging) {
            if (this.x + this.dx > canvas.width - this.w || this.x + this.dx < 0) {
                this.dx = -this.dx;
            }
            if (this.y + this.dy > canvas.height - this.h || this.y + this.dy < 0) {
                this.dy = -this.dy;
            }
            this.x += this.dx;
            this.y += this.dy;
        }

        this.draw();
    }

    draw() {
        ctx.drawImage(this.img, this.x, this.y, this.w, this.h);
    }

    // 마우스가 이미지 영역 안에 있는지 확인
    contains(mx, my) {
        return mx >= this.x && mx <= this.x + this.w &&
               my >= this.y && my <= this.y + this.h;
    }
}

const items = imgSources.map((src, i) => new InteractiveImage(src, 1 + i * 0.2));

// 마우스 이벤트 핸들러
canvas.addEventListener('mousedown', (e) => {
    const mx = e.clientX;
    const my = e.clientY;

    // 뒤에 있는 이미지가 클릭될 수도 있으므로 역순으로 체크
    for (let i = items.length - 1; i >= 0; i--) {
        if (items[i].contains(mx, my)) {
            draggingItem = items[i];
            draggingItem.isDragging = true;
            // 드래그 시 마우스 위치와 이미지 좌상단 사이의 간격 저장 (자연스러운 드래그)
            draggingItem.offsetX = mx - draggingItem.x;
            draggingItem.offsetY = my - draggingItem.y;
            break; 
        }
    }
});

window.addEventListener('mousemove', (e) => {
    if (draggingItem) {
        draggingItem.x = e.clientX - draggingItem.offsetX;
        draggingItem.y = e.clientY - draggingItem.offsetY;
    }
});

window.addEventListener('mouseup', () => {
    if (draggingItem) {
        draggingItem.isDragging = false;
        draggingItem = null;
    }
});

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    items.forEach(item => item.update());
    requestAnimationFrame(animate);
}

animate();

// main_hero_liquid — Interactive Liquid Gradient (from CodePen cameronknight/ogxWmBP)
(function () {
  'use strict';

  // Three.js r128 CDN 동적 로드
  const threeScript = document.createElement('script');
  threeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
  threeScript.onload = function () { initLiquidGradient(); };
  document.head.appendChild(threeScript);

  function initLiquidGradient() {
    const container = document.querySelector('.main_hero_img');
    if (!container) return;

    /* ──────────────────────────────────────
       TouchTexture  (원본 CodePen 그대로)
    ────────────────────────────────────── */
    class TouchTexture {
      constructor() {
        this.size   = 64;
        this.width  = this.height = this.size;
        this.maxAge = 64;
        this.radius = 0.25 * this.size;
        this.speed  = 1 / this.maxAge;
        this.trail  = [];
        this.last   = null;
        this.initTexture();
      }
      initTexture() {
        this.canvas        = document.createElement('canvas');
        this.canvas.width  = this.width;
        this.canvas.height = this.height;
        this.ctx           = this.canvas.getContext('2d');
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.texture       = new THREE.Texture(this.canvas);
      }
      update() {
        this.clear();
        const speed = this.speed;
        for (let i = this.trail.length - 1; i >= 0; i--) {
          const point = this.trail[i];
          let f = point.force * speed * (1 - point.age / this.maxAge);
          point.x += point.vx * f;
          point.y += point.vy * f;
          point.age++;
          if (point.age > this.maxAge) { this.trail.splice(i, 1); }
          else { this.drawPoint(point); }
        }
        this.texture.needsUpdate = true;
      }
      clear() {
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      }
      addTouch(point) {
        let force = 0, vx = 0, vy = 0;
        const last = this.last;
        if (last) {
          const dx = point.x - last.x;
          const dy = point.y - last.y;
          if (dx === 0 && dy === 0) return;
          const dd = dx * dx + dy * dy;
          const d  = Math.sqrt(dd);
          vx = dx / d; vy = dy / d;
          force = Math.min(dd * 20000, 2.0);
        }
        this.last = { x: point.x, y: point.y };
        this.trail.push({ x: point.x, y: point.y, age: 0, force, vx, vy });
      }
      drawPoint(point) {
        const pos = { x: point.x * this.width, y: (1 - point.y) * this.height };
        let intensity = 1;
        if (point.age < this.maxAge * 0.3) {
          intensity = Math.sin((point.age / (this.maxAge * 0.3)) * (Math.PI / 2));
        } else {
          const t = 1 - (point.age - this.maxAge * 0.3) / (this.maxAge * 0.7);
          intensity = -t * (t - 2);
        }
        intensity *= point.force;
        const radius = this.radius;
        const color  = `${((point.vx + 1) / 2) * 255}, ${((point.vy + 1) / 2) * 255}, ${intensity * 255}`;
        const offset = this.size * 5;
        this.ctx.shadowOffsetX = offset;
        this.ctx.shadowOffsetY = offset;
        this.ctx.shadowBlur    = radius;
        this.ctx.shadowColor   = `rgba(${color},${0.2 * intensity})`;
        this.ctx.beginPath();
        this.ctx.fillStyle = 'rgba(255,0,0,1)';
        this.ctx.arc(pos.x - offset, pos.y - offset, radius, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }

    /* ──────────────────────────────────────
       Shaders  (원본 CodePen 그대로)
    ────────────────────────────────────── */
    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vec3 pos = position.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.);
        vUv = uv;
      }
    `;

    const fragmentShader = `
      uniform float uTime;
      uniform vec2  uResolution;
      uniform vec3  uColor1;
      uniform vec3  uColor2;
      uniform vec3  uColor3;
      uniform vec3  uColor4;
      uniform vec3  uColor5;
      uniform vec3  uColor6;
      uniform float uSpeed;
      uniform float uIntensity;
      uniform sampler2D uTouchTexture;
      uniform float uGrainIntensity;
      uniform vec3  uDarkNavy;
      uniform float uGradientSize;
      uniform float uGradientCount;
      uniform float uColor1Weight;
      uniform float uColor2Weight;

      varying vec2 vUv;
      #define PI 3.14159265359

      float grain(vec2 uv, float time) {
        vec2 grainUv  = uv * uResolution * 0.5;
        float val = fract(sin(dot(grainUv + time, vec2(12.9898, 78.233))) * 43758.5453);
        return val * 2.0 - 1.0;
      }

      vec3 getGradientColor(vec2 uv, float time) {
        float gr = uGradientSize;
        vec2 c1  = vec2(0.5 + sin(time*uSpeed*0.4)*0.4,  0.5 + cos(time*uSpeed*0.5)*0.4);
        vec2 c2  = vec2(0.5 + cos(time*uSpeed*0.6)*0.5,  0.5 + sin(time*uSpeed*0.45)*0.5);
        vec2 c3  = vec2(0.5 + sin(time*uSpeed*0.35)*0.45, 0.5 + cos(time*uSpeed*0.55)*0.45);
        vec2 c4  = vec2(0.5 + cos(time*uSpeed*0.5)*0.4,  0.5 + sin(time*uSpeed*0.4)*0.4);
        vec2 c5  = vec2(0.5 + sin(time*uSpeed*0.7)*0.35, 0.5 + cos(time*uSpeed*0.6)*0.35);
        vec2 c6  = vec2(0.5 + cos(time*uSpeed*0.45)*0.5, 0.5 + sin(time*uSpeed*0.65)*0.5);
        vec2 c7  = vec2(0.5 + sin(time*uSpeed*0.55)*0.38, 0.5 + cos(time*uSpeed*0.48)*0.42);
        vec2 c8  = vec2(0.5 + cos(time*uSpeed*0.65)*0.36, 0.5 + sin(time*uSpeed*0.52)*0.44);
        vec2 c9  = vec2(0.5 + sin(time*uSpeed*0.42)*0.41, 0.5 + cos(time*uSpeed*0.58)*0.39);
        vec2 c10 = vec2(0.5 + cos(time*uSpeed*0.48)*0.37, 0.5 + sin(time*uSpeed*0.62)*0.43);
        vec2 c11 = vec2(0.5 + sin(time*uSpeed*0.68)*0.33, 0.5 + cos(time*uSpeed*0.44)*0.46);
        vec2 c12 = vec2(0.5 + cos(time*uSpeed*0.38)*0.39, 0.5 + sin(time*uSpeed*0.56)*0.41);

        float i1  = 1.0 - smoothstep(0.0, gr, length(uv-c1));
        float i2  = 1.0 - smoothstep(0.0, gr, length(uv-c2));
        float i3  = 1.0 - smoothstep(0.0, gr, length(uv-c3));
        float i4  = 1.0 - smoothstep(0.0, gr, length(uv-c4));
        float i5  = 1.0 - smoothstep(0.0, gr, length(uv-c5));
        float i6  = 1.0 - smoothstep(0.0, gr, length(uv-c6));
        float i7  = 1.0 - smoothstep(0.0, gr, length(uv-c7));
        float i8  = 1.0 - smoothstep(0.0, gr, length(uv-c8));
        float i9  = 1.0 - smoothstep(0.0, gr, length(uv-c9));
        float i10 = 1.0 - smoothstep(0.0, gr, length(uv-c10));
        float i11 = 1.0 - smoothstep(0.0, gr, length(uv-c11));
        float i12 = 1.0 - smoothstep(0.0, gr, length(uv-c12));

        vec2 ru1 = uv - 0.5;
        float a1 = time*uSpeed*0.15;
        ru1 = vec2(ru1.x*cos(a1)-ru1.y*sin(a1), ru1.x*sin(a1)+ru1.y*cos(a1)) + 0.5;
        vec2 ru2 = uv - 0.5;
        float a2 = -time*uSpeed*0.12;
        ru2 = vec2(ru2.x*cos(a2)-ru2.y*sin(a2), ru2.x*sin(a2)+ru2.y*cos(a2)) + 0.5;

        float ri1 = 1.0 - smoothstep(0.0, 0.8, length(ru1-0.5));
        float ri2 = 1.0 - smoothstep(0.0, 0.8, length(ru2-0.5));

        vec3 color = vec3(0.0);
        color += uColor1*(0.55+0.45*sin(time*uSpeed))*i1*uColor1Weight;
        color += uColor2*(0.55+0.45*cos(time*uSpeed*1.2))*i2*uColor2Weight;
        color += uColor3*(0.55+0.45*sin(time*uSpeed*0.8))*i3*uColor1Weight;
        color += uColor4*(0.55+0.45*cos(time*uSpeed*1.3))*i4*uColor2Weight;
        color += uColor5*(0.55+0.45*sin(time*uSpeed*1.1))*i5*uColor1Weight;
        color += uColor6*(0.55+0.45*cos(time*uSpeed*0.9))*i6*uColor2Weight;
        if (uGradientCount > 6.0) {
          color += uColor1*(0.55+0.45*sin(time*uSpeed*1.4))*i7*uColor1Weight;
          color += uColor2*(0.55+0.45*cos(time*uSpeed*1.5))*i8*uColor2Weight;
          color += uColor3*(0.55+0.45*sin(time*uSpeed*1.6))*i9*uColor1Weight;
          color += uColor4*(0.55+0.45*cos(time*uSpeed*1.7))*i10*uColor2Weight;
        }
        if (uGradientCount > 10.0) {
          color += uColor5*(0.55+0.45*sin(time*uSpeed*1.8))*i11*uColor1Weight;
          color += uColor6*(0.55+0.45*cos(time*uSpeed*1.9))*i12*uColor2Weight;
        }
        color += mix(uColor1,uColor3,ri1)*0.45*uColor1Weight;
        color += mix(uColor2,uColor4,ri2)*0.40*uColor2Weight;

        color = clamp(color, vec3(0.0), vec3(1.0)) * uIntensity;
        float lum = dot(color, vec3(0.299,0.587,0.114));
        color = mix(vec3(lum), color, 1.35);
        color = pow(color, vec3(0.92));
        float br1 = length(color);
        color = mix(uDarkNavy, color, max(br1*1.2, 0.15));
        float mb = 1.0; float b = length(color);
        if (b > mb) color *= mb/b;
        return color;
      }

      void main() {
        vec2 uv = vUv;
        vec4 touchTex = texture2D(uTouchTexture, uv);
        float vx = -(touchTex.r*2.0-1.0);
        float vy = -(touchTex.g*2.0-1.0);
        float intensity = touchTex.b;
        uv.x += vx*0.8*intensity;
        uv.y += vy*0.8*intensity;

        vec2 center = vec2(0.5);
        float dist   = length(uv-center);
        float ripple = sin(dist*20.0-uTime*3.0)*0.04*intensity;
        float wave   = sin(dist*15.0-uTime*2.0)*0.03*intensity;
        uv += vec2(ripple+wave);

        vec3 color = getGradientColor(uv, uTime);
        color += grain(uv, uTime)*uGrainIntensity;
        float ts = uTime*0.5;
        color.r += sin(ts)*0.02;
        color.g += cos(ts*1.4)*0.02;
        color.b += sin(ts*1.2)*0.02;
        float br2 = length(color);
        color = mix(uDarkNavy, color, max(br2*1.2, 0.15));
        color = clamp(color, vec3(0.0), vec3(1.0));
        float mb2 = 1.0; float b2 = length(color);
        if (b2 > mb2) color *= mb2/b2;
        gl_FragColor = vec4(color, 1.0);
      }
    `;

    /* ──────────────────────────────────────
       SceneManager 헬퍼
    ────────────────────────────────────── */
    const W = container.offsetWidth;
    const H = container.offsetHeight;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false, stencil: false, depth: false
    });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    // id 부여 → CSS #webGLApp 스타일 적용
    renderer.domElement.id = 'webGLApp';
    container.insertBefore(renderer.domElement, container.firstChild);

    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 10000);
    camera.position.z = 50;
    const scene  = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e27);

    function getViewSize() {
      const fov = (camera.fov * Math.PI) / 180;
      const h   = Math.abs(camera.position.z * Math.tan(fov / 2) * 2);
      return { width: h * camera.aspect, height: h };
    }

    /* ──────────────────────────────────────
       GradientBackground mesh
    ────────────────────────────────────── */
    const touchTexture = new TouchTexture();

    const uniforms = {
      uTime:         { value: 0 },
      uResolution:   { value: new THREE.Vector2(W, H) },
      uColor1:       { value: new THREE.Vector3(0.216, 0.000, 1.000) }, // #000000
      uColor2:       { value: new THREE.Vector3(0.102, 0.000, 0.600) }, // #000000
      uColor3:       { value: new THREE.Vector3(0.118, 0.000, 1.000) }, // #47311F
      uColor4:       { value: new THREE.Vector3(0.000, 1.000, 0.251) }, // #182239
      uColor5:       { value: new THREE.Vector3(0.051, 0.000, 0.302) }, // #1E625D
      uColor6:       { value: new THREE.Vector3(1.000, 0.918, 0.000) }, //  #000000
      uSpeed:        { value: 1.5 },
      uIntensity:    { value: 1.8 },
      uTouchTexture: { value: touchTexture.texture },
      uGrainIntensity: { value: 0.08 },
      uDarkNavy:     { value: new THREE.Vector3(0.051, 0.000, 0.302) }, // #0D004D
      uGradientSize: { value: 0.45 },
      uGradientCount:{ value: 12.0 },
      uColor1Weight: { value: 1.0  },
      uColor2Weight: { value: 1.0  }
    };

    const vs = getViewSize();
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(vs.width, vs.height, 1, 1),
      new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader })
    );
    scene.add(mesh);

    /* ──────────────────────────────────────
       마우스 / 터치 이벤트  (container 기준)
    ────────────────────────────────────── */
    function getRelativePos(clientX, clientY) {
      const rect = container.getBoundingClientRect();
      return {
        x: (clientX - rect.left)  / rect.width,
        y: 1 - (clientY - rect.top) / rect.height
      };
    }
    container.addEventListener('mousemove', e => {
      touchTexture.addTouch(getRelativePos(e.clientX, e.clientY));
    });
    container.addEventListener('touchmove', e => {
      const t = e.touches[0];
      touchTexture.addTouch(getRelativePos(t.clientX, t.clientY));
    }, { passive: true });

    /* ──────────────────────────────────────
       리사이즈
    ────────────────────────────────────── */
    window.addEventListener('resize', () => {
      const nW = container.offsetWidth;
      const nH = container.offsetHeight;
      camera.aspect = nW / nH;
      camera.updateProjectionMatrix();
      renderer.setSize(nW, nH);
      uniforms.uResolution.value.set(nW, nH);
      const nvs = getViewSize();
      mesh.geometry.dispose();
      mesh.geometry = new THREE.PlaneGeometry(nvs.width, nvs.height, 1, 1);
    });

    /* ──────────────────────────────────────
       애니메이션 루프
    ────────────────────────────────────── */
    const clock = new THREE.Clock();
    function tick() {
      const delta = Math.min(clock.getDelta(), 0.1);
      uniforms.uTime.value += delta;
      touchTexture.update();
      renderer.render(scene, camera);
      requestAnimationFrame(tick);
    }
    tick();
  }
})();