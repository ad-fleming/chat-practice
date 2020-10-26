
// SOCKET IO works by sending events back and forth between client and server
// It's like an open door
// We can 'emit' events back and forth

const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users')

// Get Username and room from URL
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})

const socket = io(); // We have access to io from the script tag in chat html

socket.emit('joinRoom', { username, room })

// Get Room and Users

socket.on('roomUsers', ({ room, users })=>{
    outputRoomName(room);
    outputUsers(users);
})

// Message from server
socket.on('message', message =>{//<---we name the parameter whatever it is named on server-side (THIS SHOULD CATCH ALL OF THE possibilities in the io.on("connection") portion)
    console.log(message)
    outputMessage(message);

    // Scroll down when message is added to Dom
    chatMessages.scrollTop =  chatMessages.scrollHeight //<---this will automatically scroll to the bottom
})

// Message submit
chatForm.addEventListener('submit', (e)=>{
    e.preventDefault();

    // Get message by accessing the target element->element of 'msg' (which his the id) and taking the value
    const msg = e.target.elements.msg.value;

    // Emitting a message to the server
    socket.emit('chatMessage', msg);

    // Clear input
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
})


// Output message to DOM

function outputMessage(message){
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`;
    document.querySelector('.chat-messages').appendChild(div);
}

// Add room name to Dom

function outputRoomName(room) {
    roomName.innerText = room;
}

// Add users to Dom

function outputUsers(users){
    userList.innerHTML = `
        ${users.map(user => `<li>${user.username}</li>`).join('')}
    `
}