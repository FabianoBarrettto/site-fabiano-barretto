/* Cena 3D do espelho de vendas (three.js). Carregada só quando a seção aparece na tela. */
import * as THREE from 'three';
import { OrbitControls } from './vendor/OrbitControls.js';
import { RoundedBoxGeometry } from './vendor/RoundedBoxGeometry.js';

const COR = { disponivel: 0xE8B84E, reservado: 0x4A7FB8, vendido: 0x9AA3AD, consulte: 0xB9C6D6 };
const MARINHO = 0x14304F, MARINHO2 = 0x1d4268;
const W = 3.1, H = 2.4, D = 3.2, CORR = 0.8, LAJE = 0.14;

function mat(cor, extra) { return new THREE.MeshStandardMaterial(Object.assign({ color: cor, roughness: 0.95, metalness: 0 }, extra || {})); }

function rotulo(texto) {
  const c = document.createElement('canvas'); c.width = 128; c.height = 64;
  const g = c.getContext('2d');
  g.fillStyle = 'rgba(255,255,255,.92)';
  g.beginPath(); g.roundRect ? g.roundRect(2, 2, 124, 60, 16) : g.rect(2, 2, 124, 60); g.fill();
  g.fillStyle = '#14304F'; g.font = '700 38px Montserrat, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(texto, 64, 34);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.4), new THREE.MeshBasicMaterial({ map: t, transparent: true }));
}

