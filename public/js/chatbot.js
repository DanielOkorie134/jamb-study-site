// Chatbot functionality
(function() {
  const chatbotToggle = document.getElementById('chatbot-toggle');
  const chatbotWindow = document.getElementById('chatbot-window');
  const chatbotMinimize = document.getElementById('chatbot-minimize');
  const chatbotClear = document.getElementById('chatbot-clear');
  const chatbotMessages = document.getElementById('chatbot-messages');
  const chatbotInput = document.getElementById('chatbot-input');
  const chatbotSend = document.getElementById('chatbot-send');
  const chatbotTyping = document.getElementById('chatbot-typing');

  if (!chatbotToggle) return; // Exit if chatbot not present

  let isOpen = false;

  // Toggle chat window
  function toggleChat() {
    isOpen = !isOpen;
    chatbotWindow.style.display = isOpen ? 'flex' : 'none';
    if (isOpen) {
      chatbotInput.focus();
      loadChatHistory();
    }
  }

  chatbotToggle.addEventListener('click', toggleChat);
  chatbotMinimize.addEventListener('click', toggleChat);

  // Load chat history
  async function loadChatHistory() {
    try {
      const response = await fetch('/chatbot/history?limit=20');
      const data = await response.json();
      
      if (data.success && data.messages.length > 0) {
        // Clear default message
        chatbotMessages.innerHTML = '';
        
        // Add messages
        data.messages.forEach(msg => {
          addMessage(msg.content, msg.role);
        });
        
        scrollToBottom();
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  }

  // Add message to chat
  function addMessage(content, role = 'user') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chatbot-message ${role}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'chatbot-message-content';
    
    const p = document.createElement('p');
    p.textContent = content;
    
    contentDiv.appendChild(p);
    messageDiv.appendChild(contentDiv);
    chatbotMessages.appendChild(messageDiv);
    
    scrollToBottom();
  }

  // Scroll to bottom
  function scrollToBottom() {
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  }

  // Show typing indicator
  function showTyping() {
    chatbotTyping.style.display = 'block';
    scrollToBottom();
  }

  // Hide typing indicator
  function hideTyping() {
    chatbotTyping.style.display = 'none';
  }

  // Show error message
  function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'chatbot-error';
    errorDiv.textContent = message;
    chatbotMessages.appendChild(errorDiv);
    scrollToBottom();
    
    setTimeout(() => {
      errorDiv.remove();
    }, 5000);
  }

  // Send message
  async function sendMessage() {
    const message = chatbotInput.value.trim();
    
    if (!message) return;
    
    // Add user message
    addMessage(message, 'user');
    chatbotInput.value = '';
    chatbotInput.style.height = 'auto';
    
    // Disable input while processing
    chatbotInput.disabled = true;
    chatbotSend.disabled = true;
    showTyping();
    
    try {
      const response = await fetch('/chatbot/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message })
      });
      
      const data = await response.json();
      
      hideTyping();
      
      if (data.success) {
        addMessage(data.message, 'assistant');
      } else {
        showError(data.message || 'Failed to get response. Please try again.');
      }
    } catch (error) {
      hideTyping();
      console.error('Chat error:', error);
      showError('An error occurred. Please check your connection and try again.');
    } finally {
      chatbotInput.disabled = false;
      chatbotSend.disabled = false;
      chatbotInput.focus();
    }
  }

  // Send button click
  chatbotSend.addEventListener('click', sendMessage);

  // Enter key to send (Shift+Enter for new line)
  chatbotInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // Auto-resize textarea
  chatbotInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 100) + 'px';
  });

  // Clear chat history
  chatbotClear.addEventListener('click', async () => {
    if (!confirm('Are you sure you want to clear your chat history?')) {
      return;
    }
    
    try {
      const response = await fetch('/chatbot/history', {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        chatbotMessages.innerHTML = `
          <div class="chatbot-message assistant">
            <div class="chatbot-message-content">
              <p>👋 Hi! I'm your JAMB study assistant. Ask me anything about English, Mathematics, Physics, or Chemistry!</p>
            </div>
          </div>
        `;
      } else {
        showError('Failed to clear history. Please try again.');
      }
    } catch (error) {
      console.error('Clear history error:', error);
      showError('An error occurred. Please try again.');
    }
  });
})();
