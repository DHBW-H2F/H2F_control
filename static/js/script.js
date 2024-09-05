document.addEventListener("DOMContentLoaded", function() {
    // Fonction pour mettre à jour la valeur du slider
    function updateValue(value) {
        document.getElementById('sliderValue').textContent = value;
    }

    // Événement de mise à jour du slider
    var slider = document.getElementById('slider');
    if (slider) {
        slider.addEventListener('input', function() {
            updateValue(this.value);
        });
    }

     // Détecter le nom du fichier actuel dans l'URL
     var currentPath = window.location.pathname;
     var pageName = currentPath.substring(currentPath.lastIndexOf('/') + 1);
 
     // Définir le texte par défaut du bouton
     var buttonText = "Select Dashboard";
 
     // Mettre à jour le texte du bouton en fonction de la page actuelle
     if (pageName === "ProductionDashboard.html") {
         buttonText = "Production Dashboard";
     } else if (pageName === "LiveDashboard.html") {
         buttonText = "Live Production Dashboard";
     } else if (pageName === "ConfigurationPanel.html") {
         buttonText = "Select a Dashboard";
         document.body.classList.add('configuration-panel'); // Ajoute la classe pour masquer le bouton
     }

    // Mettre à jour le texte du bouton dropdown
    var dropdownButton = document.getElementById("dropdownMenuButton");
    if (dropdownButton) {
        dropdownButton.textContent = buttonText;
    }

    // Script pour rafraîchir la page
    var refreshButton = document.getElementById('refreshButton');
    if (refreshButton) {
        refreshButton.addEventListener('click', function() {
            location.reload(); // Rafraîchir la page
        });
    }
});
