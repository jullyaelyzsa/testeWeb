const API = 'http://localhost:3001/personagens';
const CHAVE_FAVORITOS = 'mitica:favoritos';
const REGIOES = ['Todas', 'Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul'];
let dados = [], busca = '', regiao = 'Todas';
const app = document.getElementById('app');

/* ---------- tema claro/escuro ---------- */
const CHAVE_TEMA = 'mitica:tema';
const botaoTema = document.getElementById('tema-toggle');
function atualizarControleTema() {
  const claro = document.documentElement.dataset.theme === 'light';
  const rotulo = claro ? 'Ativar modo escuro' : 'Ativar modo claro';
  botaoTema.setAttribute('aria-label', rotulo);
  botaoTema.title = rotulo;
  botaoTema.querySelector('span').textContent = claro ? '☾' : '☀';
}
atualizarControleTema();
botaoTema.addEventListener('click', () => {
  const tema = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
  document.documentElement.dataset.theme = tema;
  try { localStorage.setItem(CHAVE_TEMA, tema); } catch {}
  atualizarControleTema();
});

const modelo = id => document.getElementById(id).content.cloneNode(true);
const norm = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

/* ---------- favoritos (localStorage) ---------- */
function lerFavoritos() {
  try {
    const lista = JSON.parse(localStorage.getItem(CHAVE_FAVORITOS) ?? '[]');
    return Array.isArray(lista) ? lista : [];
  } catch { return []; }
}
const gravarFavoritos = ids => {
  try { localStorage.setItem(CHAVE_FAVORITOS, JSON.stringify(ids)); } catch {}
};
const ehFavorito = id => lerFavoritos().includes(id);
function alternarFavorito(id) {
  const lista = lerFavoritos();
  gravarFavoritos(lista.includes(id) ? lista.filter(x => x !== id) : [...lista, id]);
}

/* ---------- regras que aparecem em mais de um lugar ---------- */
const textoBotaoFavorito = salvo => (salvo ? '♥ Favoritado' : '♡ Favoritar');

function atualizarBotaoFavorito(botao, p) {
  const salvo = ehFavorito(p.id);
  botao.textContent = textoBotaoFavorito(salvo);
  botao.classList.toggle('off', salvo);
  botao.setAttribute('aria-pressed', String(salvo));
  botao.setAttribute('aria-label', `${salvo ? 'Desfavoritar' : 'Favoritar'} ${p.nome}`);
}

function preencherImagem(img, p) {
  if (!p.imagem) { img.remove(); return; }
  img.src = p.imagem;
  img.addEventListener('error', () => img.remove(), { once: true }); // imagem quebrada: fica o emoji
}

function preencherLista(ul, itens, criar, mensagemVazia) {
  ul.replaceChildren();
  if (!itens.length) {
    const li = document.createElement('li');
    li.className = 'vazio';
    li.textContent = mensagemVazia;
    ul.append(li);
    return;
  }
  ul.append(...itens.map(criar));
}

/* ---------- peças (cada uma clona um <template>) ---------- */
function criarCard(p) {
  const f = modelo('modelo-card');
  f.querySelector('.card').dataset.r = p.regiao;
  f.querySelector('.emoji').textContent = p.emoji;
  preencherImagem(f.querySelector('img'), p);
  const link = f.querySelector('h3 a');
  link.textContent = p.nome;
  link.href = `#/personagem/${encodeURIComponent(p.id)}`;
  f.querySelector('.tag').textContent = p.regiao;
  return f;
}

function criarFavorito(p) {
  const f = modelo('modelo-favorito');
  const link = f.querySelector('a');
  link.textContent = `${p.emoji} ${p.nome}`;
  link.href = `#/personagem/${encodeURIComponent(p.id)}`;
  const botao = f.querySelector('button');
  botao.setAttribute('aria-label', `Remover ${p.nome} dos favoritos`);
  botao.addEventListener('click', () => { alternarFavorito(p.id); renderizarFavoritos(); });
  return f;
}

