class Transacao {
    constructor(id, descricao, tipo, categoria, parcelas, valor, dataVencimento, dataPagamento, dataCriacao, status, recorrente) {
        this.id = id;
        this.descricao = descricao;
        this.tipo = tipo; // 'DESPESA' ou 'RECEITA'
        this.categoria = categoria; // Categoria como 'ALIMENTACAO', 'MORADIA', etc.
        this.parcelas = parcelas;
        this.valor = valor;
        this.dataVencimento = dataVencimento;
        this.dataPagamento = dataPagamento;
        this.dataCriacao = dataCriacao;
        this.status = status;
        this.recorrente = recorrente;
    }
}

module.exports = Transacao;
