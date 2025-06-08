const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());

async function pegarTop100SteamSpy() {
  const url = 'https://steamspy.com/api.php?request=top100in2weeks';
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

    // Busca os appids ordenados por popularidade
    const appids = await pegarTop100SteamSpy();
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

app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});
