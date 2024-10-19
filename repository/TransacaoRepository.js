const mysql = require('mysql2/promise');
const Conta = require('../model/Transacao');

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
        const [rows] = await this.connection.query('SELECT * FROM tb_transacoes');
        return rows.map(row => new Conta(
            row.id,
            row.descricao,
            row.tipo,
            row.categoria,
            row.parcelas,
            row.valor,
            row.dataVencimento,
            row.dataPagamento,
            row.dataCriacao,
            row.status
        ));
    }

    // Método para buscar uma conta por ID
    async findById(id) {
        const [rows] = await this.connection.query('SELECT * FROM tb_transacoes WHERE id = ?', [id]);
        if (rows.length === 0) {
            return null;
        }
        const row = rows[0];
        return new Conta(
            row.id,
            row.descricao,
            row.tipo,
            row.categoria,
            row.parcelas,
            row.valor,
            row.dataVencimento,
            row.dataPagamento,
            row.dataCriacao,
            row.status
        );
    }

    // Método para criar uma nova conta
    async create(transacao) {
        await this.ensureConnection();
        const result = await this.connection.query(
            'INSERT INTO tb_transacoes (descricao, tipo, categoria, parcelas, valor, data_vencimento, data_pagamento, created_at, status, recorrente) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [transacao.descricao, transacao.tipo, transacao.categoria, transacao.parcelas, transacao.valor, transacao.dataVencimento, transacao.dataPagamento, transacao.dataCriacao, transacao.status, transacao.recorrente]
        );
        return result.insertId; // Retorna o ID da nova transacao criada
    }

    // Método para atualizar uma conta existente
    async update(id, transacao) {
        await this.ensureConnection();
        const result = await this.connection.query(
            'UPDATE tb_transacoes SET descricao = ?, tipo = ?, categoria = ?, parcelas = ?, valor = ?, data_vencimento = ?, data_pagamento = ? WHERE id = ?',
            [transacao.descricao, transacao.tipo, transacao.categoria, transacao.parcelas, transacao.valor, transacao.dataVencimento, transacao.dataPagamento, id]
        );
        return result.affectedRows; // Retorna o número de linhas afetadas
    }

    // Método para deletar uma conta
    async delete(id) {
        await this.ensureConnection();
        const result = await this.connection.query('DELETE FROM tb_transacoes WHERE id = ?', [id]);
        return result.affectedRows; // Retorna o número de linhas deletadas
    }
}

module.exports = TransacaoRepository;

