var animationElements, breakMinutes, breakSlider, clockDiv, clockFace, clockState, fireButton, i, len, padWithZeros, rainButton, redrawClock, redrawColors, redrawSliders, redrawSound, resetAnimation, resetButton, setAnimationTime, sliderState, sound, soundState, sounds, startButton, startClock, update, updateClock, volumeButton, volumeSlider, windButton, workMinutes, workSlider;

startButton = document.getElementById("start");

resetButton = document.getElementById("reset");

clockDiv = document.getElementById("time");

workSlider = document.getElementById("workslider");

breakSlider = document.getElementById("breakslider");

workMinutes = document.getElementById("workminutes");

breakMinutes = document.getElementById("breakminutes");

clockFace = document.getElementById('clock-face');

rainButton = document.getElementById("rain");

fireButton = document.getElementById("fire");

windButton = document.getElementById("wind");

volumeButton = document.getElementById("volume");

volumeSlider = document.getElementById("volumeslider");

animationElements = Array.from(document.getElementsByClassName('clock-animation'));

sounds = [new Audio("assets/rain.mp3"), new Audio("assets/fire.mp3"), new Audio("assets/wind.mp3")];

for (i = 0, len = sounds.length; i < len; i++) {
  sound = sounds[i];
  sound.loop = true;
}

clockState = {
  time: 1500,
  running: false,
  work: true,
  reset: true
};

sliderState = {
  work: 25,
  "break": 5
};

soundState = {
  volume: 80,
  rain: false,
  fire: false,
  wind: false
};

update = function(state, field, val) {
  var newState;
  newState = state;
  newState[field] = val;
  return newState;
};

updateClock = function(state, field, val) {
  var newClock;
  newClock = state;
  newClock[field] = val;
  return newClock;
};

redrawClock = function(oldClock, newClock) {
  var el, j, k, len1, len2;
  if (oldClock.running !== newClock.running) {
    if (newClock.running) {
      startButton.children[0].classList.remove("fa-play");
      startButton.children[0].classList.add("fa-pause");
      for (j = 0, len1 = animationElements.length; j < len1; j++) {
        el = animationElements[j];
        el.classList.remove('pause');
      }
    } else {
      startButton.children[0].classList.add("fa-play");
      startButton.children[0].classList.remove("fa-pause");
      for (k = 0, len2 = animationElements.length; k < len2; k++) {
        el = animationElements[k];
        el.classList.add('pause');
      }
    }
  }
  if (oldClock.time !== newClock.time) {
    clockDiv.innerHTML = padWithZeros(Math.floor(newClock.time / 60).toString() + ":" + padWithZeros((newClock.time % 60).toString()));
  }
  if (oldClock.work !== newClock.work) {
    if (newClock.work) {
      clockDiv.classList.add("work");
      return clockDiv.classList.remove("break");
    } else {
      clockDiv.classList.remove("work");
      return clockDiv.classList.add("break");
    }
  }
};

redrawSliders = function(oldState, newState) {
  if (oldState.work !== newState.work) {
    workMinutes.innerHTML = newState.work;
  }
  if (oldState["break"] !== newState["break"]) {
    return breakMinutes.innerHTML = newState["break"];
  }
};

redrawSound = function(oldState, newState) {
  var j, k, l, len1, len2, len3, results, results1;
  if (oldState.volume !== newState.volume) {
    for (j = 0, len1 = sounds.length; j < len1; j++) {
      sound = sounds[j];
      sound.volume = newState.volume / 100;
    }
  }
  if (oldState.rain !== newState.rain) {
    if (newState.rain) {
      rainButton.classList.add("active");
      sounds[0].play();
    } else {
      rainButton.classList.remove("active");
      sounds[0].pause();
    }
  }
  if (oldState.fire !== newState.fire) {
    if (newState.fire) {
      fireButton.classList.add("active");
      sounds[1].play();
    } else {
      fireButton.classList.remove("active");
      sounds[1].pause();
    }
  }
  if (oldState.wind !== newState.wind) {
    if (newState.wind) {
      windButton.classList.add("active");
      sounds[2].play();
    } else {
      windButton.classList.remove("active");
      sounds[2].pause();
    }
  }
  if (oldState.mute !== newState.mute) {
    if (newState.mute) {
      volumeButton.children[0].classList.remove("fa-volume-up");
      volumeButton.children[0].classList.add("fa-volume-off");
      volumeSlider.classList.add("disabled");
      volumeSlider.disabled = true;
      results = [];
      for (k = 0, len2 = sounds.length; k < len2; k++) {
        sound = sounds[k];
        results.push(sound.muted = true);
      }
      return results;
    } else {
      volumeButton.children[0].classList.add("fa-volume-up");
      volumeButton.children[0].classList.remove("fa-volume-off");
      volumeSlider.classList.remove("disabled");
      volumeSlider.disabled = false;
      results1 = [];
      for (l = 0, len3 = sounds.length; l < len3; l++) {
        sound = sounds[l];
        results1.push(sound.muted = false);
      }
      return results1;
    }
  }
};

