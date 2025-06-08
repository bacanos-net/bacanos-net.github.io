const stringSimilarity = require('string-similarity');

// Remove símbolos, pontuação, acentos e deixa minúsculo
function normalizarNome(nome) {
  return nome
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove acentos
    .replace(/[\W_]+/g, ' ') // remove símbolos/pontuação
    .replace(/\s+/g, ' ') // espaços múltiplos
    .trim();
}

function encontrarJogoCorrespondente(nome, jsonData) {
  const nomesJson = Object.keys(jsonData);
  const nomeNormalizado = normalizarNome(nome);
  const nomesNormalizados = nomesJson.map(n => normalizarNome(n));
  const match = stringSimilarity.findBestMatch(nomeNormalizado, nomesNormalizados);
  const melhorIndice = match.bestMatchIndex;
  return nomesJson[melhorIndice];
}

module.exports = { encontrarJogoCorrespondente };
