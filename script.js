document.getElementById('startButton').addEventListener('click', function() {
    document.getElementById('boxNama').style.display = 'flex';
});

document.getElementById('closeButton').addEventListener('click', function() {
    document.getElementById('boxNama').style.display = 'none';
});

document.getElementById('boxMasuk').addEventListener('click', function() {
    document.getElementById('boxNama').style.display = 'none';
    document.getElementById('boxLevel').style.display = 'flex';
});

document.addEventListener("DOMContentLoaded", function() {
    const closeButton = document.getElementById("searchClose");
    const boxLevel = document.getElementById("boxLevel");

    closeButton.addEventListener("click", function() {
        boxLevel.style.display = "none";
    });

    // If you have other initializations or event listeners, add them here
});

const audio = new Audio();
audio.src = "Click - Sound Effect (HD).mp3";

var soundEffect = document.getElementById("soundEffect");
var soundIcon = document.getElementById("soundIcon");
var isPlaying = false;

function toggleSound() {
    if (isPlaying) {
        soundEffect.pause();
        soundIcon.classList.remove('fa-volume-up');
        soundIcon.classList.add('fa-volume-mute');
    } else {
        soundEffect.play();
        soundIcon.classList.remove('fa-volume-mute');
        soundIcon.classList.add('fa-volume-up');
    }
    isPlaying = !isPlaying;
}

// Reset sound effect when it ends
soundEffect.onended = function() {
    soundIcon.classList.remove('fa-volume-up');
    soundIcon.classList.add('fa-volume-mute');
    isPlaying = false;
}

window.addEventListener('click',()=>{
    document
})