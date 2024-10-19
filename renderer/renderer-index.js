document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM completamente carregado e analisado');

    // Inicializar dropdown do Semantic UI
    $('.ui.dropdown').dropdown();

    // Capturar os elementos do DOM
    const typeInput = document.getElementById('type');
    const descriptionInput = document.getElementById('description');
    const amountInput = document.getElementById('amount');
    const installmentsInput = document.getElementById('installments');
    const startDateInput = document.getElementById('startDate');
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

    startDateInput.value = moment().format('YYYY-MM-DD')

    console.log('Elementos capturados do DOM:', {
        typeInput,
        descriptionInput,
        amountInput,
        installmentsInput,
        startDateInput,
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

    // Máscara para o campo de valor (monetário)
    amountInput.addEventListener('input', () => {
        console.log('Valor digitado no campo de valor:', amountInput.value);
        let value = amountInput.value.replace(/\D/g, '');
        value = (value / 100).toFixed(2).replace('.', ',');
        amountInput.value = value ? `R$ ${value}` : '';
        console.log('Valor formatado no campo de valor:', amountInput.value);
    });

    // Mostrar ou ocultar o campo de parcelas dependendo do tipo selecionado
    typeInput.addEventListener('change', toggleInstallmentsField);

    function toggleInstallmentsField() {
        console.log('Tipo selecionado:', typeInput.value);
        if (typeInput.value === 'Despesa') {
            parcelasContainer.style.display = 'block';
            statusContainer.style.display = 'block';
            vencimentoContainer.style.display = 'block'
            console.log('Campo de parcelas exibido');
        } else {
            parcelasContainer.style.display = 'none';
            statusContainer.style.display = 'none';
            vencimentoContainer.style.display = 'none'
            console.log('Campo de parcelas ocultado');
        }
    }

    recorrenteInput.onchange = () => {
        installmentsInput.disabled = recorrenteInput.checked
    }

    statusInput.onchange = () => {
        if (statusInput.value === 'PAGA') {
            pagamentoContainer.style.display = 'block'
        } else {
            pagamentoContainer.style.display = 'none'
        }
    }

    // Inicializar o estado do campo de parcelas
    toggleInstallmentsField();

    // Função para adicionar um registro
    const addConta = () => {
        console.log('Iniciando o processo de adicionar uma nova conta');
        const type = typeInput.value;
        const description = descriptionInput.value.trim();
        const amount = parseFloat(amountInput.value.replace('R$ ', '').replace(',', '.'));
        const installments = recorrenteInput.checked ? 12 : parseInt(installmentsInput.value);
        const categoria = categoriaInput.value;
        const status = statusInput.value;
        const dataPagamento = moment(dataPagamentoInput.value);

        const dataVencimento = moment(dataVencimentoInput.value);
        let isVencida
        if (dataVencimento !== null && dataVencimento !== 'undefined' && dataVencimento.isBefore(moment())) {
            isVencida = !isVencida
        }

        const startDate = startDateInput.value ? new Date(startDateInput.value) : new Date();

        console.log('Dados capturados para adicionar conta:', {
            type,
            description,
            amount,
            installments,
            startDate,
            status,
            isVencida
        });

        // Validação dos campos
        if (!description || isNaN(amount) || amount <= 0 || isNaN(installments) || installments <= 0) {
            console.error('Erro de validação: alguns campos estão inválidos');
            alert('Por favor, preencha todos os campos corretamente.');
            return;
        }

        console.log(`Adicionando ${installments} parcelas para a conta.`);

        // Adicionar registros ao array de registros
        for (let i = 0; i < installments; i++) {
            const installmentDate = new Date(startDate);
            installmentDate.setMonth(installmentDate.getMonth() + i);
            const formattedDate = installmentDate.toISOString().split('T')[0];

            const transacao = {
                id: null,
                descricao: `${description} (Parcela ${i + 1}/${installments})`,
                tipo: type,
                categoria,
                parcelas: i + 1,
                valor: parseFloat((amount / installments).toFixed(2)),
                dataVencimento,
                dataPagamento: status === 'PAGA' ? dataPagamento : null,
                dataCriacao: moment(),
                status,
                recorrente: recorrenteInput.checked
            }

            window.electronAPI.createTransacao(transacao);

            console.log('Conta adicionada:', {
                type,
                description: `${description} (Parcela ${i + 1}/${installments})`,
                amount: parseFloat((amount / installments).toFixed(2)),
                date: formattedDate,
                status
            });
        }

        // Limpar os campos do formulário
        descriptionInput.value = '';
        amountInput.value = '';
        installmentsInput.value = '1';
        startDateInput.value = '';
        console.log('Campos do formulário limpos');

        // Atualizar a interface
        loadContas().then(contas => {
            renderContas(contas);
            updateTotals(contas);
            renderChart(contas);
        }).catch(error => {
            console.error('Erro ao carregar as contas:', error);
        });
        console.log('Interface atualizada com as novas contas.');
    };

    // Função assíncrona para renderizar os registros na tabela
    const renderContas = (contas) => {
        console.log('Iniciando renderização das contas:', contas);
        // Limpa a tabela
        financeTable.innerHTML = '';

        // Obtém o mês selecionado no filtro (se existir)
        const selectedMonth = monthFilterInput.value
            ? moment(monthFilterInput.value, 'YYYY-MM').format('YYYY-MM')
            : moment().format('YYYY-MM');

        try {
            // Filtra as contas pelo mês selecionado
            const filteredContas = contas.filter(conta => {
                const contaDate = moment(conta.dataVencimento).format('YYYY-MM');
                return contaDate.startsWith(selectedMonth);
            });

            console.log('Contas filtradas para o mês selecionado:', filteredContas);

            // Itera sobre as contas filtradas e cria as linhas da tabela
            filteredContas.forEach((conta, index) => {
                console.log(`Renderizando conta ${index + 1}:`, conta);

                const row = document.createElement('tr');

                const typeCell = document.createElement('td');
                typeCell.textContent = conta.tipo; // tipo (DESPESA ou RECEITA)
                row.appendChild(typeCell);

                const descriptionCell = document.createElement('td');
                descriptionCell.textContent = conta.descricao;
                row.appendChild(descriptionCell);

                const dateCell = document.createElement('td');
                dateCell.textContent = moment(conta.dataVencimento).format('YYYY-MM-DD'); // formata a data
                row.appendChild(dateCell);

                const amountCell = document.createElement('td');
                amountCell.textContent = `R$ ${conta.valor.toFixed(2).replace('.', ',')}`;
                row.appendChild(amountCell);

                const installmentsCell = document.createElement('td');
                installmentsCell.textContent = conta.parcelas > 1 ? `${index + 1}/${conta.parcelas}` : '-';
                row.appendChild(installmentsCell);

                const td_status = document.createElement('td');
                const dv_status = document.createElement('div');
                dv_status.textContent = conta.status ?? '-';
                let className;
                if (dv_status.textContent === 'PENDENTE') {
                    className = 'ui circular label';
                } else if (dv_status.textContent === 'VENCIDO') {
                    className = 'ui circular red label';
                } else {
                    className = 'ui circular green label';
                }
                dv_status.className = className;
                td_status.appendChild(dv_status);
                row.appendChild(td_status);

                // Botão de ações (Excluir e Pagar)
                const actionCell = document.createElement('td');
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'ui red button';
                deleteBtn.textContent = 'Excluir';
                deleteBtn.onclick = async () => {
                    console.log('Solicitando exclusão da conta:', conta);
                    window.electronAPI.deleteConta(conta.id).then(() => {
                        console.log('Conta deletada com sucesso.');
                        renderContas(); // Atualiza a tabela após exclusão
                        updateTotals(); // Atualiza os totais
                        renderChart(); // Atualiza o gráfico
                    }).catch(error => {
                        console.error('Erro ao deletar a conta:', error);
                    });
                };

                const pagarBtn = document.createElement('button');
                pagarBtn.className = 'ui blue button';
                pagarBtn.textContent = 'Pagar';
                pagarBtn.onclick = () => {
                    alert('Conta paga!');
                    console.log('Conta marcada como paga:', conta);
                };

                if (conta.status !== 'PAGO') {
                    actionCell.appendChild(pagarBtn);
                }

                actionCell.appendChild(deleteBtn);
                row.appendChild(actionCell);

                financeTable.appendChild(row);
            });
        } catch (error) {
            console.error('Erro ao carregar as contas:', error);
        }
    };

    // Outras funções como updateTotals e renderChart seguem o mesmo princípio para adicionar logs

    // Adicionando eventos e chamadas async com logs
    addBtn.addEventListener('click', () => {
        console.log('Botão de adicionar clicado');
        addConta();
    });

    monthFilterInput.addEventListener('change', () => {
        console.log('Filtro de mês alterado:', monthFilterInput.value);
        loadContas().then(contas => {
            renderContas(contas);
            updateTotals(contas);
            renderChart(contas);
        }).catch(error => {
            console.error('Erro ao carregar as contas:', error);
        });
    });

    // Carregar contas inicialmente
    (async function loadContas() {
        try {
            const contas = await window.electronAPI.getAllTransacoes();
            console.log('Contas carregadas inicialmente:', contas);
            renderContas(contas);
            updateTotals(contas);
            renderChart(contas);
        } catch (error) {
            console.error('Erro ao carregar as contas inicialmente:', error);
        }
    })();
});
