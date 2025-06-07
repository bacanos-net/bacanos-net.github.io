document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.querySelector('.search-bar input');
    const searchButton = document.querySelector('.search-bar button');
    const games = document.querySelectorAll('.games-list .game');
    const title = document.getElementById('allgames-title');
    const errorMsg = document.getElementById('search-error');
    const suggestionsBox = document.getElementById('suggestions');

    // Cria uma lista com os nomes dos jogos
    let gameNames = [];
    if (games.length > 0) {
        gameNames = Array.from(games).map(game => game.querySelector('h3').textContent);
    }

    // Função para mostrar sugestões
    function showSuggestions(value) {
        if (!suggestionsBox) return;
        suggestionsBox.innerHTML = '';
        if (!value) {
            suggestionsBox.style.display = 'none';
            return;
        }
        const filtered = gameNames.filter(name => name.toLowerCase().includes(value.toLowerCase()));
        if (filtered.length === 0) {
            suggestionsBox.style.display = 'none';
            return;
        }
        filtered.forEach(name => {
            const div = document.createElement('div');
            div.textContent = name;
            div.onclick = function() {
                searchInput.value = name;
                suggestionsBox.style.display = 'none';
                searchButton.click();
            };
            suggestionsBox.appendChild(div);
        });
        suggestionsBox.style.display = 'block';
    }

    function searchGames() {
        const query = searchInput.value.trim().toLowerCase();
        let found = 0;

        // Esconde o título ao pesquisar
        if (title) title.style.display = query ? 'none' : '';

        // Se não estiver na allgames.html, salva e redireciona
        if (!window.location.pathname.endsWith('allgames.html')) {
            localStorage.setItem('searchQuery', query);
            window.location.href = 'allgames.html';
            return;
        }

        games.forEach(game => {
            const gameTitle = game.querySelector('h3').textContent.toLowerCase();
            if (gameTitle.includes(query) && query !== '') {
                game.style.display = '';
                game.style.border = '3px solid #aaff00';
                game.style.background = '#f4ffe0';
                found++;
            } else if (query === '') {
                game.style.display = '';
                game.style.border = '';
                game.style.background = '';
            } else {
                game.style.display = 'none';
                game.style.border = '';
                game.style.background = '';
            }
        });

        // Mostra mensagem de erro se nada for encontrado
        if (errorMsg) {
            if (query && found === 0) {
                errorMsg.textContent = 'Ops, pode ser que não é isso que procura';
                errorMsg.style.display = 'block';
            } else {
                errorMsg.textContent = '';
                errorMsg.style.display = 'none';
            }
        }
    }

    if (searchButton && searchInput) {
        searchButton.addEventListener('click', searchGames);
        searchInput.addEventListener('keyup', function(event) {
            if (event.key === 'Enter') searchGames();
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', function() {
            showSuggestions(this.value);
        });
        searchInput.addEventListener('blur', function() {
            setTimeout(() => { if (suggestionsBox) suggestionsBox.style.display = 'none'; }, 200);
        });
    }

    // Se está na allgames.html, faz a busca automática ao carregar
    if (window.location.pathname.endsWith('allgames.html')) {
        const savedQuery = localStorage.getItem('searchQuery');
        if (savedQuery && searchInput) {
            searchInput.value = savedQuery;
            searchButton.click();
            localStorage.removeItem('searchQuery');
        }
    }
});