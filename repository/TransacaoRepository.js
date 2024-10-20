const mysql = require('mysql2/promise');
const Transacao = require('../model/Transacao');

class TransacaoRepository {
    constructor() {
        // A conexão agora é criada de forma assíncrona
        this.init();
    }

    // Método assíncrono para inicializar a conexão
    async init() {
        this.connection = await mysql.createConnection({
            host: '127.0.0.1',
            user: 'financas',
            password: 'financas',
            database: 'financas',
            port: 3307
        });
    }

    // Método para garantir que a conexão foi estabelecida antes de executar a consulta
    async ensureConnection() {
        if (!this.connection) {
            await this.init();
        }
    }

    // Método para buscar todas as contas
    async findAll() {
        await this.ensureConnection();
        const [rows] = await this.connection.query('SELECT * FROM tb_transacoes');
        return rows.map(row => new Transacao(
            row.id,
            row.descricao,
            row.tipo,
            row.categoria,
            row.parcela,
            row.valor,
            row.data_vencimento,
            row.data_pagamento,
            row.data_transacao,
            row.status,
            row.recorrente,
            row.numero_parcelas
        ));
    }

    // Método para buscar uma conta por ID
    async findById(id) {
        await this.ensureConnection();
        const [rows] = await this.connection.query('SELECT * FROM tb_transacoes WHERE id = ?', [id]);
        if (rows.length === 0) {
            return null;
        }
        const row = rows[0];
        return new Transacao(
            row.id,
            row.descricao,
            row.tipo,
            row.categoria,
            row.parcela,
            row.valor,
            row.data_vencimento,
            row.data_pagamento,
            row.data_transacao,
            row.status,
            row.recorrente,
            row.numero_parcelas
        );
    }

    // Método para criar uma nova conta
    async create(transacao) {
        await this.ensureConnection();
        const result = await this.connection.query(
            'INSERT INTO tb_transacoes (descricao, tipo, categoria, parcela, valor, data_vencimento, data_pagamento, data_transacao, status, recorrente, numero_parcelas) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [transacao.descricao, transacao.tipo, transacao.categoria, transacao.parcela, transacao.valor, transacao.dataVencimento, transacao.dataPagamento, transacao.dataTransacao, transacao.status, transacao.recorrente, transacao.parcelas]
        );
        return result.insertId; // Retorna o ID da nova transacao criada
    }

    // Método para atualizar uma conta existente
    async update(id, transacao) {
        await this.ensureConnection();
        const result = await this.connection.query(
            'UPDATE tb_transacoes SET descricao = ?, tipo = ?, categoria = ?, parcelas = ?, valor = ?, data_vencimento = ?, data_pagamento = ?, status = ?, recorrente = ?, numero_parcelas = ? WHERE id = ?',
            [transacao.descricao, transacao.tipo, transacao.categoria, transacao.parcela, transacao.valor, transacao.dataVencimento, transacao.dataPagamento, transacao.status, transacao.recorrente, transacao.numeroParcelas, id]
        );
        return result.affectedRows; // Retorna o número de linhas afetadas
    }

    // Método para deletar uma conta
    async delete(id) {
        await this.ensureConnection();
        const result = await this.connection.query('DELETE FROM tb_transacoes WHERE id = ?', [id]);
        return result.affectedRows; // Retorna o número de linhas deletadas
    }

    // Método para deletar uma conta
    async pagar(id) {
        await this.ensureConnection();
        const result = await this.connection.query('UPDATE tb_transacoes SET status = \'PAGO\', data_pagamento = CURDATE() WHERE id = ?', [id]);
        return result.affectedRows; // Retorna o número de linhas deletadas
    }

    async alterarVencimento(id, newVencimento) {
        await this.ensureConnection();
        const result = await this.connection.query('UPDATE tb_transacoes SET data_vencimento = ? WHERE id = ?', [newVencimento, id]);
        return result.affectedRows; // Retorna o número de linhas deletadas
    }

    async atualizarStatus(id, status) {
        await this.ensureConnection();
        const result = await this.connection.query('UPDATE tb_transacoes SET status = ? WHERE id = ?', [status, id]);
        return result.affectedRows; // Retorna o número de linhas deletadas
    }
}

module.exports = TransacaoRepository;

