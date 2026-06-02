const firebaseConfig = {
  apiKey: "AIzaSyBTp8oCK8qI96g7ru4Ot69v9Zh8Q01jRZk",
  authDomain: "appclicker67.firebaseapp.com",
  projectId: "appclicker67",
  storageBucket: "appclicker67.firebasestorage.app",
  messagingSenderId: "747324004819",
  appId: "1:747324004819:web:187548329a3e35d5127726",
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

const telaLogin = document.getElementById("tela-login");
const chatContainer = document.getElementById("chat-container");
const btnLogin = document.getElementById("btn-login");
const btnAnonimo = document.getElementById("btn-anonimo");
const btnSair = document.getElementById("btn-sair");
const areaMensagens = document.getElementById("area-mensagens");
const inputTexto = document.getElementById("input-texto");
const btnEnviar = document.getElementById("btn-enviar");

let usuarioAtual = null;

auth.onAuthStateChanged((user) => {
  if (user) {
    usuarioAtual = user;
    telaLogin.style.display = "none";
    chatContainer.style.display = "flex";
    carregarMensagens();
  } else {
    usuarioAtual = null;
    telaLogin.style.display = "flex";
    chatContainer.style.display = "none";
    areaMensagens.innerHTML = "";
  }
});

btnLogin.onclick = () => {
  const provedorGoogle = new firebase.auth.GoogleAuthProvider();
  auth
    .signInWithPopup(provedorGoogle)
    .catch((erro) => alert("Erro: " + erro.message));
};

btnAnonimo.onclick = () => {
  auth.signInAnonymously().catch((erro) => alert("Erro: " + erro.message));
};

btnSair.onclick = () => auth.signOut();

// Função para enviar mensagem e limpar o histórico se passar de 100
async function enviarMensagem() {
  const texto = inputTexto.value.trim();
  if (texto === "" || !usuarioAtual) return;

  try {
    // 1. Envia a nova mensagem
    await db.collection("mensagens").add({
      texto: texto,
      nome: usuarioAtual.displayName || "Anônimo",
      uid: usuarioAtual.uid,
      data: firebase.firestore.FieldValue.serverTimestamp(),
    });

    inputTexto.value = "";
    rolarParaBaixo();

    // 2. Verifica se existem mais de 100 mensagens e apaga as antigas
    const snapshot = await db
      .collection("mensagens")
      .orderBy("data", "desc")
      .get();
    if (snapshot.size > 10) {
      const batch = db.batch();
      // Pega todas as mensagens após a centésima mais recente
      snapshot.docs.slice(10).forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      console.log("Histórico limpo: mantendo apenas as 100 mais recentes.");
    }
  } catch (erro) {
    console.error("Erro no processo de envio:", erro);
  }
}

function carregarMensagens() {
  // Ouve apenas as 100 mensagens mais recentes para economizar recursos
  db.collection("mensagens")
    .orderBy("data", "desc")
    .limit(10)
    .onSnapshot((snapshot) => {
      // Pegamos os documentos, invertemos para mostrar do mais antigo para o mais novo na tela
      const docs = [];
      snapshot.forEach((doc) => docs.push(doc.data()));
      docs.reverse();

      areaMensagens.innerHTML = "";
      docs.forEach((dados) => {
        if (dados.data) {
          // Evita erro se o timestamp do servidor ainda não chegou
          exibirMensagem(dados);
        }
      });
      rolarParaBaixo();
    });
}

function exibirMensagem(dados) {
  const novaBolha = document.createElement("div");
  const eMinha = dados.uid === usuarioAtual.uid;

  novaBolha.classList.add("mensagem");
  novaBolha.classList.add(eMinha ? "enviada" : "recebida");

  const spanNome = document.createElement("span");
  spanNome.classList.add("nome-usuario");
  spanNome.innerText = dados.nome;

  novaBolha.appendChild(spanNome);

  const textoMsg = document.createTextNode(dados.texto);
  novaBolha.appendChild(textoMsg);

  areaMensagens.appendChild(novaBolha);
}

function rolarParaBaixo() {
  areaMensagens.scrollTop = areaMensagens.scrollHeight;
}

btnEnviar.onclick = enviarMensagem;
inputTexto.addEventListener("keypress", (e) => {
  if (e.key === "Enter") enviarMensagem();
});
