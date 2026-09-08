import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { doc, getDoc, setDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const $ = id => document.getElementById(id);
let stock = JSON.parse(localStorage.getItem('milomercios_stock')) || [];

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
  listarNoAdmin();
  const cfg = await getDoc(doc(db, 'configuracao', 'subscricao'));
  if (cfg.exists()) { $('sub-plano').value = cfg.data().plano || 'mensal'; $('sub-valor').value = cfg.data().valor || ''; }
});

$('btn-logout').addEventListener('click', () => signOut(auth));
$('btn-sub').addEventListener('click', async () => {
  const valor = Number($('sub-valor').value);
  if (!valor || valor < 0) return alert('Informe um valor válido.');
  await setDoc(doc(db, 'configuracao', 'subscricao'), { plano: $('sub-plano').value, valor, atualizadoEm: new Date() });
  alert('Configuração de subscrição guardada.');
});

function listarNoAdmin() {
  const lista = $('admin-list');
  if (!stock.length) { lista.textContent = 'Nenhum produto local. Os novos produtos dos vendedores ficam na coleção produtos do Firebase.'; return; }
  lista.innerHTML = stock.map(p => `<div class="admin-item"><span>${escapeHtml(p.nome)} — ${Number(p.preco || 0).toLocaleString('pt-AO')} Kz</span><button onclick="remover(${p.id})">Remover</button></div>`).join('');
}
window.remover = function(id){ stock = stock.filter(p => p.id !== id); localStorage.setItem('milomercios_stock', JSON.stringify(stock)); listarNoAdmin(); };
function escapeHtml(v){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