/* ---------- telas ---------- */
function atualizarLista() {
  const q = norm(busca);
  const itens = dados.filter(p => (regiao === 'Todas' || p.regiao === regiao) &&
    (norm(p.nome).includes(q) || norm(p.regiao).includes(q)));
  preencherLista(document.getElementById('lista'), itens, criarCard, 'Nenhuma lenda encontrada.');
}

function telaLista() {
  const f = modelo('modelo-lista');
  f.getElementById('total').textContent = `✦ ${dados.length} lendas catalogadas`;
  const chips = f.getElementById('chips');
  REGIOES.forEach(r => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip' + (r === regiao ? ' on' : '');
    b.textContent = r;
    b.setAttribute('aria-pressed', String(r === regiao));
    b.addEventListener('click', () => {
      regiao = r;
      chips.querySelectorAll('.chip').forEach(c => {
        const selecionado = c.textContent === r;
        c.classList.toggle('on', selecionado);
        c.setAttribute('aria-pressed', String(selecionado));
      });
      atualizarLista();
    });
    chips.append(b);
  });
  app.replaceChildren(f);
  atualizarLista();
}

function telaDetalhe(id) {
  const p = dados.find(x => String(x.id) === id);
  if (!p) { location.hash = '#/'; return; }
  const f = modelo('modelo-detalhe');
  f.querySelector('.det').dataset.r = p.regiao;
  f.querySelector('.emoji').textContent = p.emoji;
  preencherImagem(f.querySelector('img'), p);
  f.querySelector('h1').textContent = p.nome;
  f.querySelector('.meta').textContent = `${p.tipo} · ${p.regiao} · ${p.origem}`;
  const botao = f.querySelector('.btn');
  atualizarBotaoFavorito(botao, p);
  botao.addEventListener('click', () => { alternarFavorito(p.id); atualizarBotaoFavorito(botao, p); });
  f.querySelector('.sinopse').textContent = p.sinopse;
  const historia = f.querySelector('.historia');
  p.historia.split('\n\n').forEach(texto => {
    const par = document.createElement('p');
    par.textContent = texto;
    historia.append(par);
  });
  const parecidas = p.semelhantes.map(i => dados.find(x => x.id === i)).filter(Boolean);
  preencherLista(f.querySelector('.parecidas'), parecidas, criarCard, 'Ainda não há histórias parecidas.');
  app.replaceChildren(f);
  document.title = `${p.nome} · Mítica`;
}

function renderizarFavoritos() {
  const itens = lerFavoritos().map(id => dados.find(x => x.id === id)).filter(Boolean);
  preencherLista(document.getElementById('lista-fav'), itens, criarFavorito, 'Você ainda não favoritou nenhuma lenda.');
}

function telaFavoritos() {
  app.replaceChildren(modelo('modelo-favoritos'));
  renderizarFavoritos();
}

function rotear() {
  const h = location.hash;
  document.title = 'Mítica · Bestiário do folclore brasileiro';
  if (h.startsWith('#/personagem/')) {
    try {
      telaDetalhe(decodeURIComponent(h.split('/')[2]));
    } catch {
      location.hash = '#/';
      return;
    }
  } else if (h === '#/favoritos') telaFavoritos();
  else telaLista();
  window.scrollTo(0, 0);
}

/* ---------- eventos e carga dos dados ---------- */
document.getElementById('busca').addEventListener('input', e => {
  busca = e.target.value;
  if (document.getElementById('lista')) atualizarLista(); else location.hash = '#/';
});
window.addEventListener('hashchange', rotear);

fetch(API).then(r => {
  if (!r.ok) throw new Error(`API respondeu com ${r.status}`);
  return r.json();
})
  .catch(erroApi => {
    console.warn('Não foi possível carregar a API. Tentando o banco local.', erroApi);
    return fetch('./db.json').then(r => {
    if (!r.ok) throw new Error(`Banco local respondeu com ${r.status}`);
    return r.json();
    }).then(j => j.personagens);
  })
  .then(d => { dados = d; rotear(); })
  .catch(() => {
    const p = document.createElement('p');
    p.className = 'vazio';
    p.textContent = 'Não foi possível carregar os personagens. Verifique se o arquivo db.json está disponível ou execute npm run api.';
    app.replaceChildren(p);
  });
