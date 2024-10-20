const TransacaoRepository = require('../repository/TransacaoRepository');
const moment = require('moment');
const PENDENTE = 'PENDENTE';
const PAGO = 'PAGO';
const VENCIDO = 'VENCIDO';


async function atualizarStatusVencidos() {
    try {
        const transacaoRepository = new TransacaoRepository();

        // Obter todas as transacoes do banco de dados
        const transacoes = await transacaoRepository.findAll();

        // Data atual
        const hoje = moment();

        // Filtrar transacoes vencidas
        const transacaoVencidas = transacoes.filter(transacao => {
            const dataVencimento = moment(transacao.dataVencimento);
            return dataVencimento.isBefore(hoje) && transacao.status === PENDENTE;
        });

        // Atualizar o status das transacoes vencidas
        for (let transacao of transacaoVencidas) {
            await transacaoRepository.atualizarStatus(transacao.id, VENCIDO);
        }

        console.log(`${transacaoVencidas.length} contas atualizadas para 'VENCIDO'.`);
    } catch (error) {
        console.error('Erro ao atualizar contas vencidas:', error);
    }
}

module.exports = {
    atualizarStatusVencidos
};