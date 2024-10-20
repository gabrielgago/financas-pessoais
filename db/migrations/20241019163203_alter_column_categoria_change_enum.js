exports.up = function (knex) {
    return knex.schema.alterTable('tb_transacoes', function (table) {
        table.enum('categoria', [
            'CARTAO_CREDITO',
            'CARTAO_DEBITO',
            'ALIMENTACAO',
            'MORADIA',
            'LASER',
            'BEM_ESTAR',
            'TRANSPORTE',
            'SALARIO',
            'DIVIDENDOS',
            'SERVICOS',
            'INVESTIMENTO',
            'EDUCACAO',
            'SAUDE',
            'OUTROS'
        ]).alter();
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('tb_transacoes', function (table) {
        table.enum('categoria', [
            'ALIMENTACAO',
            'MORADIA',
            'TRANSPORTE',
            'CARTAO',
            'LASER',
            'INVESTIMENTOS',
            'SEM_CATEGORIA'
        ]).alter(); // Reverte para os valores anteriores
    });
};
