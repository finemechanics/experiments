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


let noiseSource;
let noiseGain = null;
const noiseButtons = ['white', 'pink', 'brown'];

function createNoiseBuffer(type, context) {
  const bufferSize = 2 * context.sampleRate;
  const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
  const output = buffer.getChannelData(0);

  if (type === 'white') {
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
  } else if (type === 'pink') {
    let b0, b1, b2, b3, b4, b5, b6;
    b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.11;
      b6 = white * 0.115926;
    }
  } else if (type === 'brown') {
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5;
    }
  }

  return buffer;
}

function startNoise(type) {
  if (!audioCtx) return;

  const buffer = createNoiseBuffer(type, audioCtx);
  noiseSource = audioCtx.createBufferSource();
  noiseGain = audioCtx.createGain();
  noiseGain.gain.setValueAtTime(document.getElementById("mixer").value, audioCtx.currentTime);
  noiseSource.buffer = buffer;
  noiseSource.loop = true;

  noiseSource.connect(noiseGain).connect(audioCtx.destination);
  noiseSource.start();
}

function stopNoise() {
  if (noiseSource) {
    noiseSource.stop();
    noiseSource.disconnect();
    noiseSource = null;
  }
  if (noiseGain) {
    noiseGain.disconnect();
    noiseGain = null;
  }
}

document.querySelectorAll('.noise-btn').forEach(button => {
  button.addEventListener('click', () => {
    stopNoise();
    const type = button.getAttribute('data-noise');
    startNoise(type);
  });
});

document.getElementById("mixer").addEventListener("input", (e) => {
  if (noiseGain) {
    noiseGain.gain.setValueAtTime(e.target.value, audioCtx.currentTime);
  }
});
