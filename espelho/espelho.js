/* Espelho de vendas interativo: dados + cartão + lista acessível. A cena 3D (cena.js) só carrega quando a seção aparece. */
const WA = 'https://wa.me/5551985738049';
const ROTULO = { disponivel: 'Disponível', reservado: 'Reservado', vendido: 'Vendido', consulte: 'Consulte' };
const brl = n => 'R$ ' + Number(n).toLocaleString('pt-BR');
const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };

const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
export async function iniciarEspelho(raiz) {
  const base = raiz.dataset.base || '';
  const palco = raiz.querySelector('.espelho-palco'), cartao = raiz.querySelector('.unidade-cartao'), corpoTab = raiz.querySelector('tbody');
  const dados = await (await fetch(raiz.dataset.json)).json();
  const unidades = [];
  dados.andares.forEach(a => a.unidades.forEach(u => unidades.push(Object.assign({ andar: a.andar }, u))));
  const porNum = new Map(unidades.map(u => [u.numero, u]));
  const abaixo = raiz.dataset.cartao === 'abaixo';
  let cena = null, atual = null;
  const sem = !!dados.semNumeracao;
  const andarNome = u => (u.andar === 1 && dados.terreo) ? 'Térreo' : u.andar + 'º andar';
  const posNome = u => (dados.posicoes && dados.posicoes[u.posicao]) || (u.lado === 'fundo' ? 'fundos' : 'frente');
  const comSac = u => ((dados.tipos[u.tipo] || {}).sacada ? 'com sacada' : 'sem sacada');
  const nomeUn = u => sem ? andarNome(u) + ' · ' + comSac(u) + ' · ' + posNome(u) : 'Unidade ' + u.numero;

  /* fallback (sem WebGL): foto do prédio */
  const fb = palco.querySelector('.espelho-fallback img');
  if (fb && dados.fallback) fb.src = base + dados.fallback;

  /* legenda só com as situações usadas */
  const leg = raiz.querySelector('.espelho-legenda');
  if (leg) { leg.replaceChildren(); [...new Set(unidades.map(u => u.status))].forEach(s => { const li = el('li'); li.appendChild(el('span', 'pt pt-' + s)); li.appendChild(document.createTextNode(ROTULO[s] || s)); leg.appendChild(li); }); }
  const tit = raiz.querySelector('#esp-tit'); if (sem) { const th = raiz.querySelector('.tabela-uni thead tr'); if (th) { th.replaceChildren(); ['Andar', 'Posição', 'Área', 'Sacada', 'Situação', 'Valor'].forEach((x, i) => { const c = el('th', i === 5 ? 'col-valor' : null, x); th.appendChild(c); }); } }
  if (tit && dados.titulo) tit.textContent = 'Escolha sua unidade';
  if (dados.exemplo === false) { const av = raiz.querySelector('.espelho-aviso'); if (av) av.hidden = false; }

  /* lista acessível */
  unidades.slice().sort((a, b) => a.andar - b.andar || a.numero.localeCompare(b.numero)).forEach(u => {
    const t = dados.tipos[u.tipo] || {};
    const tr = el('tr'); tr.dataset.num = u.numero;
    const b = el('button', null, sem ? cap(posNome(u)) : u.numero); b.type = 'button'; b.setAttribute('aria-label', 'Ver detalhes: ' + nomeUn(u));
    b.addEventListener('click', () => selecionar(u.numero));
    const td0 = el('td'); td0.appendChild(b); if (sem) { tr.appendChild(el('td', null, andarNome(u))); tr.appendChild(td0); } else tr.appendChild(td0);
    [sem ? null : u.andar + 'º', t.area ? t.area + ' m²' : '—', t.sacada ? 'Sim' : 'Não', ROTULO[u.status] || u.status, typeof u.valorAPartir === 'number' ? brl(u.valorAPartir) : '—'].forEach((x, i) => { if (x === null) return; const td = el('td', i === 4 ? 'col-valor' : null, x); tr.appendChild(td); });
    corpoTab.appendChild(tr);
  });

  /* ampliação da planta ao tocar */
  const dlg = document.createElement('dialog'); dlg.className = 'planta-zoom';
  const zimg = el('img'); const zfechar = el('button', 'fechar', '×'); zfechar.type = 'button'; zfechar.setAttribute('aria-label', 'Fechar planta ampliada');
  dlg.append(zfechar, zimg); raiz.appendChild(dlg);
  zfechar.addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
  function ampliar(src, alt) { zimg.src = src; zimg.alt = alt; if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', ''); }

  function abrirCartao(u) {
    const t = dados.tipos[u.tipo] || {};
    cartao.replaceChildren();
    const fechar = el('button', 'fechar', '×'); fechar.type = 'button'; fechar.setAttribute('aria-label', 'Fechar cartão da unidade');
    fechar.addEventListener('click', () => selecionar(null));
    cartao.appendChild(fechar);
    cartao.appendChild(el('h3', null, sem ? andarNome(u) + ' · ' + posNome(u) : 'Unidade ' + u.numero));
    cartao.appendChild(el('span', 'chip chip-' + u.status, ROTULO[u.status] || u.status));
    const dl = el('dl', 'u-dados');
    [['Andar', andarNome(u)], ['Metragem', t.area ? t.area + ' m²' : '—'], ['Sacada', t.sacada ? 'Sim' : 'Não'], ['Posição', sem ? cap(posNome(u)) : (u.lado === 'fundo' ? 'Fundos' : 'Frente')]].forEach(([k, v]) => { const d = el('div'); d.appendChild(el('dt', null, k)); d.appendChild(el('dd', null, v)); dl.appendChild(d); });
    cartao.appendChild(dl);
    if (typeof u.valorAPartir === 'number') cartao.appendChild(el('p', 'imovel-preco', 'a partir de ' + brl(u.valorAPartir) + ' · sujeito à aprovação de crédito'));
    if (t.planta || (t.fotos && t.fotos.length)) {
      const f = el('div', 'u-fotos'); f.setAttribute('aria-label', 'Planta e fotos internas do tipo de unidade');
      if (t.planta) { const im = el('img', 'u-planta'); im.src = t.planta.startsWith('./') ? t.planta : base + t.planta; im.alt = 'Planta ilustrativa da unidade tipo ' + (t.nome || ''); im.loading = 'lazy'; im.width = 400; im.height = 400; im.tabIndex = 0; im.setAttribute('role', 'button'); im.title = 'Toque para ampliar'; const abrir = () => ampliar(im.src, im.alt); im.addEventListener('click', abrir); im.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrir(); } }); f.appendChild(im); }
      (t.fotos || []).forEach((s, i) => { const im = el('img'); im.src = base + s; im.alt = 'Foto interna da unidade tipo ' + (t.nome || '') + ' (' + (i + 1) + ')'; im.loading = 'lazy'; im.width = 400; im.height = 300; f.appendChild(im); });
      cartao.appendChild(f);
    }
    if (u.status !== 'vendido') {
      const quem = sem ? 'na unidade do ' + andarNome(u).toLowerCase() + ', ' + comSac(u) + ', ' + posNome(u) : 'na unidade ' + u.numero + ' (' + u.andar + 'º andar)';
      const msg = 'Olá, Fabiano! Tenho interesse ' + quem + (sem ? ', do ' : ' do ') + dados.titulo + ', ' + dados.bairro + ', ' + dados.cidade + ' (ref. ' + dados.imovel + (sem ? '' : '/' + u.numero) + '). Pode me passar mais informações?';
      const a = el('a', 'btn btn-whatsapp', u.status === 'reservado' ? 'Perguntar se liberou' : (u.status === 'consulte' ? 'Perguntar disponibilidade' : 'Quero esta unidade'));
      a.href = WA + '?text=' + encodeURIComponent(msg); a.target = '_blank'; a.rel = 'noopener';
      cartao.appendChild(a);
    } else cartao.appendChild(el('p', null, 'Esta unidade já foi vendida. Fale comigo para ver as disponíveis.'));
    cartao.classList.add('aberto');
    if (abaixo || matchMedia('(max-width:759px)').matches) cartao.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  function selecionar(num, focar) {
    atual = num;
    corpoTab.querySelectorAll('tr').forEach(tr => tr.classList.toggle('sel', tr.dataset.num === num));
    if (num) abrirCartao(porNum.get(num)); else cartao.classList.remove('aberto');
    if (cena) { cena.selecionar(num, focar); cena.deslocar(num && !abaixo && matchMedia('(min-width:760px)').matches ? 170 : 0); }
  }
  const dica = palco.querySelector('.espelho-dica');
  raiz.addEventListener('keydown', e => { if (e.key === 'Escape' && atual) selecionar(null); });

  /* carrega a cena 3D só quando a seção entra na tela */
  const carregando = palco.querySelector('.espelho-carregando');
  async function carregar3D() {
    try {
      const m = await import('./cena.js');
      cena = m.criarCena(palco, dados, { aoSelecionar: n => selecionar(n), aoInteragir: () => dica && dica.classList.add('some') });
      if (atual) { cena.selecionar(atual); cena.deslocar(!abaixo && matchMedia('(min-width:760px)').matches ? 170 : 0); }
    } catch (e) { palco.classList.add('sem-3d'); }
    if (carregando) carregando.remove();
  }
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => { if (es[0].isIntersecting) { io.disconnect(); carregar3D(); } }, { rootMargin: '200px' });
    io.observe(palco);
  } else carregar3D();
  return { selecionar };
}
