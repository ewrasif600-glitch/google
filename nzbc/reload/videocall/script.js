const video = document.getElementById("video");

const micBtn = document.getElementById("micBtn");
const camBtn = document.getElementById("camBtn");
const shareBtn = document.getElementById("shareBtn");
const emojiBtn = document.getElementById("emojiBtn");
const endBtn = document.getElementById("endBtn");

const time = document.getElementById("time");

let stream;

// Time
function updateTime() {
    const now = new Date();

    let h = now.getHours();
    let m = now.getMinutes();

    const ampm = h >= 12 ? "PM" : "AM";

    h = h % 12;
    h = h ? h : 12;

    m = m < 10 ? "0" + m : m;

    time.innerHTML = `${h}:${m} ${ampm}`;
}

updateTime();
setInterval(updateTime, 1000);

// Open Camera
async function startCamera() {

    try{

        stream = await navigator.mediaDevices.getUserMedia({

            video:true,
            audio:true

        });

        video.srcObject = stream;

    }catch(e){

        alert("Camera permission denied.");

    }

}

startCamera();


// Camera Toggle

camBtn.onclick = ()=>{

    const track = stream.getVideoTracks()[0];

    track.enabled = !track.enabled;

    if(track.enabled){

        camBtn.innerHTML='<i class="fa-solid fa-video"></i>';

        camBtn.style.background="#3c4043";

    }else{

        camBtn.innerHTML='<i class="fa-solid fa-video-slash"></i>';

        camBtn.style.background="#ea4335";

    }

};


// Mic Toggle

micBtn.onclick=()=>{

    const track = stream.getAudioTracks()[0];

    track.enabled=!track.enabled;

    if(track.enabled){

        micBtn.innerHTML='<i class="fa-solid fa-microphone"></i>';

        micBtn.style.background="#3c4043";

    }else{

        micBtn.innerHTML='<i class="fa-solid fa-microphone-slash"></i>';

        micBtn.style.background="#ea4335";

    }

};


// Screen Share

shareBtn.onclick = async()=>{

    try{

        const display = await navigator.mediaDevices.getDisplayMedia({

            video:true

        });

        video.srcObject = display;

        display.getVideoTracks()[0].onended=()=>{

            video.srcObject=stream;

        }

    }catch(e){}

};


// Emoji

emojiBtn.onclick=()=>{

    alert("😀 😂 😍 👏 👍 ❤️ 😮 😢");

};


// Hang Up

endBtn.onclick=()=>{

    if(stream){

        stream.getTracks().forEach(track=>track.stop());

    }

    video.srcObject=null;

    document.body.innerHTML=`
    <div style="
    display:flex;
    justify-content:center;
    align-items:center;
    height:100vh;
    background:#202124;
    color:white;
    font-family:Roboto;
    font-size:35px;">
    Call Ended
    </div>`;

};