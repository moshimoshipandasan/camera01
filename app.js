const video = document.getElementById("video");
const startButton = document.getElementById("start-button");
const stopButton = document.getElementById("stop-button");
const captureButton = document.getElementById("capture-button");
const recordButton = document.getElementById("record-button");
const downloadButton = document.getElementById("download-button");
const canvas = document.getElementById("canvas");

let stream;
let mediaRecorder;
let recordedChunks = [];

startButton.addEventListener("click", async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    startButton.disabled = true;
    stopButton.disabled = false;
    captureButton.disabled = false;
    recordButton.disabled = false;
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
    recordButton.disabled = true;
    recordedChunks = [];
  }
});

captureButton.addEventListener("click", () => {
  const context = canvas.getContext("2d");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "photo.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, "image/png");
});

recordButton.addEventListener("click", () => {
  if (recordButton.textContent === "録画開始") {
    startRecording();
  } else {
    stopRecording();
    recordButton.textContent = "録画開始";
    downloadButton.disabled = false;
  }
});

function startRecording() {
  recordedChunks = [];
  const options = { mimeType: "video/webm" };
  try {
    mediaRecorder = new MediaRecorder(stream, options);
  } catch (e) {
    console.error("MediaRecorderを作成できませんでした。", e);
    return;
  }
  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.start();
  console.log("録画が開始されました。");
  recordButton.textContent = "録画停止";
  downloadButton.disabled = true;
}

function handleDataAvailable(event) {
  if (event.data && event.data.size > 0) {
    recordedChunks.push(event.data);
  }
}

function stopRecording() {
  mediaRecorder.stop();
  console.log("録画が停止されました。Blobs:", recordedChunks);
  download();
}

function download() {
  const blob = new Blob(recordedChunks, { type: "video/webm" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "video.mp4";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

window.addEventListener("beforeunload", () => {
  if (stream) {
    stream.getTracks().forEach((track) => {
      track.stop();
    });
  }
});