let audioCtx;
let oscillatorL;
let oscillatorR;
let gainNodeL;
let gainNodeR;

const startButton = document.getElementById("start-button");
const stopButton = document.getElementById("stop-button");
const baseFreqInput = document.getElementById("base-frequency");
const beatFreqInput = document.getElementById("beat-frequency");

function updateFrequencies() {
  const baseFreq = parseFloat(baseFreqInput.value);
  const beatFreq = parseFloat(beatFreqInput.value);

  if (oscillatorL && oscillatorR) {
    oscillatorL.frequency.setTargetAtTime(baseFreq, audioCtx.currentTime, 0.01);
    oscillatorR.frequency.setTargetAtTime(baseFreq + beatFreq, audioCtx.currentTime, 0.01);
  }
}

startButton.addEventListener("click", () => {
  const baseFreq = parseFloat(baseFreqInput.value);
  const beatFreq = parseFloat(beatFreqInput.value);

  audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  oscillatorL = audioCtx.createOscillator();
  oscillatorR = audioCtx.createOscillator();

  gainNodeL = audioCtx.createGain();
  gainNodeR = audioCtx.createGain();

  // Start gain at 0
  gainNodeL.gain.setValueAtTime(0, audioCtx.currentTime);
  gainNodeR.gain.setValueAtTime(0, audioCtx.currentTime);

  // Fade in smoothly
  gainNodeL.gain.exponentialRampToValueAtTime(1.0, audioCtx.currentTime + 0.5);
  gainNodeR.gain.exponentialRampToValueAtTime(1.0, audioCtx.currentTime + 0.5);

  const splitter = audioCtx.createChannelMerger(2);

  oscillatorL.frequency.value = baseFreq;
  oscillatorR.frequency.value = baseFreq + beatFreq;

  oscillatorL.connect(gainNodeL);
  oscillatorR.connect(gainNodeR);

  gainNodeL.connect(splitter, 0, 0);
  gainNodeR.connect(splitter, 0, 1);

  splitter.connect(audioCtx.destination);

  oscillatorL.start();
  oscillatorR.start();

  startButton.disabled = true;
  stopButton.disabled = false;
});

stopButton.addEventListener("click", () => {
  if (audioCtx && gainNodeL && gainNodeR) {
    // Fade out before stopping
    const stopTime = audioCtx.currentTime + 0.5;
    gainNodeL.gain.exponentialRampToValueAtTime(0.001, stopTime);
    gainNodeR.gain.exponentialRampToValueAtTime(0.001, stopTime);

    oscillatorL.stop(stopTime);
    oscillatorR.stop(stopTime);

    setTimeout(() => {
      audioCtx.close();
      startButton.disabled = false;
      stopButton.disabled = true;
    }, 600);
  }
});

baseFreqInput.addEventListener("input", updateFrequencies);
beatFreqInput.addEventListener("input", updateFrequencies);

document.querySelectorAll('.freq-btn').forEach(button => {
  button.addEventListener('click', () => {
    const freq = button.getAttribute('data-freq');
    baseFreqInput.value = freq;
    updateFrequencies();
  });
});

document.querySelectorAll('.beat-btn').forEach(button => {
  button.addEventListener('click', () => {
    const beat = button.getAttribute('data-beat');
    beatFreqInput.value = beat;
    updateFrequencies();
  });
});
