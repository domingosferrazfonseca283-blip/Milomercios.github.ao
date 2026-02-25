// 1. Carregar itens do carrinho
let itensCarrinho = JSON.parse(localStorage.getItem('milomercios_cart')) || [];
const listaHtml = document.getElementById('cart-list');
const totalHtml = document.getElementById('cart-total');

function renderizarCarrinho() {
    listaHtml.innerHTML = "";
    let somaTotal = 0;

    if (itensCarrinho.length === 0) {
        listaHtml.innerHTML = "<p style='text-align:center; padding:20px;'>O seu carrinho está vazio.</p>";
        totalHtml.innerText = "0,00";
        return;
    }

    itensCarrinho.forEach((item, index) => {
        somaTotal += parseFloat(item.preco);
        listaHtml.innerHTML += `
            <div class="cart-item" style="display:flex; justify-content:space-between; align-items:center; background:white; padding:15px; margin-bottom:10px; border-radius:8px;">
                <div>
                    <strong>${item.nome}</strong><br>
                    <span>${item.preco.toLocaleString('pt-PT')} MT</span>
                </div>
                <button onclick="removerDoCarrinho(${index})" style="color:red; border:none; background:none; font-weight:bold;">Remover</button>
            </div>
        `;
    });

    totalHtml.innerText = somaTotal.toLocaleString('pt-PT');
}

function removerDoCarrinho(index) {
    itensCarrinho.splice(index, 1);
    localStorage.setItem('milomercios_cart', JSON.stringify(itensCarrinho));
    renderizarCarrinho();
}

// 2. A MAGIA: Enviar para o WhatsApp
function finalizarCompra() {
    if (itensCarrinho.length === 0) {
        alert("Adicione produtos antes de finalizar!");
        return;
    }

    let numeroTelefone = "+244938820401"; // SUBSTITUA PELO SEU NÚMERO (com código do país)
    let mensagem = `*Novo Pedido - Milomércios*\n\n`;
    
    itensCarrinho.forEach(item => {
        mensagem += `- ${item.nome}: ${item.preco} MT\n`;
    });

    mensagem += `\n*Total: ${totalHtml.innerText} MT*`;

    // Criar o link do WhatsApp
    let url = `https://wa.me/${numeroTelefone}?text=${encodeURIComponent(mensagem)}`;
    
    // Abrir o WhatsApp
    window.open(url, '_blank');
}

renderizarCarrinho();
