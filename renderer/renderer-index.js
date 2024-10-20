const PAGO = 'PAGO';
const VENCIDO = 'VENCIDO';
const PENDENTE = 'PENDENTE';
const RECEBIDO = 'RECEBIDO';
const DESPESA = 'Despesa';
const RECEITA = 'RECEITA';
const PAGAR = 'Pagar';
const MESES = 'months';

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM completamente carregado e analisado');

    // Capturar os elementos do DOM
    const typeInput = document.getElementById('type');
    const descriptionInput = document.getElementById('description');
    const amountInput = document.getElementById('amount');
    const installmentsInput = document.getElementById('installments');
    const dataTransacaoInput = document.getElementById('dataTransacao');
    const recorrenteInput = document.getElementById('recorrente');
    const statusInput = document.getElementById('status');
    const categoriaInput = document.getElementById('categoria');
    const dataVencimentoInput = document.getElementById('dataVencimento');
    const dataPagamentoInput = document.getElementById('dataPagamento');
    const monthFilterInput = document.getElementById('monthFilter');

    const totalReceitasElement = document.getElementById('totalReceitas');
    const totalDespesasElement = document.getElementById('totalDespesas');
    const saldoFinalElement = document.getElementById('saldoFinal');

    const parcelasContainer = document.getElementById('parcelasContainer');
    const statusContainer = document.getElementById('statusContainer');
    const recorrenteContainer = document.getElementById('recorrenteContainer');
    const vencimentoContainer = document.getElementById('vencimentoContainer');
    const pagamentoContainer = document.getElementById('pagamentoContainer');

    const addBtn = document.getElementById('addBtn');
    const financeTable = document.getElementById('financeTable');

    dataTransacaoInput.value = moment().format('YYYY-MM-DD')

    console.log('Elementos capturados do DOM:', {
        typeInput,
        descriptionInput,
        amountInput,
        installmentsInput,
        startDateInput: dataTransacaoInput,
        addBtn,
        financeTable,
        totalReceitasElement,
        totalDespesasElement,
        saldoFinalElement,
        parcelasContainer,
        statusContainer,
        recorrenteContainer,
        monthFilterInput
    });

    function addMascaraInputValor() {
        // Máscara para o campo de valor (monetário)
        amountInput.addEventListener('input', () => {
            console.log('Valor digitado no campo de valor:', amountInput.value);
            let value = amountInput.value.replace(/\D/g, '');
            value = (value / 100).toFixed(2).replace('.', ',');
            amountInput.value = value ? `R$ ${value}` : '';
            console.log('Valor formatado no campo de valor:', amountInput.value);
        });
    }

    addMascaraInputValor();

    // Mostrar ou ocultar o campo de parcelas dependendo do tipo selecionado
    typeInput.addEventListener('change', toggleInstallmentsField);

    recorrenteInput.onchange = () => {
        installmentsInput.disabled = recorrenteInput.checked
    }

    statusInput.onchange = () => {
        if (statusInput.value === PAGO) {
            pagamentoContainer.style.display = 'block'
        } else {
            pagamentoContainer.style.display = 'none'
        }
    }

// Adicionar registro ao pressionar "Enter" nos campos de descrição e valor
    [descriptionInput, amountInput].forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault(); // Previne o comportamento padrão de submit
                addConta(); // Adiciona a transacao
            }
        });
    });

    // Evento para filtrar por mês
    monthFilterInput.addEventListener('change', () => {
        console.log('Filtro de mês alterado:', monthFilterInput.value);
        loadTransacoes();
    });

    function toggleInstallmentsField() {
        console.log('Tipo selecionado:', typeInput.value);
        if (typeInput.value === DESPESA) {
            parcelasContainer.style.display = 'block';
            statusContainer.style.display = 'block';
            vencimentoContainer.style.display = 'block'
            pagamentoContainer.style.display = 'none';
            console.log('Campo de parcelas exibido');
        } else {
            parcelasContainer.style.display = 'none';
            statusContainer.style.display = 'none';
            vencimentoContainer.style.display = 'none';
            pagamentoContainer.style.display = 'block';
            console.log('Campo de parcelas ocultado');
        }
    }

    // Inicializar o estado do campo de parcelas
    toggleInstallmentsField();

    function limparCamposFormulario() {
        // Limpar os campos do formulário
        descriptionInput.value = '';
        amountInput.value = '';
        installmentsInput.value = '1';
        dataTransacaoInput.value = '';
        addMascaraInputValor();
        console.log('Campos do formulário limpos');
    }