export function criarCena(palco, dados, cb) {
  const reduzir = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const canvas = renderer.domElement;
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', 'Prédio em 3D: gire e toque numa unidade para ver os detalhes. A lista de unidades logo abaixo traz as mesmas informações.');
  canvas.tabIndex = 0;
  palco.prepend(canvas);

  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xffffff, 0xaebdd0, 1.15));
  const sol = new THREE.DirectionalLight(0xffffff, 1.9); sol.position.set(9, 16, 11); scene.add(sol);
  const sol2 = new THREE.DirectionalLight(0xcfe0ff, 0.5); sol2.position.set(-10, 6, -9); scene.add(sol2);

  /* geometria vinda dos dados: unidades por lado, saguão central, cobertura */
  const geo = Object.assign({ largura: W, profundidade: D, saguao: 0, coroa: false }, dados.geometria || {});
  const UW = geo.largura, UD = geo.profundidade, HALL = geo.saguao;
  const todas = []; dados.andares.forEach(a => a.unidades.forEach(u => todas.push(Object.assign({ andar: a.andar }, u))));
  const temFundo = todas.some(u => u.lado === 'fundo');
  const nPos = Math.max(...todas.map(u => u.posicao)) + 1;
  const corr = temFundo ? CORR : 0;
  const larg = nPos * UW + HALL + 0.3, prof = (temFundo ? 2 * UD + corr : UD) + 0.3;
  const k = Math.max(1, larg / 6.8);

  /* entorno genérico: gramado, calçada, árvores e prédios baixos */
  const raio = Math.max(24, larg * 2.4);
  const chao = new THREE.Mesh(new THREE.CylinderGeometry(raio, raio, 0.4, 56), mat(0xdfe9df)); chao.position.y = -0.2; scene.add(chao);
  const calcada = new THREE.Mesh(new RoundedBoxGeometry(larg + 3.6, 0.16, prof + 3.6, 2, 0.06), mat(0xd3dae1)); calcada.position.y = 0.08; scene.add(calcada);
  const rnd = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
  function arvore(x, z, e) {
    const g = new THREE.Group();
    const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.12 * e, 0.16 * e, 1.1 * e, 6), mat(0x8a6a4a)); tr.position.y = 0.55 * e; g.add(tr);
    const fo = new THREE.Mesh(new THREE.IcosahedronGeometry(0.85 * e, 0), mat(rnd() > 0.5 ? 0x5d8f6a : 0x79a581, { flatShading: true })); fo.position.y = 1.5 * e; g.add(fo);
    g.position.set(x, 0, z); scene.add(g);
  }
  [[-6.8, 6.2], [6.9, 6.0], [-7.2, -5.5], [7.3, -6.4], [0, 9.2], [-3.2, -9.0], [4.2, -9.4], [-9.5, 0.5], [9.8, 1.5], [-5.4, 9.6], [6.1, 9.8]].forEach(p => arvore(p[0] * k, p[1] + (prof - 7.4) / 2 * Math.sign(p[1]), 0.9 + rnd() * 0.5));
  const cores = [0xcdd6df, 0xd9dfe6, 0xc3ced9, 0xe2e6ea];
  [[-14, 2, 4, 3.2, 5], [-13, -8, 5, 4.6, 4], [14, -3, 4.5, 3.6, 6], [13, 8, 4, 5.4, 4], [3, -15, 6, 3.4, 4], [-6, 15, 5, 4, 4.5]].forEach((b, i) => {
    const m = new THREE.Mesh(new RoundedBoxGeometry(b[2], b[3], b[4], 2, 0.1), mat(cores[i % 4])); m.position.set(b[0] * k, b[3] / 2, b[1] + (prof - 7.4) / 2 * Math.sign(b[1])); scene.add(m);
  });

  /* prédio */
  const predio = new THREE.Group(); predio.position.y = 0.16; scene.add(predio);
  const andares = dados.andares.slice().sort((a, b) => a.andar - b.andar);
  const nAnd = andares.length, passo = H + LAJE, total = nAnd * passo + LAJE;
  for (let i = 0; i <= nAnd; i++) {
    const laje = new THREE.Mesh(new RoundedBoxGeometry(larg, LAJE, prof, 2, 0.04), mat(MARINHO)); laje.position.y = i * passo + LAJE / 2; predio.add(laje);
  }
  const par = new THREE.Mesh(new RoundedBoxGeometry(larg, 0.35, prof, 2, 0.06), mat(MARINHO2)); par.position.y = total + 0.1; predio.add(par);
  const vidro = mat(0x2a4766, { roughness: 0.25, metalness: 0.1 });
  const guarda = mat(0xbfd8ee, { transparent: true, opacity: 0.45, roughness: 0.2 });
  if (temFundo) {
    const nucleo = new THREE.Mesh(new RoundedBoxGeometry(nPos * UW, total, corr, 2, 0.05), mat(MARINHO2)); nucleo.position.y = total / 2; predio.add(nucleo);
    const entrada = new THREE.Mesh(new RoundedBoxGeometry(1.0, 1.7, 0.12, 2, 0.05), mat(0x22364f)); entrada.position.set(0, 0.16 + 0.85, UD + corr / 2 + 0.02); predio.add(entrada);
  }
  if (HALL > 0) { /* saguão central: bloco marinho com porta no térreo e janelas nos andares */
    const sag = new THREE.Mesh(new RoundedBoxGeometry(HALL, total, UD - 0.05, 2, 0.06), mat(MARINHO2)); sag.position.set(0, total / 2, 0); predio.add(sag);
    for (let i = 0; i < nAnd; i++) {
      const j = new THREE.Mesh(new THREE.PlaneGeometry(HALL * 0.62, 1.0), vidro); j.position.set(0, LAJE + i * passo + H / 2 + (i === 0 ? 0.35 : 0.1), UD / 2 - 0.02 + 0.016); if (i > 0) predio.add(j);
      const jb = j.clone(); jb.position.z = -(UD / 2 - 0.02 + 0.016); jb.rotation.y = Math.PI; predio.add(jb);
    }
    const porta = new THREE.Mesh(new RoundedBoxGeometry(HALL * 0.62, 1.75, 0.1, 2, 0.04), mat(0x22364f)); porta.position.set(0, LAJE + 0.9, UD / 2 - 0.0 + 0.02); predio.add(porta);
    const marq = new THREE.Mesh(new RoundedBoxGeometry(HALL * 0.9, 0.08, 0.6, 2, 0.03), mat(0xf1f4f7)); marq.position.set(0, LAJE + 1.95, UD / 2 + 0.28); predio.add(marq);
  }
  const slotX = p => { const base = (p - (nPos - 1) / 2) * UW; return base + (HALL ? (p < nPos / 2 ? -HALL / 2 : HALL / 2) : 0); };
  /* coroa: platibanda mais alta sobre as colunas com sacada no último andar; caixa d'água branca ao centro */
  if (geo.coroa) {
    const topo = andares[nAnd - 1];
    topo.unidades.forEach(u => { if ((dados.tipos[u.tipo] || {}).sacada) { const c = new THREE.Mesh(new RoundedBoxGeometry(UW - 0.1, 0.7, UD - 0.1, 2, 0.08), mat(MARINHO2)); c.position.set(slotX(u.posicao), total + 0.5, 0); predio.add(c); } });
    const cx = new THREE.Mesh(new RoundedBoxGeometry(Math.max(1.2, HALL), 0.6, UD * 0.5, 2, 0.06), mat(0xe9eef2)); cx.position.set(0, total + 0.5, 0); predio.add(cx);
  }

  const pick = [], grupos = new Map();
  andares.forEach((a, ia) => {
    a.unidades.forEach(u => {
      const lado = u.lado === 'fundo' ? -1 : 1;
      const g = new THREE.Group();
      const x = slotX(u.posicao);
      const z = temFundo ? lado * (UD / 2 + corr / 2) : 0;
      const y = LAJE + ia * passo + H / 2;
      g.position.set(x, y, z);
      g.userData.num = u.numero;
      const corCls = COR[u.status] || COR.disponivel;
      const corpoMat = mat(corCls);
      const corpo = new THREE.Mesh(new RoundedBoxGeometry(UW - 0.1, H, UD - 0.1, 3, 0.1), corpoMat);
      g.add(corpo);
      const tipo = dados.tipos[u.tipo] || {};
      const face = lado * (UD / 2 - 0.05);
      const janW = tipo.sacada ? 1.2 : 1.3;
      const jan = new THREE.Mesh(new THREE.PlaneGeometry(janW, tipo.sacada ? 1.7 : 1.0), vidro);
      jan.position.set(tipo.sacada ? -0.3 : -0.3, tipo.sacada ? -0.2 : 0.1, face + lado * 0.012); if (lado < 0) jan.rotation.y = Math.PI;
      g.add(jan);
      const jan2 = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.9), vidro);
      jan2.position.set(0.8, 0.15, face + lado * 0.012); if (lado < 0) jan2.rotation.y = Math.PI;
      g.add(jan2);
      if (!temFundo) { /* janelas decorativas nos fundos */
        const jf = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.9), vidro); jf.position.set(0, 0.15, -(UD / 2 - 0.05) - 0.012); jf.rotation.y = Math.PI; g.add(jf);
      }
      if (tipo.sacada) {
        const laje = new THREE.Mesh(new RoundedBoxGeometry(UW - 0.5, 0.1, 0.9, 2, 0.04), mat(0xf1f4f7)); laje.position.set(0, -H / 2 + 0.05, lado * (UD / 2 + 0.38)); g.add(laje);
        const gd = new THREE.Mesh(new THREE.BoxGeometry(UW - 0.5, 0.7, 0.04), guarda); gd.position.set(0, -H / 2 + 0.45, lado * (UD / 2 + 0.8)); g.add(gd);
      }
      if (!dados.semNumeracao) { const r = rotulo(u.numero); r.position.set(0.85, H / 2 - 0.35, face + lado * 0.02); if (lado < 0) { r.rotation.y = Math.PI; r.position.x = -0.85; } g.add(r); }
      g.traverse(o => { if (o.isMesh) { o.userData.num = u.numero; pick.push(o); } });
      const cont = new THREE.LineSegments(new THREE.EdgesGeometry(corpo.geometry, 30), new THREE.LineBasicMaterial({ color: 0xffffff })); cont.visible = false; g.add(cont); g.userData.contorno = cont;
      g.userData.corpoMat = corpoMat; g.userData.cor = corCls;
      predio.add(g); grupos.set(u.numero, g);
    });
  });

  /* câmera e controles */
  const camera = new THREE.PerspectiveCamera(38, 1, 0.5, 120);
  const alvo0 = new THREE.Vector3(0, total / 2 + 0.2, 0);
  const controls = new OrbitControls(camera, canvas);
  controls.target.copy(alvo0);
  controls.enableDamping = true; controls.dampingFactor = 0.08;
  controls.enablePan = false; controls.rotateSpeed = 0.7; controls.zoomSpeed = 0.8;
  controls.minPolarAngle = 0.35; controls.maxPolarAngle = Math.PI / 2 - 0.06;
  controls.autoRotate = !reduzir; controls.autoRotateSpeed = 0.9;
  let dirty = true, anim = null, ativo = true, raf = 0, visivel = true, desloc = 0;
  function aplicarView() { const w = palco.clientWidth || 300, h = palco.clientHeight || 300; if (desloc) camera.setViewOffset(w, h, desloc, 0, w, h); else camera.clearViewOffset(); camera.updateProjectionMatrix(); dirty = true; }
  function ajustar() {
    const w = palco.clientWidth || 300, h = palco.clientHeight || 300, asp = w / h;
    renderer.setSize(w, h, false); camera.aspect = asp;
    const ef = larg * 0.75 + prof * 0.66, dist = Math.max(18, Math.min(70, Math.max(ef / (0.8 * 0.688 * Math.min(asp, 1.7)), (total + 3) / (0.8 * 0.688))));
    controls.minDistance = dist * 0.5; controls.maxDistance = dist * 1.35;
    if (!ajustar.feito) { camera.position.set(dist * 0.62, dist * 0.42, dist * 0.7); ajustar.feito = true; }
    camera.updateProjectionMatrix(); aplicarView();
  }
  const ro = new ResizeObserver(ajustar); ro.observe(palco); ajustar();
  controls.addEventListener('start', () => { controls.autoRotate = false; cb.aoInteragir && cb.aoInteragir(); });
  controls.addEventListener('change', () => { dirty = true; });

  /* seleção e destaque */
  let sel = null, hov = null;
  function pintar(num) {
    const g = grupos.get(num); if (!g) return;
    const e = num === sel ? 0.5 : (num === hov ? 0.2 : 0);
    g.userData.contorno.visible = num === sel;
    g.userData.corpoMat.emissive.setHex(g.userData.cor); g.userData.corpoMat.emissiveIntensity = e;
    const s = num === sel ? 1.045 : 1; g.scale.set(s, s, s);
  }
  function selecionar(num, focar) {
    const antes = sel; sel = num; if (antes) pintar(antes); if (num) pintar(num);
    if (num && focar !== false) {
      const g = grupos.get(num), alvo = new THREE.Vector3(g.position.x * 0.5, g.position.y + predio.position.y, g.position.z * 0.3);
      if (reduzir) controls.target.copy(alvo); else anim = { de: controls.target.clone(), para: alvo, t0: performance.now(), dur: 500 };
      controls.autoRotate = false;
    }
    dirty = true;
  }
  const ray = new THREE.Raycaster(), p = new THREE.Vector2();
  function alvoEm(ev) {
    const r = canvas.getBoundingClientRect();
    p.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(p, camera);
    const h = ray.intersectObjects(pick, false)[0];
    return h ? h.object.userData.num : null;
  }
  let ini = null;
  canvas.addEventListener('pointerdown', ev => { ini = { x: ev.clientX, y: ev.clientY, t: performance.now() }; });
  canvas.addEventListener('pointerup', ev => {
    if (!ini) return;
    const mov = Math.hypot(ev.clientX - ini.x, ev.clientY - ini.y), dt = performance.now() - ini.t; ini = null;
    if (mov < 7 && dt < 600) { const n = alvoEm(ev); if (n) cb.aoSelecionar(n); }
  });
  canvas.addEventListener('pointermove', ev => {
    if (ev.pointerType !== 'mouse' || ev.buttons) return;
    const n = alvoEm(ev);
    if (n !== hov) { const a = hov; hov = n; if (a) pintar(a); if (n) pintar(n); palco.classList.toggle('hover', !!n); dirty = true; }
  });
  canvas.addEventListener('pointerleave', () => { if (hov) { const a = hov; hov = null; pintar(a); palco.classList.remove('hover'); dirty = true; } });

  function loop(now) {
    if (!ativo) return;
    raf = requestAnimationFrame(loop);
    if (!visivel) return;
    if (anim) {
      const k = Math.min(1, (now - anim.t0) / anim.dur), e = 1 - Math.pow(1 - k, 3);
      controls.target.lerpVectors(anim.de, anim.para, e); if (k >= 1) anim = null; dirty = true;
    }
    const mudou = controls.update();
    if (mudou || dirty) { renderer.render(scene, camera); dirty = false; }
  }
  raf = requestAnimationFrame(loop);
  const io = new IntersectionObserver(es => { visivel = es[0].isIntersecting; if (visivel) dirty = true; });
  io.observe(palco);
  document.addEventListener('visibilitychange', () => { visivel = !document.hidden; dirty = true; });

  return {
    selecionar,
    deslocar(px) { desloc = px; aplicarView(); },
    destruir() { ativo = false; cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); controls.dispose(); renderer.dispose(); canvas.remove(); }
  };
}
