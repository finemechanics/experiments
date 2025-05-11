const canvas = document.getElementById('orbCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

let audioContext, analyser, frequencyData;

async function initAudio() {
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const source = audioContext.createMediaStreamSource(stream);

  analyser = audioContext.createAnalyser();
  analyser.fftSize = 512;
  const bufferLength = analyser.frequencyBinCount;
  frequencyData = new Uint8Array(bufferLength);

  source.connect(analyser);
}

let start = null;

function getFrequencyBands() {
  if (!analyser) return { bass: 0, mids: 0, highs: 0 };

  analyser.getByteFrequencyData(frequencyData);

  const bassRange = frequencyData.slice(0, 20);
  const midsRange = frequencyData.slice(20, 80);
  const highsRange = frequencyData.slice(80);

  const average = arr => arr.reduce((a, b) => a + b, 0) / arr.length;

  return {
    bass: average(bassRange),
    mids: average(midsRange),
    highs: average(highsRange),
  };
}

function drawOrb(timestamp) {
  if (!start) start = timestamp;
  const elapsed = (timestamp - start) / 1000;

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  const { bass, mids, highs } = getFrequencyBands();

  const pulse = 50 + Math.sin(elapsed * 2) * 10 + bass * 0.5;
  const colorIntensity = mids / 255;
  const glowIntensity = highs / 255;

  const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, pulse * 2);
  gradient.addColorStop(0, `rgba(${100 + mids},${200 - highs},255,0.9)`);
  gradient.addColorStop(0.4, `rgba(100,150,255,${0.6 + glowIntensity * 0.4})`);
  gradient.addColorStop(1, 'rgba(20,20,50,0)');

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(centerX, centerY, pulse * 2, 0, Math.PI * 2);
  ctx.fill();

  requestAnimationFrame(drawOrb);
}

initAudio().then(() => {
  requestAnimationFrame(drawOrb);
}).catch(err => {
  alert('Microphone access denied or error: ' + err.message);
});
