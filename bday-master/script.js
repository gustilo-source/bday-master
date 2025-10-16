document.addEventListener("DOMContentLoaded", function () {
  const cake = document.querySelector(".cake");
  const candleCountDisplay = document.getElementById("candleCount");
  let candles = [];
  let audioContext, analyser, microphone;
  let audio = new Audio('hbd.mp3');
  let audioAllowed = false; // track if user interacted

  function updateCandleCount() {
    const activeCandles = candles.filter(c => !c.classList.contains("out")).length;
    candleCountDisplay.textContent = activeCandles;
  }

  function addCandle(left, top) {
    if (candles.length >= 23) return;

    const candle = document.createElement("div");
    candle.className = "candle";
    candle.style.left = left + "px";
    candle.style.top = top + "px";

    const flame = document.createElement("div");
    flame.className = "flame";
    candle.appendChild(flame);

    cake.appendChild(candle);
    candles.push(candle);
    updateCandleCount();
  }

  cake.addEventListener("click", function (event) {
    const rect = cake.getBoundingClientRect();
    const left = event.clientX - rect.left;
    const top = event.clientY - rect.top;
    addCandle(left, top);

    // allow audio after first click
    if (!audioAllowed) {
      audioAllowed = true;
      audio.play().catch(err => console.log("Audio blocked until user interaction."));
    }
  });

  function isBlowing() {
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    let sum = 0;
    for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
    let average = sum / bufferLength;

    return average > 80;
  }

  function blowOutCandles() {
    let blownOut = 0;

    if (candles.length > 0 && candles.some(c => !c.classList.contains("out"))) {
      if (isBlowing()) {
        candles.forEach(c => {
          if (!c.classList.contains("out") && Math.random() > 0.5) {
            c.classList.add("out");
            blownOut++;
          }
        });
      }

      if (blownOut > 0) updateCandleCount();

      if (candles.every(c => c.classList.contains("out"))) {
        setTimeout(() => {
          triggerConfetti();
          endlessConfetti();

          // play audio if allowed
          if (audioAllowed) audio.play().catch(err => console.log("Audio blocked"));
        }, 200);
      }
    }
  }

  if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);
        analyser.fftSize = 256;
        setInterval(blowOutCandles, 200);
      })
      .catch(err => console.log("Unable to access microphone: " + err));
  } else {
    console.log("getUserMedia not supported on your browser!");
  }

  function triggerConfetti() {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  }

  function endlessConfetti() {
    setInterval(() => {
      confetti({ particleCount: 200, spread: 90, origin: { y: 0 } });
    }, 1000);
  }
});
