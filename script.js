// ==========================================
// YAPLANDIRMA
// ==========================================

const CONFIG = {
    meetingDate: '2026-05-16',
    totalScreens: 14,
    autoScrollDelay: 5000 // 5 saniye
};

// ==========================================
// GLOBAL DEĞİŞKENLER
// ==========================================

let musicStarted = false;
let currentScrollSection = 0;
let autoScrollInterval = null;
let experienceStarted = false;

// DOM Elementleri
const elements = {
    musicControl: null,
    musicButton: null,
    volumeSlider: null,
    backgroundMusic: null,
    progressFill: null,
    scrollIndicator: null,
    startButton: null,
    heartsAnimation: null,
    secretHeart: null,
    secretModal: null,
    secretClose: null,
    replayButton: null,
    daysSince: null,
    monthsSince: null,
    sections: []
};

// ==========================================
// SAYFA YÜKLENDİĞİNDE
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    initializeElements();
    setupEventListeners();
    calculateStats();
});

// ==========================================
// ELEMENT İNİTİALİZASYONU
// ==========================================

function initializeElements() {
    elements.musicControl = document.getElementById('musicControl');
    elements.musicButton = document.getElementById('musicButton');
    elements.volumeSlider = document.getElementById('volumeSlider');
    elements.backgroundMusic = document.getElementById('backgroundMusic');
    elements.progressFill = document.getElementById('progressFill');
    elements.scrollIndicator = document.getElementById('scrollIndicator');
    elements.startButton = document.getElementById('startButton');
    elements.heartsAnimation = document.getElementById('heartsAnimation');
    elements.secretHeart = document.getElementById('secretHeart');
    elements.secretModal = document.getElementById('secretModal');
    elements.secretClose = document.getElementById('secretClose');
    elements.replayButton = document.getElementById('replayButton');
    elements.daysSince = document.getElementById('daysSince');
    elements.monthsSince = document.getElementById('monthsSince');
    elements.sections = document.querySelectorAll('.screen');
    
    // Başlangıç ses seviyesi
    if (elements.backgroundMusic) {
        elements.backgroundMusic.volume = 0.6;
    }
}

// ==========================================
// EVENT LİSTENERLAR
// ==========================================

function setupEventListeners() {
    // Başlat butonu
    if (elements.startButton) {
        elements.startButton.addEventListener('click', startExperience);
    }
    
    // Müzik kontrolü
    if (elements.musicButton) {
        elements.musicButton.addEventListener('click', toggleMusic);
    }
    
    if (elements.volumeSlider) {
        elements.volumeSlider.addEventListener('input', (e) => {
            if (elements.backgroundMusic) {
                elements.backgroundMusic.volume = e.target.value / 100;
            }
        });
    }
    
    // Scroll eventi
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Kullanıcı kaydırdığında otomatik kaydırmayı durdur
    let scrollTimeout;
    window.addEventListener('wheel', () => {
        stopAutoScroll();
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            if (experienceStarted) {
                startAutoScroll();
            }
        }, 3000);
    }, { passive: true });
    
    // Touch için aynı şey
    window.addEventListener('touchmove', () => {
        stopAutoScroll();
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            if (experienceStarted) {
                startAutoScroll();
            }
        }, 3000);
    }, { passive: true });
    
    // Gizli kalp
    if (elements.secretHeart) {
        elements.secretHeart.addEventListener('click', openSecretModal);
    }
    
    if (elements.secretClose) {
        elements.secretClose.addEventListener('click', closeSecretModal);
    }
    
    if (elements.secretModal) {
        elements.secretModal.addEventListener('click', (e) => {
            if (e.target === elements.secretModal) {
                closeSecretModal();
            }
        });
    }
    
    // Yeniden izleme
    if (elements.replayButton) {
        elements.replayButton.addEventListener('click', replayExperience);
    }
}

// ==========================================
// DENEYİMİ BAŞLAT
// ==========================================

function startExperience() {
    experienceStarted = true;
    
    // Kalp animasyonu
    createHearts(elements.heartsAnimation, 15);
    elements.heartsAnimation.classList.add('active');
    
    // Müziği başlat
    startMusic();
    
    // Kontrolleri göster
    if (elements.musicControl) {
        elements.musicControl.classList.add('visible');
    }
    
    // 2 saniye sonra otomatik kaydırmayı başlat ve sonraki ekrana geç
    setTimeout(() => {
        scrollToSection(1);
        startAutoScroll();
    }, 2000);
}

