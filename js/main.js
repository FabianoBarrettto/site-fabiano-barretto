/* Fabiano Barretto Imóveis — comportamento do site (sem dependências, sem rastreamento) */
(function () {
  'use strict';

  var WA_NUMERO = '5551985738049';
  var WA_BASE = 'https://wa.me/' + WA_NUMERO;

  function waLink(texto) {
    return WA_BASE + (texto ? '?text=' + encodeURIComponent(texto) : '');
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function brl(n) {
    return Number(n).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
  }

  /* ---------- Menu no celular ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('menu');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var aberto = nav.classList.toggle('aberto');
      toggle.setAttribute('aria-expanded', aberto ? 'true' : 'false');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('aberto')) {
        nav.classList.remove('aberto');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }

  /* Ano no rodapé */
  var ano = document.getElementById('ano');
  if (ano) ano.textContent = new Date().getFullYear();

  /* ---------- Dados dos imóveis ---------- */
  function carregarImoveis() {
    return fetch('dados/imoveis.json', { cache: 'no-cache' })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (d) { return Array.isArray(d) ? d : (d.imoveis || []); });
  }

  function msgErro() {
    return '<div class="erro-dados"><p><strong>Não foi possível carregar os imóveis agora.</strong></p>' +
      '<p>Fale comigo no WhatsApp e eu te mostro as opções disponíveis.</p>' +
      '<a class="btn btn-whatsapp" href="' + waLink('Olá, Fabiano! Quero ver os imóveis disponíveis em Alvorada.') + '">Fale comigo no WhatsApp</a></div>';
  }

  function categoria(im) { return im.categoria === 'medio-alto' ? 'medio-alto' : 'mcmv'; }
  var NOME_CATEGORIA = { 'mcmv': 'Minha Casa Minha Vida', 'medio-alto': 'Médio e alto padrão' };

  function cardImovel(im) {
    var img = (im.imagens && im.imagens[0]) || { src: 'img/exemplo-casa.svg', alt: '' };
    var info = [esc(im.bairro)];
    if (im.areaM2) info.push(esc(im.areaM2) + ' m²');
    if (im.quartos) info.push(esc(im.quartos) + (im.quartos > 1 ? ' quartos' : ' quarto'));
    var alto = categoria(im) === 'medio-alto';
    var preco = '<p class="imovel-preco">a partir de <strong>' + brl(im.valorAPartir) + '</strong></p>' +
      (im.exemplo ? '<span class="valor-exemplo">Valor de exemplo</span>' : '');
    return '<a class="imovel-card' + (alto ? ' card-alto' : '') + '" href="imovel.html?id=' + encodeURIComponent(im.id) + '">' +
      '<div class="imovel-foto"><img src="' + esc(img.src) + '" alt="' + esc(img.alt) + '" loading="lazy" width="800" height="600">' +
      (im.etiqueta ? '<span class="etiqueta' + (alto ? ' etiqueta-alto' : '') + '">' + esc(im.etiqueta) + '</span>' : '') +
      (im.exemplo ? '<span class="selo selo-ilustrativa">Exemplo</span>' : '') + '</div>' +
      '<div class="imovel-corpo">' +
      '<h3 class="imovel-titulo">' + esc(im.titulo) + '</h3>' +
      '<span class="imovel-bairro">' + info.join(' · ') + '</span>' +
      (alto ? '<div class="preco-linha">' + preco + '</div>' : preco) +
      '</div></a>';
  }

  /* Destaques na página inicial: uma faixa por categoria */
  function faixaDestaques(el, cat, max) {
    if (!el) return;
    carregarImoveis().then(function (lista) {
      var sel = lista.filter(function (i) { return i.destaque && categoria(i) === cat; }).slice(0, max);
      el.innerHTML = sel.length ? sel.map(cardImovel).join('') :
        '<p class="vazio">Em breve, novos imóveis por aqui. Fale comigo no WhatsApp para saber das oportunidades.</p>';
    }).catch(function () { el.innerHTML = msgErro(); });
  }
  faixaDestaques(document.getElementById('destaques'), 'mcmv', 4);
  faixaDestaques(document.getElementById('destaques-alto'), 'medio-alto', 3);

  /* Busca da página inicial: preenche os bairros a partir do cadastro */
  var buscaBairro = document.getElementById('b-bairro');
  if (buscaBairro) {
    carregarImoveis().then(function (lista) {
      bairrosDe(lista).forEach(function (b) {
        var o = document.createElement('option');
        o.value = b; o.textContent = b; buscaBairro.appendChild(o);
      });
    }).catch(function () { /* a busca continua funcionando sem a lista de bairros */ });
  }

  function bairrosDe(lista) {
    var bairros = [];
    lista.forEach(function (i) { if (i.bairro && bairros.indexOf(i.bairro) < 0) bairros.push(i.bairro); });
    return bairros.sort(function (a, b) { return a.localeCompare(b, 'pt-BR'); });
  }

  /* Lista com filtros */
  var lista = document.getElementById('lista-imoveis');
  if (lista) {
    var fCategoria = document.getElementById('f-categoria');
    var fTipo = document.getElementById('f-tipo');
    var fBairro = document.getElementById('f-bairro');
    var fValor = document.getElementById('f-valor');
    var fQuartos = document.getElementById('f-quartos');
    var contagem = document.getElementById('contagem');
    var todos = [];
    var params = new URLSearchParams(location.search);

    function preencher(sel, valor) {
      if (!valor) return;
      for (var n = 0; n < sel.options.length; n++) {
        if (sel.options[n].value === valor) { sel.value = valor; return; }
      }
    }

    function aplicar() {
      var c = fCategoria.value, t = fTipo.value, b = fBairro.value, v = Number(fValor.value) || 0, q = Number(fQuartos.value) || 0;
      var res = todos.filter(function (i) {
        return (!c || categoria(i) === c) && (!t || i.tipo === t) && (!b || i.bairro === b) &&
          (!v || i.valorAPartir <= v) && (!q || i.quartos >= q);
      });
      contagem.textContent = res.length === 1 ? '1 imóvel encontrado' : res.length + ' imóveis encontrados';
      lista.innerHTML = res.length ? res.map(cardImovel).join('') :
        '<div class="vazio" style="grid-column:1/-1"><p><strong>Nenhum imóvel com esses filtros.</strong></p><p>Fale comigo: posso avisar quando chegar algo que combine com o que você procura.</p>' +
        '<a class="btn btn-whatsapp" href="' + waLink('Olá, Fabiano! Não achei no site o imóvel que procuro. Pode me ajudar?') + '">Fale comigo no WhatsApp</a></div>';
    }

    carregarImoveis().then(function (d) {
      todos = d;
      bairrosDe(d).forEach(function (b) {
        var o = document.createElement('option');
        o.value = b; o.textContent = b; fBairro.appendChild(o);
      });
      /* Filtros vindos da busca da página inicial (imoveis.html?categoria=...&tipo=...) */
      preencher(fCategoria, params.get('categoria'));
      preencher(fTipo, params.get('tipo'));
      preencher(fBairro, params.get('bairro'));
      preencher(fValor, params.get('valor'));
      preencher(fQuartos, params.get('quartos'));
      [fCategoria, fTipo, fBairro, fValor, fQuartos].forEach(function (el) { el.addEventListener('change', aplicar); });
      aplicar();
    }).catch(function () { lista.innerHTML = msgErro(); contagem.textContent = ''; });
  }

  /* Página de detalhe */
  var detalhe = document.getElementById('detalhe-imovel');
  if (detalhe) {
    var id = new URLSearchParams(location.search).get('id');
    carregarImoveis().then(function (d) {
      var im = d.filter(function (i) { return i.id === id; })[0];
      if (!im) {
        detalhe.innerHTML = '<div class="vazio"><p><strong>Imóvel não encontrado.</strong></p><p>Ele pode ter sido vendido ou o link mudou.</p>' +
          '<a class="btn btn-marinho" href="imoveis.html">Ver todos os imóveis</a></div>';
        return;
      }
      renderDetalhe(im);
    }).catch(function () { detalhe.innerHTML = msgErro(); });
  }

  function renderDetalhe(im) {
    var imgs = im.imagens || [];
    var msg = 'Olá, Fabiano! Tenho interesse no imóvel "' + im.titulo + '" (' + im.bairro + ', ' + im.cidade + ') que vi no seu site. Ref.: ' + im.id + '. Pode me passar mais informações?';
    if (im.exemplo) msg = 'Olá, Fabiano! Vi no seu site um imóvel de exemplo ("' + im.titulo + '") e quero conhecer as opções reais disponíveis.';

    document.title = im.titulo + ' em ' + im.bairro + ', Alvorada RS | Fabiano Barretto Imóveis';
    var md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute('content', im.titulo + ' em ' + im.bairro + ', Alvorada RS, a partir de ' + brl(im.valorAPartir) + '. ' + NOME_CATEGORIA[categoria(im)] + ', sujeito à aprovação de crédito.');

    if (im.exemplo) {
      var robots = document.createElement('meta');
      robots.name = 'robots'; robots.content = 'noindex';
      document.head.appendChild(robots);
    }

    var fichas = [];
    if (im.quartos) fichas.push(['Quartos', im.quartos]);
    if (im.banheiros) fichas.push(['Banheiros', im.banheiros]);
    if (im.vagas) fichas.push(['Vagas', im.vagas]);
    if (im.areaM2) fichas.push(['Área', im.areaM2 + ' m²']);

    var html = '<p class="migalhas"><a href="index.html">Início</a> › <a href="imoveis.html">Imóveis</a> › ' + esc(im.titulo) + '</p>' +
      '<div class="imovel-detalhe"><div>' +
      '<div class="galeria"><div class="galeria-principal">' +
      (imgs[0] ? '<img id="foto-principal" src="' + esc(imgs[0].src) + '" alt="' + esc(imgs[0].alt) + '" width="800" height="600">' : '') +
      (im.etiqueta ? '<span class="etiqueta' + (categoria(im) === 'medio-alto' ? ' etiqueta-alto' : '') + '">' + esc(im.etiqueta) + '</span>' : '') +
      (im.exemplo ? '<span class="selo selo-ilustrativa">Imagem ilustrativa</span>' : '') +
      '</div>';
    if (imgs.length > 1) {
      html += '<div class="miniaturas">' + imgs.map(function (g, n) {
        return '<button type="button" data-n="' + n + '" aria-label="Ver foto ' + (n + 1) + '"' + (n === 0 ? ' aria-current="true"' : '') + '><img src="' + esc(g.src) + '" alt="" loading="lazy"></button>';
      }).join('') + '</div>';
    }
    html += '</div>';
    if (im.exemplo) {
      html += '<div class="caixa-aviso"><strong>Imóvel de exemplo.</strong> Este anúncio é fictício e mostra como os imóveis aparecerão no site. Valores, bairro e imagens não correspondem a um imóvel real à venda.</div>';
    }
    html += '<h2>Sobre o imóvel</h2><p>' + esc(im.descricao) + '</p>';
    if (im.caracteristicas && im.caracteristicas.length) {
      html += '<h3>Características</h3><ul class="lista-check">' + im.caracteristicas.map(function (c) { return '<li>' + esc(c) + '</li>'; }).join('') + '</ul>';
    }
    if (im.planta) {
      html += '<h3 style="margin-top:28px">Planta</h3><img src="' + esc(im.planta.src) + '" alt="' + esc(im.planta.alt) + '" loading="lazy" width="800" height="600" style="border-radius:14px;border:1px solid var(--borda)">';
    }
    html += '</div><aside class="painel-lateral card"><div class="card-corpo">' +
      '<span class="eyebrow" style="margin:0">' + esc(NOME_CATEGORIA[categoria(im)]) + '</span>' +
      '<span class="imovel-bairro" style="display:block">' + esc(im.tipo) + ' · ' + esc(im.bairro) + ', ' + esc(im.cidade) + '</span>' +
      '<h1 style="font-size:1.6rem;margin:8px 0 14px">' + esc(im.titulo) + '</h1>' +
      '<p class="imovel-preco" style="margin:0">a partir de</p><p class="preco-grande">' + brl(im.valorAPartir) + '</p>' +
      '<ul class="ficha">' + fichas.map(function (f) { return '<li>' + esc(f[0]) + '<strong>' + esc(f[1]) + '</strong></li>'; }).join('') + '</ul>' +
      '<a class="btn btn-whatsapp btn-bloco" href="' + waLink(msg) + '" target="_blank" rel="noopener"><img src="img/whatsapp.svg" alt="" width="22" height="22">Quero este imóvel</a>' +
      '<p class="aviso-pequeno" style="margin-top:14px">Valores a partir de, sujeitos a alteração e à aprovação de crédito.' +
      (categoria(im) === 'mcmv' ? ' Condições do Minha Casa Minha Vida conforme regras vigentes.' : '') + '</p>' +
      '<a class="btn btn-contorno btn-bloco" style="margin-top:6px" href="simulacao.html">Fazer simulação gratuita</a>' +
      '</div></aside></div>';
    detalhe.innerHTML = html;

    var principal = document.getElementById('foto-principal');
    detalhe.querySelectorAll('.miniaturas button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var g = imgs[Number(btn.getAttribute('data-n'))];
        principal.src = g.src; principal.alt = g.alt;
        detalhe.querySelectorAll('.miniaturas button').forEach(function (b) { b.removeAttribute('aria-current'); });
        btn.setAttribute('aria-current', 'true');
      });
    });

    /* Marcação schema.org só para imóveis reais (nunca para exemplos) */
    if (!im.exemplo) {
      var ld = {
        '@context': 'https://schema.org',
        '@type': 'Residence',
        name: im.titulo,
        description: im.descricao,
        numberOfRooms: im.quartos,
        floorSize: im.areaM2 ? { '@type': 'QuantitativeValue', value: im.areaM2, unitCode: 'MTK' } : undefined,
        address: { '@type': 'PostalAddress', addressLocality: im.cidade, addressRegion: 'RS', addressCountry: 'BR', streetAddress: im.bairro },
        image: imgs.length ? imgs[0].src : undefined
      };
      var s = document.createElement('script');
      s.type = 'application/ld+json';
      s.textContent = JSON.stringify(ld);
      document.head.appendChild(s);
    }
  }

  /* ---------- Formulário de simulação ---------- */
  var form = document.getElementById('form-simulacao');
  if (form) {
    var campoTel = form.elements['telefone'];
    campoTel.addEventListener('input', function () {
      var d = campoTel.value.replace(/\D/g, '').slice(0, 11);
      var f = d;
      if (d.length > 6) f = '(' + d.slice(0, 2) + ') ' + d.slice(2, d.length - 4) + '-' + d.slice(-4);
      else if (d.length > 2) f = '(' + d.slice(0, 2) + ') ' + d.slice(2);
      campoTel.value = f;
    });

    function marcar(nome, ok) {
      var el = form.elements[nome];
      var campo = el.closest('.campo');
      campo.classList.toggle('invalido', !ok);
      el.setAttribute('aria-invalid', ok ? 'false' : 'true');
      return ok;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var nome = form.elements['nome'].value.trim();
      var tel = form.elements['telefone'].value;
      var renda = form.elements['renda'].value;
      var okNome = marcar('nome', nome.length >= 2);
      var digitos = tel.replace(/\D/g, '');
      var okTel = marcar('telefone', digitos.length === 10 || digitos.length === 11);
      var okRenda = marcar('renda', renda !== '');
      var okCons = marcar('consentimento', form.elements['consentimento'].checked);
      if (!(okNome && okTel && okRenda && okCons)) {
        var primeiro = form.querySelector('.invalido input, .invalido select');
        if (primeiro) primeiro.focus();
        return;
      }
      var msg = 'Olá, Fabiano! Quero fazer minha simulação gratuita do Minha Casa Minha Vida.\n' +
        'Nome: ' + nome + '\n' +
        'Meu WhatsApp: ' + tel + '\n' +
        'Renda familiar aproximada: ' + renda + '\n' +
        '(mensagem enviada pelo formulário do site)';
      var url = waLink(msg);
      var conf = document.getElementById('confirmacao');
      conf.hidden = false;
      conf.querySelector('a').href = url;
      conf.focus();
      window.open(url, '_blank', 'noopener');
    });
  }
})();
