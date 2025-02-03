document.getElementById("uploadForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    let salesFile = document.getElementById("salesFile").files[0];
    let priceFile = document.getElementById("priceFile").files[0];

    let formData = new FormData();
    formData.append("sales_file", salesFile);
    formData.append("price_file", priceFile);

    let response = await fetch("/upload", { method: "POST", body: formData });
    let result = await response.json();

    if (response.ok) {
        populateTable(result.data);
        document.getElementById("downloadBtn").style.display = "block";
    } else {
        alert(result.error);
    }
});

document.getElementById("downloadBtn").addEventListener("click", function () {
    window.location.href = "/download";
});

function populateTable(data) {
    let tableBody = document.querySelector("#dataTable tbody");
    tableBody.innerHTML = "";

    let labels = [];
    let lastMonthSales = [];
    let salesForecast = [];

    data.forEach(row => {
        let tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${row.SKUs}</td>
            <td>${row.Price}</td>
            <td>${row["Sales Forecast"].toFixed(2)}</td>
            <td>${row["Purchase Order"].toFixed(2)}</td>
        `;

        tableBody.appendChild(tr);

        labels.push(row.SKUs);
        lastMonthSales.push(row["Last month sales"]);
        salesForecast.push(row["Sales Forecast"]);
    });

    renderChart(labels, lastMonthSales, salesForecast);
}

function renderChart(labels, lastMonthSales, salesForecast) {
    let ctx = document.getElementById("salesChart").getContext("2d");
    
    if (window.salesChartInstance) {
        window.salesChartInstance.destroy();
    }

    window.salesChartInstance = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [
                { label: "Last Month Sales", data: lastMonthSales, borderColor: "blue", fill: false },
                { label: "Sales Forecast", data: salesForecast, borderColor: "red", fill: false }
            ]
        }
    });
}
