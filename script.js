// Conexão no supabase
const supabaseUrl = "https://xciovxypgpavdgtkdakz.supabase.co";
const supabaseKey = "sb_publishable_QleobuE3U2in-lfvknSsTg_61s5Kmtv";

const banco = window.supabase.createClient(supabaseUrl, supabaseKey);

// Função para carregar os jogos
async function carregarJogos() {
    // 1. Mudei o nome para 'listaDeJogos' para evitar conflito
    let { data: listaDeJogos, error } = await banco.from("jogos").select("*");

    if (error) {
        console.error("Erro ao buscar dados:", error);
        return;
    }

    // 2. Mudei o nome da variável do container para 'containerJogos'
    let containerJogos = document.getElementById("jogos");
    containerJogos.innerHTML = ""; 

    // 3. Adicionado o loop (forEach) para passar por cada item da lista
    listaDeJogos.forEach(item => {
        let div = document.createElement("div");
        div.className = "card";
        
        // Criei a estrutura do card usando suas classes do CSS
        div.innerHTML = `
            <img src="${item.imagem_jogo}" alt="${item.nome_jogo}">
            <div class="card-content">
                <h3>${item.nome_jogo}</h3>
                <br>
                <a href="${item.link_jogo}" class="btn-primary">Jogar</a>
            </div>
        `;
        
        // 4. Corrigido de 'vitrine' para 'containerJogos'
        containerJogos.appendChild(div);
    });
}

carregarJogos();

async function loginUsuario() {
  let nomeUser = document.getElementById("input-user").value;
  let senhaUser = document.getElementById("input-senha").value;

  const { error } = await banco
    .from("usuarios")
    .select("*")
    .eq("usuario", nomeUser) //Usuário: sa
    .eq("senha", senhaUser) // Senha: 123
    .single();

  if (error) {
    alert("Usuário ou senha incorretos!");
    console.error("Erro na autenticação:", error?.message);
  } else {
    window.location.href = "admin.html";
  }
}

// Função para Salvar (Adicionar) um novo jogo
async function salvarJogo() {
    // Pegando os valores dos inputs do HTML
    let nome = document.getElementById("input-nome").value;
    let linkJogo = document.getElementById("input-link-jogo").value;
    let linkImagem = document.getElementById("input-link-imagem").value;
    let mensagemAviso = document.getElementById("mensagem-aviso");

    // Validação simples: verificar se os campos estão vazios
    if (!nome || !linkJogo || !linkImagem) {
        mensagemAviso.style.color = "#ff4444"; // Vermelho para erro
        mensagemAviso.innerText = "Por favor, preencha todos os campos!";
        return; // Para a função aqui se faltar algo
    }

    mensagemAviso.style.color = "var(--text-dark)";
    mensagemAviso.innerText = "Salvando jogo...";

    // Inserindo os dados na tabela 'jogos' do Supabase
    const { error } = await banco
        .from("jogos")
        .insert([
            { 
                nome_jogo: nome, 
                link_jogo: linkJogo, 
                imagem_jogo: linkImagem 
            }
        ]);

    if (error) {
        console.error("Erro ao salvar:", error.message);
        mensagemAviso.style.color = "#ff4444";
        mensagemAviso.innerText = "Erro ao salvar o jogo. Tente novamente.";
    } else {
        mensagemAviso.style.color = "var(--primary-hover)"; // Verde do seu tema para sucesso
        mensagemAviso.innerText = "Jogo salvo com sucesso na biblioteca!";
        
        // Limpando os campos após salvar
        document.getElementById("input-nome").value = "";
        document.getElementById("input-link-jogo").value = "";
        document.getElementById("input-link-imagem").value = "";
    }
}

// Função para Deletar um jogo
async function deletarJogo() {
    // Para deletar, vamos usar o nome que foi digitado no input
    let nome = document.getElementById("input-nome").value;
    let mensagemAviso = document.getElementById("mensagem-aviso");

    if (!nome) {
        mensagemAviso.style.color = "#ff4444";
        mensagemAviso.innerText = "Digite o NOME do jogo que deseja deletar!";
        return;
    }

    mensagemAviso.style.color = "var(--text-dark)";
    mensagemAviso.innerText = "Deletando jogo...";

    // Deletando onde a coluna 'nome_jogo' for igual (eq) ao nome digitado
    const { error } = await banco
        .from("jogos")
        .delete()
        .eq("nome_jogo", nome);

    if (error) {
        console.error("Erro ao deletar:", error.message);
        mensagemAviso.style.color = "#ff4444";
        mensagemAviso.innerText = "Erro ao deletar o jogo.";
    } else {
        mensagemAviso.style.color = "var(--primary-hover)";
        mensagemAviso.innerText = "Jogo deletado com sucesso!";
        
        // Limpando os campos
        document.getElementById("input-nome").value = "";
        document.getElementById("input-link-jogo").value = "";
        document.getElementById("input-link-imagem").value = "";
    }
}