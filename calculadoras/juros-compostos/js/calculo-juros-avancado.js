document.getElementById('advancedCompoundInterestForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    // Captura os valores dos campos e aplica o valor padrão caso esteja vazio
    const initialDeposit = parseFloat(document.getElementById('initialDeposit').value.replace(/\./g, '').replace(',', '.')) || 0;
    const monthlyContribution = parseFloat(document.getElementById('monthlyContribution').value.replace(/\./g, '').replace(',', '.')) || 0;
    const monthlyInterest = parseFloat(document.getElementById('monthlyInterest').value) / 100 || 0; // Convertendo percentual para decimal
    const inflation = parseFloat(document.getElementById('inflation').value) / 100 || 0; // Convertendo percentual para decimal
    const period = parseInt(document.getElementById('period').value);
    const include13th = document.getElementById('include13th').value === 'yes';
    
    let accumulated = initialDeposit;
    let contributionValue = monthlyContribution;
    let contributionsTotal = 0;
    let labels = [];
    let dataAccumulated = [];
    let dataContributions = [];
    const year = new Date().getFullYear();

    for (let month = 1; month <= period * 12; month++) {
        if (month % 12 === 0) {
            contributionValue *= (1 + inflation);
        }

        let extraContribution = 0;
        if (month % 12 === 0 && include13th) {
            extraContribution = contributionValue;
        }

        contributionsTotal += contributionValue + extraContribution;
        accumulated = accumulated * (1 + monthlyInterest) + contributionValue + extraContribution;

        if (month % 12 === 0) {
            labels.push(`${year + Math.floor(month / 12)}`);
            dataAccumulated.push(accumulated.toFixed(2));
            dataContributions.push(contributionsTotal.toFixed(2));
        }
    }

    const presentValue = accumulated / Math.pow((1 + inflation), period);
    const monthlyRetirement = presentValue * 0.005;

    // Exibindo os resultados no padrão brasileiro
    const resultDiv = document.getElementById('result');
	resultDiv.style.display = 'block'; // Exibe o elemento #result
    resultDiv.innerHTML = `<p>Reserva Acumulada (R$): ${accumulated.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                           <p>Valor Presente (R$): ${presentValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                           <p>Valor Mensal de Aposentadoria (R$): ${monthlyRetirement.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>`;

    // Configurando o gráfico com Chart.js
    const ctx = document.getElementById('investmentChart').getContext('2d');
    if (window.investmentChart && typeof window.investmentChart.destroy === 'function') {
        window.investmentChart.destroy();
    }
    window.investmentChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Reserva Acumulada',
                data: dataAccumulated,
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: true
            }, {
                label: 'Contribuições Totais',
                data: dataContributions,
                borderColor: 'rgb(255, 159, 64)',
                backgroundColor: 'rgba(255, 159, 64, 0.2)',
                fill: true
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Tempo (Anos)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Valor (R$)'
                    },
                    beginAtZero: true
                }
            }
        }
    });

    // Faz a rolagem suave para o gráfico
    document.getElementById('result').scrollIntoView({
        behavior: 'smooth', // Rolar suavemente
        block: 'start' // Centraliza o gráfico na tela
    });
});


// Formatação automática dos números durante a digitação
document.querySelectorAll('input[type="number"]').forEach(input => {
    input.addEventListener('input', (event) => {
        const target = event.target;
        let value = target.value.replace(/\D/g, ''); // Remove qualquer caractere não numérico
        if (value) {
            // Formata o número com separadores de milhar e 2 casas decimais
            value = Number(value).toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        }
        target.value = value;
    });
});