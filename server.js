const path = require("path");
const http = require("http"); //<--this is used by express under the hood, but we'll need to access directly
const express = require("express");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages")
const { userJoin, getCurrentUser, userLeave, getRoomUsers} = require("./utils/users")

// Initialize express
const app = express ();
// set static folder 
app.use(express.static(path.join(__dirname, "public")))

// botName (server message)
const botName = 'ChatCord Bot'

// Define PORT
const PORT = process.env.PORT || 3000;
const server = http.createServer(app) //<--- pass in express app to server (which we need because we're accessing http^^)
const io = socketio(server); //<---we initialize a variable and pass in the server (now we can run socket.io when client connects)

// ===== Run when client connects ====
io.on('connection', socket =>{

    socket.on('joinRoom', ({ username, room })=>{

        const user = userJoin(socket.id, username, room); //<--- assigning socket id as user id through userJoin method defined in users.js

        socket.join(user.room)
        
        socket.emit('message', formatMessage(botName, 'Welcome to ChatCord!'))//<---- first parameter can be named whatever you want, second is the emitted message
        // Broadcast when a user connects (broadcast.emit emits to all users except the user causing the emit)
        socket.broadcast.to(user.room)
        .emit(
            'message',
            formatMessage(botName, `${user.username} has joined the chat...`)
            );

        // Send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })
    })
    // Listen for chatMessage
    socket.on('chatMessage', msg=>{
        const user = getCurrentUser(socket.id);
        console.log(user + "line 47 server.js");
        io.emit('message', formatMessage(user.username, msg));
    })
     // Runs when client disconnects (DISCONNECT MUST BE CONTAINED INSIDE OF THE OVERALL CONNECTION FUNCTION)
     socket.on('disconnect', () =>{
        const user = userLeave(socket.id);

        if(user){
            io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat...`));
            // Send users and room info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
        })
        }

    })
})



// Start server, and notify if connected 
server.listen(PORT, () => console.log(`Server running on port ${PORT}`)); //<---- has to be server.listen because we're using http and passing in our express app

