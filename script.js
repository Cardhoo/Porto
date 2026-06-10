document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('bg-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height;
        let particles = [];

        function resize() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        }

        window.addEventListener('resize', resize);
        resize();

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.size = Math.random() * 1.5 + 0.5;
                this.speedX = Math.random() * 0.4 - 0.2; 
                this.speedY = Math.random() * 0.4 - 0.2;
                this.opacity = Math.random() * 0.5 + 0.2;
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                if (this.x < 0) this.x = width;
                if (this.x > width) this.x = 0;
                if (this.y < 0) this.y = height;
                if (this.y > height) this.y = 0;
            }
            draw() {
                ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        function initParticles() {
            particles = [];
            let particleCount = Math.floor(window.innerWidth / 30);
            if(particleCount > 80) particleCount = 80;
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        }

        function animateParticles() {
            ctx.clearRect(0, 0, width, height);
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();
            }
            requestAnimationFrame(animateParticles);
        }

        initParticles();
        animateParticles();
    }

    const viewCounterEl = document.getElementById('viewCounter');
    if (viewCounterEl) {
        fetch('https://api.counterapi.dev/v1/rickyfarhan/portfolio/up')
            .then(res => res.json())
            .then(data => {
                if(data && data.count) {
                    viewCounterEl.innerText = data.count.toLocaleString('id-ID');
                } else {
                    viewCounterEl.innerText = "1.000+";
                }
            })
            .catch(err => {
                console.error("View count error");
                viewCounterEl.innerText = "1.000+";
            });
    }

    const glitchTextEl = document.getElementById('glitch-text');
    const phrases = [
        "I am interested in Smart Contract and Blockchain",
        "Always learning and growing",
        "Exploring new technologies",
        "Web3 and AI Agent Enthusiast"
    ];
    let phraseIndex = 0;

    if (glitchTextEl) {
        setInterval(() => {
            glitchTextEl.classList.remove('fade-in');
            glitchTextEl.classList.add('fade-out');
            setTimeout(() => {
                phraseIndex = (phraseIndex + 1) % phrases.length;
                glitchTextEl.innerText = phrases[phraseIndex];
                glitchTextEl.classList.remove('fade-out');
                glitchTextEl.classList.add('fade-in');
            }, 500);
        }, 3500);
    }

    const DISCORD_USER_ID = "813291404242714634"; 
    const dsSpotifyTitle = document.getElementById('dsSpotifyTitle');
    const dsSpotifyArtist = document.getElementById('dsSpotifyArtist');
    const dsActivityTitle = document.getElementById('dsActivityTitle');
    const profileStatusDot = document.getElementById('profileStatusDot');
    const profileStatusText = document.getElementById('profileStatusText');

    function connectLanyard() {
        if (!DISCORD_USER_ID) return;
        const ws = new WebSocket('wss://api.lanyard.rest/socket');
        let heartbeatInterval = null;

        ws.onopen = () => {
        };
        
        ws.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            
            if (msg.op === 1) {
                const interval = msg.d.heartbeat_interval;
                
                ws.send(JSON.stringify({ op: 2, d: { subscribe_to_id: DISCORD_USER_ID } }));
                
                if (heartbeatInterval) clearInterval(heartbeatInterval);
                heartbeatInterval = setInterval(() => {
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify({ op: 3 }));
                    }
                }, interval);
                
            } else if (msg.op === 0) {
                updateDiscordUI(msg.d);
            }
        };
        
        ws.onclose = () => {
            if (heartbeatInterval) clearInterval(heartbeatInterval);
            setTimeout(connectLanyard, 5000);
        };
    }

    function updateDiscordUI(data) {
        if (profileStatusDot) {
            profileStatusDot.className = `status-dot ${data.discord_status}`;
        }
        if (profileStatusText) {
            let statusStr = data.discord_status;
            if (statusStr === 'dnd') statusStr = 'Do Not Disturb';
            profileStatusText.innerText = statusStr.charAt(0).toUpperCase() + statusStr.slice(1);
        }
        if (!dsSpotifyTitle) return;

        if (data.spotify) {
            dsSpotifyTitle.innerText = data.spotify.song;
            dsSpotifyArtist.innerText = `by ${data.spotify.artist}`;
            dsSpotifyTitle.style.color = '#1ed760';
            
            const dsSpotifyArt = document.getElementById('dsSpotifyArt');
            const dsSpotifyIcon = document.getElementById('dsSpotifyIcon');
            if (dsSpotifyArt && dsSpotifyIcon) {
                dsSpotifyArt.style.display = 'block';
                dsSpotifyIcon.style.display = 'none';
            }
        } else {
            dsSpotifyTitle.innerText = "Spotify Not Detected";
            dsSpotifyArtist.innerText = "Play Spotify with Discord status enabled";
            dsSpotifyTitle.style.color = '#fff';
            
            const dsSpotifyArt = document.getElementById('dsSpotifyArt');
            const dsSpotifyIcon = document.getElementById('dsSpotifyIcon');
            if (dsSpotifyArt && dsSpotifyIcon) {
                dsSpotifyArt.style.display = 'none';
                dsSpotifyIcon.style.display = 'block';
            }
        }

        const activities = data.activities || [];
        const gameActivity = activities.find(a => a.type === 0);
        const customStatus = activities.find(a => a.type === 4);

        if (gameActivity) {
            dsActivityTitle.innerText = `Playing ${gameActivity.name}`;
        } else if (customStatus && customStatus.state) {
            dsActivityTitle.innerText = customStatus.state;
        } else if (data.discord_status !== 'offline') {
            dsActivityTitle.innerText = "No live activity right now";
        } else {
            dsActivityTitle.innerText = "Offline";
        }
    }

    connectLanyard();

    window.openModal = function(id) {
        document.getElementById(id).classList.remove('hidden');
    }

    window.closeModal = function(id) {
        document.getElementById(id).classList.add('hidden');
    }

    const chatContainer = document.getElementById('chat-widget');
    const openChatBtn = document.getElementById('open-chat-btn');
    const closeChatBtn = document.getElementById('close-chat-btn');
    const langBtn = document.getElementById('lang-toggle-btn');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const chatBody = document.getElementById('chat-body');
    let currentLang = 'ID'; 

    if(langBtn) {
        langBtn.addEventListener('click', () => {
            if (currentLang === 'ID') {
                currentLang = 'EN';
                langBtn.innerText = 'EN';
                document.getElementById('welcome-msg').innerHTML = 'Hello! I am Dho, Ricky\'s assistant. Try typing <strong>"project"</strong>, <strong>"certificate"</strong>, or <strong>"skill"</strong>!';
            } else {
                currentLang = 'ID';
                langBtn.innerText = 'ID';
                document.getElementById('welcome-msg').innerHTML = 'Halo! Saya Dho, asisten Chat Bot Ricky. Coba ketik <strong>"proyek"</strong>, <strong>"sertifikat"</strong>, atau <strong>"skill"</strong>!';
            }
        });
    }

    if(openChatBtn) {
        openChatBtn.addEventListener('click', () => {
            chatContainer.classList.remove('hidden');
            openChatBtn.style.display = 'none';
        });
    }

    if(closeChatBtn) {
        closeChatBtn.addEventListener('click', () => {
            chatContainer.classList.add('hidden');
            openChatBtn.style.display = 'flex';
        });
    }

    function appendMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message');
        msgDiv.classList.add(sender === 'user' ? 'user-message' : 'ai-message');
        msgDiv.innerHTML = text;
        chatBody.appendChild(msgDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    function generateAIResponse(userText) {
        const text = userText.toLowerCase();
        const isEn = (currentLang === 'EN');

        if (text.includes('proyek') || text.includes('project') || text.includes('karya') || text.includes('portofolio')) {
            return { text: isEn ? "Sure! Here are Ricky's featured projects. Opening data..." : "Tentu! Ini adalah daftar proyek unggulan yang pernah Ricky kerjakan. Membuka data proyek...", action: "openProjects" };
        } 
        else if (text.includes('skill') || text.includes('keahlian') || text.includes('kemampuan') || text.includes('bisa apa')) {
            return { text: isEn ? "Got it! Here is the list of Ricky's technical skills. Opening data..." : "Siap! Berikut adalah daftar keahlian teknis yang Ricky miliki. Membuka data skill...", action: "openSkills" };
        }
        else if (text.includes('sertifikasi') || text.includes('sertifikat') || text.includes('prestasi') || text.includes('bnsp') || text.includes('certificate')) {
            return { text: isEn ? "Got it! Here is the list of Ricky's certificates. Opening data..." : "Siap! Berikut adalah daftar sertifikasi yang Ricky raih. Membuka data sertifikat...", action: "openCerts" };
        }
        else if (text.includes('pengalaman') || text.includes('magang') || text.includes('kerja') || text.includes('taiyo') || text.includes('experience')) {
            return { text: isEn ? "Ricky was an IT Support Intern at PT. Taiyo Sinar Raya Teknik (July - Oct 2024)." : "Ricky pernah magang sebagai IT Support di PT. Taiyo Sinar Raya Teknik (Juli - Okt 2024)." };
        }
        else if (text.includes('pendidikan') || text.includes('kuliah') || text.includes('smk') || text.includes('mahasiswa') || text.includes('tkj') || text.includes('education')) {
            return { text: isEn ? "Ricky is a Vocational High School graduate (TKJ) and currently an IT Student at UBSI." : "Ricky adalah lulusan SMK jurusan TKJ dan sekarang menempuh pendidikan sebagai Mahasiswa TI di UBSI." };
        }
        else if (text.includes('hobi') || text.includes('suka') || text.includes('game') || text.includes('futsal') || text.includes('hobby')) {
            return { text: isEn ? "In his free time, Ricky plays Futsal and video games like Valorant, Delta Force, Free Fire, and Roblox." : "Di waktu luang, Ricky suka main Futsal dan bermain game (Valorant, Delta Force, Free Fire, dan Roblox)." };
        }
        else if (text.includes('kontak') || text.includes('telepon') || text.includes('wa') || text.includes('email') || text.includes('contact')) {
            return { text: isEn ? "For privacy reasons, please contact Ricky via the social links." : "Untuk alasan privasi, silakan hubungi Ricky melalui link sosial yang tersedia." };
        }
        else if (text.includes('siapa kamu') || text.includes('dho') || text.includes('bot') || text.includes('who are you')) {
            return { text: isEn ? "I am Dho, Ricky's assistant. Ready to help you!" : "Saya Dho, Asisten di website ini. Siap menjawab seputar profil profesional Ricky!" };
        }
        else if (text.includes('halo') || text.includes('hai') || text.includes('hello') || text.includes('hi')) {
            return { text: isEn ? "Hello! Try typing 'project', 'certificate' or 'skill' to see my magic!" : "Halo! Coba ketik perintah seperti 'Lihat Proyek', 'Sertifikat', atau 'Skill' untuk melihat fitur otomatis saya!" };
        }
        else {
            return { text: isEn ? "Sorry, I can only talk about Ricky's professional profile. Ask about projects or certificates!" : "Maaf, saya hanya diprogram untuk membahas profil profesional Ricky. Coba tanyakan tentang proyek atau sertifikat!" };
        }
    }

    function handleSend() {
        const text = chatInput.value.trim();
        if (text === '') return;
        appendMessage(text, 'user');
        chatInput.value = '';
        setTimeout(() => {
            const responseObj = generateAIResponse(text);
            appendMessage(responseObj.text, 'ai');
            if (responseObj.action === "openProjects") {
                setTimeout(() => openModal('projectsModal'), 800);
            } else if (responseObj.action === "openCerts") {
                setTimeout(() => openModal('certsModal'), 800);
            } else if (responseObj.action === "openSkills") {
                setTimeout(() => openModal('skillsModal'), 800);
            }
        }, 600);
    }

    if(sendBtn) sendBtn.addEventListener('click', handleSend);
    if(chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSend();
        });
    }

    function triggerSecurityAlert() {
        openModal('securityModal');
    }

    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        triggerSecurityAlert();
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'F12' || e.keyCode === 123) {
            e.preventDefault();
            triggerSecurityAlert();
        }
        if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i')) {
            e.preventDefault();
            triggerSecurityAlert();
        }
        if (e.ctrlKey && e.shiftKey && (e.key === 'J' || e.key === 'j')) {
            e.preventDefault();
            triggerSecurityAlert();
        }
        if (e.ctrlKey && (e.key === 'U' || e.key === 'u')) {
            e.preventDefault();
            triggerSecurityAlert();
        }
    });
});