/**
 * Romantic Gifting Page for Huyền Trang
 * Procedural Audio Synthesizer, 2D Canvas Petal Simulation, and interactive transitions
 */

// --- AUDIO SYNTHESIZER ---
class RomanticSynth {
    constructor() {
        this.ctx = null;
        this.playing = false;
        this.timeoutId = null;
        this.currentNoteIndex = 0;
        
        // Soothing chord progression: Cmaj9 - Am9 - Fmaj9 - G13
        this.chords = [
            [130.81, 164.81, 196.00, 246.94, 293.66], // C3, E3, G3, B3, D4 (Cmaj9)
            [110.00, 130.81, 164.81, 196.00, 246.94], // A2, C3, E3, G3, B3 (Am9)
            [87.31, 130.81, 174.61, 220.00, 261.63],  // F2, C3, F3, A3, C4 (Fmaj9)
            [98.00, 146.83, 196.00, 246.94, 277.18]   // G2, D3, G3, B3, Db4 (G7b5 / G13 sound)
        ];
    }
    
    init() {
        // Fallback for cross-browser AudioContext
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
            this.ctx = new AudioContextClass();
        }
    }
    
    playNote(freq, startTime, duration, type = 'sine', volume = 0.1) {
        if (!this.ctx) return;
        
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(freq, startTime);
        
        // Attack, Decay, Sustain, Release (ADSR) envelope for dreamy/bell feel
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.15); // Soft attack
        gainNode.gain.exponentialRampToValueAtTime(volume * 0.6, startTime + duration * 0.3); // Decay
        gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration); // Release
        
        osc.connect(gainNode);
        gainNode.connect(this.ctx.destination);
        
        osc.start(startTime);
        osc.stop(startTime + duration);
    }

    playTriggerChord() {
        if (!this.ctx) this.init();
        if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();

        const now = this.ctx.currentTime;
        // Dreamy opening chime arpeggio
        const introNotes = [261.63, 329.63, 392.00, 493.88, 523.25, 659.25, 783.99, 987.77]; // C4 to B5 arpeggio
        introNotes.forEach((freq, idx) => {
            this.playNote(freq, now + idx * 0.08, 2.5, 'sine', 0.06);
            this.playNote(freq * 1.5, now + idx * 0.08 + 0.02, 1.2, 'triangle', 0.02); // Add a subtle bell harmonic
        });
    }
    
    playStep() {
        if (!this.playing) return;
        
        const now = this.ctx.currentTime;
        const chordIndex = Math.floor(this.currentNoteIndex / 8) % this.chords.length;
        const step = this.currentNoteIndex % 8;
        
        // Strum chord at the first step
        if (step === 0) {
            const chord = this.chords[chordIndex];
            chord.forEach((freq, idx) => {
                // Arpeggiated entry for chord notes
                this.playNote(freq, now + idx * 0.1, 4.5, 'sine', 0.04);
            });
        }
        
        // Ambient high notes (wind chime style)
        if (Math.random() > 0.4) {
            const chord = this.chords[chordIndex];
            // Pick random chord note and shift it 2 octaves up
            const baseFreq = chord[Math.floor(Math.random() * chord.length)];
            const freq = baseFreq * 4; // Shift up two octaves
            
            // Bell effect
            this.playNote(freq, now, 2.0, 'sine', 0.025);
            this.playNote(freq * 1.5, now + 0.01, 1.0, 'sine', 0.01); 
        }
        
        this.currentNoteIndex++;
        // Schedule next note
        this.timeoutId = setTimeout(() => this.playStep(), 800);
    }
    
    toggle() {
        if (!this.ctx) this.init();
        
        if (this.playing) {
            this.playing = false;
            if (this.timeoutId) clearTimeout(this.timeoutId);
            if (this.ctx && this.ctx.state === 'running') {
                this.ctx.suspend();
            }
        } else {
            this.playing = true;
            if (this.ctx && this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
            this.playStep();
        }
        return this.playing;
    }
}

const synth = new RomanticSynth();

// --- CANVAS PARTICLE SYSTEM ---
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');

let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

const mouse = { x: null, y: null };
const particles = [];

// Particle configuration
const MAX_PARTICLES = 120;

// Rose Petal Class
class Petal {
    constructor(isBurst = false, x = null, y = null) {
        this.reset(isBurst, x, y);
    }
    
    reset(isBurst = false, x = null, y = null) {
        this.x = x !== null ? x : Math.random() * width;
        this.y = y !== null ? y : (isBurst ? Math.random() * height : -20);
        this.size = Math.random() * 12 + 6;
        this.speedX = Math.random() * 1.5 - 0.75;
        this.speedY = Math.random() * 1.2 + 0.6;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 1.5 - 0.75;
        this.opacity = Math.random() * 0.4 + 0.5;
        
        // Variety of pink colors
        const hues = [340, 345, 350, 355, 0];
        const hue = hues[Math.floor(Math.random() * hues.length)];
        this.color = `hsl(${hue}, 100%, ${Math.random() * 15 + 75}%)`;
        
        this.swing = Math.random() * 2 * Math.PI;
        this.swingSpeed = Math.random() * 0.02 + 0.005;
        this.isSparkle = Math.random() > 0.75;
        this.isHeart = !this.isSparkle && Math.random() > 0.7;
    }
    
    update() {
        this.y += this.speedY;
        this.swing += this.swingSpeed;
        this.x += this.speedX + Math.sin(this.swing) * 0.4;
        this.rotation += this.rotationSpeed;
        
        // Repulsion force from mouse cursor
        if (mouse.x !== null && mouse.y !== null) {
            const dx = this.x - mouse.x;
            const dy = this.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
                const force = (120 - dist) / 120;
                this.x += (dx / dist) * force * 4;
                this.y += (dy / dist) * force * 4;
            }
        }
        
