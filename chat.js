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
