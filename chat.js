// 1. Configuração do Firebase (Cole AS SUAS CHAVES aqui)
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

// 3. Mapeando os novos elementos do DOM
const telaLogin = document.getElementById("tela-login");
const chatContainer = document.getElementById("chat-container");
const btnLogin = document.getElementById("btn-login");

// Variável global para guardar os dados de quem logou
let usuarioAtual = null;

// 4. Função de Login com Google
btnLogin.onclick = function () {
  const provedorGoogle = new firebase.auth.GoogleAuthProvider();

  auth
    .signInWithPopup(provedorGoogle)
    .then(function (resultado) {
      // Deu certo! Guarda os dados do usuário
      usuarioAtual = resultado.user;
      console.log("Logado como:", usuarioAtual.displayName);

      // Esconde o Login e Mostra o Chat
      telaLogin.style.display = "none";
      chatContainer.style.display = "flex";
    })
    .catch(function (erro) {
      alert("Erro ao fazer login: " + erro.message);
    });
};
// 1. Mapeando o DOM
const areaMensagens = document.getElementById("area-mensagens");
const inputTexto = document.getElementById("input-texto");
const btnEnviar = document.getElementById("btn-enviar");

// 2. Função Principal de Envio
function enviarMensagem() {
  // Pega o valor e remove espaços vazios nas pontas
  const textoDaMensagem = inputTexto.value.trim();

  // Trava: Se o texto for vazio, sai da função e não faz nada
  if (textoDaMensagem === "") {
    return;
  }

  // 3. Criação dinâmica do elemento HTML (DOM)
  const novaBolha = document.createElement("div");
  novaBolha.classList.add("mensagem", "minha-mensagem");
  novaBolha.innerText = textoDaMensagem;

  // 4. Injeta a mensagem na área do chat
  areaMensagens.appendChild(novaBolha);

  // 5. Limpa a barra de digitação
  inputTexto.value = "";
}

// 6. Conecta o botão de Enviar à nossa função
btnEnviar.onclick = enviarMensagem;

// 7. Enviar mensagem ao apertar a tecla "Enter"
inputTexto.addEventListener("keypress", function (evento) {
  if (evento.key === "Enter") {
    enviarMensagem();
    rolarParaBaixo(); // Chama o auto-scroll
  }
});

// Atualiza o clique do botão para também fazer o scroll
btnEnviar.onclick = function () {
  enviarMensagem();
  rolarParaBaixo();
};

// 8. Função de Auto-Scroll
function rolarParaBaixo() {
  // Define a posição da barra de rolagem igual à altura total do container
  areaMensagens.scrollTop = areaMensagens.scrollHeight;
}