        // Reset if went off bottom or sides
        if (this.y > height + 20 || this.x < -20 || this.x > width + 20) {
            this.reset(false);
        }
    }
    
    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        
        if (this.isSparkle) {
            // Draw a shiny sparkle
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#fff3a1';
            ctx.fillStyle = '#fffbeb';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size / 4, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.isHeart) {
            // Draw a cute miniature heart
            ctx.translate(this.x, this.y);
            ctx.rotate((this.rotation * Math.PI) / 180);
            ctx.fillStyle = this.color;
            ctx.beginPath();
            const s = this.size * 0.8;
            ctx.moveTo(0, -s / 4);
            ctx.bezierCurveTo(-s/2, -s, -s, -s/2, -s, s/4);
            ctx.bezierCurveTo(-s, s/2 + s/4, -s/2, s, 0, s * 1.1);
            ctx.bezierCurveTo(s/2, s, s, s/2 + s/4, s, s/4);
            ctx.bezierCurveTo(s, -s/2, s/2, -s, 0, -s/4);
            ctx.closePath();
            ctx.fill();
        } else {
            // Draw a realistic flower petal
            ctx.translate(this.x, this.y);
            ctx.rotate((this.rotation * Math.PI) / 180);
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.ellipse(0, 0, this.size, this.size / 1.7, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw vein
            ctx.beginPath();
            ctx.moveTo(-this.size, 0);
            ctx.quadraticCurveTo(0, -this.size / 6, this.size, 0);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
        
        ctx.restore();
    }
}

// Initialize particles
function initParticles() {
    for (let i = 0; i < MAX_PARTICLES; i++) {
        particles.push(new Petal(true));
    }
}

// Particle animation loop
function animate() {
    ctx.clearRect(0, 0, width, height);
    
    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
    }
    
    requestAnimationFrame(animate);
}

// Handle resizing
window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
});

// Track mouse movement
window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
});

// Trigger a burst of particles at a specific position
function triggerBurst(count, x, y) {
    for (let i = 0; i < count; i++) {
        const p = new Petal(true, x, y);
        // Direct speed upwards/outwards
        p.speedX = Math.random() * 6 - 3;
        p.speedY = -(Math.random() * 4 + 2);
        p.opacity = 1;
        
        // Limit total active particles to avoid lag
        if (particles.length > MAX_PARTICLES + 100) {
            particles.shift();
        }
        particles.push(p);
    }
}

// --- DOM & INTERACTIVE FLOW ---

const envelopeWrapper = document.getElementById('envelope-wrapper');
const envelopeElement = document.getElementById('envelope-element');
const envelopeSection = document.getElementById('envelope-section');
const mainContentSection = document.getElementById('main-content-section');
const musicBtn = document.getElementById('music-btn');
const showerBtn = document.getElementById('shower-btn');

// 1. Envelope click event
envelopeWrapper.addEventListener('click', () => {
    if (envelopeElement.classList.contains('open')) return;
    
    // Add open class to trigger CSS 3D animation
    envelopeElement.classList.add('open');
    
    // Play chime sound immediately
    synth.playTriggerChord();
    
    // Trigger small burst of sparkles on the letter
    const envelopeRect = envelopeWrapper.getBoundingClientRect();
    triggerBurst(25, envelopeRect.left + envelopeRect.width / 2, envelopeRect.top + envelopeRect.height / 2);
    
    // Transition to main bouquet view after delay
    setTimeout(() => {
        // Fade out envelope section
        envelopeSection.style.opacity = '0';
        envelopeSection.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            envelopeSection.style.display = 'none';
            
            // Show and fade in main content
            mainContentSection.classList.remove('hidden');
            
            // Extra particle explosion at center
            triggerBurst(50, width / 2, height / 2);
            
            // Auto start ambient synth loop
            if (!synth.playing) {
                const isPlaying = synth.toggle();
                if (isPlaying) {
                    musicBtn.classList.add('playing');
                    musicBtn.querySelector('.text').textContent = 'Tắt Nhạc';
                }
            }
        }, 800);
        
    }, 1600);
});

// 2. Ambient Music Toggle
musicBtn.addEventListener('click', () => {
    const isPlaying = synth.toggle();
    if (isPlaying) {
        musicBtn.classList.add('playing');
        musicBtn.querySelector('.text').textContent = 'Tắt Nhạc';
    } else {
        musicBtn.classList.remove('playing');
        musicBtn.querySelector('.text').textContent = 'Bật Nhạc Thư Giãn';
    }
});

// 3. Flower rain explosion button
showerBtn.addEventListener('click', (e) => {
    const rect = showerBtn.getBoundingClientRect();
    triggerBurst(60, rect.left + rect.width / 2, rect.top + rect.height / 2);
    
    // Play a gentle bell sound on click
    if (synth.ctx) {
        const now = synth.ctx.currentTime;
        synth.playNote(523.25, now, 1.5, 'sine', 0.05); // C5
        synth.playNote(659.25, now + 0.1, 1.5, 'sine', 0.03); // E5
        synth.playNote(783.99, now + 0.2, 2.0, 'sine', 0.03); // G5
    }
});

// 4. Interactive sparkles on hover of the bouquet image
const bouquetFrame = document.querySelector('.bouquet-frame');
if (bouquetFrame) {
    bouquetFrame.addEventListener('mousemove', (e) => {
        if (Math.random() > 0.7) {
            const rect = bouquetFrame.getBoundingClientRect();
            const relX = e.clientX;
            const relY = e.clientY;
            triggerBurst(1, relX, relY);
        }
    });
}

// Start Particle Canvas
initParticles();
animate();
