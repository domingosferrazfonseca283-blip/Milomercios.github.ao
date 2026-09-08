import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js';
import { collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';

const app = document.getElementById('checkout-app');
const cartKey = 'milomercios_cart';
const orderKey = 'milomercios_order';
const items = JSON.parse(localStorage.getItem(cartKey) || '[]');
const money = value => `${Number(value || 0).toLocaleString('pt-AO')} Kz`;
const total = items.reduce((sum, item) => sum + (Number(item.preco) || 0) * (Number(item.quantidade) || 1), 0);
let currentUser = null;

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' })[char]);
}

function render() {
    if (!items.length) {
        app.innerHTML = `<section class="card success"><h2>Carrinho vazio</h2><p>Adicione produtos antes de continuar para o checkout.</p><a class="btn" href="index.html" style="display:block;box-sizing:border-box;text-decoration:none;">Voltar à loja</a></section>`;
        return;
    }
    app.innerHTML = `<div class="grid"><section class="card"><h2>Dados do cliente</h2><form id="customer-form"><label for="nome">Nome completo *</label><input id="nome" name="nome" autocomplete="name" required placeholder="Ex.: João Manuel"><div class="row"><div><label for="telefone">Telefone *</label><input id="telefone" name="telefone" type="tel" autocomplete="tel" required placeholder="+244 ..."></div><div><label for="email">E-mail</label><input id="email" name="email" type="email" autocomplete="email" placeholder="exemplo@email.com"></div></div><label for="morada">Morada / endereço *</label><textarea id="morada" name="morada" autocomplete="street-address" required placeholder="Rua, bairro, município e outros detalhes"></textarea><label for="pagamento">Método de pagamento *</label><select id="pagamento" name="pagamento" required><option value="">Selecione...</option><option value="transferencia">Transferência bancária</option><option value="multicaixa">Multicaixa / referência</option><option value="entrega">Pagamento na entrega</option></select><button class="btn" type="submit">Confirmar encomenda</button></form></section><aside class="card"><h2>Resumo da compra</h2><div>${items.map(item => { const qty = Number(item.quantidade) || 1; return `<div class="item"><span>${escapeHtml(item.nome)} × ${qty}</span><strong>${money((Number(item.preco)||0) * qty)}</strong></div>`; }).join('')}</div><div class="total"><span>Total</span><span>${money(total)}</span></div><p style="color:#68707a;font-size:.9rem;">A encomenda será registada no sistema. O processamento automático do pagamento será ligado ao gateway na próxima etapa.</p></aside></div>`;
    document.getElementById('customer-form').addEventListener('submit', submitOrder);
}

async function submitOrder(event) {
    event.preventDefault();
    if (!currentUser) { alert('Inicie sessão para finalizar a encomenda.'); location.href = 'login.html'; return; }
    const form = new FormData(event.currentTarget);
    const customer = Object.fromEntries(form.entries());
    const sellerIds = [...new Set(items.map(item => item.vendedorId).filter(Boolean))];
    if (!sellerIds.length) { alert('Este carrinho contém produtos sem vendedor associado. Atualize os produtos antes de continuar.'); return; }
    const order = { clienteId: currentUser.uid, customer, items, total, sellerIds, paymentMethod: customer.pagamento, paymentStatus: 'pendente', orderStatus: 'aguardando_pagamento', criadoEm: serverTimestamp() };
    try {
        const ref = await addDoc(collection(db, 'pedidos'), order);
        localStorage.setItem(orderKey, JSON.stringify({ ...order, id: ref.id, criadoEm: new Date().toISOString() }));
        localStorage.removeItem(cartKey);
        renderConfirmation({ ...order, id: ref.id });
    } catch (error) { alert('Não foi possível registar a encomenda: ' + error.message); }
}

function renderConfirmation(order) {
    app.innerHTML = `<section class="card success"><h2>Encomenda registada! ✅</h2><p>Obrigado, <strong>${escapeHtml(order.customer.nome)}</strong>.</p><p>Número da encomenda: <strong>${escapeHtml(order.id)}</strong></p><p>Total: <strong>${money(order.total)}</strong></p><p>Método escolhido: <strong>${escapeHtml(order.customer.pagamento)}</strong></p><p style="color:#68707a;">A encomenda já foi enviada para o sistema. O vendedor poderá acompanhá-la pelo painel.</p><a class="btn" href="index.html" style="display:block;box-sizing:border-box;text-decoration:none;">Voltar à loja</a></section>`;
}

onAuthStateChanged(auth, user => { currentUser = user || null; render(); });
