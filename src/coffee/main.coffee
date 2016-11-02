# Cache some DOM elements for future use.
startButton = document.getElementById("start")
resetButton = document.getElementById("reset")
clockDiv = document.getElementById("time")
workSlider = document.getElementById("workslider")
breakSlider = document.getElementById("breakslider")
workMinutes = document.getElementById("workminutes")
breakMinutes = document.getElementById("breakminutes")
clockFace = document.getElementById('clock-face')

rainButton = document.getElementById("rain")
fireButton = document.getElementById("fire")
windButton = document.getElementById("wind")
volumeButton = document.getElementById("volume")
volumeSlider = document.getElementById("volumeslider")


animationElements = Array.from(document.getElementsByClassName('clock-animation'))

sounds = [
  new Audio("assets/rain.mp3"),
  new Audio("assets/fire.mp3"),
  new Audio("assets/wind.mp3")
]
sound.loop = true for sound in sounds


# Define component states
clockState =
  time: 1500
  running: false
  work: true
  reset: true

sliderState =
  work: 25
  break: 5

soundState =
  volume: 80
  rain: false
  fire: false
  wind: false

# Update functions
update = (state, field, val) ->
  newState = state
  newState[field] = val
  return newState

updateClock = (state, field, val) ->
  newClock = state
  newClock[field] = val
  return newClock

# Redraw functions
redrawClock = (oldClock, newClock) ->
  # If the 'running' state is changed. We need to toggle the play/pause button.
  # And change the animation state.
  if oldClock.running != newClock.running
    if newClock.running
      startButton.children[0].classList.remove("fa-play")
      startButton.children[0].classList.add("fa-pause")
      el.classList.remove('pause') for el in animationElements
    else
      startButton.children[0].classList.add("fa-play")
      startButton.children[0].classList.remove("fa-pause")
      el.classList.add('pause') for el in animationElements

  # If the time has changed, simply display the new time.
  if oldClock.time != newClock.time
    clockDiv.innerHTML = padWithZeros Math.floor(newClock.time / 60).toString() +
                         ":" +
                         padWithZeros (newClock.time % 60).toString()

  if oldClock.work != newClock.work
    if newClock.work
      clockDiv.classList.add("work")
      clockDiv.classList.remove("break")
    else
      clockDiv.classList.remove("work")
      clockDiv.classList.add("break")



redrawSliders = (oldState, newState) ->
  if oldState.work != newState.work
    workMinutes.innerHTML = newState.work
  if oldState.break != newState.break
    breakMinutes.innerHTML = newState.break


redrawSound = (oldState, newState) ->
  if oldState.volume != newState.volume
    sound.volume = newState.volume/100 for sound in sounds
  if oldState.rain != newState.rain
    if newState.rain
      rainButton.classList.add("active")
      sounds[0].play()
    else
      rainButton.classList.remove("active")
      sounds[0].pause()

  if oldState.fire != newState.fire
    if newState.fire
      fireButton.classList.add("active")
      sounds[1].play()
    else
      fireButton.classList.remove("active")
      sounds[1].pause()

  if oldState.wind != newState.wind
    if newState.wind
      windButton.classList.add("active")
      sounds[2].play()
    else
      windButton.classList.remove("active")
      sounds[2].pause()

  if oldState.mute != newState.mute
    if newState.mute
      volumeButton.children[0].classList.remove("fa-volume-up")
      volumeButton.children[0].classList.add("fa-volume-off")
      volumeSlider.classList.add("disabled")
      volumeSlider.disabled = true
      sound.muted = true for sound in sounds
    else
      volumeButton.children[0].classList.add("fa-volume-up")
      volumeButton.children[0].classList.remove("fa-volume-off")
      volumeSlider.classList.remove("disabled")
      volumeSlider.disabled = false
      sound.muted = false for sound in sounds

redrawColors = (oldColor, newColor) ->
  el.classList.remove(oldColor) for el in coloredElements
  el.classList.add(newColor) for el in coloredElements

  
      
