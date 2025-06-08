<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Bacanos Store — Filtro e Detalhes</title>
    <link rel="stylesheet" href="style.css">
    <link rel="icon" href="jolly_roger_sapofrog.png" type="image/x-icon">
    <link href='https://fonts.googleapis.com/css?family=JetBrains Mono' rel='stylesheet'>
    <script src="https://cdn.jsdelivr.net/npm/fuse.js@7.0.0"></script>
</head>
<body>
    <header>
        <div class="logo">
            <h1>BacanosStore</h1><img src="jolly_roger_sapofrog.png">
        </div>

        <div class="search-bar">
            <input type="text" id="header-busca" placeholder="Buscar jogos...">
            <div id="suggestions" class="suggestions"></div>
            <button id="header-buscar">Buscar</button>
        </div>
    </header>
    <nav>
            <ul>
                <li><a href="bacanosstore.html">Início</a></li>
                <li><a href="allgames.html">Jogos</a></li>
                <li><a href="promocao.html">Promoções</a></li>
                <li><a href="novidade.html">Novidades</a></li>
                <li><a href="contato.html">Contato</a></li>
            </ul>
        </nav>
  <h1>Bacanos Store</h1>

  <label for="filter">Filtrar por gênero:</label>
  <select id="filter">
    <option value="todos">Todos</option>
  </select>

  <input type="text" id="busca" placeholder="Buscar jogo..." />
  <button id="anterior">←</button>
  <span id="pagina-atual">1</span>
  <button id="proximo">→</button>
  <div id="lista-jogos"></div>

  <div id="detalhes" style="display:none;">
    <button id="voltar">← Voltar</button>
    <img id="detalhe-img" alt="" />
    <h2 id="detalhe-titulo"></h2>
    <p id="detalhe-descricao"></p>
    <p><strong>Gêneros:</strong> <span id="detalhe-generos"></span></p>
    <p><strong>Data de lançamento:</strong> <span id="detalhe-release"></span></p>
    <p><strong>Preço:</strong> <span id="detalhe-preco"></span></p>
    <!-- O container de downloads será criado via JS -->
  </div>

<script>
const listaJogos = document.getElementById('lista-jogos');
const filterSelect = document.getElementById('filter');
const buscaInput = document.getElementById('busca');
const detalhesDiv = document.getElementById('detalhes');
const voltarBtn = document.getElementById('voltar');

let paginaAtual = 1;
let jogos = [];
let generosSet = new Set();

function criarCard(jogo) {
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <img src="https://cdn.cloudflare.steamstatic.com/steam/apps/${jogo.appid}/header.jpg" alt="${jogo.name}" />
    <div class="info">
      <div class="title">${jogo.name}</div>
      <button class="comprar-btn">Comprar / Download</button>
    </div>
  `;
  // Apenas o botão abre os detalhes
  card.querySelector('.comprar-btn').onclick = (e) => {
    e.stopPropagation();
    mostrarDetalhes(jogo);
  };
  return card;
}

async function mostrarDetalhes(jogo) {
  detalhesDiv.style.display = 'block';
  listaJogos.style.display = 'none';
  document.getElementById('detalhe-titulo').textContent = jogo.name;
  document.getElementById('detalhe-generos').textContent = (jogo.genres || []).join(', ');
  document.getElementById('detalhe-release').textContent = jogo.release_date || 'Desconhecida';
  document.getElementById('detalhe-preco').textContent = jogo.price || 'Indisponível';
  document.getElementById('detalhe-img').src = jogo.header_image || `https://cdn.cloudflare.steamstatic.com/steam/apps/${jogo.appid}/header.jpg`;
  document.getElementById('detalhe-descricao').textContent = jogo.short_description || 'Sem descrição disponível';

  // Remove container antigo se existir
  let linksContainer = document.getElementById('detalhe-downloads');
  if (linksContainer) linksContainer.remove();

  linksContainer = document.createElement('div');
  linksContainer.id = 'detalhe-downloads';
  linksContainer.innerHTML = '<p><strong>Downloads:</strong></p>';

  try {
    let apiBase = window.location.hostname === "localhost"
      ? "http://localhost:3000"
      : "https://prunbo-github-io.onrender.com";
    const res = await fetch(`${apiBase}/api/downloads?nome=${encodeURIComponent(jogo.name)}`);
    const data = await res.json();

    let totalLinks = 0;
    const fontes = [
      { key: 'onlinefix', label: 'OnlineFix' },
      { key: 'dodi', label: 'DODI' },
      { key: 'steamrip', label: 'SteamRip' },
      { key: 'gog', label: 'GOG' },
      { key: 'fitgirl', label: 'FitGirl' }
    ];

    fontes.forEach(fonte => {
      const fonteData = data[fonte.key];
      if (fonteData && fonteData.links && fonteData.links.length > 0) {
        totalLinks += fonteData.links.length;
        // Mostra o nome fuzzy matched ao lado do nome da fonte
        const fonteTitle = document.createElement('p');
        fonteTitle.innerHTML = `<strong>${fonte.label}</strong> <span style="color:#888;font-size:0.9em">(match: ${fonteData.matchedName})</span>:`;
        linksContainer.appendChild(fonteTitle);
        fonteData.links.forEach(link => {
          const a = document.createElement('a');
          a.href = link.url;
          a.textContent = link.name;
          a.target = '_blank';
          a.style.display = 'block';
          linksContainer.appendChild(a);
        });
      }
    });

    if (totalLinks === 0) {
      linksContainer.innerHTML += '<p>Nenhum link disponível.</p>';
    }
  } catch (e) {
    linksContainer.innerHTML += '<p>Erro ao buscar links de download.</p>';
  }

  detalhesDiv.appendChild(linksContainer);
}

