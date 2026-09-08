import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { collection, addDoc, getDocs, query, where, doc, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const $ = id => document.getElementById(id);
let uid = null;

onAuthStateChanged(auth, async user => {
  if (!user) { window.location.href = "login.html"; return; }
  uid = user.uid;
  const perfilSnap = await getDoc(doc(db, "usuarios", uid));
  const perfil = perfilSnap.exists() ? perfilSnap.data() : {};
  if (perfil.tipo !== "vendedor") {
    alert("Esta área é exclusiva para vendedores.");
    window.location.href = "index.html";
    return;
  }
  $("saudacao").textContent = `Olá, ${perfil.nomeLoja || user.email}`;
  $("estado").textContent = perfil.subscricaoAtiva === false ? "Subscrição vencida" : "Ativa / em configuração";
  $("estado").className = `status ${perfil.subscricaoAtiva === false ? "pending" : "active"}`;
  $("plano").textContent = perfil.planoSubscricao || "Mensal";
  await carregarProdutos();
});

async function carregarProdutos() {
  const snap = await getDocs(query(collection(db, "produtos"), where("vendedorId", "==", uid)));
  $("total-produtos").textContent = snap.size;
  $("lista").innerHTML = snap.empty ? "Ainda não publicou produtos." : "";
  snap.forEach(d => {
    const p = d.data();
    $("lista").innerHTML += `<div class="product"><div><strong>${escapeHtml(p.nome || "Produto")}</strong><br><small>${Number(p.preco || 0).toLocaleString("pt-AO")} Kz · ${escapeHtml(p.categoria || "outros")}</small></div><span class="status ${p.ativo === false ? "pending" : "active"}">${p.ativo === false ? "Pendente" : "Publicado"}</span></div>`;
  });
}

$("btn-produto").addEventListener("click", async () => {
  const nome = $("p-nome").value.trim();
  const preco = Number($("p-preco").value);
  if (!nome || !preco || preco < 0) return alert("Informe o nome e um preço válido.");
  try {
    await addDoc(collection(db, "produtos"), { vendedorId: uid, nome, preco, categoria: $("p-cat").value, imagem: $("p-img").value.trim(), descricao: $("p-desc").value.trim(), ativo: true, criadoEm: serverTimestamp() });
    ["p-nome","p-preco","p-img","p-desc"].forEach(id => $(id).value = "");
    alert("Produto publicado com sucesso!");
    carregarProdutos();
  } catch (e) { console.error(e); alert("Não foi possível publicar o produto: " + e.message); }
});

$("btn-sub").addEventListener("click", () => alert("A área de pagamento da subscrição será ligada ao método de pagamento escolhido pelo administrador."));
$("btn-sair").addEventListener("click", () => signOut(auth));
function escapeHtml(v){return String(v).replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"}[c]));}