redrawColors = function(oldColor, newColor) {
  var el, j, k, len1, len2, results;
  for (j = 0, len1 = coloredElements.length; j < len1; j++) {
    el = coloredElements[j];
    el.classList.remove(oldColor);
  }
  results = [];
  for (k = 0, len2 = coloredElements.length; k < len2; k++) {
    el = coloredElements[k];
    results.push(el.classList.add(newColor));
  }
  return results;
};

startButton.addEventListener("click", function() {
  var oldClock;
  oldClock = JSON.parse(JSON.stringify(clockState));
  clockState = update(clockState, "running", !oldClock.running);
  redrawClock(oldClock, clockState);
  if (clockState.running) {
    clockState.iv = startClock();
    if (clockState.reset) {
      clockState.reset = false;
      resetAnimation();
      return setAnimationTime(clockState.time);
    }
  } else {
    return clearInterval(clockState.iv);
  }
});

resetButton.addEventListener("click", function() {
  var oldClock;
  oldClock = JSON.parse(JSON.stringify(clockState));
  clockState = update(update(update(clockState, "time", sliderState.work * 60), "running", false), "work", true);
  redrawClock(oldClock, clockState);
  setAnimationTime(clockState.time);
  return resetAnimation();
});

workSlider.addEventListener("input", function(ev) {
  var oldClock, oldState;
  oldState = JSON.parse(JSON.stringify(sliderState));
  sliderState = update(sliderState, "work", ev.target.value);
  redrawSliders(oldState, sliderState);
  if (!clockState.running) {
    oldClock = JSON.parse(JSON.stringify(clockState));
    clockState = update(clockState, "time", sliderState.work * 60);
    redrawClock(oldClock, clockState);
    return clockState.reset = true;
  }
});

breakSlider.addEventListener("input", function(ev) {
  var oldState;
  oldState = JSON.parse(JSON.stringify(sliderState));
  sliderState = update(sliderState, "break", ev.target.value);
  return redrawSliders(oldState, sliderState);
});

rainButton.addEventListener("click", function() {
  var oldState;
  oldState = JSON.parse(JSON.stringify(soundState));
  soundState = update(soundState, "rain", !oldState.rain);
  return redrawSound(oldState, soundState);
});

fireButton.addEventListener("click", function() {
  var oldState;
  oldState = JSON.parse(JSON.stringify(soundState));
  soundState = update(soundState, "fire", !oldState.fire);
  return redrawSound(oldState, soundState);
});

windButton.addEventListener("click", function() {
  var oldState;
  oldState = JSON.parse(JSON.stringify(soundState));
  soundState = update(soundState, "wind", !oldState.wind);
  return redrawSound(oldState, soundState);
});

volumeButton.addEventListener("click", function() {
  var oldState;
  oldState = JSON.parse(JSON.stringify(soundState));
  soundState = update(soundState, "mute", !oldState.mute);
  return redrawSound(oldState, soundState);
});

volumeSlider.addEventListener("input", function(ev) {
  var oldState;
  oldState = JSON.parse(JSON.stringify(soundState));
  soundState = update(soundState, "volume", ev.target.value);
  return redrawSound(oldState, soundState);
});

padWithZeros = function(str) {
  if (str.length > 1) {
    return str;
  } else {
    return "0" + str;
  }
};

startClock = function() {
  var secondsIv;
  return secondsIv = setInterval(function() {
    var oldClock;
    if (clockState.time >= 1) {
      oldClock = JSON.parse(JSON.stringify(clockState));
      clockState = update(clockState, "time", oldClock.time - 1);
      return redrawClock(oldClock, clockState);
    } else if (clockState.time <= 1 && clockState.work) {
      oldClock = JSON.parse(JSON.stringify(clockState));
      clockState = update(update(clockState, "time", sliderState["break"] * 60), "work", false);
      setAnimationTime(clockState.time);
      resetAnimation();
      return redrawClock(oldClock, clockState);
    }
  }, 950);
};

resetAnimation = function() {
  var cal, cam, car;
  cal = document.getElementById('clock-animation-left-semicircle');
  car = document.getElementById('clock-animation-right-semicircle');
  cam = document.getElementById('clock-animation-right-mask');
  cal.removeAttribute('id');
  car.removeAttribute('id');
  cam.removeAttribute('id');
  return setTimeout(function() {
    cal.setAttribute('id', 'clock-animation-left-semicircle');
    car.setAttribute('id', 'clock-animation-right-semicircle');
    return cam.setAttribute('id', 'clock-animation-right-mask');
  }, 10);
};

setAnimationTime = function(time) {
  var rule, sheet;
  rule = ".animation { animation-duration: " + time + "s }";
  sheet = document.getElementById('style').sheet;
  return sheet.insertRule(rule, sheet.cssRules.length);
};
