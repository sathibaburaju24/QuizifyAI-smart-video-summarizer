// Backend API URL
const API_URL = 'http://localhost:5000';

// Global State
let currentSummary = "";
let currentQuiz = [];
let currentTranscript = "";
let detectedLanguage = "";

// Expose functions to window because we are in a module
window.processVideo = processVideo;
window.showOptions = showOptions;
window.showSummary = showSummary;
window.showQuiz = showQuiz;
window.renderCurrentQuestion = renderCurrentQuestion;
window.selectOption = selectOption;
window.submitAnswer = submitAnswer;
window.nextQuestion = nextQuestion;
window.closeQuiz = closeQuiz;
window.toggleAudioPlayer = toggleAudioPlayer;
window.playAudio = playAudio;
window.pauseAudio = pauseAudio;
window.stopAudio = stopAudio;
window.showResults = showResults;


async function processVideo() {
    const input = document.getElementById('videoUrl');
    const loading = document.getElementById('loading');
    const url = input.value.trim();

    if (!url) {
        alert('Please enter a valid YouTube URL');
        return;
    }

    // UI Updates
    loading.style.display = 'block';
    const ctaBtn = document.querySelector('.cta-btn');
    const originalText = ctaBtn.innerText;
    ctaBtn.innerText = 'Processing...';
    ctaBtn.disabled = true;

    // Remove previous results
    const existing = document.getElementById('results-section');
    if (existing) existing.remove();

    try {
        // 1. Fetch transcript from YouTube
        loading.innerHTML = '<i class="fas fa-download"></i> Fetching video transcript...';

        // 2. Send to backend for processing
        loading.innerHTML = '<i class="fas fa-sync fa-spin"></i> Extracting audio and transcript...';

        const response = await fetch(`${API_URL}/api/process-video`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: url })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to process video');
        }

        // 3. Get results
        loading.innerHTML = '<i class="fas fa-brain fa-pulse"></i> Generating AI summary and quiz...';
        const data = await response.json();

        if (!data.success) {
            throw new Error('Processing failed');
        }

        // Save Results
        currentTranscript = data.transcript;
        currentSummary = data.summary;
        currentQuiz = data.quiz;
        detectedLanguage = data.detected_language || 'unknown';

        // 4. Finalize
        loading.style.display = 'none';
        ctaBtn.innerText = originalText;
        ctaBtn.disabled = false;

        showOptions();

    } catch (error) {
        console.error(error);
        let errorMessage = error.message;

        // Provide helpful error messages
        if (error.message.includes('fetch')) {
            errorMessage = 'Cannot connect to backend server. Make sure it is running on http://localhost:5000';
        }

        loading.innerHTML = `<span style="color:var(--accent)">Error: ${errorMessage}</span>`;
        ctaBtn.disabled = false;
        ctaBtn.innerText = originalText;
    }
}


function showOptions() {
    const existing = document.getElementById('results-section');
    if (existing) existing.remove();

    const optionsHtml = `
    <section id="results-section" class="features" style="animation: fadeInUp 0.5s ease-out; padding-top: 2rem;">
        <h2 class="section-title">Select <span class="gradient-text">Output Format</span></h2>
        <div class="choice-container">
            <div class="choice-card" onclick="showSummary()">
                <i class="fas fa-file-alt choice-icon"></i>
                <h3>View Summary</h3>
                <p style="margin-top: 1rem; color: var(--text-secondary);">AI-Generated Summary via DistilBART.</p>
            </div>
            <div class="choice-card" onclick="showQuiz()">
                <i class="fas fa-question-circle choice-icon"></i>
                <h3>Take Quiz</h3>
                <p style="margin-top: 1rem; color: var(--text-secondary);">Test your knowledge with 5 questions.</p>
            </div>
        </div>
        <div id="dynamic-content-area" style="margin-top: 3rem;"></div>
    </section>
    `;

    const heroEntry = document.querySelector('.hero');
    heroEntry.insertAdjacentHTML('afterend', optionsHtml);

    document.getElementById('results-section').scrollIntoView({ behavior: 'smooth' });
}

// Speech Synthesis Setup
const synth = window.speechSynthesis;
let utterance = null;

