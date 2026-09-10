// === БАЗА ДАННЫХ (5 ПРОЕКТОВ И ИХ ОБЛОЖКИ) ===
const archiveData = [
  { id: "1", title: "JJK_EDIT", url: "гэнг бэнг эдит.mp4", cover: "обожка_бэнг.jpg", views: "1.5M", tags: "tiktok, vfx" },
  { id: "2", "title": "JEALOUS_EDIT", url: "jealous sukuna 2.mp4", cover: "обложка_джелас.jpg", views: "1.8K", tags: "tiktok, edit" },
  { id: "3", "title": "ASTRONOMY", url: "астрономия.mp4", cover: "обложка_астрономия.jpg", views: "-", tags: "reels, podcast" },
  { id: "4", "title": "INTERSTELLAR", url: "портфолио интерстеллар.mp4", cover: "обложка_интерстеллар.jpg", views: "-", tags: "reels, science" },
  { id: "5", "title": "TEST", url: "тестовое задание.mp4", cover: "обложка_клиника.jpg", views: "-", tags: "reels, test" }
];

let audioCtx = null;
let ambientNode = null, ambientNode2 = null, ambientGain = null, isAmbientPlaying = false;

window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const preloader = document.getElementById('preloader');
        if (preloader) preloader.classList.add('fade-out');
    }, 1200);
    
    loadVideos();
    initScrollMechanic();
    initTerminal();
    initModalEvents();
    
    const ambientBtn = document.getElementById('ambientToggle');
    if (ambientBtn) ambientBtn.addEventListener('click', toggleAmbient);
});

// Отслеживание скролла
function initScrollMechanic() {
    window.addEventListener('scroll', () => {
        const body = document.body;
        if (window.scrollY > 50) {
            body.classList.add('scrolled');
        } else {
            body.classList.remove('scrolled');
        }
    });
}

// Генерация сетки
function loadVideos() {
    const grid = document.getElementById('shatterContainer');
    if (!grid) return;

    grid.innerHTML = archiveData.map(v => `
        <div class="video-shard" onclick="openModal('${v.id}')">
            <div class="project-cover" style="background-image: url('${v.cover}')"></div>
            <div class="main-photo-piece"></div>
            <div class="shard-info">
                <h3>${v.title}</h3>
                <p>VIEWS: ${v.views || 'N/A'} // TAGS: ${v.tags}</p>
            </div>
        </div>
    `).join('');
}

// Модальное окно (плеер)
function initModalEvents() {
    const modal = document.getElementById('videoModal');
    if (modal) {
        modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
    }
}

function openModal(id) {
    const modal = document.getElementById('videoModal');
    const videoElement = document.getElementById('modalVideo');
    const titleElement = document.getElementById('modalTitle');
    if (!modal || !videoElement) return;

    if (!document.body.classList.contains('scrolled')) return;

    const vid = archiveData.find(v => v.id === id);
    if (!vid) return;

    videoElement.src = vid.url;
    if (titleElement) titleElement.innerText = vid.title;
    
    modal.classList.add('active');
    videoElement.play();
}

function closeModal() {
    const modal = document.getElementById('videoModal');
    const videoElement = document.getElementById('modalVideo');
    if (!modal || !videoElement) return;

    modal.classList.remove('active');
    videoElement.pause();
    videoElement.currentTime = 0;
    videoElement.src = '';
}

// Звуковая система
function getAudioContext() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
}

function toggleAmbient() {
    const btn = document.getElementById('ambientToggle');
    const ctx = getAudioContext();

    if (!isAmbientPlaying) {
        ambientNode = ctx.createOscillator();
        ambientNode2 = ctx.createOscillator();
        ambientGain = ctx.createGain();
        ambientNode.type = 'sine'; ambientNode.frequency.setValueAtTime(55, ctx.currentTime);
        ambientNode2.type = 'triangle'; ambientNode2.frequency.setValueAtTime(110, ctx.currentTime);
        ambientGain.gain.setValueAtTime(0.02, ctx.currentTime);
        ambientNode.connect(ambientGain); ambientNode2.connect(ambientGain);
        ambientGain.connect(ctx.destination);
        ambientNode.start(); ambientNode2.start();
        isAmbientPlaying = true;
        if (btn) { btn.classList.add('active'); btn.innerText = 'AMBIENT: ON'; }
    } else {
        if (ambientGain) {
            ambientGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
            setTimeout(() => {
                if (ambientNode) { ambientNode.stop(); ambientNode.disconnect(); }
                if (ambientNode2) { ambientNode2.stop(); ambientNode2.disconnect(); }
            }, 500);
        }
        isAmbientPlaying = false;
        if (btn) { btn.classList.remove('active'); btn.innerText = 'AMBIENT: OFF'; }
    }
}

// Терминал 
function initTerminal() {
    const terminal = document.getElementById('terminal');
    const termInput = document.getElementById('termInput');
    const termOutput = document.getElementById('termOutput');
    if (!terminal || !termInput) return;

    document.addEventListener('keydown', (e) => {
        if (e.key === '`') {
            e.preventDefault();
            terminal.classList.toggle('active');
            if (terminal.classList.contains('active')) termInput.focus();
        }
    });

    termInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const cmd = termInput.value.trim();
            termInput.value = '';
            if (!cmd) return;
            appendOutput(`> ${cmd}`);

            const action = cmd.split(' ')[0].toLowerCase();
            if (action === 'help') appendOutput("COMMANDS:\n  clear - Clear terminal\n  status - System info");
            else if (action === 'clear') { if (termOutput) termOutput.innerHTML = ''; }
            else if (action === 'status') appendOutput("HOST: GITHUB_PAGES_STATIC\nDB: READ_ONLY\nSTATUS: ONLINE");
            else appendOutput(`Unknown command: ${action}`);
        }
    });
}

function appendOutput(text) {
    const termOutput = document.getElementById('termOutput');
    if (termOutput) {
        termOutput.innerHTML += `\n${text}`;
        termOutput.scrollTop = termOutput.scrollHeight;
    }
}