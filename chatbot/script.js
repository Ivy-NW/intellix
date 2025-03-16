const API_KEY = 'AIzaSyA9f_zDsYjVWQx2DWO_1zuWlVofQi48UMg';
        const chatMessages = document.getElementById('chat-messages');
        const userInput = document.getElementById('user-input');
        const sendButton = document.getElementById('send-button');
        const typingIndicator = document.getElementById('typing-indicator');

        function addMessage(message, isUser = false) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
            messageDiv.textContent = message;
            chatMessages.appendChild(messageDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        async function generateResponse(prompt) {
            const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

            try {
                const response = await fetch(`${url}?key=${API_KEY}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: prompt
                            }]
                        }]
                    })
                });

                const data = await response.json();
                return data.candidates[0].content.parts[0].text;
            } catch (error) {
                console.error('Error:', error);
                return 'Sorry, I encountered an error. Please try again.';
            }
        }

        async function handleUserInput() {
            const message = userInput.value.trim();
            if (!message) return;

            // Add user message
            addMessage(message, true);
            userInput.value = '';

            // Show typing indicator
            typingIndicator.style.display = 'block';

            // Get bot response
            const response = await generateResponse(message);

            // Hide typing indicator and add bot response
            typingIndicator.style.display = 'none';
            addMessage(response);
        }

        sendButton.addEventListener('click', handleUserInput);
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleUserInput();
            }
        });

        const menuBtn = document.getElementById('menuBtn');
        const navLinks = document.querySelector('.nav-links');
        const dropdowns = document.querySelectorAll('.dropdown');
    
        // Toggle mobile menu
        menuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuBtn.querySelector('i').classList.toggle('fa-bars');
            menuBtn.querySelector('i').classList.toggle('fa-times');
        });
    
        // Handle dropdowns on mobile
        dropdowns.forEach(dropdown => {
            const link = dropdown.querySelector('a');
            
            link.addEventListener('click', (e) => {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    dropdown.classList.toggle('active');
                    
                    // Close other dropdowns
                    dropdowns.forEach(other => {
                        if (other !== dropdown) {
                            other.classList.remove('active');
                        }
                    });
                }
            });
        });
    
        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navLinks.contains(e.target) && !menuBtn.contains(e.target)) {
                navLinks.classList.remove('active');
                menuBtn.querySelector('i').classList.remove('fa-times');
                menuBtn.querySelector('i').classList.add('fa-bars');
            }
        });
    
        // Close mobile menu when window is resized above mobile breakpoint
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                navLinks.classList.remove('active');
                menuBtn.querySelector('i').classList.remove('fa-times');
                menuBtn.querySelector('i').classList.add('fa-bars');
                dropdowns.forEach(dropdown => dropdown.classList.remove('active'));
            }
        });