// ==========================================
// KALP ANİMASYONLARI
// ==========================================

function createHearts(container, count) {
    if (!container) return;
    
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const heart = document.createElement('div');
            heart.className = 'heart-particle';
            heart.textContent = '❤️';
            heart.style.left = Math.random() * 100 + '%';
            heart.style.animationDelay = (Math.random() * 2) + 's';
            container.appendChild(heart);
            
            setTimeout(() => {
                heart.remove();
            }, 4000);
        }, i * 200);
    }
}

// ==========================================
// OTOMATIK KAYDIRMA
// ==========================================

function startAutoScroll() {
    if (autoScrollInterval) return;
    
    autoScrollInterval = setInterval(() => {
        currentScrollSection++;
        
        if (currentScrollSection >= CONFIG.totalScreens - 1) {
            stopAutoScroll();
            return;
        }
        
        scrollToSection(currentScrollSection);
    }, CONFIG.autoScrollDelay);
}

function stopAutoScroll() {
    if (autoScrollInterval) {
        clearInterval(autoScrollInterval);
        autoScrollInterval = null;
    }
}

function scrollToSection(index) {
    if (elements.sections[index]) {
        elements.sections[index].scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
        currentScrollSection = index;
    }
}

// ==========================================
// SCROLL YÖNETİMİ
// ==========================================

function handleScroll() {
    // İlerleme çubuğunu güncelle
    const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    if (elements.progressFill) {
        elements.progressFill.style.width = `${scrollPercentage}%`;
    }
    
    // Scroll göstergesini gizle
    if (window.scrollY > 100 && elements.scrollIndicator) {
        elements.scrollIndicator.classList.add('hidden');
    } else if (window.scrollY <= 100 && elements.scrollIndicator) {
        elements.scrollIndicator.classList.remove('hidden');
    }
    
    // İstatistik ekranı görünür olduğunda animasyonu başlat
    const statsSection = document.getElementById('screen3');
    if (statsSection && isElementInViewport(statsSection)) {
        animateStats();
    }
    
    // Final ekranı görünür olduğunda kalpler
    const finalSection = document.getElementById('screen14');
    if (finalSection && isElementInViewport(finalSection)) {
        createFinalHearts();
    }
    
    // Hangi bölümdeyiz?
    elements.sections.forEach((section, index) => {
        if (isElementInViewport(section)) {
            currentScrollSection = index;
        }
    });
}

function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const windowWidth = window.innerWidth || document.documentElement.clientWidth;
    
    const vertInView = (rect.top <= windowHeight / 2) && ((rect.top + rect.height) >= windowHeight / 2);
    const horInView = (rect.left <= windowWidth) && ((rect.left + rect.width) >= 0);
    
    return (vertInView && horInView);
}

// ==========================================
// MÜZİK KONTROLLERİ
// ==========================================

function startMusic() {
    if (!elements.backgroundMusic || musicStarted) return;
    
    const playPromise = elements.backgroundMusic.play();
    
    if (playPromise !== undefined) {
        playPromise
            .then(() => {
                musicStarted = true;
                elements.musicButton.classList.remove('paused');
            })
            .catch((error) => {
                console.warn('Müzik otomatik başlatılamadı:', error);
            });
    }
}

function toggleMusic() {
    if (!elements.backgroundMusic) return;
    
    if (elements.backgroundMusic.paused) {
        const playPromise = elements.backgroundMusic.play();
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    musicStarted = true;
                    elements.musicButton.classList.remove('paused');
                })
                .catch((error) => {
                    console.error('Müzik çalınamadı:', error);
                });
        }
    } else {
        elements.backgroundMusic.pause();
        elements.musicButton.classList.add('paused');
    }
}

// ==========================================
// İSTATİSTİK HESAPLAMA
// ==========================================

let statsAnimated = false;

