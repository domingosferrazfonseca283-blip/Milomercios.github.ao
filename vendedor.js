import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { collection, addDoc, getDocs, query, where, doc, getDoc, serverTimestamp, limit } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const $ = id => document.getElementById(id);
let uid = null;
let perfilAtual = {};
let configSub = {};

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
  await carregarConfiguracao();
  await carregarProdutos();
  await carregarUltimoPedido();
});

async function carregarConfiguracao() {
  const snap = await getDoc(doc(db, "configuracao", "subscricao"));
  configSub = snap.exists() ? snap.data() : {};
  const plano = configSub.plano || perfilAtual.planoSubscricao || "mensal";
  const valor = Number(configSub.valor || 0);
  $("btn-sub").textContent = valor > 0 ? `Pagar ${plano} — ${valor.toLocaleString("pt-AO")} Kz` : "Solicitar/renovar subscrição";
}

async function carregarUltimoPedido() {
  try {
    const snap = await getDocs(query(collection(db, "pedidosSubscricao"), where("vendedorId", "==", uid), limit(20)));
    if (!snap.empty) {
      const pedidos = snap.docs.map(d => d.data()).sort((a,b) => (b.criadoEm?.seconds || 0) - (a.criadoEm?.seconds || 0));
      const ultimo = pedidos[0];
      if (ultimo.estado === "aguardando_pagamento") $("aviso-venda").textContent += " Já existe um pedido de subscrição aguardando confirmação do pagamento.";
    }
  } catch (e) { console.warn("Não foi possível carregar o último pedido", e); }
}

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
  if (perfilAtual.estadoConta !== "ativo" || perfilAtual.subscricaoAtiva !== true) return alert("A sua conta ou subscrição ainda não está ativa.");
  const nome = $("p-nome").value.trim();
  const preco = Number($("p-preco").value);
  if (!nome || !Number.isFinite(preco) || preco < 0) return alert("Informe o nome e um preço válido.");
  try {
    await addDoc(collection(db, "produtos"), { vendedorId: uid, nome, preco, categoria: $("p-cat").value, imagem: $("p-img").value.trim(), descricao: $("p-desc").value.trim(), ativo: false, estadoAprovacao: "pendente", criadoEm: serverTimestamp() });
    ["p-nome","p-preco","p-img","p-desc"].forEach(id => $(id).value = "");
    alert("Produto enviado para aprovação do administrador.");
    carregarProdutos();
  } catch (e) { console.error(e); alert("Não foi possível enviar o produto: " + e.message); }
});

$("btn-sub").addEventListener("click", async () => {
  try {
    const plano = configSub.plano || perfilAtual.planoSubscricao || "mensal";
    const valor = Number(configSub.valor || 0);
    if (!valor || valor <= 0) return alert("O administrador ainda não configurou o valor da subscrição.");
    const existente = await getDocs(query(collection(db, "pedidosSubscricao"), where("vendedorId", "==", uid), where("estado", "==", "aguardando_pagamento"), limit(1)));
    if (!existente.empty) {
      if (configSub.linkPagamento) window.open(configSub.linkPagamento, "_blank", "noopener,noreferrer");
      return alert(configSub.linkPagamento ? "Já existe um pedido. Abrimos o link de pagamento configurado." : "Já existe um pedido de subscrição aguardando confirmação.");
    }
    const ref = await addDoc(collection(db, "pedidosSubscricao"), { vendedorId: uid, email: perfilAtual.email || auth.currentUser?.email || "", plano, valor, estado: "aguardando_pagamento", criadoEm: serverTimestamp() });
    if (configSub.linkPagamento) {
      window.open(configSub.linkPagamento, "_blank", "noopener,noreferrer");
      alert("Pedido criado. A janela de pagamento foi aberta. Depois do pagamento, aguarde a confirmação do administrador.");
    } else {
      alert(`Pedido criado: ${plano} — ${valor.toLocaleString("pt-AO")} Kz. O administrador ainda precisa configurar o link de pagamento.`);
    }
  } catch (e) { console.error(e); alert("Não foi possível criar o pedido de subscrição: " + e.message); }
});

$("btn-sair").addEventListener("click", () => signOut(auth));
function escapeHtml(v){return String(v).replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"}[c]));}
