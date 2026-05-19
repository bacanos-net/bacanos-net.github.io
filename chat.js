const firebaseConfig = {
  apiKey: "AIzaSyBTp8oCK8qI96g7ru4Ot69v9Zh8Q01jRZk",
  authDomain: "appclicker67.firebaseapp.com",
  projectId: "appclicker67",
  storageBucket: "appclicker67.firebasestorage.app",
  messagingSenderId: "747324004819",
  appId: "1:747324004819:web:187548329a3e35d5127726",
};

// 2. Inicializando os serviços
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore(); // Inicializa o Firestore

// 3. Mapeando elementos do DOM
const telaLogin = document.getElementById("tela-login");
const chatContainer = document.getElementById("chat-container");
const btnLogin = document.getElementById("btn-login");
const btnAnonimo = document.getElementById("btn-anonimo");
const btnSair = document.getElementById("btn-sair");
const areaMensagens = document.getElementById("area-mensagens");
const inputTexto = document.getElementById("input-texto");
const btnEnviar = document.getElementById("btn-enviar");

let usuarioAtual = null;

// --- LÓGICA DE AUTENTICAÇÃO ---

// Observador de estado de login (mantém logado ao atualizar a página)
auth.onAuthStateChanged((user) => {
  if (user) {
    usuarioAtual = user;
    telaLogin.style.display = "none";
    chatContainer.style.display = "flex";
    carregarMensagens(); // Começa a ouvir as mensagens
  } else {
    usuarioAtual = null;
    telaLogin.style.display = "flex";
    chatContainer.style.display = "none";
    areaMensagens.innerHTML = ""; // Limpa o chat ao sair
  }
});

// Login com Google
btnLogin.onclick = function () {
  const provedorGoogle = new firebase.auth.GoogleAuthProvider();
  auth
    .signInWithPopup(provedorGoogle)
    .catch((erro) => alert("Erro: " + erro.message));
};

// Login Anônimo
btnAnonimo.onclick = function () {
  auth.signInAnonymously().catch((erro) => alert("Erro: " + erro.message));
};

// Logout
btnSair.onclick = function () {
  auth.signOut();
};

// --- LÓGICA DO CHAT (FIRESTORE) ---

// Função para enviar mensagem para o Firestore
function enviarMensagem() {
  const texto = inputTexto.value.trim();
  if (texto === "" || !usuarioAtual) return;

  // Salva no banco de dados
  db.collection("mensagens")
    .add({
      texto: texto,
      nome: usuarioAtual.displayName || "Anônimo",
      uid: usuarioAtual.uid,
      data: firebase.firestore.FieldValue.serverTimestamp(), // Hora do servidor
    })
    .then(() => {
      inputTexto.value = "";
      rolarParaBaixo();
    })
    .catch((erro) => console.error("Erro ao salvar:", erro));
}

// Função para carregar mensagens em tempo real
function carregarMensagens() {
  // Ouve a coleção "mensagens" ordenada por data
  db.collection("mensagens")
    .orderBy("data", "asc")
    .onSnapshot((snapshot) => {
      areaMensagens.innerHTML = ""; // Limpa para reconstruir (ou você pode processar apenas as novas)

      snapshot.forEach((doc) => {
        const dados = doc.data();
        exibirMensagem(dados);
      });
      rolarParaBaixo();
    });
}

// Função para criar o HTML da mensagem
function exibirMensagem(dados) {
  const novaBolha = document.createElement("div");
  const eMinha = dados.uid === usuarioAtual.uid;

  novaBolha.classList.add("mensagem");
  novaBolha.classList.add(eMinha ? "minha-mensagem" : "outra-mensagem");

  // Adiciona o nome do usuário acima da mensagem
  const spanNome = document.createElement("span");
  spanNome.classList.add("nome-usuario");
  spanNome.innerText = dados.nome;

  novaBolha.appendChild(spanNome);
  novaBolha.append(dados.texto);

  areaMensagens.appendChild(novaBolha);
}

function rolarParaBaixo() {
  areaMensagens.scrollTop = areaMensagens.scrollHeight;
}

// Eventos de clique e teclado
btnEnviar.onclick = enviarMensagem;
inputTexto.addEventListener("keypress", (e) => {
  if (e.key === "Enter") enviarMensagem();
});
