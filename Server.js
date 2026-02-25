const express = require('express');
const mongoose = require('mongoose');
const app = express();

// Conexão com o Banco de Dados Real
mongoose.connect('SUA_URL_DO_MONGODB_AQUI');

// Modelo de Produto para o Banco
const Produto = mongoose.model('Produto', {
    nome: String,
    preco: Number,
    categoria: String,
    imagem: String
});

// Rota para a Loja buscar produtos do Banco
app.get('/api/produtos', async (req, res) => {
    const produtos = await Produto.find();
    res.json(produtos);
});

app.listen(3000, () => console.log("Milomércios Online na porta 3000!"));
