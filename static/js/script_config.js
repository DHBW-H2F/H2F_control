document.addEventListener("DOMContentLoaded", function() {
    // start/stop action
    const startButtons = document.querySelectorAll('.startButton');
    const stopButtons = document.querySelectorAll('.stopButton');
    const restartButtons = document.querySelectorAll('.restartButton');
    const statusEle = document.querySelectorAll(".sys_status");
    const prod_valuesEle= document.querySelectorAll(".sys_prod_value span");
    const switchbuttons = document.getElementById("switch-screen").querySelectorAll("button");
    const screens=document.getElementById("main-container").querySelectorAll(".sys_screen");

    startButtons.forEach((button)=>{
        button.addEventListener('click', async function() {
            let device = button.id.split("_")[1];
            if(device!==undefined) device+="/";
            const response = await fetch("/"+device+"start");
        });
    });
    stopButtons.forEach((button)=>{
        button.addEventListener('click', async function() {
            let device = button.id.split("_")[1];
            if(device!==undefined) device+="/";
            const response = await fetch("/"+device+"stop");
        });
    });
    restartButtons.forEach((button)=>{
        button.addEventListener('click', async function() {
            let device = button.id.split("_")[1];
            if(device!==undefined) device+="/";
            const response = await fetch("/"+device+"restart");
        });
    });
    // Production rate
    const prodRate = document.getElementById('slider');

    prodRate.addEventListener("change", async function () {
        const request = await fetch("/electrolyser/prodRate?" + new URLSearchParams({
            rate: prodRate.value,
        }),{
            method: "PUT",
        });
    });
    switchbuttons.forEach(btn=>{
        btn.addEventListener("click",(evt)=>{
            switchbuttons.forEach((b)=>b.classList.remove("disabled"));
            screens.forEach((screen)=>{screen.classList.add("d-none")});
            evt.target.classList.add("disabled");
            document.getElementById(evt.target.value).classList.remove("d-none")
        })
    });

    // Fonction pour mettre à jour la valeur du slider
    function updateValue(value) {
        document.getElementById('sliderValue').textContent = value;
    }

    // Événement de mise à jour du slider
    var slider = document.getElementById('slider');
    slider.addEventListener('input', function() {
        updateValue(this.value);
    });

    function getRandomValue(){
        let a = Math.random()*100;
        return (a)-(a%1);
    }
    
    function updateProdValue(){
        statusEle.forEach(async (stat)=>{
            let device = stat.id.split("_")[1];
            if(device!==undefined) device+="/";
            const response = await fetch("/"+device+"getState");
        });
        prod_valuesEle.forEach(async (prod_value)=>{
            let device = prod_value.id.split("_")[1];
            if(device!==undefined) device+="/";
            const response = await fetch("/"+device+"getProdValue");
        });
    }

    async function  updateStateAndValue(){
        while(true){
            const delay = ()=>{return new Promise(resolve => setTimeout(resolve, 5000))}
            await delay().then(()=>{
                updateProdValue();
            });
        }
    }
    updateStateAndValue();

});
