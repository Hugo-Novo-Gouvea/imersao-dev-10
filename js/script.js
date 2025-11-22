// Seleciona o container onde os cards serão inseridos
const cardContainer = document.querySelector('.card-container');

// Variável para armazenar todos os dados carregados do JSON
let todosOsDados = [];

// Função para buscar os dados do arquivo JSON
// Usamos async/await para lidar com a operação assíncrona (leitura do arquivo)
async function carregarDados() {
    try {
        // Faz a requisição para o arquivo dados.json
        const response = await fetch('dados.json');
        // Converte a resposta em formato JSON
        todosOsDados = await response.json();
        // Exibe todos os dados inicialmente
        exibirDados(todosOsDados);
    } catch (error) {
        // Exibe um erro no console se não conseguir carregar o arquivo
        console.error('Erro ao carregar dados:', error);
    }
}

// Função para exibir os dados na tela, criando os cards
function exibirDados(dados) {
    // Limpa o container de cards antes de adicionar novos
    cardContainer.innerHTML = '';

    // Para cada item nos dados, cria um card HTML
    dados.forEach(item => {
        const card = `
            <article class="card">
                <h2>${item.nome}</h2>
                <p>${item.descricao}</p>
            </article>
        `;
        // Insere o card criado no container
        cardContainer.innerHTML += card;
    });
}

// Função que é chamada quando o botão de busca é clicado
function iniciarBusca() {
    // Pega o valor digitado no campo de busca e converte para minúsculas
    const termoBusca = document.getElementById('caixa-busca').value.toLowerCase();

    // Filtra os dados com base no termo de busca
    // Verifica se o nome ou a descrição do item (em minúsculas) incluem o termo de busca
    const dadosFiltrados = todosOsDados.filter(item => 
        item.nome.toLowerCase().includes(termoBusca) || item.descricao.toLowerCase().includes(termoBusca)
    );

    // Exibe os dados filtrados na tela
    exibirDados(dadosFiltrados);
}

// Chama a função para carregar os dados assim que a página for carregada
carregarDados();