// Função para adicionar um registro
    const addConta = (e) => {
        e.preventDefault()

        console.log('Iniciando o processo de adicionar uma nova transacao');
        const type = typeInput.value;
        const description = descriptionInput.value.trim();
        const valor = parseFloat(amountInput.value.replace('R$ ', '').replace(',', '.'));
        const installments = recorrenteInput.checked ? 12 : parseInt(installmentsInput.value);
        const categoria = categoriaInput.value;
        const status = statusInput.value;
        const dataPagamento = moment(dataPagamentoInput.value);
        const dataVencimento = moment(dataVencimentoInput.value);
        const dataTransacao = moment(dataTransacaoInput.value);

        let isVencida
        if (dataVencimento !== null && dataVencimento !== 'undefined' && dataVencimento.isBefore(moment())) {
            isVencida = !isVencida
        }

        const startDate = dataTransacaoInput.value ? new Date(dataTransacaoInput.value) : new Date();

        console.log('Dados capturados para adicionar transacao:', {
            type,
            description,
            amount: valor,
            installments,
            startDate,
            status,
            isVencida
        });

        // Validação dos campos
        if (!description || isNaN(valor) || valor <= 0 || isNaN(installments) || installments <= 0) {
            console.error('Erro de validação: alguns campos estão inválidos');
            alert('Por favor, preencha todos os campos corretamente.');
            return;
        }

        console.log(`Adicionando ${installments} parcelas para a transacao.`);

        // Adicionar registros ao array de registros
        for (let i = 0; i < installments; i++) {
            const installmentDate = new Date(startDate);
            installmentDate.setMonth(installmentDate.getMonth() + i);
            // const formattedDate = installmentDate.toISOString().split('T')[0];

            const transacao = {
                id: null,
                descricao: installments > 1 ? `${description} (Parcela ${i + 1}/${installments})` : description,
                tipo: type,
                categoria,
                parcelas: i + 1,
                valor: parseFloat((valor / installments).toFixed(2)),
                dataVencimento: type === DESPESA && dataVencimento.isValid() ? (i === 0 ? dataVencimento.format('YYYY-MM-DD') : dataVencimento.add(1, MESES).format('YYYY-MM-DD')) : null,
                dataPagamento: dataPagamento.isValid() ? (i === 0 ? dataPagamento.format('YYYY-MM-DD') : dataPagamento.add(1, MESES).format('YYYY-MM-DD')) : null,
                dataTransacao: dataTransacao.isValid() ? (i === 0 ? dataTransacao.format('YYYY-MM-DD') : dataTransacao.add(1, MESES).format('YYYY-MM-DD')) : moment().format('YYYY-MM-DD'),
                status: i > 0 ? PENDENTE : status,
                recorrente: recorrenteInput.checked,
                numeroParcelas: installments
            }
            window.electronAPI.createTransacao(transacao);

            console.log('Transacao adicionada:', transacao);
        }

        limparCamposFormulario();

        // Atualizar a interface
        loadTransacoes();
        console.log('Interface atualizada com as novas transacaos.');
    };

    // Função assíncrona para renderizar os registros na tabela
    const renderTransacoes = (transacaos) => {
        console.log('Iniciando renderização das transacaos:', transacaos);
        // Limpa a tabela
        financeTable.innerHTML = '';

        // Obtém o mês selecionado no filtro (se existir)
        const selectedMonth = monthFilterInput.value
            ? moment(monthFilterInput.value, 'YYYY-MM').format('YYYY-MM')
            : moment().format('YYYY-MM');

        try {
            // Filtra as transacaos pelo mês selecionado
            const filteredContas = transacaos.filter(transacao => {
                const dtTransacao = moment(transacao.dataTransacao);
                const dtFiltro = moment(monthFilterInput.value);
                return dtTransacao.month() === dtFiltro.month() && dtTransacao.year() === dtFiltro.year()
            });

            console.log('Contas filtradas para o mês selecionado:', filteredContas);

            // Itera sobre as transacaos filtradas e cria as linhas da tabela
            filteredContas.forEach((transacao, index) => {
                console.log(`Renderizando transacao ${index + 1}:`, transacao);

                const row = document.createElement('tr');

                const typeCell = document.createElement('td');
                typeCell.textContent = transacao.tipo; // tipo (DESPESA ou RECEITA)
                row.appendChild(typeCell);

                const descriptionCell = document.createElement('td');
                descriptionCell.textContent = transacao.descricao;
                descriptionCell.colSpan = 1;
                row.appendChild(descriptionCell);

                const dataTransacaoCell = document.createElement('td');
                dataTransacaoCell.textContent = moment(transacao.dataTransacao).format('YYYY-MM-DD'); // formata a data
                row.appendChild(dataTransacaoCell);

                const dataVencimentoCell = document.createElement('td');
                dataVencimentoCell.textContent = transacao.dataVencimento ? moment(transacao.dataVencimento).format('YYYY-MM-DD') : '-'; // formata a data
                row.appendChild(dataVencimentoCell);

                const dataPagamentoCell = document.createElement('td');
                dataPagamentoCell.textContent = transacao.dataPagamento ? moment(transacao.dataPagamento).format('YYYY-MM-DD') : '-'; // formata a data
                row.appendChild(dataPagamentoCell);

                const amountCell = document.createElement('td');
                amountCell.textContent = `R$ ${transacao.valor.toFixed(2).replace('.', ',')}`;
                row.appendChild(amountCell);

                const installmentsCell = document.createElement('td');
                installmentsCell.textContent = `${transacao.parcela}/${transacao.numeroParcelas}`;
                row.appendChild(installmentsCell);

                const td_status = document.createElement('td');
                const dv_status = document.createElement('div');
                dv_status.textContent = transacao.status ?? '-';
                let className;
                if (dv_status.textContent === PENDENTE) {
                    className = 'ui circular label';
                } else if (dv_status.textContent === VENCIDO) {
                    className = 'ui circular red label';
                } else {
                    className = 'ui circular green label';
                }
                dv_status.className = className;
                td_status.appendChild(dv_status);
                row.appendChild(td_status);

                // Botão de ações (Excluir e Pagar)
                const actionCell = document.createElement('td');

                // actionCell.appendChild(deleteBtn);
                actionCell.colSpan = 1
                actionCell.innerHTML = `<div class="ui right icon pointing dropdown button">
                                          <i class="wrench icon"></i>
                                          <div class="menu">
                                            <div class="header">Ações</div>
                                            ${transacao.status !== PAGO ? '<div class="item" id="pagar_transacao" id-transacao="' + transacao.id + '" descricao="' + transacao.descricao + '">Pagar</div>' : ''}
                                            ${transacao.status !== RECEBIDO && transacao.tipo === RECEITA ? '<div class="item" id="receber_transacao" id-transacao="' + transacao.id + '" descricao="' + transacao.descricao + '">Receber</div>' : ''}
                                            <div class="item" id="alterar_vencimento_transacao" id-transacao="${transacao.id}" descricao="${transacao.descricao}">Alterar vencimento</div>
                                            <div class="ui divider"></div>
                                            <div class="item" id="deletar_transacao" id-transacao="${transacao.id}" descricao="${transacao.descricao}">Deletar</div>
                                          </div>
                                        </div>`

                row.appendChild(actionCell);

                financeTable.appendChild(row);
            });

            $('.ui.dropdown').dropdown();

            $('[id=deletar_transacao]').on('click', function () {
                const descricao = $(this).attr('descricao');
                const id = $(this).attr('id-transacao');
                console.log('Pronto para deletar transacao de id: ', id)
                window.electronAPI.deleteTransacao(id)
                    .then(() => alert(`Transação '${descricao}' deletada com sucesso.`))
                    .catch(error => alert(`Houve um erro ao tentar deletar a transação '${descricao}': \n${error}`))
            })

            $('[id=pagar_transacao]').on('click', function () {
                const descricao = $(this).attr('descricao');
                const id = $(this).attr('id-transacao');
                console.log('Pronto para pagar transacao de id: ', id)
                window.electronAPI.pagarTransacao(id)
                    .then(() => alert(`Transação '${descricao}' paga com sucesso.`))
                    .catch(error => alert(`Houve um erro ao tentar pagar a transação '${descricao}': \n${error}`))
            })

            $('[id=alterar_vencimento_transacao]').on('click', function () {
                const descricao = $(this).attr('descricao');
                const id = $(this).attr('id-transacao');
                $($(this).parents('tr').children('td')[3]).empty().append(`<input type="date" id="dataVencimento_${id}" descricao="${descricao}" onchange="salvarDataVencimento(this.id, this.value, this.descricao)" id_transacao="1">`)
                console.log('Pronto para alterar o vencimento da transacao de id: ', id)
            })

            new DataTable('#tb_transacoes', {
                paging: true,       // Habilita paginação
                searching: false,   // Desabilita a busca, se não for necessária
                info: false,        // Desabilita a exibição de informações de página
                lengthChange: true,
                pageLength: 10,// Desabilita a mudança do número de registros por página
                responsive: true,
                language: {
                    paginate: {
                        first: 'Primeiro',
                        last: 'Último',
                        next: 'Próximo',
                        previous: 'Anterior'
                    }
                },
                pagingType: 'full_numbers'
            });

            $('#tb_transacoes').removeClass('dataTable')

        } catch (error) {
            console.error('Erro ao carregar as transacaos:', error);
        }
    };

    // Função para calcular e atualizar os totais
    const updateTotals = (transacoes) => {
        const selectedMonth = monthFilterInput.value ? moment(monthFilterInput.value).format('YYYY-MM') : moment().format('YYYY-MM');

        // Filtrar as transacoes pelo mês selecionado
        const filteredContas = transacoes.filter(transacao => moment(transacao.dataVencimento).format('YYYY-MM').startsWith(selectedMonth));

        // Calcular total de receitas
        const totalReceitas = filteredContas
            .filter(transacao => transacao.tipo === RECEITA)
            .reduce((acc, transacao) => acc + transacao.valor, 0);

        // Calcular total de despesas
        const totalDespesas = filteredContas
            .filter(transacao => transacao.tipo === DESPESA)
            .reduce((acc, transacao) => acc + transacao.valor, 0);

        // Calcular saldo final
        const saldoFinal = totalReceitas - totalDespesas;

        // Atualizar os elementos na página
        totalReceitasElement.textContent = `R$ ${totalReceitas.toFixed(2).replace('.', ',')}`;
        totalDespesasElement.textContent = `R$ ${totalDespesas.toFixed(2).replace('.', ',')}`;
        saldoFinalElement.textContent = `R$ ${saldoFinal.toFixed(2).replace('.', ',')}`;
    };


    // Função para renderizar o gráfico de receitas e despesas
    const renderChart = (transacoes) => {
        const selectedMonth = monthFilterInput.value ? moment(monthFilterInput.value).format('YYYY-MM') : moment().format('YYYY-MM');

        // Filtrar as transacoes pelo mês selecionado
        const filteredContas = transacoes.filter(transacao => moment(transacao.dataVencimento).format('YYYY-MM').startsWith(selectedMonth));

        // Calcular total de receitas
        const totalReceitas = filteredContas
            .filter(transacao => transacao.tipo === RECEITA)
            .reduce((acc, transacao) => acc + transacao.valor, 0);

        // Calcular total de despesas
        const totalDespesas = filteredContas
            .filter(transacao => transacao.tipo === DESPESA)
            .reduce((acc, transacao) => acc + transacao.valor, 0);

        // Renderizar o gráfico com as receitas e despesas
        Highcharts.chart('chartContainer', {
            chart: {
                type: 'pie',
            },
            title: {
                text: 'Receitas e Despesas',
            },
            series: [
                {
                    name: 'Valor',
                    colorByPoint: true,
                    data: [
                        {
                            name: 'Receitas',
                            y: totalReceitas,
                            color: '#28a745', // Cor verde para receitas
                        },
                        {
                            name: 'Despesas',
                            y: totalDespesas,
                            color: '#dc3545', // Cor vermelha para despesas
                        },
                    ],
                },
            ],
            plotOptions: {
                pie: {
                    dataLabels: {
                        format: '{point.name}: R$ {point.y:.2f}'.replace('.', ','),
                    },
                },
            },
        });
    };

    // Carregar transacaos inicialmente
    async function loadTransacoes() {
        try {
            const transacaos = await window.electronAPI.getAllTransacoes();
            console.log('Contas carregadas inicialmente:', transacaos);
            renderTransacoes(transacaos);
            updateTotals(transacaos);
            renderChart(transacaos);
        } catch (error) {
            console.error('Erro ao carregar as transacaos inicialmente:', error);
        }
    }

    // Evento de clique para adicionar um registro
    addBtn.addEventListener('click', addConta);// Evento de clique para adicionar um registro

    loadTransacoes();

    // Inicializar dropdown do Semantic UI
    $('.ui.dropdown').dropdown();

});

