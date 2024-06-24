import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Octree } from 'three/addons/math/Octree.js';
import { Capsule } from 'three/addons/math/Capsule.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';

let model, animations, playerHealth = 3;
let controlsEnabled = true, timerInterval;
let currentsoalMatematika;
let audioInitialized = false;
let playerScore1 = 0;
let wallsOpened = 0;
const clock = new THREE.Clock();
const scene = new THREE.Scene();
const mixers = [], objects = [], monsters = [];

scene.background = new THREE.Color(0x151515);
scene.fog = new THREE.Fog(0x0C0C0C, 0, 50);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.rotation.order = 'YXZ';

const ambientLight = new THREE.AmbientLight(0xffffff, 0.02);
scene.add(ambientLight);

const senter = new THREE.SpotLight(0xffffff);
senter.intensity = 0.45;
senter.angle = Math.PI / 7;
senter.penumbra = 0.3;
senter.distance = 5;
senter.decay = 1;
senter.castShadow = true;
scene.add(senter);
let SenterNyala = false;

const container = document.getElementById('container');
const loadingScreen = document.getElementById('loading');
const hati2Container = document.getElementById('hati2');
const timerElement = document.getElementById('timer');
const notifKalah = document.getElementById('notifKalah');
const respawnButton = document.getElementById('respawnButton');
const exitButton = document.getElementById('exitButton');
const notifMenang = document.getElementById('notifMenang');
const scoreText = document.getElementById('scoreText');
const mainMenuButton = document.getElementById('mainMenuButton');
const leaderboardButton = document.getElementById('leaderboardButton');
const soalMatematika = document.getElementById('soalMatematika');
const questionText = document.getElementById('questionText');
const pilihan1 = document.getElementById('pilihan1');
const pilihan2 = document.getElementById('pilihan2');
const pilihan3 = document.getElementById('pilihan3');

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.NoToneMapping;
container.appendChild(renderer.domElement);

const GRAVITY = 30;
const STEPS_PER_FRAME = 5;

const worldOctree = new Octree();

const playerCollider = new Capsule(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 1.65, 0), 0.35);
const playerVelocity = new THREE.Vector3();
const playerDirection = new THREE.Vector3();

let playerOnFloor = false;

const keyStates = {};

const vector1 = new THREE.Vector3();
const vector2 = new THREE.Vector3();
const vector3 = new THREE.Vector3();

// Load audio
const listener = new THREE.AudioListener();
camera.add(listener);

const bgSound = new THREE.Audio(listener);
const flashlightSound = new THREE.Audio(listener);
const footstepSound = new THREE.Audio(listener);
const sakit = new THREE.Audio(listener);
const mati = new THREE.Audio(listener);

const audioLoader = new THREE.AudioLoader();

audioLoader.load('bg.mp3', (buffer) => {
    bgSound.setBuffer(buffer);
    bgSound.setLoop(true);
    bgSound.setVolume(0.4);
});

audioLoader.load('Mati.mp3', (buffer) => {
    mati.setBuffer(buffer);
    mati.setVolume(0.6);
});

audioLoader.load('Sakit.mp3', (buffer) => {
    sakit.setBuffer(buffer);
    sakit.setVolume(0.65);
});

audioLoader.load('flashlight.mp3', (buffer) => {
    flashlightSound.setBuffer(buffer);
    flashlightSound.setVolume(0.5);
});

audioLoader.load('steps.mp3', (buffer) => {
    footstepSound.setBuffer(buffer);
    footstepSound.setVolume(0.5);
    footstepSound.setLoop(true);
});

function initializeAudio() {
    if (!audioInitialized) {
        bgSound.play();
        audioInitialized = true;
    }
}

document.addEventListener('keydown', (event) => {
    keyStates[event.code] = true;
    initializeAudio();
    if (event.code === 'KeyF') {
        SenterNyala = !SenterNyala;
        senter.visible = SenterNyala;
        flashlightSound.play();
    }
});

