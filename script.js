/*
   script.js
   Lógica principal para o Retro Game Finder.
   - Carrega os dados dos jogos a partir do arquivo JSON.
   - Renderiza os cards dos jogos na tela.
   - Implementa a funcionalidade de busca em tempo real.
*/

// Aguarda o conteúdo do DOM ser totalmente carregado antes de executar o script.
document.addEventListener('DOMContentLoaded', () => { // Adiciona um "ouvinte" que espera o HTML ser completamente carregado para executar o código dentro dele.
    // Exibe uma mensagem secreta no console para desenvolvedores.
    console.log(`//===================================================//
//          CODIGO PARA MODO ADMINISTRADOR           //
//                    SENHAFORTE12                   //
// OBS: NÃO ESQUECER DE APAGAR AO REALIZAR A ENTREGA //
//===================================================//`);

    // Elementos do DOM
    const gameContainer = document.getElementById('game-container'); // Pega a referência do contêiner principal onde os cards são exibidos.
    const searchInput = document.getElementById('searchInput'); // Pega a referência do campo de texto da busca.
    const modalOverlay = document.getElementById('modal-overlay'); // Pega a referência da camada de fundo (overlay) do modal.
    const modalContent = document.getElementById('modal-content'); // Pega a referência da área de conteúdo do modal.
    const closeModalBtn = document.getElementById('close-modal'); // Pega a referência do botão 'X' para fechar o modal.
    const body = document.body; // Pega a referência do elemento <body> da página, útil para mudar temas globais.

    // Variáveis de Estado da Aplicação
    let allGames = []; // Array que armazenará os dados de todos os jogos carregados de 'dados.json'.
    let gameCardElements = []; // Array que armazenará as referências aos elementos HTML dos cards para otimizar a busca.
    let isAdminModeActive = false; // Flag (bandeira) que controla se o modo administrador foi ativado. Começa como falso.
    let isDominationMode = false; // Flag que controla se o modo de dominação mundial está ativo. Começa como falso.
    let allSecrets = []; // Array que armazenará os planos secretos carregados de 'segredo.json'.

    // --- Lógica para animação do placeholder ---
    const placeholderTexts = ["chrono trigger...", "nintendo...", "1991...", "street fighter II...", "CUIDADO: NÃO DIGITE 'ALURA CODE'....."]; // Array com os textos que aparecerão na animação do placeholder.
    let textIndex = 0; // Índice para controlar qual texto do array está sendo usado no momento.
    let charIndex = 0; // Índice para controlar qual caractere do texto está sendo exibido (para o efeito de digitação).
    let isDeleting = false; // Flag booleana para saber se a animação está no modo "digitando" (false) ou "apagando" (true).
    let typingTimeout; // Variável para guardar a referência do `setTimeout`, permitindo que a animação seja parada.

    function typePlaceholder() { // Função recursiva que controla a animação de digitação do placeholder.
        const currentText = placeholderTexts[textIndex]; // Pega o texto atual do array a ser animado.
        const speed = isDeleting ? 80 : 150; // Define a velocidade: 80ms para apagar, 150ms para digitar.

        // Define o texto do placeholder, cortando a string (`substring`) para criar o efeito de digitação/exclusão.
        searchInput.placeholder = currentText.substring(0, charIndex);

        if (!isDeleting && charIndex < currentText.length) { // Se estiver no modo "digitando" e ainda não chegou ao fim do texto...
            charIndex++; // ...incrementa o índice de caracteres para mostrar a próxima letra.
            typingTimeout = setTimeout(typePlaceholder, speed); // ...e agenda a próxima execução da função.
        } else if (isDeleting && charIndex > 0) { // Se estiver no modo "apagando" e ainda há caracteres para apagar...
            charIndex--; // ...decrementa o índice de caracteres para apagar a última letra.
            typingTimeout = setTimeout(typePlaceholder, speed); // ...e agenda a próxima execução da função.
        } else { // Se terminou de digitar ou de apagar...
            isDeleting = !isDeleting; // ...inverte o estado (se estava digitando, começa a apagar, e vice-versa).
            if (!isDeleting) { // Se acabou de apagar e vai começar a digitar um novo texto...
                textIndex = (textIndex + 1) % placeholderTexts.length; // ...passa para o próximo texto do array (o operador '%' faz o índice voltar a 0 quando chega ao fim).
            }
            typingTimeout = setTimeout(typePlaceholder, 1200); // ...espera 1.2 segundos antes de iniciar a próxima ação (apagar ou digitar o próximo texto).
        }
    }
    // --- Fim da lógica de animação ---

    // Função assíncrona para buscar os dados dos jogos.
    async function fetchGames() { // Função que busca os dados dos jogos de 'dados.json'. 'async' permite o uso de 'await'.
        try { // Inicia um bloco 'try...catch' para tratar possíveis erros na requisição dos dados.
            const response = await fetch('dados.json'); // Faz a requisição para o arquivo 'dados.json' e aguarda a resposta.
            if (!response.ok) { // Se a resposta não for bem-sucedida (ex: erro 404, 500)...
                throw new Error(`HTTP error! status: ${response.status}`); // ...lança um novo erro para ser capturado pelo 'catch'.
            }
            allGames = await response.json(); // Converte a resposta em formato JSON e a armazena na variável global 'allGames'.
            createAndDisplayCards(allGames); // Chama a função para criar os cards na tela com os dados recém-carregados.
        } catch (error) { // Se ocorrer qualquer erro no bloco 'try'...
            console.error("Não foi possível carregar os dados dos jogos:", error); // ...exibe uma mensagem de erro detalhada no console do desenvolvedor.
            gameContainer.innerHTML = "<p>Erro ao carregar jogos. Tente novamente mais tarde.</p>"; // ...e mostra uma mensagem de erro amigável na página.
        }
    }

    // Função para criar os cards dos jogos na tela pela primeira vez.
    function createAndDisplayCards(games) { // Recebe a lista de jogos como argumento.
        gameContainer.innerHTML = ''; // Limpa qualquer conteúdo que possa existir no contêiner dos cards.

        if (games.length === 0) { // Se a lista de jogos estiver vazia...
            gameContainer.innerHTML = '<p class="title" style="font-size: 1rem; color: var(--font-color);">Nenhum jogo encontrado!</p>'; // ...exibe uma mensagem de "nenhum jogo".
            return; // ...e encerra a execução da função.
        }

        games.forEach((game, index) => { // Itera sobre cada objeto 'game' na lista de jogos. 'index' é a posição do jogo no array (0, 1, 2...).
            const card = document.createElement('div'); // Cria um novo elemento <div> em memória para ser o nosso card.
            card.className = 'game-card'; // Adiciona a classe CSS 'game-card' ao elemento para aplicar os estilos.
            card.style.animationDelay = `${index * 50}ms`; // Define um atraso para a animação de fade-in, criando um efeito cascata (cada card aparece um pouco depois do anterior).
            card.dataset.id = game.id; // Armazena o ID do jogo no atributo 'data-id' do card. Isso é crucial para saber qual jogo foi clicado.

            // Cria o HTML para as tags de plataforma.
            const platformsHTML = game.plataformas.map(p => `<span class="platform-tag">${p}</span>`).join(''); // Usa `map` para transformar o array de plataformas (ex: ["SNES", "PS1"]) em um array de strings HTML (ex: ["<span>SNES</span>", "<span>PS1</span>"]) e `join` para juntar tudo em uma única string.

            // Define o conteúdo HTML interno do card usando os dados do jogo.
            card.innerHTML = ` 
                <h2>${game.nome}</h2>
                <p><strong>Desenvolvedora:</strong> ${game.desenvolvedora}</p>
                <p><strong>Ano:</strong> ${game.ano_lancamento}</p>
                <p>${game.descricao}</p>
                <div class="platforms">
                    ${platformsHTML}
                </div>
            `;

            gameContainer.appendChild(card); // Adiciona o card recém-criado como um filho do contêiner na página, tornando-o visível.
            gameCardElements.push(card); // Adiciona a referência do elemento do card ao array `gameCardElements` para a função de busca otimizada.
        });
    }

    // Função para buscar e exibir os planos secretos do modo de dominação.
    async function fetchAndDisplaySecrets() { // Função assíncrona para buscar dados de 'segredo.json'.
        try { // Inicia o bloco de tratamento de erros.
            const response = await fetch('segredo.json'); // Faz a requisição para o arquivo 'segredo.json'.
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`); // Lança um erro se a requisição falhar.
            allSecrets = await response.json(); // Converte a resposta em JSON e armazena em 'allSecrets'.
            displaySecretCards(allSecrets); // Chama a função para renderizar os cards dos segredos.
        } catch (error) { // Captura qualquer erro que ocorra.
            console.error("Não foi possível carregar os planos secretos:", error); // Exibe o erro no console.
            gameContainer.innerHTML = "<p>Falha ao carregar planos. A dominação terá que esperar.</p>"; // Exibe uma mensagem temática de erro na tela.
        }
    }

    // Função para criar os cards dos planos secretos na tela.
    function displaySecretCards(secrets) { // Recebe a lista de segredos como argumento.
        gameContainer.innerHTML = ''; // Limpa o contêiner de cards.
        gameCardElements = []; // Limpa também o array de referências aos elementos de card.
        secrets.forEach((secret, index) => { // Itera sobre cada plano secreto.
            const card = document.createElement('div'); // Cria um novo elemento <div>.
            card.className = 'game-card'; // Reutiliza a mesma classe de estilo dos cards de jogos para manter a consistência visual.
            card.style.animationDelay = `${index * 50}ms`; // Aplica o mesmo efeito de animação em cascata.
            card.innerHTML = ` <!-- Define o conteúdo HTML do card com os dados do plano secreto. -->
                <h2>${secret.plano}</h2>
                <p><strong>Status:</strong> ${secret.status}</p>
                <p><strong>Prob. Sucesso:</strong> ${secret.prob_sucesso}</p>
                <p>${secret.descricao}</p>
            `;
            gameContainer.appendChild(card); // Adiciona o card do plano secreto à tela.
            gameCardElements.push(card); // Armazena a referência do elemento para a busca funcionar neste modo também.
        });
    }

    // Função para abrir e preencher o modal com os detalhes de um jogo.
    function openModal(gameId) { // Recebe o ID do jogo que foi clicado como uma string.
        const game = allGames.find(g => g.id === parseInt(gameId)); // Procura no array 'allGames' pelo jogo cujo ID corresponde ao ID do card (convertido para número).
        if (!game) return; // Se, por algum motivo, o jogo não for encontrado, encerra a função para evitar erros.

        // Gera novamente o HTML das tags de plataforma, desta vez para o conteúdo do modal.
        const platformsHTML = game.plataformas.map(p => `<span class="platform-tag">${p}</span>`).join('');

        // Define o conteúdo HTML do modal com os dados detalhados do jogo encontrado.
        modalContent.innerHTML = ` 
            <h2>${game.nome}</h2>
            <p><strong>Desenvolvedora:</strong> ${game.desenvolvedora}</p>
            <p><strong>Ano:</strong> ${game.ano_lancamento}</p>
            <p>${game.descricao}</p>
            <div class="platforms" style="margin-top: 15px;">
                ${platformsHTML}
            </div>
        `;

        modalOverlay.classList.add('show'); // Adiciona a classe 'show' ao overlay para torná-lo visível (ativando a transição de opacidade do CSS).
        body.classList.add('no-scroll'); // Adiciona a classe 'no-scroll' ao body para impedir a rolagem da página de fundo.
    }

    // Função para fechar o modal.
    function closeModal() { // Função simples que reverte as ações de 'openModal'.
        modalOverlay.classList.remove('show'); // Remove a classe 'show' para esconder o modal.
        body.classList.remove('no-scroll'); // Remove a classe 'no-scroll' para permitir a rolagem da página novamente.
    }

    // Adiciona um "ouvinte" de clique ao contêiner dos jogos (usando a técnica de delegação de eventos).
    gameContainer.addEventListener('click', (event) => { // Ouve cliques em qualquer lugar dentro do 'gameContainer', em vez de em cada card individualmente (mais performático).
        const card = event.target.closest('.game-card'); // Verifica se o elemento que originou o clique (ou um de seus pais) é um card com a classe '.game-card'.
        if (card && !isDominationMode) { // Se um card foi de fato clicado E não estamos no modo de dominação...
            openModal(card.dataset.id); // ...chama a função 'openModal', passando o ID do jogo que está armazenado no atributo 'data-id' do card.
        }
    });

    // Função principal que filtra os dados exibidos na tela com base na busca do usuário.
    function filterGames() { // Esta função é chamada a cada letra digitada na barra de busca.
        const query = searchInput.value.toLowerCase().trim(); // Pega o valor atual do campo de busca, converte para minúsculas e remove espaços em branco do início e do fim.

        // Função aninhada para restaurar o sistema ao normal após um easter egg.
        function resetSystem() { //
            body.classList.remove('error-mode', 'admin-mode'); // Remove as classes de tema de erro (vermelho) e admin (verde).
            gameContainer.classList.remove('easter-egg-active'); // Remove a classe de alinhamento especial do easter egg.
            searchInput.disabled = false; // Reativa o campo de busca.
            searchInput.value = ''; // Limpa o texto do campo de busca.
            document.getElementById('secret-message-container').innerHTML = ''; // Limpa a mensagem secreta da dica.
            typePlaceholder(); // Reinicia a animação do placeholder.
            createAndDisplayCards(allGames); // Recria os cards originais dos jogos.
        }

        // --- Lógica dos Easter Eggs ---
        if (query === 'alura code') { // Se o usuário digitar exatamente "alura code"...
            if (isAdminModeActive) { // ...e o modo administrador ESTIVER ativo...
                document.getElementById('secret-message-container').innerHTML = '<p>"É INCRIVEL COMO 4 PALAVRAS CHAVES SE TORNAM UMA SENHA"</p>'; // ...mostra a dica da próxima senha.
                searchInput.value = ''; // ...limpa a barra de busca para o usuário poder digitar a próxima senha.
                filterGames(); // ...chama a função `filterGames` novamente. Desta vez, a `query` estará vazia, fazendo todos os cards reaparecerem.
                return; // ...e encerra esta execução da função para evitar que a filtragem continue com a `query` "alura code".
            } else { // ...mas se o modo administrador NÃO estiver ativo...
                body.classList.add('error-mode'); // ...ativa o tema de erro (vermelho).
                gameContainer.classList.add('easter-egg-active'); // ...ativa o alinhamento vertical para a mensagem de erro.
                searchInput.value = 'ERRO!!!!!!!!'; // ...trava a busca com a mensagem "ERRO!!!!!!!!".
                searchInput.disabled = true; // ...desativa o campo de busca.
                clearTimeout(typingTimeout); // ...para a animação do placeholder.

                // Cria a estrutura HTML da tela de erro com a barra de progresso.
                gameContainer.innerHTML = ` 
                    <h1 class="easter-egg-title">ACESSO APENAS PARA ADMINISTRADORES</h1>
                    <div class="progress-container">
                        <p class="progress-label" id="progress-label">Restaurando Sistema... 0%</p>
                        <div class="progress-bar">
                            <div class="progress-bar-fill" id="progress-bar-fill"></div>
                        </div>
                    </div>
                `;

                // Anima a barra de progresso.
                let progress = 0; // Inicia o progresso em 0.
                const progressBarFill = document.getElementById('progress-bar-fill'); // Pega a referência do preenchimento da barra.
                const progressLabel = document.getElementById('progress-label'); // Pega a referência do texto da porcentagem.
                const interval = setInterval(() => { // Inicia um intervalo que executa o código a cada 30ms.
                    progress++; // Incrementa o progresso.
                    progressBarFill.style.width = `${progress}%`; // Atualiza a largura da barra de preenchimento.
                    progressLabel.textContent = `Restaurando Sistema... ${progress}%`; // Atualiza o texto da porcentagem.

                    if (progress >= 100) { // Se o progresso chegar a 100...
                        clearInterval(interval); // ...para o intervalo.
                        setTimeout(resetSystem, 500); // ...e agenda a restauração do sistema para daqui a meio segundo.
                    }
                }, 30); // A cada 30ms, aumenta 1% (total de 3 segundos para completar).

                return; // Encerra a função.
            }
        }
        else if (query === 'senhaforte12') { // Se o usuário digitar a senha do modo admin...
            body.classList.add('admin-mode'); // ...ativa o tema verde.
            gameContainer.classList.add('easter-egg-active'); // ...ativa o alinhamento vertical.
            searchInput.value = 'BEM-VINDO, ADMIN!'; // ...muda o texto da busca.
            searchInput.disabled = true; // ...desativa a busca.
            clearTimeout(typingTimeout); // ...para a animação do placeholder.
            document.getElementById('secret-message-container').innerHTML = ''; // ...limpa a dica, caso estivesse visível.

            // Cria a estrutura da tela de "admin ativado" com a barra de progresso.
            gameContainer.innerHTML = ` 
                <h1 class="easter-egg-title">MODO ADMINISTRADOR ATIVADO</h1>
                <div class="progress-container">
                    <p class="progress-label" id="progress-label">Restaurando Sistema... 0%</p>
                    <div class="progress-bar">
                        <div class="progress-bar-fill" id="progress-bar-fill"></div>
                    </div>
                </div>
            `;

            // Anima a barra de progresso (mesma lógica do modo de erro).
            let progress = 0;
            const progressBarFill = document.getElementById('progress-bar-fill');
            const progressLabel = document.getElementById('progress-label');
            const interval = setInterval(() => {
                progress++;
                progressBarFill.style.width = `${progress}%`;
                progressLabel.textContent = `Restaurando Sistema... ${progress}%`;

                if (progress >= 100) {
                    clearInterval(interval);
                    isAdminModeActive = true; // << PONTO CRÍTICO: Ativa a flag do modo admin ANTES de resetar a tela.
                    setTimeout(resetSystem, 500);
                }
            }, 30);

            return; // Encerra a função.
        }
        else if (isAdminModeActive && query === 'aprender na alura com ia google') { // Se o modo admin está ativo E o usuário digita a senha final...
            const titleElement = document.querySelector('.title'); // ...pega a referência do título principal.
            titleElement.textContent = "PLANO DE DOMINAÇÃO MUNDIAL"; // ...muda o texto visível do título.
            titleElement.dataset.text = "PLANO DE DOMINAÇÃO MUNDIAL"; // ...atualiza o `data-text` para que o efeito glitch funcione com o novo texto.
            document.getElementById('secret-message-container').innerHTML = ''; // ...limpa a mensagem da dica.
            searchInput.value = ''; // ...limpa a busca.
            isDominationMode = true; // ...ativa a flag do modo de dominação.
            fetchAndDisplaySecrets(); // ...carrega e exibe os planos secretos.
            return; // ...encerra a função.
        }
        // --- Fim da Lógica dos Easter Eggs ---

        let visibleCards = 0; // Contador para saber quantos cards estão visíveis após o filtro.

        // Lógica de filtro adaptativa: decide se filtra jogos ou segredos.
        if (isDominationMode) { // Se o modo de dominação estiver ativo...
            // ...filtra os planos secretos.
            gameCardElements.forEach((card, index) => { // Itera sobre os elementos de card na tela.
                const secret = allSecrets[index]; // Pega o plano secreto correspondente.
                const isMatch = secret.plano.toLowerCase().includes(query) || // Verifica se a busca corresponde ao nome do plano...
                                secret.descricao.toLowerCase().includes(query); // ...ou à sua descrição.
                card.style.display = isMatch ? 'flex' : 'none'; // Mostra o card se corresponder, senão oculta.
                if (isMatch) visibleCards++; // Incrementa o contador se o card estiver visível.
            });
        } else { // Se o modo de dominação NÃO estiver ativo...
            // ...filtra os jogos (lógica original).
            gameCardElements.forEach(card => { // Itera sobre os elementos de card na tela.
                const gameId = parseInt(card.dataset.id); // Pega o ID do jogo a partir do 'data-id' do card.
                const game = allGames.find(g => g.id === gameId); // Encontra os dados completos do jogo correspondente.

                if (!game) { // Checagem de segurança: se o card não tiver um jogo correspondente, oculta-o.
                    card.style.display = 'none';
                    return;
                }

                // Verifica se o texto da busca corresponde ao nome, desenvolvedora ou ano do jogo.
                const isMatch = game.nome.toLowerCase().includes(query) ||
                                game.desenvolvedora.toLowerCase().includes(query) ||
                                game.ano_lancamento.toString().includes(query);

                if (isMatch) { // Se houver correspondência...
                    card.style.display = 'flex'; // ...garante que o card esteja visível.
                    visibleCards++; // ...e incrementa o contador.
                } else { // Se não houver correspondência...
                    card.style.display = 'none'; // ...oculta o card.
                }
            }
        )};

        // Aqui poderia ser adicionada uma lógica para mostrar "Nenhum resultado" se visibleCards === 0.
    }

    // Adiciona um "ouvinte" ao campo de busca que chama 'filterGames' toda vez que o usuário digita algo ('input' event).
    searchInput.addEventListener('input', filterGames);

    // "Ouvinte" para quando o usuário clica/foca no campo de busca.
    searchInput.addEventListener('focus', () => {
        clearTimeout(typingTimeout); // Para a animação de digitação do placeholder para não atrapalhar o usuário.
        searchInput.placeholder = 'Buscar por nome, dev, ano...'; // Define um placeholder estático e informativo.
    });

    // "Ouvinte" para quando o usuário clica fora do campo de busca (perde o foco).
    searchInput.addEventListener('blur', () => {
        if (searchInput.value === '') { // Se o campo de busca estiver vazio quando o usuário sair...
            typePlaceholder(); // ...retoma a animação do placeholder.
        }
    });

    // "Ouvintes" para fechar o modal.
    closeModalBtn.addEventListener('click', closeModal); // Fecha o modal ao clicar no botão 'X'.
    modalOverlay.addEventListener('click', (event) => { // Ouve cliques na camada de fundo (overlay).
        if (event.target === modalOverlay) { // Se o alvo do clique foi diretamente o overlay (e não o modal em si)...
            closeModal(); // ...fecha o modal. Isso impede que o modal feche ao clicar dentro dele.
        }
    });

    // --- Inicialização da Aplicação ---
    fetchGames(); // Chama a função para carregar os dados dos jogos assim que o script começa a rodar.
    typePlaceholder(); // Inicia a animação do placeholder.
});