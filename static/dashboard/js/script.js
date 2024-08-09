function updateRangeValue(value) {
  document.getElementById('rangeValue').innerText = value + '%';
}

const darkModeSwitch = document.getElementById('darkModeSwitch');
darkModeSwitch.addEventListener('change', function() {
  if (this.checked) {
      document.body.classList.remove('light-mode');
      document.body.classList.add('dark-mode');
  } else {
      document.body.classList.remove('dark-mode');
      document.body.classList.add('light-mode');
  }
});

const productionRange = document.getElementById('productionRange');
productionRange.addEventListener('input', function() {
  updateRangeValue(this.value);
});

// Adding functionality to the new buttons
document.getElementById('startButton').addEventListener('click', function() {
  window.location.href = '/start';
});

document.getElementById('stopButton').addEventListener('click', function() {
  window.location.href = '/stop';
});
