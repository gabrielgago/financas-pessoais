/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('tb_contas', function(table) {
        table.increments('id').primary();
        table.string('descricao').notNullable();
        table.enum('tipo', ['DESPESA', 'RECEITA']).notNullable()
        table.enum('categoria', ['ALIMENTACAO', 'MORADIA', 'TRANSPORTE', 'CARTAO', 'LASER', 'INVESTIMENTOS', 'SEM_CATEGORIA']).defaultTo('SEM_CATEGORIA')
        table.integer('parcelas').defaultTo(1);
        table.float('valor', 9, 2).notNullable();
        table.timestamp('data_vencimento').nullable();
        table.timestamp('data_pagamento').nullable();
        table.timestamp('data_transacao').defaultTo(knex.fn.now());
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
};
