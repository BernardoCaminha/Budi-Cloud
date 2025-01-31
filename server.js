const {Storage} = require('@google-cloud/storage');
const storage = new Storage({
  keyFilename: './armazenamento-db-budi.json' 
});
const bucket = storage.bucket('delicias_budi'); 
   
const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const moment = require('moment');

const app = express();
const port = 3000;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'Delicias_Budi',
  password: '1234',
  port: 5432,
});

app.use(express.static('public'));
app.use(bodyParser.json());

//funções do google cloud
   async function salvarNaNuvem(chave, dados) {
     const file = bucket.file(chave);
     await file.save(JSON.stringify(dados));
     console.log(`Dados salvos na nuvem: ${chave}`);
   }

   async function recuperarDaNuvem(chave) {
     const file = bucket.file(chave);
     const [conteudo] = await file.download();
     return JSON.parse(conteudo.toString());
   }

// Rota para buscar todos os itens de pronta entrega
   app.get('/api/pronta_entrega', async (req, res) => {
     try {
       const result = await pool.query('SELECT * FROM pronta_entrega');
       
       // Recuperar dados adicionais da nuvem
       for (let produto of result.rows) {
         try {
           const dadosNuvem = await recuperarDaNuvem(`pronta_entrega/${produto.id}`);
           produto.dadosNuvem = dadosNuvem;
         } catch (error) {
           console.error(`Erro ao recuperar dados da nuvem para o produto ${produto.id}:`, error);
         }
       }

       res.json(result.rows);
     } catch (err) {
       console.error(err);
       res.status(500).json({ error: 'Erro ao buscar produtos' });
     }
   });
   
   app.get('/api/estoque_materiais', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM estoque_materiais');
    
    // Recuperar dados adicionais da nuvem
    for (let material of result.rows) {
      try {
        const dadosNuvem = await recuperarDaNuvem(`estoque_materiais/${material.id}`);
        material.dadosNuvem = dadosNuvem;
      } catch (error) {
        console.error(`Erro ao recuperar dados da nuvem para o material ${material.id}:`, error);
      }
    }

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar materiais' });
  }
});

// Rota para buscar todos os pedidos de clientes
app.get('/api/pedidos_clientes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM pedidos_clientes');
    
    // Recuperar dados adicionais da nuvem
    for (let pedido of result.rows) {
      try {
        const dadosNuvem = await recuperarDaNuvem(`pedidos_clientes/${pedido.id}`);
        pedido.dadosNuvem = dadosNuvem;
      } catch (error) {
        console.error(`Erro ao recuperar dados da nuvem para o pedido ${pedido.id}:`, error);
      }
    }

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar pedidos' });
  }
});

// Adicionar item à pronta entrega
   app.post('/api/pronta_entrega', async (req, res) => {
     try {
       const { nome, quantidade, preco } = req.body;
       const result = await pool.query(
         'INSERT INTO pronta_entrega (nome, quantidade, preco) VALUES ($1, $2, $3) RETURNING *',
         [nome, quantidade, preco]
       );
       
       // Salvar na nuvem
       await salvarNaNuvem(`pronta_entrega/${result.rows[0].id}`, result.rows[0]);

       res.json(result.rows[0]);
     } catch (err) {
       console.error(err);
       res.status(500).json({ error: 'Erro ao adicionar produto' });
     }
   });

// Remover item da pronta entrega
app.delete('/api/pronta_entrega/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM pronta_entrega WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    res.json({ message: 'Produto removido com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao remover produto' });
  }
});

// Adicionar material ao estoque
app.post('/api/estoque_materiais', async (req, res) => {
  try {
    const { nome, quantidade } = req.body;
    const result = await pool.query(
      'INSERT INTO estoque_materiais (nome, quantidade) VALUES ($1, $2) RETURNING *',
      [nome, quantidade]
    );
    
    // Salvar na nuvem
    await salvarNaNuvem(`estoque_materiais/${result.rows[0].id}`, result.rows[0]);

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao adicionar material' });
  }
});

// Remover material do estoque
app.delete('/api/estoque_materiais/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM estoque_materiais WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Material não encontrado' });
    }
    res.json({ message: 'Material removido com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao remover material' });
  }
});

// Adicionar pedido
app.post('/api/pedidos_clientes', async (req, res) => {
  try {
    const { nome_cliente, telefone, descricao_pedido, preco, prazo_entrega } = req.body;
    const result = await pool.query(
      'INSERT INTO pedidos_clientes (nome_cliente, telefone, descricao_pedido, preco, prazo_entrega) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [nome_cliente, telefone, descricao_pedido, preco, prazo_entrega]
    );
    
    // Salvar na nuvem
    await salvarNaNuvem(`pedidos_clientes/${result.rows[0].id}`, result.rows[0]);

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao adicionar pedido' });
  }
});

// Remover pedido
app.delete('/api/pedidos_clientes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM pedidos_clientes WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }
    res.json({ message: 'Pedido removido com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao remover pedido' });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});