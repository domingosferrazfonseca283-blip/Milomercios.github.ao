let itensCarrinho = JSON.parse(localStorage.getItem('milomercios_cart') || '[]');
const listaHtml = document.getElementById('cart-list');
const totalHtml = document.getElementById('cart-total');

const money = value => `${Number(value || 0).toLocaleString('pt-AO')} Kz`;

function renderizarCarrinho() {
    listaHtml.innerHTML = '';
    let somaTotal = 0;

    if (!itensCarrinho.length) {
        listaHtml.innerHTML = "<p style='text-align:center;padding:20px;'>O seu carrinho está vazio.</p>";
        totalHtml.innerText = '0,00';
        return;
    }

    itensCarrinho.forEach((item, index) => {
        const quantidade = Number(item.quantidade) || 1;
        const preco = Number(item.preco) || 0;
        somaTotal += preco * quantidade;
        listaHtml.innerHTML += `
            <div class="cart-item">
                <div><strong>${item.nome}</strong><br><span>${money(preco)} × ${quantidade}</span></div>
                <button onclick="removerDoCarrinho(${index})" style="color:red;border:none;background:none;font-weight:bold;cursor:pointer;">Remover</button>
            </div>`;
    });

    totalHtml.innerText = somaTotal.toLocaleString('pt-AO');
}

function removerDoCarrinho(index) {
    itensCarrinho.splice(index, 1);
    localStorage.setItem('milomercios_cart', JSON.stringify(itensCarrinho));
    renderizarCarrinho();
}

function limparCarrinho() {
    itensCarrinho = [];
    localStorage.setItem('milomercios_cart', '[]');
    renderizarCarrinho();
}

renderizarCarrinho();
