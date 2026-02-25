// 1. Tenta carregar os produtos do Admin, se não existir, usa uma lista de exemplo
let produtos = JSON.parse(localStorage.getItem('milomercios_stock')) || [
    { id: 101, nome: "Smartphone Pro", preco: 25000, categoria: "eletronicos", img: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300" },
    { id: 102, nome: "Tênis Runner", preco: 4500, categoria: "moda", img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300" }
];

const app = document.getElementById('app');
const cartCount = document.getElementById('cart-count');

// 2. Função para desenhar os produtos na tela
function renderizarLoja() {
    app.innerHTML = ""; // Limpa a tela antes de carregar

    produtos.forEach(prod => {
        app.innerHTML += `
            <div class="product-card">
                <img src="${prod.img}" alt="${prod.nome}">
                <h3>${prod.nome}</h3>
                <p>${prod.preco.toLocaleString('pt-PT')} MT</p>
                <button class="btn-buy" onclick="adicionarAoCarrinho(${prod.id})">
                    <i class="fas fa-cart-plus"></i> Comprar
                </button>
            </div>
        `;
    });
}

// 3. Função para adicionar ao carrinho
function adicionarAoCarrinho(id) {
    const produtoEscolhido = produtos.find(p => p.id === id);
    
    // Pega o que já está no carrinho ou cria lista vazia
    let carrinho = JSON.parse(localStorage.getItem('milomercios_cart')) || [];
    
    carrinho.push(produtoEscolhido);
    
    // Guarda no "banco" do telemóvel
    localStorage.setItem('milomercios_cart', JSON.stringify(carrinho));
    
    // Atualiza o contador visual
    cartCount.innerText = carrinho.length;
    
    alert(`Sucesso! ${produtoEscolhido.nome} adicionado.`);
}

// 4. Iniciar a loja ao abrir a página
window.onload = () => {
    renderizarLoja();
    // Atualiza o contador do carrinho se já houver itens salvos
    let carrinhoExistente = JSON.parse(localStorage.getItem('milomercios_cart')) || [];
    cartCount.innerText = carrinhoExistente.length;
};
