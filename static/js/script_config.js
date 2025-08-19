const stageManager = {
    electrolyser :{
        0 : {
            class:"sts_idle",
            value:"Internal Error, System not Initialized yet"
        },
        1 : {
            class:"sts_running",
            value:"System in Operation",
        },
        2 : {
            class:"sts_err",
            value:"Error",
        },
        3 : {
            class:"sts_fatal_err",
            value:"Fatal Error",
        },
        4 : {
            class:"sts_err",
            value:"System in Expert Mode",
        },
        other : {
            class:"sts_cant_connect",
            value:"offline"
        }
    },
    compressor : {
        0:{
            class:"sts_fatal_err",
            value:"Stopped"
        },
        1:{
            class:"sts_idle",
            value:"Pre-heating"
        },
        2:{
            class:"sts_running",
            value:"Start Up"
        },
        3:{
            class:"sts_running",
            value:"In Operation"
        },
        other:{
            class:"sts_fatal_err",
            value:"offline"
        }
    }
    
}

function getCurrentStatus(element){
    let listClass = Array.from(element.classList)
    return element.classList[listClass.find((ele)=>ele.includes("sts_"))]
}

function setStatusValue(element,device,state){
    state = isNaN(state) ? -1 : state;
    element.classList.remove(getCurrentStatus(element));
    const stateList = stageManager[device];
    const stateValue = stateList[state];
    element.classList.add(stateValue===undefined ? stateList["other"].class : stateValue.class);
    element.innerHTML.add(stateValue===undefined ? stateList["other"].value : stateValue.value);
}

function setProdValue(ele,value){
    const progress = value - parseFloat(ele.value);
    ele.parentNode.title = (progress>0 ? "+" : "") + progress.toFixed(2)
    ele.innerHTML = (value == 0 ? "--" : value.toFixed(2));
    ele.parentNode.style.color = progress < 0 ? "red" : "green";
    ele.value = value;
}

// Fonction pour mettre à jour la valeur des slider
function updateValueSlider(value) {
    document.querySelectorAll('.slider-value').forEach(sliderValue =>{
        sliderValue.textContent = value;
    });
}

function syncSlider(listSlider,value){
    listSlider.forEach(slider => {
        slider.value = value;
    });
}


document.addEventListener("DOMContentLoaded", function() {
    
    const startButtons = document.querySelectorAll('.startButton');
    const stopButtons = document.querySelectorAll('.stopButton');
    const restartButtons = document.querySelectorAll('.restartButton');
    const statusEle = document.querySelectorAll(".sys_status");
    const prod_valuesEle= document.querySelectorAll(".sys_prod_value span");
    const switchbuttons = document.getElementById("switch-screen").querySelectorAll("button");
    const screens=document.getElementById("main-container").querySelectorAll(".sys_screen");
    const prodRateSlider = document.querySelectorAll('.slider_elec');

    switchbuttons.forEach(btn=>{
        btn.addEventListener("click",(evt)=>{
            switchbuttons.forEach((b)=>b.classList.remove("disabled"));
            screens.forEach((screen)=>{screen.classList.add("d-none")});
            evt.target.classList.add("disabled");
            document.getElementById(evt.target.value).classList.remove("d-none")
        })
    });

    startButtons.forEach((button)=>{
        button.addEventListener('click', async function() {
            let device = button.id.split("_")[1];
            device = device!==undefined ? device+="/" : device="";
            console.log("/"+device+"start");
            const response = await fetch("/"+device+"start");
        });
    });
    stopButtons.forEach((button)=>{
        button.addEventListener('click', async function() {
            let device = button.id.split("_")[1];
            device = device!==undefined ? device+="/" : device="";
            console.log("/"+device+"stop");
            const response = await fetch("/"+device+"stop");
        });
    });
    restartButtons.forEach((button)=>{
        button.addEventListener('click', async function() {
            let device = button.id.split("_")[1];
            device = device!==undefined ? device+="/" : device="";
            console.log("/"+device+"stop");
            const response = await fetch("/"+device+"restart");
        });
    });


    prodRateSlider.forEach(prodRate => {
        prodRate.addEventListener("change", async function () {
            const request = await fetch("/electrolyser/prodRate?" + 
                new URLSearchParams({
                    rate: prodRate.value,
                }),
                {
                    method: "PUT",
                });
        });
        prodRate.addEventListener('input', function() {
            updateValueSlider(prodRate.value);
            syncSlider(prodRateSlider,prodRate.value)
        });

        updateValueSlider(prodRate.value);
    });

    async function updateValue(){
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
                updateValue();
            });
        }
    }
    updateValue();
    updateStateAndValue();
    

});