function calculateStats() {
    const meetingDate = new Date(CONFIG.meetingDate);
    const today = new Date();
    
    if (meetingDate > today) {
        if (elements.daysSince) elements.daysSince.textContent = '...';
        if (elements.monthsSince) elements.monthsSince.textContent = '...';
        return;
    }
    
    // Gün hesaplama
    const timeDiff = today.getTime() - meetingDate.getTime();
    const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    
    // Ay hesaplama
    let monthsDiff = (today.getFullYear() - meetingDate.getFullYear()) * 12;
    monthsDiff += today.getMonth() - meetingDate.getMonth();
    if (today.getDate() < meetingDate.getDate()) {
        monthsDiff--;
    }
    if (monthsDiff < 0) monthsDiff = 0;
    
    if (elements.daysSince) {
        elements.daysSince.setAttribute('data-target', daysDiff);
        elements.daysSince.textContent = '0';
    }
    
    if (elements.monthsSince) {
        elements.monthsSince.setAttribute('data-target', monthsDiff);
        elements.monthsSince.textContent = '0';
    }
}

function animateStats() {
    if (statsAnimated) return;
    statsAnimated = true;
    
    animateCounter(elements.daysSince);
    animateCounter(elements.monthsSince);
}

function animateCounter(element) {
    if (!element) return;
    
    const target = parseInt(element.getAttribute('data-target'));
    const duration = 2000;
    const steps = 60;
    const stepValue = target / steps;
    const stepDuration = duration / steps;
    let current = 0;
    
    const interval = setInterval(() => {
        current += stepValue;
        if (current >= target) {
            current = target;
            clearInterval(interval);
        }
        element.textContent = Math.floor(current);
    }, stepDuration);
}

// ==========================================
// GİZLİ MESAJ MODAL
// ==========================================

function openSecretModal() {
    if (elements.secretModal) {
        elements.secretModal.classList.add('active');
        stopAutoScroll();
    }
}

function closeSecretModal() {
    if (elements.secretModal) {
        elements.secretModal.classList.remove('active');
        if (experienceStarted) {
            startAutoScroll();
        }
    }
}

// ==========================================
// FİNAL ANİMASYONLARI
// ==========================================

let finalHeartsCreated = false;

function createFinalHearts() {
    if (finalHeartsCreated) return;
    finalHeartsCreated = true;
    
    const finalHearts = document.getElementById('finalHearts');
    if (!finalHearts) return;
    
    finalHearts.innerHTML = '';
    
    const heartCount = 20;
    const hearts = ['❤️', '💕', '💖', '💗'];
    
    for (let i = 0; i < heartCount; i++) {
        setTimeout(() => {
            const heart = document.createElement('div');
            heart.className = 'final-heart';
            heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
            heart.style.left = Math.random() * 100 + '%';
            heart.style.fontSize = (20 + Math.random() * 20) + 'px';
            heart.style.animationDuration = (4 + Math.random() * 3) + 's';
            heart.style.animationDelay = (Math.random() * 2) + 's';
            finalHearts.appendChild(heart);
        }, i * 300);
    }
}

// ==========================================
// YENİDEN İZLE
// ==========================================

function replayExperience() {
    // Değişkenleri sıfırla
    experienceStarted = false;
    musicStarted = false;
    statsAnimated = false;
    finalHeartsCreated = false;
    currentScrollSection = 0;
    
    // Otomatik kaydırmayı durdur
    stopAutoScroll();
    
    // Müziği durdur
    if (elements.backgroundMusic && !elements.backgroundMusic.paused) {
        elements.backgroundMusic.pause();
        elements.backgroundMusic.currentTime = 0;
        elements.musicButton.classList.add('paused');
    }
    
    // Kontrolleri gizle
    if (elements.musicControl) {
        elements.musicControl.classList.remove('visible');
    }
    
    // Kalp animasyonunu sıfırla
    if (elements.heartsAnimation) {
        elements.heartsAnimation.classList.remove('active');
        elements.heartsAnimation.innerHTML = '';
    }
    
    // Başa dön
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==========================================
// HATA KONTROLÜ
// ==========================================

if (elements.backgroundMusic) {
    elements.backgroundMusic.addEventListener('error', () => {
        console.warn('Müzik dosyası yüklenemedi. music/our-song.mp3 dosyasını kontrol edin.');
    });
}

// Fotoğraf yükleme hatalarını yönet
document.querySelectorAll('img').forEach((img) => {
    img.addEventListener('error', function() {
        this.style.display = 'block';
        this.alt = '📷';
    });
});

// Console mesajı
console.log('%c❤️ 16 Mayıs\'tan Sonsuza ❤️', 'color: #D7264D; font-size: 24px; font-weight: bold;');
console.log('%cTıklayınız butonuna bas ve hikâyeye başla!', 'color: #B8AEB3; font-size: 14px;');
