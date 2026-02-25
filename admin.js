// VERIFICAÇÃO DE SEGURANÇA
if (sessionStorage.getItem('logado') !== 'true') {
    alert("Acesso restrito! Por favor, faça login.");
    window.location.href = "login.html";
}

function logout() {
    sessionStorage.removeItem('logado');
    window.location.href = "login.html";
}

// Carregar produtos já existentes ou criar lista vazia
let stock = JSON.parse(localStorage.getItem('milomercios_stock')) || [];

function salvarProduto() {
    const nome = document.getElementById('p-nome').value;
    const preco = document.getElementById('p-preco').value;
    const cat = document.getElementById('p-cat').value;

    if(nome === "" || preco === "") {
        alert("Preencha todos os campos!");
        return;
    }

    const novoProd = {
        id: Date.now(), // Gera um ID único baseado no tempo
        nome: nome,
        preco: preco,
        categoria: cat,
        img: "https://via.placeholder.com/150"
    };

    stock.push(novoProd);
    localStorage.setItem('milomercios_stock', JSON.stringify(stock));
    
    alert("Produto guardado com sucesso!");
    limparCampos();
    listarNoAdmin();
}

function listarNoAdmin() {
    const lista = document.getElementById('admin-list');
    lista.innerHTML = "<h3>Produtos em Stock</h3>";
    
    stock.forEach(p => {
        lista.innerHTML += `
            <div class="admin-item">
                <span>${p.nome} - ${p.preco}</span>
                <button onclick="remover(${p.id})" style="background:red; color:white; border:none; padding:5px;">X</button>
            </div>
        `;
    });
}

function remover(id) {
    stock = stock.filter(p => p.id !== id);
    localStorage.setItem('milomercios_stock', JSON.stringify(stock));
    listarNoAdmin();
}

function limparCampos() {
    document.getElementById('p-nome').value = "";
    document.getElementById('p-preco').value = "";
}

// Iniciar a lista ao abrir a página
listarNoAdmin();
