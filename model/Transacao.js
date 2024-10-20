class Transacao {
    constructor(id, descricao, tipo, categoria, parcela, valor, dataVencimento, dataPagamento, dataTransacao, status, recorrente, numeroParcelas) {
        this.id = id;
        this.descricao = descricao;
        this.tipo = tipo; // 'DESPESA' ou 'RECEITA'
        this.categoria = categoria; // Categoria como 'ALIMENTACAO', 'MORADIA', etc.
        this.parcela = parcela;
        this.valor = valor;
        this.dataVencimento = dataVencimento;
        this.dataPagamento = dataPagamento;
        this.dataTransacao = dataTransacao;
        this.status = status;
        this.recorrente = recorrente;
        this.numeroParcelas = numeroParcelas;
    }
}

module.exports = Transacao;
