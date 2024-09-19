document.addEventListener("DOMContentLoaded", function() {
    // start/stop action
    const startButton = document.getElementById('startButton');
    const stopButton = document.getElementById('stopButton');

    startButton.addEventListener('click', async function() {
        const response = await fetch("/start");
    });
    stopButton.addEventListener('click', async function() {
        const response = await fetch("/stop");
    });


    // Production rate
    const prodRate = document.getElementById('slider');

    prodRate.addEventListener("change", async function () {
        const request = await fetch("/prodRate?" + new URLSearchParams({
            rate: prodRate.value,
        }));
    })
});
