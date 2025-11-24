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
  let currentContext = null;

  // Get page context
  function getPageContext() {
    const context = {
      pageType: 'home',
      url: window.location.pathname
    };

    // Detect page type and extract relevant information
    if (window.location.pathname.includes('/topics/')) {
      context.pageType = 'topic';
      
      // Extract topic information from the page
      const topicTitle = document.querySelector('h1');
      const subjectName = document.querySelector('nav a[href*="/subjects/"]');
      const explanation = document.querySelector('.note-content');
      
      if (topicTitle) context.topicTitle = topicTitle.textContent.trim();
      if (subjectName) context.subjectName = subjectName.textContent.trim();
      if (explanation) {
        // Get first 500 characters of explanation
        context.topicContent = explanation.textContent.trim().substring(0, 500);
      }
      
      // Check if there are exercises visible
      const exercises = document.querySelectorAll('.exercise-item');
      if (exercises.length > 0) {
        context.hasExercises = true;
      }
      
    } else if (window.location.pathname.includes('/subjects/')) {
      context.pageType = 'subject';
      
      const subjectTitle = document.querySelector('h1');
      if (subjectTitle) context.subjectName = subjectTitle.textContent.trim();
      
    } else if (window.location.pathname.includes('/mock-exam')) {
      context.pageType = 'exam';
      
      // Try to get current question if visible
      const currentQuestion = document.querySelector('.question-text');
      if (currentQuestion) {
        context.currentQuestion = currentQuestion.textContent.trim();
      }
    }

    // Check for selected text
    const selectedText = window.getSelection().toString().trim();
    if (selectedText && selectedText.length > 0 && selectedText.length < 500) {
      context.selectedText = selectedText;
    }

    return context;
  }

  // Update quick actions based on context
  function updateQuickActions() {
    const quickActionsContainer = document.getElementById('chatbot-quick-actions');
    if (!quickActionsContainer) return;

    currentContext = getPageContext();
    quickActionsContainer.innerHTML = '';

    const actions = [];

    // Context-specific quick actions
    if (currentContext.pageType === 'topic') {
      if (currentContext.topicTitle) {
        actions.push({
          text: '💡 Explain this topic',
          message: `Can you explain the topic "${currentContext.topicTitle}" in simple terms?`
        });
        actions.push({
          text: '📝 Give me practice questions',
          message: `Can you give me some practice questions about "${currentContext.topicTitle}"?`
        });
      }
      if (currentContext.hasExercises) {
        actions.push({
          text: '🎯 Help with exercises',
          message: 'Can you help me understand the practice exercises on this page?'
        });
      }
    } else if (currentContext.pageType === 'subject') {
      if (currentContext.subjectName) {
        actions.push({
          text: '📚 Study tips',
          message: `What are the best ways to study ${currentContext.subjectName} for JAMB?`
        });
        actions.push({
          text: '🎯 Key topics',
          message: `What are the most important topics in ${currentContext.subjectName} for JAMB?`
        });
      }
    } else if (currentContext.pageType === 'exam') {
      actions.push({
        text: '💡 Explain this question',
        message: 'Can you explain this question and how to solve it?'
      });
    }

    // Selected text action
    if (currentContext.selectedText) {
      actions.push({
        text: '🔍 Explain selection',
        message: `Can you explain this: "${currentContext.selectedText.substring(0, 100)}${currentContext.selectedText.length > 100 ? '...' : ''}"`
      });
    }

    // Render quick action buttons
    actions.forEach(action => {
      const button = document.createElement('button');
      button.className = 'chatbot-quick-action';
      button.textContent = action.text;
      button.onclick = () => {
        chatbotInput.value = action.message;
        chatbotInput.focus();
      };
      quickActionsContainer.appendChild(button);
    });

    // Show/hide container based on actions
    quickActionsContainer.style.display = actions.length > 0 ? 'flex' : 'none';
  }

  // Toggle chat window
  function toggleChat() {
    isOpen = !isOpen;
    chatbotWindow.style.display = isOpen ? 'flex' : 'none';
    if (isOpen) {
      chatbotInput.focus();
      loadChatHistory();
      try {
        updateQuickActions(); // Update context when opening
      } catch (error) {
        console.warn('Quick actions not available:', error);
      }
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
    
    // Get current page context
    currentContext = getPageContext();
    
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
        body: JSON.stringify({ 
          message,
          pageContext: currentContext // Include page context
        })
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
      try {
        updateQuickActions(); // Refresh quick actions after sending
      } catch (error) {
        console.warn('Quick actions not available:', error);
      }
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
