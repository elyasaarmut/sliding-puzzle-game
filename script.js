const boardElement = document.getElementById("board");

let timerInterval = null;
let secondsElapsed = 0;
let isGameStarted = false;
let isPaused = false;

// Oyun boyutunu tutan değişkenimiz
let gridSize = 3; 
let boardState = [];

// Boyuta göre başlangıç dizisini otomatik üreten fonksiyon
function initializeBoardState() {
    boardState = [];
    let totalTiles = gridSize * gridSize;
    
    for (let i = 1; i < totalTiles; i++) {
        boardState.push(i);
    }
    boardState.push(""); 

    // Çözülebilir bir tahta olması için bilgisayara rastgele 150 hamle yaptırıyoruz
    for (let i = 0; i < 150; i++) {
        let emptyIdx = boardState.indexOf("");
        let row = Math.floor(emptyIdx / gridSize);
        let col = emptyIdx % gridSize;
        let possibleMoves = [];

        if (row > 0) possibleMoves.push(emptyIdx - gridSize);
        if (row < gridSize - 1) possibleMoves.push(emptyIdx + gridSize);
        if (col > 0) possibleMoves.push(emptyIdx - 1);
        if (col < gridSize - 1) possibleMoves.push(emptyIdx + 1);

        let randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        
        // Taşların yerini değiştir
        let temp = boardState[randomMove];
        boardState[randomMove] = boardState[emptyIdx];
        boardState[emptyIdx] = temp;
    }
    
    // Yeni oyuna başlarken sayacı sıfırla
    clearInterval(timerInterval);
    secondsElapsed = 0;
    isGameStarted = false;
    document.getElementById("timer").innerText = "00:00";
}

// Tahtayı ekrana çizen ana fonksiyonumuz
// Tahtayı ekrana çizen ana fonksiyonumuz
function createBoard() {
    boardElement.innerHTML = "";
    boardElement.style.setProperty('--grid-size', gridSize);

    for (let i = 0; i < boardState.length; i++) {
        let tileValue = boardState[i];
        let tile = document.createElement("div");

        if (tileValue === "") {
            tile.className = "empty";
            tile.style.backgroundColor = "#1e1e1f"; 
        } else {
            tile.className = "tile";
            tile.innerText = tileValue;
            
            // Taşa tıklandığında moveTile fonksiyonunu çalıştır
            // 'i' değeri o anki taşın dizideki konumunu (index) temsil eder
            tile.addEventListener("click", () => moveTile(i));
        }

        boardElement.appendChild(tile);
    }
}

// Taşı hareket ettirme fonksiyonu
function moveTile(clickedIndex) {
    if (isPaused) return; // Oyun duraklatıldıysa hamle yapma

    let emptyIndex = boardState.indexOf("");
    let clickedRow = Math.floor(clickedIndex / gridSize);
    let clickedCol = clickedIndex % gridSize;
    let emptyRow = Math.floor(emptyIndex / gridSize);
    let emptyCol = emptyIndex % gridSize;

    let isAdjacent = 
        (clickedRow === emptyRow && Math.abs(clickedCol - emptyCol) === 1) || 
        (clickedCol === emptyCol && Math.abs(clickedRow - emptyRow) === 1);

    if (isAdjacent) {
        startTimer(); // İlk başarılı hamlede sayacı başlat
        
        let temp = boardState[clickedIndex];
        boardState[clickedIndex] = boardState[emptyIndex];
        boardState[emptyIndex] = temp;

        createBoard();
        checkWin(); // Her hamleden sonra kazandı mı diye kontrol et
    }
}