// Botão voltar funcional
if (voltarBtn) {
  voltarBtn.onclick = () => {
    detalhesDiv.style.display = 'none';
    listaJogos.style.display = '';
  };
}

function popularFiltro() {
  filterSelect.innerHTML = '<option value="todos">Todos</option>';
  Array.from(generosSet).sort().forEach(g => {
    const opt = document.createElement('option');
    opt.value = g;
    opt.textContent = g;
    filterSelect.appendChild(opt);
  });
}

function filtrarJogos() {
  const filtro = filterSelect.value;
  listaJogos.innerHTML = '';
  let filtrados = filtro === 'todos' ? jogos : jogos.filter(j => (j.genres || []).includes(filtro));
  filtrados.forEach(jogo => {
    listaJogos.appendChild(criarCard(jogo));
  });
}

async function carregarJogos() {
  listaJogos.textContent = 'Carregando...';
  try {
    // Busca os jogos da página atual, com busca global se houver termo
    const busca = buscaInput.value.trim();
    let url = `https://prunbo-github-io.onrender.com/api/jogo?page=${paginaAtual}&limit=20`;
    if (busca) {
      url += `&search=${encodeURIComponent(busca)}`;
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error('Falha ao carregar jogos');
    jogos = await res.json();

    generosSet.clear();
    jogos.forEach(j => {
      if (j.genres) j.genres.forEach(g => generosSet.add(g));
    });

    popularFiltro();
    filtrarJogos();
    document.getElementById('pagina-atual').textContent = paginaAtual;
  } catch (e) {
    listaJogos.textContent = 'Erro ao carregar jogos.';
    console.error(e);
  }
}

filterSelect.addEventListener('change', () => {
  carregarJogos();
});

buscaInput.addEventListener('input', () => {
  paginaAtual = 1;
  carregarJogos();
});

document.getElementById('proximo').onclick = () => {
  paginaAtual++;
  carregarJogos();
};
document.getElementById('anterior').onclick = () => {
  if (paginaAtual > 1) {
    paginaAtual--;
    carregarJogos();
  }
};

// Sincroniza a barra de pesquisa do header com a busca da lista
const headerBuscaInput = document.getElementById('header-busca');
const headerBuscarBtn = document.getElementById('header-buscar');

if (headerBuscaInput && buscaInput) {
  headerBuscaInput.addEventListener('input', () => {
    buscaInput.value = headerBuscaInput.value;
    paginaAtual = 1;
    carregarJogos();
  });
  if (headerBuscarBtn) {
    headerBuscarBtn.addEventListener('click', () => {
      buscaInput.value = headerBuscaInput.value;
      paginaAtual = 1;
      carregarJogos();
    });
  }
  buscaInput.addEventListener('input', () => {
    headerBuscaInput.value = buscaInput.value;
  });
}

carregarJogos();

</script>

</body>
</html>