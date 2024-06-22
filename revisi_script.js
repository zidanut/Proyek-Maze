document.addEventListener('DOMContentLoaded', function() {
    const audio = document.getElementById('soundEffect');
    const profileName = document.getElementById('profileName');
    const usernameInput = document.getElementById('username');
    const profileImage = document.getElementById('profileImage');
    const profileImageInput = document.getElementById('profileImageInput');
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const captionText = document.getElementById('caption');
    const closeModal = document.getElementById('closeModal');

    document.getElementById('startButton').addEventListener('click', function() {
        document.getElementById('boxNama').style.display = 'flex';
        playSound();
    });

    document.getElementById('closeButton').addEventListener('click', function() {
        document.getElementById('boxNama').style.display = 'none';
        playSound();
    });

    document.getElementById('boxMasuk').addEventListener('click', function() {
        document.getElementById('boxNama').style.display = 'none';
        document.getElementById('boxLevel').style.display = 'flex';
        playSound();
    });

    document.getElementById('boxBatal').addEventListener('click', function() {
        document.getElementById('boxNama').style.display = 'none';
        playSound();
    });

    document.getElementById('bantuanButton').addEventListener('click', function() {
        document.getElementById('boxKeyboard').style.display = 'flex';
    });

    document.getElementById('closeKeyboard').addEventListener('click', function() {
        document.getElementById('boxKeyboard').style.display = 'none';
        playSound();
    });

    document.getElementById('searchClose').addEventListener('click', function() {
        document.getElementById('boxLevel').style.display = 'none';
        playSound();
    });

    document.getElementById('profileName').addEventListener('click', function() {
        document.getElementById('containerUsername').style.display = 'flex';
        playSound();
    });

    document.getElementById('ubah').addEventListener('click', function() {
        const username = usernameInput.value.trim();
        if (username) {
            profileName.textContent = username;
        }
        const file = profileImageInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                profileImage.src = e.target.result;
            }
            reader.readAsDataURL(file);
        }
        document.getElementById('containerUsername').style.display = 'none';
        playSound();
    });

    document.getElementById('batal').addEventListener('click', function() {
        document.getElementById('containerUsername').style.display = 'none';
        playSound();
    });

    document.querySelectorAll('.bantuan, .deskripsi, .leaderboard, .btn.level').forEach(button => {
        button.addEventListener('click', function() {
            playSound();
        });
    });

    function playSound() {
        if (!audio.muted) {
            audio.currentTime = 0;
            audio.play();
        }
    }
  
    document.getElementById('soundIcon').addEventListener('click', function() {
        toggleSound();
    });

    function toggleSound() {
        const soundIcon = document.getElementById('soundIcon');
        if (audio.muted) {
            audio.muted = false;
            soundIcon.classList.remove('fa-volume-mute');
            soundIcon.classList.add('fa-volume-up');
        } else {
            audio.muted = true;
            soundIcon.classList.remove('fa-volume-up');
            soundIcon.classList.add('fa-volume-mute');
        }
    }

    // Profile image click to show modal
    profileImage.addEventListener('click', function() {
        modal.style.display = 'block';
        modalImage.src = profileImage.src;
        captionText.innerHTML = profileName.textContent;
    });

    // Close the modal
    closeModal.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    let play = document.getElementById("soundMusic")
        function playMusic(){
        let audio = new Audio("Out of Flux - Descending Chamber.mp3");
        audio.play()
    }
    play.addEventListener("click", playMusic);
});

