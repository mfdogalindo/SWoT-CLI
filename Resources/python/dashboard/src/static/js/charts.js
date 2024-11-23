document.addEventListener('DOMContentLoaded', function() {
    const chartColors = {
        temperature: {
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)'
        },
        humidity: {
            borderColor: 'rgba(54, 162, 235, 1)',
            backgroundColor: 'rgba(54, 162, 235, 0.2)'
        },
        noise: {
            borderColor: 'rgba(255, 206, 86, 1)',
            backgroundColor: 'rgba(255, 206, 86, 0.2)'
        },
        'air-quality': {
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)'
        }
    };

    function createChart(elementId, readings) {
        const ctx = document.getElementById(elementId).getContext('2d');
        const sensorType = elementId.split('-')[0];

        const data = {
            labels: readings.map(reading => new Date(reading.timestamp).toLocaleTimeString()),
            datasets: [{
                label: sensorType.charAt(0).toUpperCase() + sensorType.slice(1),
                data: readings.map(reading => reading.value),
                borderColor: chartColors[sensorType].borderColor,
                backgroundColor: chartColors[sensorType].backgroundColor,
                tension: 0.4
            }]
        };

        return new Chart(ctx, {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    // Initialize charts for each sensor type
    for (const sensorType of ['temperature', 'humidity', 'noise', 'air-quality']) {
        const readings = window[`${sensorType}Readings`];
        if (readings && readings.content) {
            createChart(`${sensorType}-chart`, readings.content);
        }
    }
});