document.addEventListener('keyup', (event) => {
    keyStates[event.code] = false;
    if (event.code === 'KeyW' || event.code === 'KeyA' || event.code === 'KeyS' || event.code === 'KeyD') {
        footstepSound.stop();
    }
});

container.addEventListener('mousedown', () => {
    document.body.requestPointerLock();
    initializeAudio();
    if (!document.getElementById('notifKalah')) {
        document.body.requestPointerLock();
    }
});

document.body.addEventListener('mousemove', (event) => {
    if (document.pointerLockElement === document.body) {
        camera.rotation.y -= event.movementX / 500;
        camera.rotation.x -= event.movementY / 500;
    }
});

window.addEventListener('resize', onWindowResize);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function playerCollisions() {
    const result = worldOctree.capsuleIntersect(playerCollider);
    playerOnFloor = false;
    if (result) {
        playerOnFloor = result.normal.y > 0;
        if (!playerOnFloor) {
            playerVelocity.addScaledVector(result.normal, -result.normal.dot(playerVelocity));
        }
        playerCollider.translate(result.normal.multiplyScalar(result.depth));
    }
}

function updatePlayer(deltaTime) {
    let damping = Math.exp(-4 * deltaTime) - 1;
    if (!playerOnFloor) {
        playerVelocity.y -= GRAVITY * deltaTime;
        damping *= 0.1;
    } 
    playerVelocity.addScaledVector(playerVelocity, damping);
    const deltaPosition = playerVelocity.clone().multiplyScalar(deltaTime);
    playerCollider.translate(deltaPosition);
    playerCollisions();
    camera.position.copy(playerCollider.end);
    checkWallCollision();

    // Head bobbing effect
    if (playerOnFloor && (keyStates['KeyW'] || keyStates['KeyA'] || keyStates['KeyS'] || keyStates['KeyD'])) {
        const bobbingSpeed = 10;
        const bobbingAmount = 0.04;
        const time = clock.getElapsedTime();
        camera.position.y += Math.sin(time * bobbingSpeed) * bobbingAmount;

        if (!footstepSound.isPlaying) {
            footstepSound.play();
        }
    }
}

function updateSenter() {
    senter.position.copy(camera.position);
    senter.target.position.copy(camera.position).add(camera.getWorldDirection(playerDirection));
    senter.target.updateMatrixWorld();
}

function getForwardVector() {
    camera.getWorldDirection(playerDirection);
    playerDirection.y = 0;
    playerDirection.normalize();
    return playerDirection;
}

function getSideVector() {
    camera.getWorldDirection(playerDirection);
    playerDirection.y = 0;
    playerDirection.normalize();
    playerDirection.cross(camera.up);
    return playerDirection;
}

function controls(deltaTime) {
    if (!controlsEnabled) return;
    const speedDelta = deltaTime * (playerOnFloor ? 10 : 3);
    if (keyStates['KeyW']) {
        playerVelocity.add(getForwardVector().multiplyScalar(speedDelta));
    }
    if (keyStates['KeyS']) {
        playerVelocity.add(getForwardVector().multiplyScalar(-speedDelta));
    }
    if (keyStates['KeyA']) {
        playerVelocity.add(getSideVector().multiplyScalar(-speedDelta));
    }
    if (keyStates['KeyD']) {
        playerVelocity.add(getSideVector().multiplyScalar(speedDelta));
    }
}

const loader = new GLTFLoader();
loader.load('labirin1.glb', (gltf) => {
    scene.add(gltf.scene);
    worldOctree.fromGraphNode(gltf.scene);
    gltf.scene.traverse(child => {
        if (child.isMesh) {
            child.castShadow = false;
            child.receiveShadow = false;
            if (child.material.map) {
                child.material.map.anisotropy = 4;
            }
        }
    });
    loadingScreen.style.display = 'none';
    container.style.display = 'block';
    updatehati2();
    addWalls();
    startTimer();
    addWinObject();
});

