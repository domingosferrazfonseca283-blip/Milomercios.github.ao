let produtos = [
  { id: 101, nome: "Smartphone Pro", preco: 25000, categoria: "eletronicos", img: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300" },
  { id: 102, nome: "Tênis Runner", preco: 4500, categoria: "moda", img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300" }
];
const app = document.getElementById('app');
const cartCount = document.getElementById('cart-count');
let categoriaAtual = 'todos';

function renderizarLoja() {
  const lista = categoriaAtual === 'todos' ? produtos : produtos.filter(p => p.categoria === categoriaAtual);
  app.innerHTML = lista.length ? lista.map(prod => `
    <div class="product-card"><img src="${escapeHtml(prod.img || '')}" alt="${escapeHtml(prod.nome)}"><h3>${escapeHtml(prod.nome)}</h3><p>${Number(prod.preco || 0).toLocaleString('pt-AO')} Kz</p><button class="btn-buy" onclick="adicionarAoCarrinho(${Number(prod.id)})"><i class="fas fa-cart-plus"></i> Comprar</button></div>`).join('') : '<p style="padding:20px">Nenhum produto nesta categoria.</p>';
}

function filter(categoria) { categoriaAtual = categoria; renderizarLoja(); }
window.filter = filter;

function adicionarAoCarrinho(id) {
  const produto = produtos.find(p => p.id === id);
  if (!produto) return;
  const carrinho = JSON.parse(localStorage.getItem('milomercios_cart')) || [];
  carrinho.push(produto);
  localStorage.setItem('milomercios_cart', JSON.stringify(carrinho));
  cartCount.innerText = carrinho.length;
  alert(`Sucesso! ${produto.nome} adicionado ao carrinho.`);
}
window.adicionarAoCarrinho = adicionarAoCarrinho;

function escapeHtml(v){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
window.onload = () => { renderizarLoja(); cartCount.innerText = (JSON.parse(localStorage.getItem('milomercios_cart')) || []).length; };