# Event listeners/handlers
# All handlers do pretty much the same thing: clone the old state, update the 
# current state, and pass both to the redraw function.
startButton.addEventListener("click", () ->
  oldClock = JSON.parse(JSON.stringify(clockState))
  clockState = update(clockState, "running", !oldClock.running)
  redrawClock(oldClock, clockState)
  if clockState.running
    clockState.iv = startClock()

    if clockState.reset
      clockState.reset = false
      resetAnimation()
      setAnimationTime(clockState.time)

  else
    clearInterval(clockState.iv)
)

# The reset button should reset the time, but also pause the clock.
resetButton.addEventListener("click", () ->
  oldClock = JSON.parse(JSON.stringify(clockState))
  clockState = update(update(update(clockState, "time", sliderState.work * 60)
    , "running", false)
    , "work", true)
  redrawClock(oldClock, clockState)
  setAnimationTime(clockState.time)
  resetAnimation()
)

workSlider.addEventListener("input", (ev) ->
  oldState = JSON.parse(JSON.stringify(sliderState))
  sliderState = update(sliderState, "work", ev.target.value)
  redrawSliders(oldState, sliderState)
  if !clockState.running
    oldClock = JSON.parse(JSON.stringify(clockState))
    clockState = update(clockState, "time", sliderState.work*60)
    redrawClock(oldClock, clockState)
    clockState.reset = true
)

breakSlider.addEventListener("input", (ev) ->
  oldState = JSON.parse(JSON.stringify(sliderState))
  sliderState = update(sliderState, "break", ev.target.value)
  redrawSliders(oldState, sliderState)
)

rainButton.addEventListener("click", () ->
  oldState = JSON.parse(JSON.stringify(soundState))
  soundState = update(soundState, "rain", !oldState.rain)
  redrawSound(oldState, soundState)
)

fireButton.addEventListener("click", () ->
  oldState = JSON.parse(JSON.stringify(soundState))
  soundState = update(soundState, "fire", !oldState.fire)
  redrawSound(oldState, soundState)
)

windButton.addEventListener("click", () ->
  oldState = JSON.parse(JSON.stringify(soundState))
  soundState = update(soundState, "wind", !oldState.wind)
  redrawSound(oldState, soundState)
)

volumeButton.addEventListener("click", () ->
  oldState = JSON.parse(JSON.stringify(soundState))
  soundState = update(soundState, "mute", !oldState.mute)
  redrawSound(oldState, soundState)
)

volumeSlider.addEventListener("input", (ev) ->
  oldState = JSON.parse(JSON.stringify(soundState))
  soundState = update(soundState, "volume", ev.target.value)
  redrawSound(oldState, soundState)
)

# Helper functions
padWithZeros = (str) ->
  if str.length > 1 then str else "0"+str

startClock = () ->
  # Running the actual clock
  secondsIv = setInterval( () ->
    if clockState.time >= 1
      # While running and not out of time
      oldClock = JSON.parse(JSON.stringify(clockState))
      clockState = update(clockState, "time", oldClock.time - 1)
      redrawClock(oldClock, clockState)
    else if clockState.time <= 1 and clockState.work
      oldClock = JSON.parse(JSON.stringify(clockState))
      clockState = update(update(clockState, "time", sliderState.break*60),
        "work", false)
      setAnimationTime(clockState.time)
      resetAnimation()
      redrawClock(oldClock, clockState)
  , 950)


resetAnimation = () ->
  cal = document.getElementById('clock-animation-left-semicircle')
  car = document.getElementById('clock-animation-right-semicircle')
  cam = document.getElementById('clock-animation-right-mask')

  
  cal.removeAttribute('id')
  car.removeAttribute('id')
  cam.removeAttribute('id')

  setTimeout(()->
    cal.setAttribute('id', 'clock-animation-left-semicircle')
    car.setAttribute('id', 'clock-animation-right-semicircle')
    cam.setAttribute('id', 'clock-animation-right-mask')
  , 10)


setAnimationTime = (time) ->
  rule = ".animation { animation-duration: " + time + "s }"
  sheet = document.getElementById('style').sheet
  sheet.insertRule(rule, sheet.cssRules.length)

