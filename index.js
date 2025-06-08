const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { encontrarJogoCorrespondente } = require('./helpers/fuzzyMatch');

const app = express();
const PORT = 3000;

app.use(cors());

async function pegarTop100SteamSpy() {
  const url = 'https://steamspy.com/api.php?request=all';
  // Tenta proxy se 403
  try {
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json,text/plain,*/*'
      }
    });
    return Object.keys(res.data);
  } catch (err) {
    // Tenta via proxy público
    try {
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
      const res = await axios.get(proxyUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json,text/plain,*/*'
        }
      });
      return Object.keys(res.data);
    } catch (e2) {
      console.error('Erro ao buscar top100 SteamSpy:', e2.message);
      throw new Error('Não foi possível acessar SteamSpy (403 ou bloqueio de proxy)');
    }
  }
}

async function pegarDetalhesJogo(appid) {
  try {
    const steamSpyUrl = `https://steamspy.com/api.php?request=appdetails&appid=${appid}`;
    let steamSpyRes;
    try {
      steamSpyRes = await axios.get(steamSpyUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json,text/plain,*/*'
        }
      });
    } catch (err) {
      // Tenta via proxy público
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(steamSpyUrl)}`;
      steamSpyRes = await axios.get(proxyUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json,text/plain,*/*'
        }
      });
    }

    const steamStoreUrl = `https://store.steampowered.com/api/appdetails?appids=${appid}&l=portuguese`;
    let storeRes;
    try {
      storeRes = await axios.get(steamStoreUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json,text/plain,*/*'
        }
      });
    } catch (err) {
      // Tenta via proxy público
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(steamStoreUrl)}`;
      storeRes = await axios.get(proxyUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json,text/plain,*/*'
        }
      });
    }

    const storeData = storeRes.data[appid];
    const descricao = storeData.success ? storeData.data.short_description : null;

    return {
      appid,
      name: steamSpyRes.data.name,
      genres: steamSpyRes.data.genres ? steamSpyRes.data.genres.split(', ') : [],
      header_image: `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/header.jpg`,
      short_description: descricao || 'Descrição não encontrada',
      release_date: steamSpyRes.data.release_date || 'Desconhecida',
      price: steamSpyRes.data.price || 'Indisponível',
      screenshots: storeData.success && storeData.data.screenshots ? storeData.data.screenshots : [],
      movies: storeData.success && storeData.data.movies ? storeData.data.movies : [],
    };
  } catch (e) {
    console.warn(`Erro no appid ${appid}:`, e.message);
    return null;
  }
}

app.get('/api/jogo', async (req, res) => {
  try {
    const pagina = parseInt(req.query.page) || 1;
    const porPagina = parseInt(req.query.limit) || 20;
    const termoBusca = (req.query.search || '').trim().toLowerCase();

    // Busca todos os jogos do SteamSpy
    const url = 'https://steamspy.com/api.php?request=all';
    let steamSpyData;
    try {
      const resSteamSpy = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json,text/plain,*/*'
        }
      });
      steamSpyData = resSteamSpy.data;
    } catch (err) {
      // Tenta via proxy público
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
      const resSteamSpy = await axios.get(proxyUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json,text/plain,*/*'
        }
      });
      steamSpyData = resSteamSpy.data;
    }

    // Filtra por busca se necessário
    let appids;
    if (termoBusca) {
      appids = Object.values(steamSpyData)
        .filter(jogo => jogo.name && jogo.name.toLowerCase().includes(termoBusca))
        .map(jogo => String(jogo.appid));
    } else {
      appids = Object.keys(steamSpyData);
    }

    // Paginação
    const inicio = (pagina - 1) * porPagina;
    const fim = inicio + porPagina;
    const appidsPagina = appids.slice(inicio, fim);

    // Busca detalhes apenas dos appids da página
    const promises = appidsPagina.map(appid =>
      pegarDetalhesJogo(appid)
        .then(data => (data && data.name && data.appid ? data : null))
        .catch(() => null)
    );

    const resultados = await Promise.all(promises);
    const jogosValidos = resultados.filter(j => j);

    res.json(jogosValidos);
  } catch (err) {
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

const ONLINEFIX_URL = 'https://hydralinks.pages.dev/sources/onlinefix.json';
const DODI_URL = 'https://hydralinks.pages.dev/sources/dodi.json';
const STEAMRIP_URL = 'https://hydralinks.pages.dev/sources/steamrip.json';
const GOG_URL = 'https://hydrasources.su/sources/gog.json';
const FITGIRL_URL = 'https://hydralinks.pages.dev/sources/fitgirl.json';

app.get('/api/downloads', async (req, res) => {
  const nome = req.query.nome;
  if (!nome) {
    return res.status(400).json({ error: 'Nome do jogo não informado' });
  }
  try {
    // Busca todas as fontes em paralelo
    const [onlinefixRes, dodiRes, steamripRes, gogRes, fitgirlRes] = await Promise.all([
      axios.get(ONLINEFIX_URL),
      axios.get(DODI_URL),
      axios.get(STEAMRIP_URL),
      axios.get(GOG_URL),
      axios.get(FITGIRL_URL)
    ]);
    const onlinefixData = onlinefixRes.data;
    const dodiData = dodiRes.data;
    const steamripData = steamripRes.data;
    const gogData = gogRes.data;
    const fitgirlData = fitgirlRes.data;

    // Fuzzy match em todas as fontes
    const matchedOnlinefix = encontrarJogoCorrespondente(nome, onlinefixData);
    const matchedDodi = encontrarJogoCorrespondente(nome, dodiData);
    const matchedSteamrip = encontrarJogoCorrespondente(nome, steamripData);
    const matchedGog = encontrarJogoCorrespondente(nome, gogData);
    const matchedFitgirl = encontrarJogoCorrespondente(nome, fitgirlData);

    const linksOnlinefix = onlinefixData[matchedOnlinefix] || [];
    const linksDodi = dodiData[matchedDodi] || [];
    const linksSteamrip = steamripData[matchedSteamrip] || [];
    const linksGog = gogData[matchedGog] || [];
    const linksFitgirl = fitgirlData[matchedFitgirl] || [];

    res.json({
      onlinefix: {
        matchedName: matchedOnlinefix,
        links: linksOnlinefix
      },
      dodi: {
        matchedName: matchedDodi,
        links: linksDodi
      },
      steamrip: {
        matchedName: matchedSteamrip,
        links: linksSteamrip
      },
      gog: {
        matchedName: matchedGog,
        links: linksGog
      },
      fitgirl: {
        matchedName: matchedFitgirl,
        links: linksFitgirl
      }
    });
  } catch (e) {
    res.status(500).json({ error: 'Erro ao buscar links de download' });
  }
});

// Exemplo:
// const data = {
// //   "Elden Ring": [],
// //   "It Takes Two": [],
// //   "Hogwarts Legacy": []
// // };
// const nomeJogo = "Elden Ring™";
// const jogoMatch = encontrarJogoCorrespondente(nomeJogo, data);
// console.log(jogoMatch); // "Elden Ring"

app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});
