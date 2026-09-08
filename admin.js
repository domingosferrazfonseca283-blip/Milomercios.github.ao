import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { doc, getDoc, setDoc, collection, getDocs, updateDoc, query, where, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const $ = id => document.getElementById(id);
let vendedores = [];
let produtos = [];

onAuthStateChanged(auth, async user => {
  if (!user) { window.location.href = 'login.html'; return; }
  const snap = await getDoc(doc(db, 'usuarios', user.uid));
  const perfil = snap.exists() ? snap.data() : {};
  if (perfil.tipo !== 'admin') {
    alert('Acesso exclusivo do administrador.');
    window.location.href = perfil.tipo === 'vendedor' ? 'vendedor.html' : 'index.html';
    return;
  }
  $('admin-info').textContent = `Administrador autenticado: ${user.email}`;
  await carregarConfiguracao();
  await carregarVendedores();
  await carregarProdutos();
});

async function carregarConfiguracao() {
  const cfg = await getDoc(doc(db, 'configuracao', 'subscricao'));
  if (cfg.exists()) {
    $('sub-plano').value = cfg.data().plano || 'mensal';
    $('sub-valor').value = cfg.data().valor ?? '';
  }
}

$('btn-logout').addEventListener('click', () => signOut(auth));
$('btn-sub').addEventListener('click', async () => {
  const valor = Number($('sub-valor').value);
  if (!valor || valor < 0) return alert('Informe um valor válido.');
  await setDoc(doc(db, 'configuracao', 'subscricao'), { plano: $('sub-plano').value, valor, atualizadoEm: serverTimestamp() }, { merge: true });
  alert('Configuração de subscrição guardada.');
});

async function carregarVendedores() {
  const snap = await getDocs(query(collection(db, 'usuarios'), where('tipo', '==', 'vendedor')));
  vendedores = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  $('total-vendedores').textContent = vendedores.length;
  $('total-ativos').textContent = vendedores.filter(v => v.subscricaoAtiva === true && v.estadoConta === 'ativo').length;
  $('vendedores-list').innerHTML = vendedores.length ? vendedores.map(v => `
    <div class="admin-item">
      <div><strong>${escapeHtml(v.nomeLoja || 'Sem nome')}</strong><br><small>${escapeHtml(v.email || '')} · Conta: ${escapeHtml(v.estadoConta || 'pendente')} · Subscrição: ${v.subscricaoAtiva === true ? 'ativa' : 'inativa'}</small></div>
      <div class="actions">
        <button class="btn" onclick="alternarConta('${v.id}',${v.estadoConta === 'ativo'})">${v.estadoConta === 'ativo' ? 'Bloquear conta' : 'Aprovar conta'}</button>
        <button class="${v.subscricaoAtiva === true ? 'btn-danger' : 'btn'}" onclick="alternarSubscricao('${v.id}',${v.subscricaoAtiva === true})">${v.subscricaoAtiva === true ? 'Retirar subscrição' : 'Conceder subscrição'}</button>
      </div>
    </div>`).join('') : '<p>Nenhum vendedor registado.</p>';
}

async function carregarProdutos() {
  const snap = await getDocs(collection(db, 'produtos'));
  produtos = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  $('total-produtos').textContent = produtos.length;
  $('produtos-list').innerHTML = produtos.length ? produtos.map(p => `
    <div class="admin-item"><div><strong>${escapeHtml(p.nome || 'Produto')}</strong><br><small>${Number(p.preco || 0).toLocaleString('pt-AO')} Kz · ${escapeHtml(p.categoria || 'outros')} · ${p.ativo === true ? 'publicado' : 'pendente/oculto'}</small></div>
    <button class="${p.ativo !== true ? 'btn' : 'btn-danger'}" onclick="alternarProduto('${p.id}',${p.ativo === true})">${p.ativo === true ? 'Ocultar' : 'Aprovar/Publicar'}</button></div>`).join('') : '<p>Nenhum produto registado.</p>';
}

window.alternarConta = async (id, ativa) => {
  await updateDoc(doc(db, 'usuarios', id), { estadoConta: ativa ? 'bloqueado' : 'ativo', atualizadoEm: serverTimestamp() });
  await carregarVendedores();
  alert(ativa ? 'Conta do vendedor bloqueada.' : 'Conta do vendedor aprovada.');
};

window.alternarSubscricao = async (id, ativa) => {
  await updateDoc(doc(db, 'usuarios', id), { subscricaoAtiva: !ativa, atualizadoEm: serverTimestamp() });
  await carregarVendedores();
  alert(!ativa ? 'Acesso de venda concedido.' : 'Subscrição retirada.');
};

window.alternarProduto = async (id, ativo) => {
  await updateDoc(doc(db, 'produtos', id), { ativo: !ativo, estadoAprovacao: !ativo ? 'aprovado' : 'oculto', atualizadoEm: serverTimestamp() });
  await carregarProdutos();
};

function escapeHtml(v){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
