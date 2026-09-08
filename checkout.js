const app = document.getElementById('checkout-app');
const cartKey = 'milomercios_cart';
const orderKey = 'milomercios_order';
const items = JSON.parse(localStorage.getItem(cartKey) || '[]');

const money = value => `${Number(value || 0).toLocaleString('pt-AO')} Kz`;
const total = items.reduce((sum, item) => sum + (Number(item.preco) || 0) * (Number(item.quantidade) || 1), 0);

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' })[char]);
}

function render() {
    if (!items.length) {
        app.innerHTML = `<section class="card success"><h2>Carrinho vazio</h2><p>Adicione produtos antes de continuar para o checkout.</p><a class="btn" href="index.html" style="display:block;box-sizing:border-box;text-decoration:none;">Voltar à loja</a></section>`;
        return;
    }

    app.innerHTML = `
        <div class="grid">
            <section class="card">
                <h2>Dados do cliente</h2>
                <form id="customer-form">
                    <label for="nome">Nome completo *</label>
                    <input id="nome" name="nome" autocomplete="name" required placeholder="Ex.: João Manuel">
                    <div class="row">
                        <div><label for="telefone">Telefone *</label><input id="telefone" name="telefone" type="tel" autocomplete="tel" required placeholder="+244 ..."></div>
                        <div><label for="email">E-mail</label><input id="email" name="email" type="email" autocomplete="email" placeholder="exemplo@email.com"></div>
                    </div>
                    <label for="morada">Morada / endereço *</label>
                    <textarea id="morada" name="morada" autocomplete="street-address" required placeholder="Rua, bairro, município e outros detalhes"></textarea>
                    <label for="pagamento">Método de pagamento *</label>
                    <select id="pagamento" name="pagamento" required>
                        <option value="">Selecione...</option>
                        <option value="transferencia">Transferência bancária</option>
                        <option value="multicaixa">Multicaixa / referência</option>
                        <option value="entrega">Pagamento na entrega</option>
                    </select>
                    <button class="btn" type="submit">Continuar para pagamento</button>
                </form>
            </section>
            <aside class="card">
                <h2>Resumo da compra</h2>
                <div>${items.map(item => {
                    const qty = Number(item.quantidade) || 1;
                    return `<div class="item"><span>${escapeHtml(item.nome)} × ${qty}</span><strong>${money((Number(item.preco)||0) * qty)}</strong></div>`;
                }).join('')}</div>
                <div class="total"><span>Total</span><span>${money(total)}</span></div>
                <p style="color:#68707a;font-size:.9rem;">O pagamento ainda não é processado automaticamente nesta etapa.</p>
            </aside>
        </div>`;

    document.getElementById('customer-form').addEventListener('submit', submitOrder);
}

function submitOrder(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const customer = Object.fromEntries(form.entries());
    const order = {
        id: `MIL-${Date.now().toString(36).toUpperCase()}`,
        createdAt: new Date().toISOString(),
        customer,
        items,
        total,
        paymentStatus: 'pendente',
        orderStatus: 'aguardando_pagamento'
    };

    localStorage.setItem(orderKey, JSON.stringify(order));
    renderConfirmation(order);
}

function renderConfirmation(order) {
    app.innerHTML = `
        <section class="card success">
            <h2>Encomenda preparada! ✅</h2>
            <p>Obrigado, <strong>${escapeHtml(order.customer.nome)}</strong>.</p>
            <p>Número da encomenda: <strong>${escapeHtml(order.id)}</strong></p>
            <p>Total: <strong>${money(order.total)}</strong></p>
            <p>Método escolhido: <strong>${escapeHtml(order.customer.pagamento)}</strong></p>
            <p style="color:#68707a;">A encomenda foi guardada no navegador com pagamento pendente. A integração com o gateway de pagamento será adicionada na próxima etapa.</p>
            <a class="btn" href="index.html" style="display:block;box-sizing:border-box;text-decoration:none;">Voltar à loja</a>
        </section>`;
}

render();
