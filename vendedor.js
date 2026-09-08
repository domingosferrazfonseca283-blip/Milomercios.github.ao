import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { collection, addDoc, getDocs, query, where, doc, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const $ = id => document.getElementById(id);
let uid = null;
let perfilAtual = {};

onAuthStateChanged(auth, async user => {
  if (!user) { window.location.href = "login.html"; return; }
  uid = user.uid;
  const perfilSnap = await getDoc(doc(db, "usuarios", uid));
  perfilAtual = perfilSnap.exists() ? perfilSnap.data() : {};
  if (perfilAtual.tipo !== "vendedor") {
    alert("Esta área é exclusiva para vendedores.");
    window.location.href = "index.html";
    return;
  }

  $("saudacao").textContent = `Olá, ${perfilAtual.nomeLoja || user.email}`;
  const contaAtiva = perfilAtual.estadoConta === "ativo";
  const subsAtiva = perfilAtual.subscricaoAtiva === true;
  const podeVender = contaAtiva && subsAtiva;
  $("estado").textContent = !contaAtiva ? "Conta pendente/bloqueada" : subsAtiva ? "Subscrição ativa" : "Aguardando subscrição";
  $("estado").className = `status ${podeVender ? "active" : "pending"}`;
  $("plano").textContent = perfilAtual.planoSubscricao || "Mensal";
  $("btn-produto").disabled = !podeVender;
  $("aviso-venda").textContent = podeVender ? "A sua conta pode publicar produtos." : "A publicação de produtos só fica disponível depois da aprovação da conta e ativação da subscrição pelo administrador.";
  await carregarProdutos();
});

async function carregarProdutos() {
  const snap = await getDocs(query(collection(db, "produtos"), where("vendedorId", "==", uid)));
  $("total-produtos").textContent = snap.size;
  $("lista").innerHTML = snap.empty ? "Ainda não publicou produtos." : "";
  snap.forEach(d => {
    const p = d.data();
    const estado = p.ativo === true ? "Publicado" : "Pendente de aprovação";
    $("lista").innerHTML += `<div class="product"><div><strong>${escapeHtml(p.nome || "Produto")}</strong><br><small>${Number(p.preco || 0).toLocaleString("pt-AO")} Kz · ${escapeHtml(p.categoria || "outros")}</small></div><span class="status ${p.ativo === true ? "active" : "pending"}">${estado}</span></div>`;
  });
}

$("btn-produto").addEventListener("click", async () => {
  if (perfilAtual.estadoConta !== "ativo" || perfilAtual.subscricaoAtiva !== true) {
    return alert("A sua conta ou subscrição ainda não está ativa.");
  }
  const nome = $("p-nome").value.trim();
  const preco = Number($("p-preco").value);
  if (!nome || !preco || preco < 0) return alert("Informe o nome e um preço válido.");
  try {
    await addDoc(collection(db, "produtos"), {
      vendedorId: uid,
      nome,
      preco,
      categoria: $("p-cat").value,
      imagem: $("p-img").value.trim(),
      descricao: $("p-desc").value.trim(),
      ativo: false,
      estadoAprovacao: "pendente",
      criadoEm: serverTimestamp()
    });
    ["p-nome","p-preco","p-img","p-desc"].forEach(id => $(id).value = "");
    alert("Produto enviado para aprovação do administrador.");
    carregarProdutos();
  } catch (e) { console.error(e); alert("Não foi possível enviar o produto: " + e.message); }
});

$("btn-sub").addEventListener("click", async () => {
  try {
    const cfgSnap = await getDoc(doc(db, "configuracao", "subscricao"));
    const cfg = cfgSnap.exists() ? cfgSnap.data() : {};
    const plano = cfg.plano || perfilAtual.planoSubscricao || "mensal";
    const valor = Number(cfg.valor || 0);
    await addDoc(collection(db, "pedidosSubscricao"), {
      vendedorId: uid,
      email: perfilAtual.email || "",
      plano,
      valor,
      estado: "aguardando_pagamento",
      criadoEm: serverTimestamp()
    });
    alert(valor > 0 ? `Pedido de subscrição criado: ${plano} — ${valor.toLocaleString("pt-AO")} Kz. O pagamento será ligado ao gateway escolhido.` : "Pedido de subscrição criado. O administrador ainda precisa configurar o valor e o pagamento.");
  } catch (e) { console.error(e); alert("Não foi possível criar o pedido de subscrição: " + e.message); }
});

$("btn-sair").addEventListener("click", () => signOut(auth));
function escapeHtml(v){return String(v).replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"}[c]));}
