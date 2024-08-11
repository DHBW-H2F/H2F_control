// Function to get a query parameter value by name
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// Function to update the dashboard iframe source based on the selected dashboard
function updateDashboard(dashboard) {
  const iframe = document.querySelector('iframe');
  let dashboardUrl;

  switch(dashboard) {
      case 'boolean':
          dashboardUrl = 'http://example.com/boolean-dashboard'; // Replace with actual URL
          break;
      case 'fan_speed':
          dashboardUrl = 'http://example.com/fan-speed-dashboard'; // Replace with actual URL
          break;
      case 'pressure':
          dashboardUrl = 'http://example.com/pressure-dashboard'; // Replace with actual URL
          break;
      case 'production':
          dashboardUrl = 'http://example.com/production-dashboard'; // Replace with actual URL
          break;
      case 'temperature':
          dashboardUrl = 'http://example.com/temperature-dashboard'; // Replace with actual URL
          break;
      case 'test':
          dashboardUrl = 'http://example.com/test-dashboard'; // Replace with actual URL
          break;
      case 'voltage':
          dashboardUrl = 'http://example.com/voltage-dashboard'; // Replace with actual URL
          break;
      default:
          dashboardUrl = 'http://example.com/default-dashboard'; // Replace with actual URL
  }

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

