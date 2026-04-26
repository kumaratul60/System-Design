// Connect to the specific port where the Node server is running
const socket = io('http://localhost:3002'); 
const myClientId = 'client-' + Math.random().toString(36).substr(2, 9);

const messagesDiv = document.getElementById('messages');
const input = document.getElementById('input');
const sendBtn = document.getElementById('send-btn');
const typingDiv = document.getElementById('typing');
const countSpan = document.getElementById('count');

// 1. Send Message Logic
function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    socket.emit('chat message', {
        senderId: myClientId,
        user: 'User',
        text: text
    });
    input.value = '';
    socket.emit('typing', false);
}

// 2. Event Listeners
sendBtn.addEventListener('click', sendMessage);

// HIT ENTER TO SEND
input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// TYPING INDICATOR
let typingTimeout;
input.addEventListener('input', () => {
    socket.emit('typing', true);
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => socket.emit('typing', false), 2000);
});

// 3. Socket Event Handlers
socket.on('chat message', (data) => {
    const isMe = data.senderId === myClientId;
    appendMessage(data, isMe);
});

socket.on('user typing', (data) => {
    typingDiv.innerText = data.isTyping ? 'Someone is typing...' : '';
});

socket.on('user count', (count) => {
    countSpan.innerText = `Users: ${count}`;
});

function appendMessage(data, isMe) {
    const msgDiv = document.createElement('div');
    
    // Determine class based on sender
    let typeClass = isMe ? 'me' : 'others';
    if (data.isBot) typeClass = 'bot';
    
    msgDiv.className = `msg ${typeClass}`;
    msgDiv.innerHTML = `
        <div>${data.text}</div>
        <span class="meta">${data.user} • ${data.timestamp}</span>
    `;
    
    messagesDiv.appendChild(msgDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}
