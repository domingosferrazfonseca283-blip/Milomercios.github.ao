import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js';
import { collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';

const app = document.getElementById('checkout-app');
const cartKey = 'milomercios_cart';
const orderKey = 'milomercios_order';
let itensCarrinho = carregarCarrinho();
let currentUser = null;

const money = value => `${Number(value || 0).toLocaleString('pt-AO')} Kz`;

function carregarCarrinho() {
    try {
        const bruto = JSON.parse(localStorage.getItem(cartKey) || '[]');
        if (!Array.isArray(bruto)) return [];
        return bruto.map(item => ({
            ...item,
            quantidade: Math.max(1, Math.floor(Number(item.quantidade) || 1)),
            preco: Number(item.preco) || 0,
            vendedorId: String(item.vendedorId || '').trim()
        })).filter(item => item.id && item.nome && item.preco > 0);
    } catch {
        return [];
    }
}

function calcularTotal(items) {
    return items.reduce((sum, item) => sum + item.preco * item.quantidade, 0);
}

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'\"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' })[char]);
}

function render() {
    itensCarrinho = carregarCarrinho();

    if (!itensCarrinho.length) {
        app.innerHTML = `<section class="card success"><h2>Carrinho vazio</h2><p>Adicione produtos antes de continuar para o checkout.</p><a class="btn" href="index.html" style="display:block;box-sizing:border-box;text-decoration:none;">Voltar à loja</a></section>`;
        return;
    }

    const total = calcularTotal(itensCarrinho);
    app.innerHTML = `<div class="grid"><section class="card"><h2>Dados do cliente</h2><form id="customer-form"><label for="nome">Nome completo *</label><input id="nome" name="nome" autocomplete="name" required placeholder="Ex.: João Manuel"><div class="row"><div><label for="telefone">Telefone *</label><input id="telefone" name="telefone" type="tel" autocomplete="tel" required placeholder="+244 ..."></div><div><label for="email">E-mail</label><input id="email" name="email" type="email" autocomplete="email" placeholder="exemplo@email.com"></div></div><label for="morada">Morada / endereço *</label><textarea id="morada" name="morada" autocomplete="street-address" required placeholder="Rua, bairro, município e outros detalhes"></textarea><label for="pagamento">Método de pagamento *</label><select id="pagamento" name="pagamento" required><option value="">Selecione...</option><option value="transferencia">Transferência bancária</option><option value="multicaixa">Multicaixa / referência</option><option value="entrega">Pagamento na entrega</option></select><button class="btn" type="submit">Confirmar encomenda</button></form></section><aside class="card"><h2>Resumo da compra</h2><div>${itensCarrinho.map(item => { const qty = item.quantidade; return `<div class="item"><span>${escapeHtml(item.nome)} × ${qty}</span><strong>${money(item.preco * qty)}</strong></div>`; }).join('')}</div><div class="total"><span>Total</span><span>${money(total)}</span></div><p style="color:#68707a;font-size:.9rem;">A encomenda será registada no sistema. O processamento automático do pagamento será ligado ao gateway na próxima etapa.</p></aside></div>`;

    document.getElementById('customer-form').addEventListener('submit', submitOrder);
}

async function submitOrder(event) {
    event.preventDefault();
    if (!currentUser) { alert('Inicie sessão para finalizar a encomenda.'); location.href = 'login.html'; return; }

    itensCarrinho = carregarCarrinho();
    if (!itensCarrinho.length) { alert('O carrinho está vazio.'); render(); return; }

    const itensSemVendedor = itensCarrinho.filter(item => !item.vendedorId);
    if (itensSemVendedor.length) {
        alert('Existe produto sem vendedor associado. Volte à loja e adicione novamente esse produto.');
        return;
    }

    const form = new FormData(event.currentTarget);
    const customer = Object.fromEntries(form.entries());
    const sellerIds = [...new Set(itensCarrinho.map(item => item.vendedorId))];
    const total = calcularTotal(itensCarrinho);
    const order = {
        clienteId: currentUser.uid,
        customer,
        items: itensCarrinho,
        total,
        sellerIds,
        paymentMethod: customer.pagamento,
        paymentStatus: 'pendente',
        orderStatus: 'aguardando_pagamento',
        criadoEm: serverTimestamp()
    };

    try {
        const ref = await addDoc(collection(db, 'pedidos'), order);
        localStorage.setItem(orderKey, JSON.stringify({ ...order, id: ref.id, criadoEm: new Date().toISOString() }));
        localStorage.removeItem(cartKey);
        renderConfirmation({ ...order, id: ref.id });
    } catch (error) {
        alert('Não foi possível registar a encomenda: ' + error.message);
    }
}

function renderConfirmation(order) {
    app.innerHTML = `<section class="card success"><h2>Encomenda registada! ✅</h2><p>Obrigado, <strong>${escapeHtml(order.customer.nome)}</strong>.</p><p>Número da encomenda: <strong>${escapeHtml(order.id)}</strong></p><p>Total: <strong>${money(order.total)}</strong></p><p>Método escolhido: <strong>${escapeHtml(order.customer.pagamento)}</strong></p><p style="color:#68707a;">A encomenda já foi enviada para o sistema. O vendedor poderá acompanhá-la pelo painel.</p><a class="btn" href="index.html" style="display:block;box-sizing:border-box;text-decoration:none;">Voltar à loja</a></section>`;
}

onAuthStateChanged(auth, user => { currentUser = user || null; render(); });
