document.getElementById("calculateButton").addEventListener("click", function() {
    var currentPrice = parseFloat(document.getElementById("currentPrice").value.replace(',', '.'));
    var strikePrice = parseFloat(document.getElementById("strikePrice").value.replace(',', '.'));
    var timeToMaturityDate = new Date(document.getElementById("timeToMaturity").value); // Data de vencimento
    var interestRate = parseFloat(document.getElementById("interestRate").value.replace(',', '.')) / 100;
    var volatility = parseFloat(document.getElementById("volatility").value.replace(',', '.')) / 100;

    // Calculando a diferença em anos entre a data atual e a data de vencimento
    var today = new Date();
    var timeToMaturity = (timeToMaturityDate - today) / (1000 * 3600 * 24 * 365); // Convertendo para anos

    if (isNaN(currentPrice) || isNaN(strikePrice) || isNaN(interestRate) || isNaN(volatility) || isNaN(timeToMaturity)) {
        alert("Por favor, preencha todos os campos corretamente.");
        return;
    }

    // Calculando a Call e Put com o modelo Black-Scholes
    var callPrice = blackScholesCall(currentPrice, strikePrice, timeToMaturity, interestRate, volatility);
    var putPrice = blackScholesPut(currentPrice, strikePrice, timeToMaturity, interestRate, volatility);

    // Exibindo os resultados
    document.getElementById("callValue").innerText = "R$ " + callPrice.toFixed(2);
    document.getElementById("putValue").innerText = "R$ " + putPrice.toFixed(2);
});

// Função Black-Scholes para Call
function blackScholesCall(S, K, T, r, sigma) {
    var d1 = (Math.log(S / K) + (r + (sigma * sigma) / 2) * T) / (sigma * Math.sqrt(T));
    var d2 = d1 - sigma * Math.sqrt(T);
    var call = S * normalCDF(d1) - K * Math.exp(-r * T) * normalCDF(d2);
    return call;
}

// Função Black-Scholes para Put
function blackScholesPut(S, K, T, r, sigma) {
    var d1 = (Math.log(S / K) + (r + (sigma * sigma) / 2) * T) / (sigma * Math.sqrt(T));
    var d2 = d1 - sigma * Math.sqrt(T);
    var put = K * Math.exp(-r * T) * normalCDF(-d2) - S * normalCDF(-d1);
    return put;
}

// Função para o cálculo da CDF normal (usada no Black-Scholes)
function normalCDF(x) {
    var t = 1 / (1 + 0.3275911 * Math.abs(x));
    var d = 1.061405429 * t - 1.453152027 * t * t + 1.421413741 * t * t * t - 0.284496736 * t * t * t * t + 0.254465821 * t * t * t * t * t;
    return 0.5 + 0.5 * Math.sign(x) * (1 - Math.exp(-x * x / 2) * d);
}