loader.load('monster.glb', function (gltf) {
    model = gltf.scene;
    animations = gltf.animations;

    model.traverse(function (object) {
        if (object.isMesh) object.castShadow = true;
    });

    const monsterWaypoints = [
        [
            new THREE.Vector3(-7.086, 0, -0.325),
            new THREE.Vector3(-16.728, 0, -0.325)
        ],
        [
            new THREE.Vector3(-11.2, 0, -3),
            new THREE.Vector3(-21.8, 0, -3)
        ],
        [
            new THREE.Vector3(-16, 0, 1.9),
            new THREE.Vector3(-22, 0, 1.9)
        ],
        [
            new THREE.Vector3(-22, 0, 9),
            new THREE.Vector3(-16, 0, 9)
        ],
        [
            new THREE.Vector3(-9.6, 0, 4.7),
            new THREE.Vector3(-9.6, 0, -0.76)
        ],
        [
            new THREE.Vector3(-5.3, 0, 11.5),
            new THREE.Vector3(0.28, 0, 11.5)
        ],
        [
            new THREE.Vector3(-7.5, 0, 13.7),
            new THREE.Vector3(0.44, 0, 13.7)
        ],
        [
            new THREE.Vector3(-2, 0, 16),
            new THREE.Vector3(-12.3, 0, 16)
        ],
        [
            new THREE.Vector3(-11.5, 0, 18.4),
            new THREE.Vector3(-10.6, 0, 18.4)
        ]
        // Tambahkan Monster
    ];

    monsterWaypoints.forEach(waypoints => {
        const monster = SkeletonUtils.clone(model);
        monster.position.copy(waypoints[0]);
        scene.add(monster);

        const monsterMixer = new THREE.AnimationMixer(monster);
        monsterMixer.clipAction(animations[0]).play();
        mixers.push(monsterMixer);

        const monsterCollider = new Capsule(
            new THREE.Vector3(monster.position.x, monster.position.y + 0.35, monster.position.z),
            new THREE.Vector3(monster.position.x, monster.position.y + 1, monster.position.z),
            0.35
        );

        monsters.push({
            model: monster,
            mixer: monsterMixer,
            collider: monsterCollider,
            waypoints: waypoints,
            currentWaypoint: 0
        });

        const helper = new THREE.BoxHelper(monster, 0xff0000);
        scene.add(helper);
    });
});

function moveMonsters(deltaTime) {
    monsters.forEach(monsterData => {
        const monster = monsterData.model;
        const waypoints = monsterData.waypoints;
        const currentWaypoint = monsterData.currentWaypoint;

        const targetPosition = waypoints[currentWaypoint];
        const direction = new THREE.Vector3().subVectors(targetPosition, monster.position);
        const distance = direction.length();

        if (distance < 0.1) {
            monsterData.currentWaypoint = (monsterData.currentWaypoint + 1) % waypoints.length;
        } else {
            direction.normalize();
            monster.position.add(direction.multiplyScalar(deltaTime * 0.5));
            monster.lookAt(targetPosition);

            monsterData.collider.start.set(monster.position.x, monster.position.y + 0.35, monster.position.z);
            monsterData.collider.end.set(monster.position.x, monster.position.y + 1, monster.position.z);

            const result = worldOctree.capsuleIntersect(monsterData.collider);
            if (result) {
                monster.position.addScaledVector(result.normal, result.depth);
                monsterData.collider.translate(result.normal.multiplyScalar(result.depth));
            }
        }

        monsterData.mixer.update(deltaTime);
    });
}

function updatehati2() {
    hati2Container.innerHTML = '';
    for (let i = 0; i < playerHealth; i++) {
        const hati = document.createElement('img');
        hati.src = 'heart.jpg';
        hati.className = 'hati';
        hati2Container.appendChild(hati);
    }
}

function checkPlayerMonsterCollision() {
    monsters.forEach(monsterData => {
        const distance = playerCollider.end.distanceTo(monsterData.collider.start);
        if (distance < 1) {
            playerHealth -= 1;
            updatehati2();
            if (playerHealth <= 0) {
                playerDead();
            }
        }
    });
}

