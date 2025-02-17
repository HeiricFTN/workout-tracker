// Update these options in the createWeightChart and createVolumeChart methods
options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        title: {
            display: true,
            text: 'Weight Progress (lbs)',
            font: {
                size: 12
            }
        },
        legend: {
            display: true,
            position: 'bottom',
            labels: {
                boxWidth: 12,
                padding: 8,
                font: {
                    size: 10
                }
            }
        }
    },
    scales: {
        y: {
            ticks: {
                font: {
                    size: 10
                }
            }
        },
        x: {
            ticks: {
                font: {
                    size: 10
                }
            }
        }
    }
}
