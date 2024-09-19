function toggleForm(formId) {
    const forms = ['prontaEntregaForm', 'materialForm', 'pedidoForm'];
    forms.forEach(form => {
        document.getElementById(form).style.display = form === formId + 'Form' ? 'block' : 'none';
    });
}

// Funções para Pronta Entrega
function adicionarProntaEntrega() {
    const nome = document.getElementById('peName').value;
    const quantidade = document.getElementById('peQuantidade').value;
    const preco = document.getElementById('pePreco').value;
    
    fetch('/api/pronta_entrega', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, quantidade, preco })
    })
    .then(response => response.json())
    .then(data => alert('Produto adicionado com sucesso!'))
    .catch(error => alert('Erro ao adicionar produto'));
}

function removerProntaEntrega() {
    const id = document.getElementById('peId').value;
    
    fetch(`/api/pronta_entrega/${id}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => alert('Produto removido com sucesso!'))
    .catch(error => alert('Erro ao remover produto'));
}

// Funções para Estoque de Materiais
function adicionarMaterial() {
    const nome = document.getElementById('matNome').value;
    const quantidade = document.getElementById('matQuantidade').value;
    
    fetch('/api/estoque_materiais', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, quantidade })
    })
    .then(response => response.json())
    .then(data => alert('Material adicionado com sucesso!'))
    .catch(error => alert('Erro ao adicionar material'));
}

function removerMaterial() {
    const id = document.getElementById('matId').value;
    
    fetch(`/api/estoque_materiais/${id}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => alert('Material removido com sucesso!'))
    .catch(error => alert('Erro ao remover material'));
}

// Funções para Pedidos de Clientes
function adicionarPedido() {
    const nome_cliente = document.getElementById('pedNome').value;
    const telefone = document.getElementById('pedTelefone').value;
    const descricao_pedido = document.getElementById('pedDescricao').value;
    const preco = document.getElementById('pedPreco').value;
    const prazo_entrega = document.getElementById('pedPrazo').value;

    // Verifica se todos os campos estão preenchidos
    if (!nome_cliente || !telefone || !descricao_pedido || !preco || !prazo_entrega) {
        alert('Por favor, preencha todos os campos.');
        return;
    }

    // Verifica se a data está no formato correto (YYYY-MM-DD)
    const dataRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dataRegex.test(prazo_entrega)) {
        alert('Por favor, insira a data no formato YYYY-MM-DD.');
        return;
    }

    console.log('Data sendo enviada:', prazo_entrega); 

    fetch('/api/pedidos_clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome_cliente, telefone, descricao_pedido, preco, prazo_entrega })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro na resposta do servidor');
        }
        return response.json();
    })
    .then(data => {
        console.log('Resposta do servidor:', data); 
        alert('Pedido adicionado com sucesso!');
    })
    .catch(error => {
        console.error('Erro ao adicionar pedido:', error);
        alert('Erro ao adicionar pedido: ' + error.message);
    });
}

function removerPedido() {
    const id = document.getElementById('pedId').value;
    
    fetch(`/api/pedidos_clientes/${id}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => alert('Pedido removido com sucesso!'))
    .catch(error => alert('Erro ao remover pedido'));
}