// Sayacı "00:00" formatına çeviren yardımcı fonksiyon
function formatTime(seconds) {
    let m = Math.floor(seconds / 60).toString().padStart(2, '0');
    let s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

// Sayacı Başlatma Fonksiyonu
function startTimer() {
    if (isGameStarted) return; // Zaten başladıysa tekrar başlatma
    isGameStarted = true;
    
    timerInterval = setInterval(() => {
        if (!isPaused) {
            secondsElapsed++;
            document.getElementById("timer").innerText = formatTime(secondsElapsed);
        }
    }, 1000);
}

// Oyunu Kazanma Kontrolü 
function checkWin() {
    let isWin = true;
    let totalTiles = gridSize * gridSize;
    
    for (let i = 0; i < totalTiles - 1; i++) {
        if (boardState[i] !== i + 1) {
            isWin = false;
            break;
        }
    }
    
    if (isWin && boardState[totalTiles - 1] === "" && isGameStarted) {
        clearInterval(timerInterval); // Sayacı durdur
        isGameStarted = false;
        
        // Final süresini ve boyut bilgisini HTML'e yaz
        document.getElementById("final-time").innerText = formatTime(secondsElapsed);
        document.getElementById("current-board-size").innerText = `${gridSize}x${gridSize}`;
        
        // O anki oynanan boyuta ait (3x3 vb.) skorları yükle
        updateScoreboardUI();

        // Taşın yerine oturmasını beklemek için 300 milisaniye sonra paneli aç
        setTimeout(() => {
            document.getElementById("win-overlay").classList.add("active");
        }, 300);
    }
}


// HTML'deki açılır menüyü seçiyoruz
const sizeSelector = document.getElementById("size-selector");

// Menüde bir değişiklik olduğunda (change event) çalışacak kod
sizeSelector.addEventListener("change", function(event) {
    // Kullanıcının seçtiği değeri (string olarak gelir) tam sayıya (integer) çeviriyoruz
    gridSize = parseInt(event.target.value);
    
    // Yeni boyuta göre diziyi baştan oluştur ve tahtayı tekrar çiz
    initializeBoardState();
    createBoard();
});

// Gerekli HTML elementlerini seçiyoruz
const pauseBtn = document.getElementById("pause-btn");
const resumeBtn = document.getElementById("resume-btn");
const overlay = document.getElementById("overlay");
const topBar = document.querySelector(".top-bar");

// Duraklatma Butonuna Tıklanınca 
pauseBtn.addEventListener("click", () => {
    isPaused = true; 
    
    // Geçen süreyi panele yazdır
    document.getElementById("paused-time-display").innerText = formatTime(secondsElapsed);
    
    // Paneli her açtığında skor tablosunu gizle (temiz başlasın)
    document.getElementById("pause-scoreboard-container").style.display = "none";
    document.getElementById("toggle-scores-btn").innerText = "🏆 Skorları Gör";
    
    topBar.classList.add("hidden");
    overlay.classList.add("active");
});

// Oyuna Dön Butonuna Tıklanınca
resumeBtn.addEventListener("click", () => {
    isPaused = false; // Oyunu devam ettir
    
    // Paneli gizle, Üst barı geri getir (Animasyonlar tetiklenir)
    overlay.classList.remove("active");
    topBar.classList.remove("hidden");
});


// --- YOUTUBE MÜZİK ÇALAR API ENTEGRASYONU ---
let ytPlayer;
let isMusicPlaying = false;
let currentTrackIndex = 0;

// YouTube Video ID'leri 
const playlist = [
    { name: "LVBEL C5, AKDO, ALIZADE - kAHpE", id: "MKjOiRpvuRA"},
    { name: "Lofi Beats to Study", id: "jfKfPfyJRdk" }, 
    { name: "Chillhop Radio", id: "5yx6BWlEVcY" },
    { name: "Synthwave Vibe", id: "4xDzrDKg11o" }
];

// YouTube API betiğini (script) sayfaya otomatik yüklüyoruz
const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// API yüklendiğinde YouTube tarafından otomatik olarak çağrılan fonksiyon
function onYouTubeIframeAPIReady() {
    ytPlayer = new YT.Player('yt-player', {
        height: '0', 
        width: '0',
        videoId: playlist[0].id,
        // autoplay: 1 yaparak otomatik başlatma komutu veriyoruz
        playerVars: { 'autoplay': 1, 'controls': 0 }, 
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

// Oynatıcı hazır olduğunda
function onPlayerReady(event) {
    document.getElementById("track-name").innerText = playlist[currentTrackIndex].name;
    ytPlayer.setVolume(50); 
    ytPlayer.playVideo(); // Müziği başlatmayı dene
    
    isMusicPlaying = true;
    document.getElementById("play-pause-music-btn").innerText = "⏸"; // İkonu duraklatmaya çevir
}

// TARAYICI ENGELİ HİLESİ: Tarayıcı otomatik müziği engellerse, ekrana ilk tıklandığında zorla başlat
document.body.addEventListener('click', function startMusicOnFirstClick() {
    // Eğer müzik çalmıyorsa (engellenmişse)
    if (ytPlayer && typeof ytPlayer.playVideo === 'function' && ytPlayer.getPlayerState() !== 1) {
        ytPlayer.playVideo();
        isMusicPlaying = true;
        document.getElementById("play-pause-music-btn").innerText = "⏸";
    }
}, { once: true }); // { once: true } komutu, bu fonksiyonun sadece ilk tıklamada 1 kez çalışmasını sağlar

// Şarkı bittiğinde sonrakine geçmesi için
function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
        document.getElementById("next-btn").click();
    }
}

// Müzik Butonlarını YouTube API'sine Bağlama
document.getElementById("play-pause-music-btn").addEventListener("click", () => {
    if (isMusicPlaying) {
        ytPlayer.pauseVideo();
        document.getElementById("play-pause-music-btn").innerText = "▶";
    } else {
        ytPlayer.playVideo();
        document.getElementById("play-pause-music-btn").innerText = "⏸";
    }
    isMusicPlaying = !isMusicPlaying;
});

document.getElementById("next-btn").addEventListener("click", () => {
    currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
    ytPlayer.loadVideoById(playlist[currentTrackIndex].id);
    document.getElementById("track-name").innerText = playlist[currentTrackIndex].name;
    if (!isMusicPlaying) ytPlayer.pauseVideo(); // Şarkı değiştirince de duraklama durumunu koru
});

document.getElementById("prev-btn").addEventListener("click", () => {
    currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
    ytPlayer.loadVideoById(playlist[currentTrackIndex].id);
    document.getElementById("track-name").innerText = playlist[currentTrackIndex].name;
    if (!isMusicPlaying) ytPlayer.pauseVideo();
});

// YouTube'un ses ayarı 0 ile 100 arasındadır
document.getElementById("volume-slider").addEventListener("input", (event) => {
    let volume = event.target.value;
    ytPlayer.setVolume(volume);
    document.getElementById("mute-btn").innerText = volume == 0 ? "🔇" : "🔊";
});

document.getElementById("mute-btn").addEventListener("click", () => {
    let currentVolume = ytPlayer.getVolume();
    if (currentVolume > 0) {
        ytPlayer.setVolume(0);
        document.getElementById("volume-slider").value = 0;
        document.getElementById("mute-btn").innerText = "🔇";
    } else {
        ytPlayer.setVolume(50);
        document.getElementById("volume-slider").value = 50;
        document.getElementById("mute-btn").innerText = "🔊";
    }
});

// --- DURAKLATMA PANELİNDEKİ SKOR TABLOSU KODU ---
document.getElementById("toggle-scores-btn").addEventListener("click", () => {
    const scoreContainer = document.getElementById("pause-scoreboard-container");
    const toggleBtn = document.getElementById("toggle-scores-btn");
    const pauseScoreList = document.getElementById("pause-score-list");
    
    if (scoreContainer.style.display === "none") {
        // Tabloyu Aç ve Verileri Yükle
        scoreContainer.style.display = "block";
        toggleBtn.innerText = "🔼 Skorları Gizle";
        document.getElementById("pause-board-size").innerText = `${gridSize}x${gridSize}`;
        
        let storageKey = `scores_${gridSize}`;
        let savedScores = JSON.parse(localStorage.getItem(storageKey)) || [];
        pauseScoreList.innerHTML = "";
        
        if (savedScores.length === 0) {
            pauseScoreList.innerHTML = "<li style='color:#888;'>Henüz kaydedilmiş skor yok.</li>";
        } else {
            savedScores.forEach((score, index) => {
                let li = document.createElement("li");
                li.style.display = "flex";
                li.style.justifyContent = "space-between";
                li.style.padding = "4px 0";
                li.style.borderBottom = "1px solid #333";
                
                let medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}.`;
                li.innerHTML = `<span>${medal} ${score.name}</span> <span>${formatTime(score.time)}</span>`;
                pauseScoreList.appendChild(li);
            });
        }
    } else {
        // Tabloyu Gizle
        scoreContainer.style.display = "none";
        toggleBtn.innerText = "🏆 Skorları Gör";
    }
});

// --- SKOR TABLOSU VE LOCALSTORAGE KODLARI ---
const winOverlay = document.getElementById("win-overlay");
const playerNameInput = document.getElementById("player-name");
const saveScoreBtn = document.getElementById("save-score-btn");
const scoreList = document.getElementById("score-list");
const restartBtn = document.getElementById("restart-btn");

// Skoru Tarayıcı Hafızasına (LocalStorage) Kaydetme
function saveScore() {
    let playerName = playerNameInput.value.trim();
    if (playerName === "") {
        playerName = "İsimsiz Oyuncu"; // Boş bırakırsa varsayılan isim
    }

    // Seçilen boyuta göre özel bir anahtar oluştur (Örn: "scores_3", "scores_4")
    let storageKey = `scores_${gridSize}`;
    
    // Tarayıcı hafızasında bu boyuta ait veri var mı diye bak (yoksa boş dizi aç)
    let savedScores = JSON.parse(localStorage.getItem(storageKey)) || [];

    // Yeni skoru listeye ekle
    savedScores.push({ name: playerName, time: secondsElapsed });

    // Listeyi süreye göre küçükten büyüğe sırala (En az sürede bitiren en üste çıkar)
    savedScores.sort((a, b) => a.time - b.time);

    // Tablo çok uzamasın diye sadece "En İyi 5 Skoru" tut
    savedScores = savedScores.slice(0, 5);

    // Güncellenmiş listeyi tekrar tarayıcı hafızasına yaz
    localStorage.setItem(storageKey, JSON.stringify(savedScores));

    // Görsel arayüzü güncelle
    playerNameInput.value = "";
    saveScoreBtn.innerText = "Kaydedildi!";
    saveScoreBtn.disabled = true; // Bir daha basılmasın diye butonu dondur
    
    updateScoreboardUI(); // Tabloyu baştan çiz
}

// Liderlik Tablosunu Ekrana Çizme
function updateScoreboardUI() {
    let storageKey = `scores_${gridSize}`;
    let savedScores = JSON.parse(localStorage.getItem(storageKey)) || [];
    
    scoreList.innerHTML = ""; // Önce tabloyu temizle

    // Eğer hiç skor yoksa
    if (savedScores.length === 0) {
        scoreList.innerHTML = "<li style='justify-content:center; color:#888;'>Henüz skor yok. İlk sen ol!</li>";
        return;
    }

    // Skorları listele ve başlarına madalya koy
    savedScores.forEach((score, index) => {
        let li = document.createElement("li");
        let medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}.`;
        
        li.innerHTML = `<span>${medal} ${score.name}</span> <span>${formatTime(score.time)}</span>`;
        scoreList.appendChild(li);
    });
}

// Butonlara Tıklama Olayları
saveScoreBtn.addEventListener("click", saveScore);

restartBtn.addEventListener("click", () => {
    // Paneli Kapat
    winOverlay.classList.remove("active");
    
    // Kaydet butonunu eski haline getir
    saveScoreBtn.innerText = "Kaydet";
    saveScoreBtn.disabled = false;
    
    // Oyunu baştan karıştırıp başlat
    initializeBoardState();
    createBoard();
});

// Duraklatma panelinin dışına (karanlık alana) tıklandığında paneli kapat
overlay.addEventListener("click", (event) => {
    // Tıklanan yer panelin içi değil de, tam olarak karanlık arka plan ise:
    if (event.target === overlay) {
        isPaused = false; // Oyunu devam ettir
        
        // Paneli gizle, Üst barı geri getir
        overlay.classList.remove("active");
        topBar.classList.remove("hidden");
    }
});

// Üst bardaki yenileme (restart) butonuna tıklanınca
document.getElementById("restart-top-btn").addEventListener("click", () => {
    // initializeBoardState fonksiyonumuz zaten sayacı sıfırlayıp taşları karıştırıyor
    initializeBoardState();
    createBoard();
});

// --- NASIL OYNANIR PANELİ KODLARI ---
const infoOverlay = document.getElementById("info-overlay");
const startGameBtn = document.getElementById("start-game-btn");

// "Oyuna Başla" butonuna tıklanınca paneli kapat
startGameBtn.addEventListener("click", () => {
    infoOverlay.classList.remove("active");
});

// Dışarıdaki karanlık alana tıklanınca paneli kapat
infoOverlay.addEventListener("click", (event) => {
    // Sadece tam olarak karanlık alana tıklandıysa kapat
    if (event.target === infoOverlay) {
        infoOverlay.classList.remove("active");
    }
});

// Oyunu başlat
initializeBoardState();
createBoard();