function showSummary() {
    const contentArea = document.getElementById('dynamic-content-area');
    contentArea.innerHTML = `
        <div class="card" style="max-width: 800px; margin: 0 auto; text-align: left; animation: fadeInUp 0.5s ease-out;">
            <!-- Video Metadata Section -->
            <div style="border-bottom: 1px solid var(--glass-border); padding-bottom: 1.5rem; margin-bottom: 1.5rem;">
                <h4 style="color: var(--text-secondary); font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.5rem;">AI-Powered Transcription & Summary</h4>
                <p style="color: var(--text-secondary); font-size: 0.85rem; margin-top: 0.5rem;">
                    <i class="fas fa-language" style="color: var(--primary);"></i> Detected Language: <strong>${detectedLanguage.toUpperCase()}</strong> | 
                    <i class="fas fa-robot" style="color: var(--secondary);"></i> Transcribed with Whisper AI | 
                    <i class="fas fa-brain" style="color: var(--accent);"></i> Summarized with BART
                </p>
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 1.5rem;">
                <h3 style="font-size: 1.8rem;"><i class="fas fa-align-left" style="color: var(--secondary);"></i> Video Summary</h3>
                <button class="cta-btn" onclick="toggleAudioPlayer()" style="padding:0.5rem 1rem; font-size:0.9rem;"><i class="fas fa-play"></i> Listen</button>
            </div>

            <!-- Hidden Audio Player -->
            <div id="audio-player" class="audio-player-container">
                <div class="player-controls">
                    <button class="player-btn" onclick="playAudio()"><i class="fas fa-play"></i></button>
                    <button class="player-btn" onclick="pauseAudio()"><i class="fas fa-pause"></i></button>
                    <div class="audio-progress">
                        <div class="progress-bar" id="progress-bar"></div>
                    </div>
                </div>
                <i class="fas fa-times close-player" onclick="toggleAudioPlayer()"></i>
            </div>

            <div id="summary-text" style="color: #e2e8f0; line-height: 1.8; font-size: 1.1rem;">
                ${currentSummary}
            </div>
        </div>
    `;
    contentArea.scrollIntoView({ behavior: 'smooth' });
}

function toggleAudioPlayer() {
    const player = document.getElementById('audio-player');
    const isHidden = player.style.display === 'none' || player.style.display === '';

    if (isHidden) {
        player.style.display = 'flex';
        // Auto-play when opened
        playAudio();
    } else {
        player.style.display = 'none';
        stopAudio();
    }
}

function playAudio() {
    if (synth.speaking && synth.paused) {
        synth.resume();
        return;
    }

    if (synth.speaking) return; // Already playing

    const text = document.getElementById('summary-text').innerText;
    utterance = new SpeechSynthesisUtterance(text);

    // Select a pleasant voice if available
    const voices = synth.getVoices();
    const preferredVoice = voices.find(v => v.name.includes('Google US English')) || voices[0];
    if (preferredVoice) utterance.voice = preferredVoice;

    // Progress bar simulation (simple animation since API doesn't give precise progress)
    const progressBar = document.getElementById('progress-bar');
    progressBar.style.width = '0%';
    progressBar.style.transition = `width ${text.length * 50}ms linear`; // Approx duration estimate

    utterance.onstart = () => {
        progressBar.style.width = '100%';
    };

    utterance.onend = () => {
        progressBar.style.width = '0%';
    };

    synth.speak(utterance);
}

function pauseAudio() {
    if (synth.speaking) {
        synth.pause();
    }
}

function stopAudio() {
    if (synth.speaking) {
        synth.cancel();
        if (document.getElementById('progress-bar')) {
            document.getElementById('progress-bar').style.width = '0%';
        }
    }
}

// Quiz Logic
let currentQuestionIndex = 0;
let score = 0;
let selectedOptionIndex = null;

function showQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    renderCurrentQuestion();
    document.getElementById('dynamic-content-area').scrollIntoView({ behavior: 'smooth' });
}

function renderCurrentQuestion() {
    const question = currentQuiz[currentQuestionIndex];
    if (!question) return;

    const contentArea = document.getElementById('dynamic-content-area');

    // Calculate progress
    const progress = ((currentQuestionIndex + 1) / currentQuiz.length) * 100;

    const html = `
        <div class="card" style="max-width: 800px; margin: 0 auto; text-align: left; animation: fadeInUp 0.5s ease-out; position: relative;">
            <div style="position: absolute; top: 1rem; right: 1rem; cursor: pointer; font-size: 1.2rem;" onclick="closeQuiz()">
                <i class="fas fa-times" style="color: var(--text-secondary);"></i>
            </div>
            
            <h3 style="text-align: center; margin-bottom: 0.5rem; font-size: 1.5rem;">Knowledge Check</h3>
            <p style="text-align: center; color: var(--text-secondary); margin-bottom: 2rem;">Question ${currentQuestionIndex + 1} of ${currentQuiz.length}</p>
            
            <div style="width: 100%; background: rgba(255,255,255,0.1); height: 4px; border-radius: 2px; margin-bottom: 2rem;">
                <div style="width: ${progress}%; background: var(--primary); height: 100%; border-radius: 2px; transition: width 0.3s;"></div>
            </div>

            <div class="quiz-question" style="border: none; background: transparent; padding: 0;">
                <p style="font-weight: 600; font-size: 1.2rem; margin-bottom: 1.5rem;">${question.q}</p>
                <div class="quiz-options" id="options-container">
                    ${question.options.map((opt, i) => `
                        <label class="quiz-option" id="option-${i}" onclick="selectOption(${i})">
                            <input type="radio" name="currentQ" value="${i}">
                            ${opt}
                        </label>
                    `).join('')}
                </div>
            </div>

            <div id="feedback-area" style="margin-top: 1.5rem; display: none;"></div>

            <div style="text-align: center; margin-top: 2rem; display: flex; justify-content: center; gap: 1rem;">
                <button id="submit-btn" class="cta-btn" onclick="submitAnswer()">Submit Answer</button>
                <button id="next-btn" class="cta-btn" onclick="nextQuestion()" style="display: none; background: rgba(255,255,255,0.1); border: 1px solid var(--glass-border);">Next Question <i class="fas fa-arrow-right"></i></button>
            </div>
        </div>
    `;

    contentArea.innerHTML = html;
}


