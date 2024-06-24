import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

import { playerScore1, wallsOpened, sisawaktu } from './Game.js';
import { nama } from "./revisi_ke2_script.js";
console.log(nama);
console.log(playerScore1);
console.log(wallsOpened);
console.log(sisawaktu);

const firebaseConfig = {
    apiKey: "AIzaSyBw8y3-rHekvNvt3tCcnW6rhRCFvupWtuc",
    authDomain: "tugas-akhir-web1-6332e.firebaseapp.com",
    databaseURL: "https://tugas-akhir-web1-6332e-default-rtdb.firebaseio.com",
    projectId: "tugas-akhir-web1-6332e",
    storageBucket: "tugas-akhir-web1-6332e.appspot.com",
    messagingSenderId: "519826560712",
    appId: "1:519826560712:web:e91c1b0e9dbf0e38b777fd"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

document.addEventListener('DOMContentLoaded', () => {
    push(ref(database, 'scores'), {
        name: nama,
        score: parseInt(playerScore1),
        wallsOpened: wallsOpened,
        remainingTime: sisawaktu
    });

    const scoreList = document.getElementById('score-list');

    onValue(ref(database, 'scores'), (snapshot) => {
        const scores = [];
        snapshot.forEach((childSnapshot) => {
            const score = childSnapshot.val();
            scores.push(score);
        });

        scores.sort((a, b) => b.score - a.score);

        scoreList.innerHTML = '';
        scores.forEach((score, index) => {
            const li = document.createElement('li');
            li.className = 'list-group-item';
            li.textContent = `${index + 1}. ${score.name}: ${score.score}, Walls Opened: ${score.wallsOpened}, Remaining Time: ${score.remainingTime}`;
            scoreList.appendChild(li);
        });
    });
});
