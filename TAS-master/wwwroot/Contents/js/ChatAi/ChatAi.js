// Cấu hình
const TAS_INFO = {
    name: "Tên Website Của Bạn",
    features: [
        "Đăng ký/Đăng nhập tài khoản",
        "Quản lý sản phẩm",
        "Giỏ hàng và thanh toán",
        "Tra cứu đơn hàng",
        "Liên hệ hỗ trợ"
    ]
};

let conversationHistory = [];

// Khởi tạo chatbot khi trang load
document.addEventListener('DOMContentLoaded', function () {
    initChatbot();
});

function initChatbot() {
    const container = document.getElementById('chatbot-container');
    if (!container) return;

    container.innerHTML = `
        <button class="chat-button" id="chatButton" onclick="toggleChat()">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
        </button>

        <div class="chat-window" id="chatWindow">
            <div class="chat-header">
                <div>
                    <h3>Trợ lý AI cho TAS</h3>
                </div>
                <button class="close-button" onclick="toggleChat()">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div class="chat-messages" id="chatMessages">
                <div class="message assistant">
                    <div class="message-content">
                        Xin chào! Tôi là trợ lý AI của website.<br><br>
                        Tôi có thể giúp bạn!
                    </div>
                </div>
            </div>

            <div class="chat-input">
                <input 
                    type="text" 
                    id="messageInput" 
                    placeholder="Nhập tin nhắn..."
                    onkeypress="handleKeyPress(event)"
                />
                <button class="send-button" id="sendButton" onclick="sendMessage()">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                </button>
            </div>
        </div>
    `;
}

function toggleChat() {
    const chatWindow = document.getElementById('chatWindow');
    chatWindow.classList.toggle('open');
}

function addMessage(role, content) {
    const messagesDiv = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = content.replace(/\n/g, '<br>');

    messageDiv.appendChild(contentDiv);
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function showLoading() {
    const messagesDiv = document.getElementById('chatMessages');
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message assistant';
    loadingDiv.id = 'loadingMessage';
    loadingDiv.innerHTML = `
        <div class="message-content loading">
            <div class="loading-dot"></div>
            <div class="loading-dot"></div>
            <div class="loading-dot"></div>
        </div>
    `;
    messagesDiv.appendChild(loadingDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function hideLoading() {
    const loadingDiv = document.getElementById('loadingMessage');
    if (loadingDiv) {
        loadingDiv.remove();
    }
}

async function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();

    if (!message) return;

    addMessage('user', message);
    input.value = '';

    const sendButton = document.getElementById('sendButton');
    sendButton.disabled = true;

    conversationHistory.push({
        role: 'user',
        content: message
    });

    showLoading();

    try {
        const response = await fetch('/ChatAi/ChatRequest', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                history: conversationHistory,
                websiteInfo: TAS_INFO
            })
        });

        if (!response.ok) {
            throw new Error('Lỗi kết nối');
        }

        const data = await response.json();

        hideLoading();
        addMessage('assistant', data.response);

        conversationHistory.push({
            role: 'assistant',
            content: data.response
        });

    } catch (error) {
        hideLoading();
        addMessage('assistant', '❌ Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.');
        console.error('Error:', error);
    } finally {
        sendButton.disabled = false;
    }
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}