function selectOption(index) {
    if (document.getElementById('submit-btn').style.display === 'none') return; // Prevent changing after submit

    selectedOptionIndex = index;
    // Visually update selection if needed manually, though radio buttons handle mostly
    document.querySelectorAll('.quiz-option').forEach((el, i) => {
        if (i === index) {
            el.style.background = 'rgba(99, 102, 241, 0.2)';
            el.style.borderColor = 'var(--primary)';
        } else {
            el.style.background = 'rgba(255, 255, 255, 0.05)';
            el.style.borderColor = 'transparent';
        }
    });
}

function submitAnswer() {
    if (selectedOptionIndex === null) {
        alert("Please select an answer first.");
        return;
    }

    const correctIndex = currentQuiz[currentQuestionIndex].correct;
    const isCorrect = selectedOptionIndex === correctIndex;
    const feedbackArea = document.getElementById('feedback-area');
    const submitBtn = document.getElementById('submit-btn');
    const nextBtn = document.getElementById('next-btn');

    // Disable interactions
    document.querySelectorAll('input[type="radio"]').forEach(inp => inp.disabled = true);
    document.querySelectorAll('.quiz-option').forEach(opt => opt.onclick = null);

    // Show feedback styles
    const options = document.querySelectorAll('.quiz-option');

    if (isCorrect) {
        options[selectedOptionIndex].style.background = 'rgba(34, 197, 94, 0.2)'; // Green tint
        options[selectedOptionIndex].style.border = '1px solid #22c55e';
        feedbackArea.innerHTML = `<p style="color: #4ade80; font-weight: 600;"><i class="fas fa-check-circle"></i> Correct!</p>`;
        score++;
    } else {
        options[selectedOptionIndex].style.background = 'rgba(239, 68, 68, 0.2)'; // Red tint
        options[selectedOptionIndex].style.border = '1px solid #ef4444';

        // Highlight correct answer
        options[correctIndex].style.background = 'rgba(34, 197, 94, 0.2)';
        options[correctIndex].style.border = '1px solid #22c55e';

        feedbackArea.innerHTML = `<p style="color: #f87171; font-weight: 600;"><i class="fas fa-times-circle"></i> Incorrect. The correct answer was highlighted.</p>`;
    }

    feedbackArea.style.display = 'block';

    // Switch buttons
    submitBtn.style.display = 'none';

    if (currentQuestionIndex === currentQuiz.length - 1) {
        nextBtn.innerHTML = 'Finish Quiz';
        nextBtn.onclick = showResults; // Change action for last question
    }

    nextBtn.style.display = 'inline-block';
}

function nextQuestion() {
    currentQuestionIndex++;
    selectedOptionIndex = null;
    renderCurrentQuestion();
}

function showResults() {
    const contentArea = document.getElementById('dynamic-content-area');
    const percentage = (score / currentQuiz.length) * 100;

    let message = "Good effort!";
    if (percentage === 100) message = "Perfect Score! 🏆";
    else if (percentage >= 80) message = "Excellent work! 🌟";
    else if (percentage >= 60) message = "Not bad! 👍";

    contentArea.innerHTML = `
        <div class="card" style="max-width: 600px; margin: 0 auto; text-align: center; animation: fadeInUp 0.5s ease-out;">
            <i class="fas fa-clipboard-check" style="font-size: 4rem; color: var(--primary); margin-bottom: 2rem;"></i>
            <h3 style="font-size: 2.5rem; margin-bottom: 1rem;">Quiz Complete!</h3>
            <p style="font-size: 1.25rem; color: var(--text-secondary); margin-bottom: 2rem;">${message}</p>
            
            <div style="display: flex; justify-content: center; gap: 3rem; margin-bottom: 3rem;">
                <div style="text-align: center;">
                    <span style="font-size: 1rem; color: var(--text-secondary); display: block;">Score</span>
                    <span style="font-size: 2.5rem; font-weight: 800; color: var(--accent);">${score}/${currentQuiz.length}</span>
                </div>
                <div style="text-align: center;">
                    <span style="font-size: 1rem; color: var(--text-secondary); display: block;">Accuracy</span>
                    <span style="font-size: 2.5rem; font-weight: 800; color: var(--primary);">${percentage}%</span>
                </div>
            </div>

            <button class="cta-btn" onclick="closeQuiz()">Close</button>
        </div>
    `;
}

function closeQuiz() {
    document.getElementById('dynamic-content-area').innerHTML = '';
}
