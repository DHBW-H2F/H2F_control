function getCurrentStatus(element){
    return element.classList[element.classList.find((ele)=>ele.includes("sts_"))]
}
function setStatusValue(state,device,element){
    if(device=="electrolyser"){
        element.classList.remove(getCurrentStatus(element));
        switch (state){
            case "0" : 
                element.classList.add("sts_idle");
                element.innerHTML = "Internal Error, System not Initialized yet";
            case "1" : 
                element.classList.add("sts_running");
                element.innerHTML = "System in Operation";
            case "2" : 
                element.classList.add("sts_err");
                element.innerHTML = "Error";
            case "3" : 
                element.classList.add("sts_fatal_err");
                element.innerHTML = "Fatal Error"; 
            case "4" : 
                element.classList.add("sts_err");
                element.innerHTML = "System in Expert Mode"; 
            break;
        }
    }
}
function setProdValue(ele,value){
    ele.innerHTML = (value == 0 ? "--" : value);
}
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
    
    async function updateProdValue(){
         try {
            
            statusEle.forEach(async (stat)=>{
                let device = stat.id.split("_")[1];
                if(device!==undefined) device+="/";
                const response = await fetch("/"+device+"state");
                const json = await response.json();
                console.log(json);
                setStatusValue(json.state,device,stat);
            });
            prod_valuesEle.forEach(async (prod_value)=>{
                let device = prod_value.id.split("_")[1];
                if(device!==undefined) device+="/";
                const response = await fetch("/"+device+"prodValue");
                const json = await response.json();
                let epsilon = 1e-5;
                const value = json.value < epsilon ? 0 : value;
                setProdValue(prod_value,value);
            });
        } catch (error) {
            console.error(error.message);
        }
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
