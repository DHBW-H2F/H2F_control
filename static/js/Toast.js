/**
 * Create an bootstrap toast (src:https://getbootstrap.com/docs/4.4/components/toasts/)
 * @param {String} title the Title of the toast
 * @returns 
 */
window.createInfoToast = function(title) {
    const createdAt = Date.now(); 
    const toast = document.createElement("div");
    $(toast).toast({"delay": 8000})
    toast.className = "toast";
    toast.setAttribute("role", "alert");
    toast.setAttribute("aria-live", "assertive");
    toast.setAttribute("aria-atomic", "true");

    const header = document.createElement("div");
    header.className = "toast-header";

    const square = document.createElement("div");
    square.id = "toastSquare";
    square.style.width = "20px";
    square.style.height = "20px";
    square.style.marginRight = "5px"
    square.style.backgroundColor = "blue";
    square.className = "rounded mr-2";

    const strong = document.createElement("strong");
    strong.className = "mr-auto";
    strong.textContent = title.replace("/","");

    const small = document.createElement("small");
    small.style.marginLeft = "5px";
    small.className = "text-muted";

    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "ml-2 mb-1 close";
    closeBtn.setAttribute("data-dismiss", "toast");
    closeBtn.setAttribute("aria-label", "Close");

    const spanClose = document.createElement("span");
    spanClose.setAttribute("aria-hidden", "true");
    spanClose.innerHTML = "&times;";  
    closeBtn.appendChild(spanClose);  
    // au clic → retirer le toast
    closeBtn.addEventListener("click", () => {
      toast.remove();
    });
    function updateTime() {
      const elapsed = Math.floor((Date.now() - createdAt) / 1000);
      small.textContent = `${elapsed}s ago`;
    }
    updateTime();
    setInterval(updateTime, 1000);  
    header.appendChild(square);
    header.appendChild(strong);
    header.appendChild(small);
    header.appendChild(closeBtn)

    const body = document.createElement("div");
    body.className = "toast-body";
    body.textContent = "awaiting … "; 

    const spinner = document.createElement("div");
    spinner.className = "spinner-border";
    spinner.setAttribute("role", "status");

    const span = document.createElement("span");
    span.className = "sr-only";
    spinner.appendChild(span);
    body.appendChild(spinner);  
    toast.appendChild(header);
    toast.appendChild(body);

    $(toast).on("hidden.bs.toast",()=>{
      toast.remove();
    })
    return toast;
}

/**
 * modify the text of the toast, remove the spinner or other div element if in
 * @param {HTMLDivElement} toast 
 * @param {String} text 
 */
window.modifyInfoToast= function(toast, text){
    const body = toast.querySelector(".toast-body") 
    const spinner = body.querySelector("div");
    if (spinner==undefined) body.removeChild(spinner);
    body.textContent = text;
}

/**
 * modify the color of the square of the toast
 * @param {HTMLDivElement} toast
 * @param {String} the color text name
 */
window.changeToastSquareColor= function(toast, color){
    const square = toast.querySelector("#toastSquare");
    square.style.backgroundColor = color;
}