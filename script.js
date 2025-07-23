class BreakTimer {
    constructor() {
        this.timeLeft = 5 * 60; // 5 minutes in seconds
        this.totalTime = 5 * 60;
        this.isRunning = false;
        this.interval = null;
        this.soundEnabled = true;
        
        this.initializeElements();
        this.setupEventListeners();
        this.updateDisplay();
        this.setupProgressRing();
    }
    
    initializeElements() {
        this.minutesDisplay = document.getElementById('minutes');
        this.secondsDisplay = document.getElementById('seconds');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.statusText = document.getElementById('statusText');
        this.breakDuration = document.getElementById('breakDuration');
        this.soundEnabled = document.getElementById('soundEnabled');
        this.notificationSound = document.getElementById('notificationSound');
        this.progressRing = document.querySelector('.progress-ring-fill');
        this.timeCircle = document.querySelector('.time-circle');
    }
    
    setupEventListeners() {
        this.startBtn.addEventListener('click', () => this.start());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.breakDuration.addEventListener('change', () => this.updateDuration());
        this.soundEnabled.addEventListener('change', () => {
            this.soundEnabled = this.soundEnabled.checked;
        });
        
        // Add gradient definition to SVG
        this.addGradientToSVG();
    }
    
    addGradientToSVG() {
        const svg = document.querySelector('.progress-ring');
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        gradient.setAttribute('id', 'gradient');
        gradient.setAttribute('x1', '0%');
        gradient.setAttribute('y1', '0%');
        gradient.setAttribute('x2', '100%');
        gradient.setAttribute('y2', '100%');
        
        const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop1.setAttribute('offset', '0%');
        stop1.setAttribute('stop-color', '#667eea');
        
        const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop2.setAttribute('offset', '100%');
        stop2.setAttribute('stop-color', '#764ba2');
        
        gradient.appendChild(stop1);
        gradient.appendChild(stop2);
        defs.appendChild(gradient);
        svg.appendChild(defs);
    }
    
    setupProgressRing() {
        const radius = 140;
        const circumference = 2 * Math.PI * radius;
        this.progressRing.style.strokeDasharray = circumference;
        this.progressRing.style.strokeDashoffset = circumference;
    }
    
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.startBtn.disabled = true;
        this.pauseBtn.disabled = false;
        this.statusText.textContent = 'Break in progress...';
        
        this.interval = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();
            this.updateProgress();
            
            if (this.timeLeft <= 0) {
                this.complete();
            }
        }, 1000);
    }
    
    pause() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.statusText.textContent = 'Break paused';
        
        clearInterval(this.interval);
    }
    
    reset() {
        this.pause();
        this.timeLeft = this.totalTime;
        this.updateDisplay();
        this.updateProgress();
        this.statusText.textContent = 'Ready to start your break';
        this.timeCircle.classList.remove('timer-complete');
    }
    
    complete() {
        this.pause();
        this.timeLeft = 0;
        this.updateDisplay();
        this.updateProgress();
        this.statusText.textContent = 'Break completed! Time to get back to work!';
        this.timeCircle.classList.add('timer-complete');
        
        if (this.soundEnabled.checked) {
            this.playNotification();
        }
        
        // Show browser notification if supported
        this.showBrowserNotification();
        
        // Remove completion animation after 2 seconds
        setTimeout(() => {
            this.timeCircle.classList.remove('timer-complete');
        }, 2000);
    }
    
    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        
        this.minutesDisplay.textContent = minutes.toString().padStart(2, '0');
        this.secondsDisplay.textContent = seconds.toString().padStart(2, '0');
    }
    
    updateProgress() {
        const progress = (this.totalTime - this.timeLeft) / this.totalTime;
        const radius = 140;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (progress * circumference);
        
        this.progressRing.style.strokeDashoffset = offset;
    }
    
    updateDuration() {
        const newDuration = parseInt(this.breakDuration.value);
        this.totalTime = newDuration * 60;
        this.timeLeft = this.totalTime;
        this.updateDisplay();
        this.updateProgress();
        this.reset();
    }
    
    playNotification() {
        try {
            this.notificationSound.currentTime = 0;
            this.notificationSound.play();
        } catch (error) {
            console.log('Could not play notification sound:', error);
        }
    }
    
    showBrowserNotification() {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Break Timer', {
                body: 'Your break is complete! Time to get back to work.',
                icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMzAiIGZpbGw9IiM2NjdlZWEiLz4KPHBhdGggZD0iTTMyIDE2VjMyTDI0IDQwIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjMiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K'
            });
        } else if ('Notification' in window && Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    this.showBrowserNotification();
                }
            });
        }
    }
}

// Initialize the timer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new BreakTimer();
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        
        if (!startBtn.disabled) {
            startBtn.click();
        } else if (!pauseBtn.disabled) {
            pauseBtn.click();
        }
    } else if (e.code === 'KeyR') {
        document.getElementById('resetBtn').click();
    }
});

// Add service worker for PWA capabilities (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
} 