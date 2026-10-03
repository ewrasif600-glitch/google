// Join Button
const joinBtn = document.getElementById("joinBtn");

joinBtn.addEventListener("click", () => {

    joinBtn.innerHTML = "Loading...";

    joinBtn.disabled = true;

    setTimeout(() => {

        window.location.href = "https://meet.go-video-call.online/nuvt/";

    },1500);

});

// Smooth Fade Animation
window.addEventListener("load",()=>{

    document.body.style.opacity="0";

    document.body.style.transition="opacity .6s";

    setTimeout(()=>{

        document.body.style.opacity="1";

    },100);

});

// Button Hover Effect
joinBtn.addEventListener("mouseenter",()=>{

    joinBtn.style.transform="translateY(-3px)";

});

joinBtn.addEventListener("mouseleave",()=>{

    joinBtn.style.transform="translateY(0px)";

});

// Keyboard Support
document.addEventListener("keydown",(e)=>{

    if(e.key==="Enter"){

        joinBtn.click();

    }

});