function checkWallCollision() {
    const walls = scene.children.filter(child => child.userData.isWall);
    for (const wall of walls) {
        const distance = playerCollider.end.distanceTo(wall.position);
        if (distance < 1) {
            if (!currentsoalMatematika) {
                currentsoalMatematika = generatesoalMatematika();
            }
            displaysoalMatematika(wall);
            playerVelocity.set(0, 0, 0);
            controlsEnabled = false;
            break;
        }
    }
}

function playerDead() {
    mati.play();
    notifKalah.style.display = 'flex';
    document.exitPointerLock();
    clearInterval(timerInterval);
}

respawnButton.addEventListener('click', () => {
    notifKalah.style.display = 'none';
    respawnPlayer();
    document.body.requestPointerLock();
});

exitButton.addEventListener('click', () => {
    window.location.href = 'revisi_ke2_home.html';
});

function respawnPlayer() {
    playerHealth = 3;
    playerScore1 = 0;
    wallsOpened = 0;
    updatehati2();
    playerCollider.start.set(0, 0.35, 0);
    playerCollider.end.set(0, 1, 0);
    playerVelocity.set(0, 0, 0);
    camera.position.copy(playerCollider.end);
    startTimer();
}

function generatesoalMatematika() {
    const num1 = Math.floor(Math.random() * 30) + 1;
    const num2 = Math.floor(Math.random() * 30) + 1;
    const operation = Math.random();

    let correctAnswer;
    let question;

    if (operation < 0.25) {
        correctAnswer = num1 + num2;
        question = `${num1} + ${num2}`;
    } else if (operation < 0.5) {
        correctAnswer = num1 - num2;
        question = `${num1} - ${num2}`;
    } else if (operation < 0.75) {
        correctAnswer = num1 * num2;
        question = `${num1} * ${num2}`;
    } else {
        const dividend = num1 * num2;
        correctAnswer = num1;
        question = `${dividend} / ${num2}`;
    }

    const incorrectAnswer1 = correctAnswer + (Math.floor(Math.random() * 10) + 1);
    const incorrectAnswer2 = correctAnswer - (Math.floor(Math.random() * 10) + 1);
    const answers = [correctAnswer, incorrectAnswer2, incorrectAnswer1].sort(() => Math.random() - 0.5);

    return {
        question,
        answers,
        correctAnswer
    };
}

function displaysoalMatematika(wall) {
    disablePointerLock();
    questionText.innerText = currentsoalMatematika.question;
    pilihan1.innerText = currentsoalMatematika.answers[0];
    pilihan2.innerText = currentsoalMatematika.answers[1];
    pilihan3.innerText = currentsoalMatematika.answers[2];

    soalMatematika.style.display = 'block';

    pilihan1.onclick = () => cekJawaban(currentsoalMatematika.answers[0], currentsoalMatematika.correctAnswer, wall);
    pilihan2.onclick = () => cekJawaban(currentsoalMatematika.answers[1], currentsoalMatematika.correctAnswer, wall);
    pilihan3.onclick = () => cekJawaban(currentsoalMatematika.answers[2], currentsoalMatematika.correctAnswer, wall);
}

function disablePointerLock() {
    if (document.pointerLockElement) {
        document.exitPointerLock();
    }
}

function cekJawaban(selectedAnswer, correctAnswer, wall) {
    if (selectedAnswer === correctAnswer) {
        soalMatematika.style.display = 'none';
        scene.remove(wall);
        controlsEnabled = true;
        playerScore1 += 10;
        wallsOpened += 1;
        currentsoalMatematika = null; //gasan reset
    } else {
        sakit.play();
        playerHealth -= 1;
        updatehati2();
        if (playerHealth <= 0) {
            playerDead();
        } else {
            currentsoalMatematika = generatesoalMatematika(); 
            displaysoalMatematika(wall);
        }
    }
}

function addWalls() {
const wallGeometry = new THREE.BoxGeometry(2, 7.5, 0.36);
const wallMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.5, transparent: true });

