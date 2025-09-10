import { createInfoToast, modifyInfoToast } from "./toast.js";
/* The `stageManager` object is used to store status information for different devices in the system.
It is structured as follows: 
{"deviceName" : {
    status_int : {
        class : "" // to assign a color
        text : "" // description of the state
    }
    ...
 }
 ...
}*/
const stageManager = {
    electrolyser :{
        0 : {
            class:"sts_idle",
            text:"Internal Error, System not Initialized yet"
        },
        1 : {
            class:"sts_running",
            text:"System in Operation",
        },
        2 : {
            class:"sts_err",
            text:"Error",
        },
        3 : {
            class:"sts_fatal_err",
            text:"Fatal Error",
        },
        4 : {
            class:"sts_err",
            text:"System in Expert Mode",
        },
        other : {
            class:"sts_cant_connect",
            text:"offline"
        }
    },
    compressor : {
        0:{
            class:"sts_fatal_err",
            text:"Stopped"
        },
        1:{
            class:"sts_idle",
            text:"Pre-heating"
        },
        2:{
            class:"sts_running",
            text:"Start Up"
        },
        3:{
            class:"sts_running",
            text:"In Operation"
        },
        other:{
            class:"sts_cant_connect",
            text:"offline"
        }
    } 
}

/**
 * Get the current status of the device from the classList of an element
 * @param {Element  } element Html contains of the status
 * @returns the full status class `string` or `undefined` if not found
 */

function getCurrentStatus(element){
    let listClass = Array.from(element.classList);
    const indexClass = listClass.find((ele)=>ele.includes("sts_"));
    return indexClass === undefined ? undefined : element.classList[indexClass];
}

/**
 * Change the text and the status class of an element
 * @param {Element} element Html element that contains the status class
 * @param {string} device the name of the device we want to change the status
 * @param {number} state the state number of the device
 */
function setStatusValue(element,device,state){
    state = isNaN(state) ? -1 : state;
    element.classList.remove(getCurrentStatus(element));
    const stateList = stageManager[device];
    const stateValue = stateList[state];
    element.classList.add(stateValue===undefined ? stateList["other"].class : stateValue.class);
    element.innerHTML= (stateValue===undefined ? stateList["other"].text : stateValue.text);
}

/**
 * Change the text number and the title value of an element
 * the number is limited by 2 value after the comma
 * @param {Element} ele Html contains of the production rate
 * @param {number} value the production rate value
 */
function setProdValue(element,value){
    const progress = value - parseFloat(element.value);
    element.parentNode.title = (progress>0 ? "+" : "") + progress.toFixed(2)
    element.innerHTML = (value == 0 ? "--" : value.toFixed(2));
    element.parentNode.style.color = progress < 0 ? "red" : "green";
    element.value = value;
}
/**
 * Fonction who call fetch to the backend
 * @param {String} url 
 * @param {Object} parameterURL the parameter to add to the url as "test?param1=1..."
 * @param {Object} parameterFetch the parameter of the fetch
 * @returns the response of the fetch or error if an error occurs
 */
async function fetchBackEnd(url, parameterURL, parameterFetch={method:"get"}){
    const param = (parameterURL==undefined ? "" : ("?"+ new URLSearchParams(parameterURL)));
    parameterFetch.signal = AbortSignal.timeout(5000);
    return fetch(url+param,parameterFetch).then(response => {
        if (!response.ok) {
            // create error object and reject if not a 2xx response code
            let err = new Error("[" +response.status+"] => " + response.statusText )
            err.status = response.status
            throw err
         }
         return response
    });
}

/**
 * Generalisation of the fonction call by the click event
 * @param {HTMLButtonElement} button 
 * @param {String} command 
 */
async function sendcommandFonction(button,command){
    const device = getDeviceButton(button,true);
    const toast = createInfoToast("Command \""+command+"\" send to "+ (device==="" ? "All Devices" : device));
    try {
        document.querySelector("body").appendChild(toast);
        $(toast).toast('show');
        const response = await fetchBackEnd("/"+device+command);
        modifyInfoToast(toast,"Command send successful");
    } catch (error) {
        modifyInfoToast(toast,"An error as occurs :\n"+error.message.toString());
    }
}

/**
 * 
 * @param {*} button 
 * @param {*} asURL 
 * @returns 
 */
function getDeviceButton(button, asURL=false){
    let device = button.id.split("_")[1];
    return asURL ? (device!==undefined ? device+="/" : device="") : device;
}
/**
 * Updates the text content of all the sliders with the `value`
 * @param {number} value The `value` of the production rate
 */
function updateValueSlider(value) {
    document.querySelectorAll('.slider-value').forEach(sliderValue =>{
        sliderValue.textContent = value;
    });
}

/**
 * The function syncSlider sets the value of each slider in a list to a specified value.
 * @param {NodeListOf<Element>} listSlider the array of the slider elements need to be synchronized
 * @param {number} value The `value` of the production rate
 */
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
        button.addEventListener('click', ()=>{sendcommandFonction(button,"start")});
    });
    stopButtons.forEach((button)=>{
        button.addEventListener('click', ()=>{sendcommandFonction(button,"stop")});
    });
    restartButtons.forEach((button)=>{
        button.addEventListener('click', ()=>{sendcommandFonction(button,"restart")});
    });

    prodRateSlider.forEach(prodRate => {
        prodRate.addEventListener("change", async function () {
            const toast = createInfoToast("Command \"Change Production rate\" send to Electrolyser");
            try {
                $(toast).toast('show');
                const response = await fetchBackEnd(
                    "/electrolyser/prodRate",
                    {
                        rate: prodRate.value,
                    },
                    {
                        method: "put",
                    }
                );
                modifyInfoToast(toast,"Command send successful");
            } catch (error) {
                modifyInfoToast(toast,"An error as occurs : "+error.message.toString());
            }
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
                    const response = await fetchBackEnd("/"+deviceURL+"state");
                    const json = await response.json();
                    setStatusValue(stat,device,parseInt(json.state));
                } catch (error) {
                    console.error(error.message);
                    setStatusValue(stat,device,undefined);
                }
            });
            prod_valuesEle.forEach(async (prod_value)=>{
                let device = prod_value.id.split("_")[1];
                const deviceURL = device!==undefined ? device+"/" : device;
                try {
                    const response = await fetchBackEnd("/"+deviceURL+"prodValue");
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