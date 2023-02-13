const video = document.getElementById("video");
const startButton = document.getElementById("start-button");
const stopButton = document.getElementById("stop-button");
const captureButton = document.getElementById("capture-button");
const canvas = document.getElementById("canvas");

let stream;

startButton.addEventListener("click", async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    startButton.disabled = true;
    stopButton.disabled = false;
    captureButton.disabled = false;
  } catch (e) {
    console.error("カメラを起動できませんでした。", e);
  }
});

stopButton.addEventListener("click", () => {
  if (stream) {
    stream.getTracks().forEach((track) => {
      track.stop();
    });
    video.srcObject = null;
    startButton.disabled = false;
    stopButton.disabled = true;
    captureButton.disabled = true;
  }
});

captureButton.addEventListener("click", () => {
  const context = canvas.getContext("2d");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  const url = canvas.toDataURL();
  const a = document.createElement("a");
  a.href = url;
  a.download = "photo.png";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
});