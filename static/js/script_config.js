document.addEventListener("DOMContentLoaded", function() {
    // start/stop action
    const startButton = document.getElementById('startButton');
    const stopButton = document.getElementById('stopButton');
    const restartButton = document.getElementById('restartButton');

    startButton.addEventListener('click', async function() {
        const response = await fetch("/start");
    });
    stopButton.addEventListener('click', async function() {
        const response = await fetch("/stop");
    });
    restartButton.addEventListener('click', async function() {
        const response = await fetch("/restart");
    });


    // Production rate
    const prodRate = document.getElementById('slider');

    prodRate.addEventListener("change", async function () {
        const request = await fetch("/prodRate?" + new URLSearchParams({
            rate: prodRate.value,
        }));
    })
});
