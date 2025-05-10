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
    oscillatorL.frequency.setValueAtTime(baseFreq, audioCtx.currentTime);
    oscillatorR.frequency.setValueAtTime(baseFreq + beatFreq, audioCtx.currentTime);
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
  if (oscillatorL) oscillatorL.stop();
  if (oscillatorR) oscillatorR.stop();
  if (audioCtx) audioCtx.close();

  startButton.disabled = false;
  stopButton.disabled = true;
});

// Update frequency when value changes
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
