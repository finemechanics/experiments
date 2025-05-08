let audioCtx;
let oscillatorL;
let oscillatorR;
let gainNodeL;
let gainNodeR;

const startButton = document.getElementById("start-button");
const stopButton = document.getElementById("stop-button");

startButton.addEventListener("click", () => {
  const baseFreq = parseFloat(document.getElementById("base-frequency").value);
  const beatFreq = parseFloat(document.getElementById("beat-frequency").value);

  audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  // Create oscillators for left and right ears
  oscillatorL = audioCtx.createOscillator();
  oscillatorR = audioCtx.createOscillator();

  gainNodeL = audioCtx.createGain();
  gainNodeR = audioCtx.createGain();

  const splitter = audioCtx.createChannelMerger(2);

  oscillatorL.frequency.value = baseFreq;
  oscillatorR.frequency.value = baseFreq + beatFreq;

  oscillatorL.connect(gainNodeL);
  oscillatorR.connect(gainNodeR);

  gainNodeL.connect(splitter, 0, 0); // Left
  gainNodeR.connect(splitter, 0, 1); // Right

  splitter.connect(audioCtx.destination);

  oscillatorL.start();
  oscillatorR.start();

  startButton.disabled = true;
  stopButton.disabled = false;
});

stopButton.addEventListener("click", () => {
  oscillatorL.stop();
  oscillatorR.stop();
  audioCtx.close();

  startButton.disabled = false;
  stopButton.disabled = true;
});
