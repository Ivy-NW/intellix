let currentTranscript = ''; // Store the transcript globally

async function getSummary() {
    const videoUrl = document.getElementById('videoUrl').value;
    const summaryDiv = document.getElementById('summary');
    const loadingDiv = document.getElementById('loading');
    const followUpSection = document.getElementById('follow-up-section');

    if (!videoUrl) {
        alert('Please enter a valid YouTube URL');
        return;
    }

    loadingDiv.style.display = 'block';
    summaryDiv.innerHTML = '';
    followUpSection.style.display = 'none';

    try {
        const response = await fetch('http://localhost:3000/summarize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ videoUrl })
        });

        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }

        loadingDiv.style.display = 'none';
        summaryDiv.innerHTML = data.summary;
        currentTranscript = data.transcript; // Store the transcript
        followUpSection.style.display = 'block'; // Show follow-up section
    } catch (error) {
        loadingDiv.style.display = 'none';
        summaryDiv.innerHTML = `Error: ${error.message || 'Error generating summary. Please try again.'}`;
        console.error('Error:', error);
    }
}

async function askFollowUp() {
    const question = document.getElementById('followUpQuestion').value;
    const answerDiv = document.getElementById('followUpAnswer');

    if (!question) {
        alert('Please enter a question');
        return;
    }

    answerDiv.innerHTML = 'Loading...';

    try {
        const response = await fetch('http://localhost:3000/ask-followup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                question,
                transcript: currentTranscript
            })
        });

        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }

        answerDiv.innerHTML = data.answer;
    } catch (error) {
        answerDiv.innerHTML = `Error: ${error.message || 'Error getting answer. Please try again.'}`;
        console.error('Error:', error);
    }
}


        // Mobile menu toggle
        const menuBtn = document.querySelector('.hamburger');
        const navLinks = document.querySelector('.nav-links');
        const dropdowns = document.querySelectorAll('.dropdown');

        menuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuBtn.querySelector('i').classList.toggle('fa-bars');
            menuBtn.querySelector('i').classList.toggle('fa-times');
        });

        // Background animation
        document.addEventListener('mousemove', (e) => {
            const spots = document.querySelectorAll('.spot');
            const mouseX = e.clientX / window.innerWidth;
            const mouseY = e.clientY / window.innerHeight;

            spots.forEach((spot, index) => {
                const factor = (index + 1) * 0.1;
                const offsetX = (mouseX - 0.5) * 50 * factor;
                const offsetY = (mouseY - 0.5) * 50 * factor;
                
                spot.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
            });
        });