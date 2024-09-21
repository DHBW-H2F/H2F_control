document.addEventListener("DOMContentLoaded", function() {
    // Initialiser Flatpickr pour les sélecteurs de date
    flatpickr("#datePickerFrom", {
        enableTime: false,
        dateFormat: "Y-m-d",
        defaultDate: "today",
        onChange: function(selectedDates, dateStr, instance) {
            console.log("Date de début sélectionnée : " + dateStr);
            updateGraphsWithDate();
        }
    });

    flatpickr("#datePickerTo", {
        enableTime: false,
        dateFormat: "Y-m-d",
        defaultDate: "today",
        onChange: function(selectedDates, dateStr, instance) {
            console.log("Date de fin sélectionnée : " + dateStr);
            updateGraphsWithDate();
        }
    });

    // Fonction pour mettre à jour les graphiques en fonction des dates sélectionnées
    function updateGraphsWithDate() {
        var fromDate = document.getElementById('datePickerFrom').value;
        var toDate = document.getElementById('datePickerTo').value;

        if (fromDate && toDate) {
            var fromTimestamp = convertToTimestamp(fromDate + 'T00:00:00');
            var toTimestamp = convertToTimestamp(toDate + 'T23:59:59');

            var iframes = document.querySelectorAll("iframe");
            iframes.forEach(function(iframe) {
                var src = iframe.getAttribute('src');
                var newSrc = updateIframeSrcWithDates(src, fromTimestamp, toTimestamp);
                iframe.setAttribute('src', newSrc);
            });
        }
    }

    // Fonction pour convertir une date en timestamp UNIX (en millisecondes)
    function convertToTimestamp(dateStr) {
        return new Date(dateStr).getTime();
    }

    // Fonction pour ajouter les paramètres from et to (en timestamp) dans l'URL des iframes
    function updateIframeSrcWithDates(src, fromTimestamp, toTimestamp) {
        var url = new URL(src);
        url.searchParams.set('from', fromTimestamp);
        url.searchParams.set('to', toTimestamp);
        // Ajouter un paramètre pour éviter le cache
        url.searchParams.set('cache_buster', new Date().getTime());
        return url.toString();
    }

    // Détecter le nom du fichier actuel dans l'URL
    var currentPath = window.location.pathname;
    var pageName = currentPath.substring(currentPath.lastIndexOf('/') + 1);

    var buttonText = "Select Dashboard";

    if (pageName === "ProductionDashboard.html") {
        buttonText = "Production Dashboard";
    } else if (pageName === "LiveDashboard.html") {
        buttonText = "Live Production Dashboard";
    } else if (pageName === "ConfigurationPanel.html") {
        buttonText = "Select a Dashboard";
        document.body.classList.add('configuration-panel');
    }

    var dropdownButton = document.getElementById("dropdownMenuButton");
    if (dropdownButton) {
        dropdownButton.textContent = buttonText;
    }

    var refreshButton = document.getElementById('refreshButton');
    if (refreshButton) {
        refreshButton.addEventListener('click', function() {
            location.reload();
        });
    }
});