const wallData = [
    { position: new THREE.Vector3(-7, 1, -1.5) },//
    { position: new THREE.Vector3(-11.8, 1, -1.7) },//
    { position: new THREE.Vector3(-21.3, 1, -1.6) },//
    { position: new THREE.Vector3(-19, 1, 7.8) },//
    { position: new THREE.Vector3(-9.5, 1, 7.8) },//
    { position: new THREE.Vector3(-4.7, 1, 7.9) },//
    { position: new THREE.Vector3(-2.3, 1, 15) },//
    { position: new THREE.Vector3(-0.052, 1, 17) },//
    { position: new THREE.Vector3(-9.5, 1, 14.9) },//
    { position: new THREE.Vector3(-14, 1, 12.3) },//
    { position: new THREE.Vector3(-16.6, 1, 13.8) },//
    { position: new THREE.Vector3(-9.5, 1, 14.9) },//
    { position: new THREE.Vector3(-0.05, 1, 5.4) }//
    //Tambahkan lagi dindingnya
];

for (const data of wallData) {
    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
    wall.position.copy(data.position);
    wall.userData.isWall = true;
    scene.add(wall);
}
}

function addWinObject() {
    const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const winSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

    const pointLight = new THREE.PointLight(0xffff00, 1, 5);
    winSphere.add(pointLight);

    winSphere.position.set(-21.2, 1, 18.5);
    // winSphere.position.set(0, 1, -3);
    scene.add(winSphere);

    const winSphereCollider = new Capsule(
        new THREE.Vector3(winSphere.position.x, winSphere.position.y, winSphere.position.z),
        new THREE.Vector3(winSphere.position.x, winSphere.position.y + 1, winSphere.position.z),
        0.5
    );

    winSphere.userData.collider = winSphereCollider;

    objects.push(winSphere);
}

function checkWinCondition() {
    objects.forEach(object => {
        if (object.userData.collider) {
            const distance = playerCollider.end.distanceTo(object.userData.collider.start);
            if (distance < 1) {
                displaynotifMenang();
                clearInterval(timerInterval);
            }
        }
    });
}

function displaynotifMenang() {
    notifMenang.style.display = 'flex';
    scoreText.innerText = `Score: ${playerScore1}\nWalls Opened: ${wallsOpened}\nTime: ${timerElement.innerText}`;
    document.exitPointerLock();
}

mainMenuButton.addEventListener('click', () => {
    window.location.href = 'revisi_ke2_home.html';//ganti dengan link main menu
});

leaderboardButton.addEventListener('click', () => {
    window.location.href = 'leaderbord.html';//ganti dengan link leaderboard
});

const TIMER_DURATION = 300; //detik

function startTimer() {
    let remainingTime = TIMER_DURATION;
    updateTimerDisplay(remainingTime);
    timerInterval = setInterval(() => {
        remainingTime -= 1;
        updateTimerDisplay(remainingTime);
        if (remainingTime <= 0) {
            clearInterval(timerInterval);
            playerDead();
        }
    }, 1000);
}

function updateTimerDisplay(remainingTime) {
    const minutes = Math.floor(remainingTime / 60).toString().padStart(2, '0');
    const seconds = (remainingTime % 60).toString().padStart(2, '0');
    timerElement.innerText = `${minutes}:${seconds}`;
}
const sisawaktu = timerElement.innerText;

function teleportPlayerIfOob() {
        if ( camera.position.y <= - 25 ) {

            playerCollider.start.set( 0, 0.35, 0 );
            playerCollider.end.set( 0, 1, 0 );
            playerCollider.radius = 0.35;
            camera.position.copy( playerCollider.end );
            camera.rotation.set( 0, 0, 0 );

        }

}

function animate() {
    const deltaTime = Math.min(0.05, clock.getDelta()) / STEPS_PER_FRAME;
    for (let i = 0; i < STEPS_PER_FRAME; i++) {
        controls(deltaTime);
        updatePlayer(deltaTime);
        moveMonsters(deltaTime);
        checkPlayerMonsterCollision();
        checkWinCondition();
        teleportPlayerIfOob();
    }
    updateSenter();
    for (const mixer of mixers) mixer.update(deltaTime);

    renderer.render(scene, camera);
}

export{ playerScore1, wallsOpened, sisawaktu };
