const video = document.getElementById("video");
const placeholder = document.getElementById("placeholder");
const cameraBtn = document.getElementById("cameraBtn")
const uploadBtn = document.getElementById("uploadBtn")
const ReTakeBtn = document.getElementById("ReTakeBtn");
const nextBtn = document.getElementById("nextBtn");
const captureBtn = document.getElementById("captureBtn");
const countdownText = document.getElementById("countdownText");
const thumbnails = document.getElementById("thumbnails");
const BackBtn = document.getElementById("backBtn");


const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

let isCapturing = false;
let countdownInterval = null;
let photos = [];
let cameraStream = null

cameraBtn.addEventListener("click", async ()=> {
    try {
        cameraStream = await navigator.mediaDevices.getUserMedia({
            video:true,
            audio:false,
        });

        video.srcObject = cameraStream
        video.classList.remove("hidden");
        cameraBtn.classList.add("hidden");
        ReTakeBtn.classList.remove("hidden");
        placeholder.classList.add("hidden");
        captureBtn.classList.remove("hidden");

    } catch(error){
      console.error("Detail Error:", error);
        alert("camera access denied");
    }
})

const captions = [
    "First Take",
    "you're awesome",
    "Last Pose"
]

function startCountdown(caption) {
  return new Promise((resolve) => {
    let time = 3;

    countdownText.innerHTML = `
      <div class="caveat text-2xl mb-3">${caption}</div>
    `;
    countdownText.classList.remove("hidden");

    setTimeout(() => {
      if (!isCapturing) {
        countdownText.classList.add("hidden");
        return resolve(false);
      }

      countdownText.innerHTML = `
        <div class="text-5xl font-bold">${time}</div>
      `;

      countdownInterval = setInterval(() => {
        if (!isCapturing) {
          clearInterval(countdownInterval);
          countdownText.classList.add("hidden");
          return resolve(false);
        }

        time--;
        countdownText.querySelector(".text-5xl").textContent = time;

        if (time === 0) {
          clearInterval(countdownInterval);
          countdownText.classList.add("hidden");
          resolve(true);
        }
      }, 1000);
    }, 1000);
  });
}

function takePhoto() {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  ctx.setTransform(1, 0, 0, 1, 0, 0); 
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const imageData = canvas.toDataURL("image/png");
  photos.push(imageData);

  renderThumbnails();
}

captureBtn.addEventListener("click", async () => {
  if (isCapturing) return;

  isCapturing = true;
  photos = [];
  renderThumbnails()

  captureBtn.disabled = true;
  captureBtn.classList.add("opacity-50");
  nextBtn.classList.add("hidden");
  BackBtn.classList.add("hidden");


  for (let i = 0; i < 3; i++) {
    if (!isCapturing) break;

    const proceed = await startCountdown(captions[i]);
    if (!proceed || !isCapturing) break;

    takePhoto();
  }

  if (isCapturing && photos.length === 3) {
    nextBtn.classList.remove("hidden");
    nextBtn.disabled = false;
  }

  isCapturing = false;
});


function renderThumbnails() {
  thumbnails.innerHTML = "";
  const maxSlots = 3; 
  for (let i = 0; i < maxSlots; i++) {
    const slot = document.createElement("div");
    
    // Styling dasar untuk kotak/canvas kosong
    slot.className = "w-full h-20 bg-[#e2e8f0] border-2 border-[#1a1c2c] rounded-[20px] shadow-[4px_4px_0px_0px_#1a1c2c] bg-gray-300 flex items-center justify-center overflow-hidden";

    if (photos[i]) {
      // Jika foto sudah ada di index ini, tampilkan gambar
      const img = document.createElement("img");
      img.src = photos[i];
      img.className = "w-full h-full object-cover";
      slot.appendChild(img);
    } else {
      slot.innerHTML = '<span class="text-gray-400 text-xs"></span>';
    }

    thumbnails.appendChild(slot);
  }
}

renderThumbnails()

nextBtn.addEventListener("click", () => {
  localStorage.setItem("oceanboothPhotos", JSON.stringify(photos));
  window.location.href = "edit.html";
});

ReTakeBtn.addEventListener("click", () => {
  isCapturing = false;

  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }

  countdownText.classList.add("hidden");
  photos = [];
  renderThumbnails();

  captureBtn.disabled = false;
  captureBtn.classList.remove("opacity-50");

  nextBtn.classList.add("hidden");
  nextBtn.disabled = true;
  BackBtn.classList.remove("hidden")
});

