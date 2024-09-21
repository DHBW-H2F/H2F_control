document.addEventListener("DOMContentLoaded", function() {
    // Initialize Flatpickr for the date pickers (From and To dates)
    flatpickr("#datePickerFrom", {
        enableTime: false, // Disables time selection, only date
        dateFormat: "Y-m-d", // Date format in Year-Month-Day
        defaultDate: "today", // Sets default date to today
        onChange: function(selectedDates, dateStr, instance) {
            console.log("Start date selected: " + dateStr); // Log the selected start date
            updateGraphsWithDate(); // Call function to update the graphs with the new dates
        }
    });

    flatpickr("#datePickerTo", {
        enableTime: false, // Disables time selection, only date
        dateFormat: "Y-m-d", // Date format in Year-Month-Day
        defaultDate: "today", // Sets default date to today
        onChange: function(selectedDates, dateStr, instance) {
            console.log("End date selected: " + dateStr); // Log the selected end date
            updateGraphsWithDate(); // Call function to update the graphs with the new dates
        }
    });

    // Function to update the graphs (iFrames) based on the selected date range
    function updateGraphsWithDate() {
        var fromDate = document.getElementById('datePickerFrom').value; // Get start date value
        var toDate = document.getElementById('datePickerTo').value; // Get end date value

        // Proceed if both dates are selected
        if (fromDate && toDate) {
            var fromTimestamp = convertToTimestamp(fromDate + 'T00:00:00'); // Convert start date to timestamp (start of the day)
            var toTimestamp = convertToTimestamp(toDate + 'T23:59:59'); // Convert end date to timestamp (end of the day)

            // Select all iFrames in the document
            var iframes = document.querySelectorAll("iframe");
            iframes.forEach(function(iframe) {
                var src = iframe.getAttribute('src'); // Get the current iFrame's src
                var newSrc = updateIframeSrcWithDates(src, fromTimestamp, toTimestamp); // Update src with the new date range
                iframe.setAttribute('src', newSrc); // Set the new src to the iFrame
            });
        }
    }

    // Converts a date string into a UNIX timestamp (in milliseconds)
    function convertToTimestamp(dateStr) {
        return new Date(dateStr).getTime();
    }

    // Updates the 'from' and 'to' parameters in the iFrame src URL
    function updateIframeSrcWithDates(src, fromTimestamp, toTimestamp) {
        var url = new URL(src); // Parse the iFrame's src URL
        url.searchParams.set('from', fromTimestamp); // Set 'from' date parameter
        url.searchParams.set('to', toTimestamp); // Set 'to' date parameter
        // Add a cache-busting parameter to ensure the request is fresh
        url.searchParams.set('cache_buster', new Date().getTime());
        return url.toString(); // Return the updated URL
    }

    // Get the full path of the current URL
    var currentPath = window.location.pathname;
    console.log("Full URL path: ", currentPath); // Log the full URL path

    // Extract the page name from the URL path (last part of the URL)
    var pageName = currentPath.substring(currentPath.lastIndexOf('/') + 1);
    console.log("Page name: ", pageName); // Log the current page name

    // Set default text for the dropdown button
    var buttonText = "Select Dashboard";

    // Logic to set the dropdown button text based on the current page
    if (pageName === "ProductionDashboard.html") {
        buttonText = "Production Dashboard";
    } else if (pageName === "LiveDashboard.html") {
        buttonText = "Live Production Dashboard";
    } else if (pageName === "ConfigurationPanel.html") {
        buttonText = "Select a Dashboard";
        document.body.classList.add('configuration-panel'); // Add a CSS class for the configuration panel page
    }

    // Update the dropdown button text
    var dropdownButton = document.getElementById("dropdownMenuButton");
    if (dropdownButton) {
        dropdownButton.textContent = buttonText; // Set the dropdown button text
    }

    // Event listener for the refresh button to reload the page when clicked
    var refreshButton = document.getElementById('refreshButton');
    if (refreshButton) {
        refreshButton.addEventListener('click', function() {
            location.reload(); // Reload the current page
        });
    }
});
