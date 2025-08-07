function getCurrentStatus(element){
    let listClass = Array.from(element.classList)
    return element.classList[listClass.find((ele)=>ele.includes("sts_"))]
}
function setStatusValue(element,device,state){
    state = isNaN(state) ? -1 : state;
    element.classList.remove(getCurrentStatus(element));
    if(device=="electrolyser"){
        switch (state){
            case 0 : 
                element.classList.add("sts_idle");
                element.innerHTML = "Internal Error, System not Initialized yet";
                break;
            case 1 : 
                element.classList.add("sts_running");
                element.innerHTML = "System in Operation";
                break;
            case 2 : 
                element.classList.add("sts_err");
                element.innerHTML = "Error";
                break;
            case 3 : 
                element.classList.add("sts_fatal_err");
                element.innerHTML = "Fatal Error";
                break;
            case 4 : 
                element.classList.add("sts_err");
                element.innerHTML = "System in Expert Mode";
                break;
            default :
                element.classList.add("sts_cant_connect");
                element.innerHTML = "offline";
                break;
        }
    }else if (device == "compressor"){
        switch (state){
            case 0 :
                element.classList.add("sts_fatal_err");
                element.innerHTML = "Stopped";
                break;
            case 1 :
                element.classList.add("sts_idle");
                element.innerHTML = "Pre-heating";
                break;
            case 2 :
                element.classList.add("sts_running");
                element.innerHTML = "Start Up";
                break;
            case 3 :
                element.classList.add("sts_running");
                element.innerHTML = "In Operation";
                break;
            default :
                element.classList.add("sts_cant_connect");
                element.innerHTML = "offline";
                break;
        }
    }
}
function setProdValue(ele,value){
    const progress = value - parseFloat(ele.value);
    ele.parentNode.title = (progress>0 ? "+" : "") + progress.toFixed(2)
    ele.innerHTML = (value == 0 ? "--" : value.toFixed(2));
    ele.parentNode.style.color = progress < 0 ? "red" : "green";
    ele.value = value;
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
            console.log("/"+device+"start");
            const response = await fetch("/"+device+"start");
        });
    });
    stopButtons.forEach((button)=>{
        button.addEventListener('click', async function() {
            let device = button.id.split("_")[1];
            if(device!==undefined) device+="/";
            console.log("/"+device+"stop");
            const response = await fetch("/"+device+"stop");
        });
    });
    restartButtons.forEach((button)=>{
        button.addEventListener('click', async function() {
            const response = await fetch("/"+"restart");
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
            statusEle.forEach(async (stat)=>{
                let device = stat.id.split("_")[1];
                const deviceURL = device!==undefined ? device+"/" : device;
                try {
                    const response = await fetch("/"+deviceURL+"state");
                    const json = await response.json();
                    setStatusValue(stat,device,parseInt(json.state));
                } catch (error) {
                    console.error(error.message);
                    setStatusValue(stat,device,-1);
                }
            });
            prod_valuesEle.forEach(async (prod_value)=>{
                let device = prod_value.id.split("_")[1];
                const deviceURL = device!==undefined ? device+"/" : device;
                try {
                    const response = await fetch("/"+deviceURL+"prodValue");
                    const json = await response.json();
                    const value = parseFloat(json.value) < 1e-5 ? 0  : parseFloat(json.value);
                    setProdValue(prod_value,value);
                } catch (error) {
                    console.error(error.message);
                    setProdValue(prod_value,0);
                }
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
