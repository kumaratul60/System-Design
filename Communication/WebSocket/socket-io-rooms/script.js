const socket = io('http://localhost:3003');
const myId = 'u-' + Math.random().toString(36).substr(2, 5);

let currentRoom = '';

const setupDiv = document.getElementById('setup');
const chatInterface = document.getElementById('chat-interface');
const roomTitle = document.getElementById('room-title');
const messagesDiv = document.getElementById('messages');
const input = document.getElementById('msg-input');

function joinRoom() {
    const roomSelect = document.getElementById('room-select');
    currentRoom = roomSelect.value;
    
    // Tell server we are joining this room
    socket.emit('join room', currentRoom);
    
    // UI Switch
    setupDiv.style.display = 'none';
    chatInterface.style.display = 'flex';
    roomTitle.innerText = `Room: ${currentRoom}`;
}

function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    socket.emit('chat message', {
        room: currentRoom,
        user: 'User',
        text: text,
        senderId: myId
    });
    input.value = '';
}

// Add Enter key listener
input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// Listen for messages
socket.on('chat message', (data) => {
    const isMe = data.senderId === myId;
    const msgDiv = document.createElement('div');
    msgDiv.className = `msg ${isMe ? 'me' : 'others'}`;
    msgDiv.innerHTML = `<strong>${data.user}</strong>: ${data.text} <br><small>${data.timestamp}</small>`;
    messagesDiv.appendChild(msgDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

// Listen for notifications
socket.on('notification', (text) => {
    const noteDiv = document.createElement('div');
    noteDiv.className = 'notification';
    noteDiv.innerText = text;
    messagesDiv.appendChild(noteDiv);
});