const salvarDataVencimento = (id, value, descricao) => {
    console.log(`Data do vencimento ${descricao} de id ${id} alterada para o vencimento ${value}...`)
    const data_alterada = moment(value).format('YYYY-MM-DD');

    let idTransacao = id.split('_')[1];
    window.electronAPI.alterarVencimento(idTransacao, data_alterada)
        .then(() => {
            alert(`Vencimento da transação '${descricao}' foi alterada com sucesso.`)
            $(`#${id}`).parents('td').empty().html(data_alterada)
        })
        .catch(error => alert(`Houve um erro ao tentar alterar o vencimento da transação '${descricao}': \n${error}`))

    // window.electronAPI.findById(id)
    //     .then((transacao) => {
    //         if (transacao.status === VENCIDO && moment(transacao.dataVencimento).isSameOrAfter(moment())) {
    //             window.electronAPI.alterarStatus(idTransacao, PENDENTE)
    //                 .then(() => {
    //                     alert(`Status da transação '${descricao}' foi alterada com sucesso.`)
    //                     $(`#${id}`).parents('td tr').children('td')[7].empty().html(PENDENTE)
    //                 })
    //                 .catch(error => alert(`Houve um erro ao tentar alterar o vencimento da transação '${descricao}': \n${error}`))
    //         }
    //     })
    //     .catch(error => alert(`Houve um erro ao tentar alterar o status da transação '${descricao}': \n${error}`))

};