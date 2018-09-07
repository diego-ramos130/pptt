'use strict';

let timerOn = false;

function standupTimer() {
  var countDownDate = new Date(Date.now() + 8*60000);
  var x = setInterval(function() {
    var now = new Date().getTime();
    var distance = countDownDate - now;

    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById('demo').innerHTML = days + 'd ' + hours + 'h '
+ minutes + 'm ' + seconds + 's ';

    if (distance < 0) {
      clearInterval(x);
      document.getElementById('demo').innerHTML = 'Back to work!';
    }
  }, 1000);
}

function on() {
  document.getElementById('overlay').style.display = 'block';
  if(!timerOn) {
    standupTimer();
    timerOn = true;
  }
}

function off() {
  document.getElementById('overlay').style.display = 'none';

}

