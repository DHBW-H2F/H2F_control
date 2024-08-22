// Function to get a query parameter value by name
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// Function to update the dashboard iframe source based on the selected dashboard
function updateDashboard(dashboard) {
  const iframe = document.querySelector('iframe');
  let dashname = dashboard.toLowerCase();
  let uid = dashname.padEnd(14,"0");
  let dashboardUrl = "http://grafana.h2f/d/"+uid+"/"+dashname+"?orgId=1&kiosk=1&theme=light&refresh=5s"

  if (iframe) {
    iframe.src = dashboardUrl;
  } else {
    console.error('No iframe found.');
  }
}

// Load the selected dashboard when the page loads
document.addEventListener('DOMContentLoaded', function() {
  const selectedDashboard = getQueryParam('dashboard');
  if (selectedDashboard) {
    updateDashboard(selectedDashboard);
  } else {
    console.error('No dashboard selected.');
  }
});

// script.js
document.addEventListener('DOMContentLoaded', function() {
  const darkModeSwitch = document.getElementById('darkModeSwitch');
  
  // Check local storage for the user's preference
  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
    darkModeSwitch.checked = true;
  }

  // Toggle dark mode on checkbox change
  darkModeSwitch.addEventListener('change', function() {
    if (darkModeSwitch.checked) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('darkMode', 'false');
    }
  });
});

  // Settings dropdown toggle
  const settingsButton = document.getElementById('settingsButton');
  const settingsDropdown = document.getElementById('settingsDropdown');

  settingsButton.addEventListener('click', function() {
    const isVisible = settingsDropdown.style.display === 'block';
    settingsDropdown.style.display = isVisible ? 'none' : 'block';
  });

  // Close dropdown if clicked outside
  document.addEventListener('click', function(event) {
    if (!settingsButton.contains(event.target) && !settingsDropdown.contains(event.target)) {
      settingsDropdown.style.display = 'none';
    }
  });

  
  // Start/stop action
  const startButton = document.getElementById('startButton');
  const stopButton = document.getElementById('stopButton');

  startButton.addEventListener('click', async function() {
    const response = await fetch("/start");
  });
  stopButton.addEventListener('click', async function() {
    const response = await fetch("/stop");
  });


  // Production rate
  const prodRate = document.getElementById('productionRange');
  const prodRateDisp = document.getElementById('rangeValue');

  prodRate.addEventListener('input', function() {
    prodRateDisp.innerHTML = prodRate.value + "%";
  })
  prodRate.addEventListener("change", async function () {
    const request = await fetch("/prodRate?" + new URLSearchParams({
        rate: prodRate.value,
      })
    );
  })

