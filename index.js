const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
app.use(express.static('public'));
app.get('/', (req, res) => {
    console.log('serving index.html');
    res.sendFile(__dirname + '/index.html');
});

// html entities for front
app.use('/html-entities/', express.static(__dirname + '/node_modules/html-entities/dist/esm/'));


const { Server } = require("socket.io");
const io = new Server(server);

// middleware to get the data of a potentiol user reconnexion
io.use(function (socket, next) {
    var handshakeData = socket.request;
    console.log("handshake", handshakeData._query);
    if (handshakeData._query.userid) {
         socket.data = {userId : handshakeData._query.userid};
    }
    console.log("user id reconnection", {userId : handshakeData._query.userid});
    next();
});

const users = [];
const sockets = {}
var userCpt = 0;
io.on('connection', (socket) => {
    var userId = "";
    var currentUser = null;
    console.log("socket.data", socket.data);
    // create new user in array if not already present
    if (socket.data.userId) {
        // reconnection
        userId = socket.data.userId;
        console.log('user is back', userId);
        if (getUser(userId)) {
            currentUser = getUser(userId)
            // cancel the deletion
            cancelUserDeletion(userId)
        }
    } else {
        // new user
        userCpt++;
        userId = Math.random().toString(36).substring(2, 12) + parseInt(userCpt);
        console.log('new user', userId);
    }
    if (!currentUser) {
        currentUser = { userId: userId, script: "", track: "" };
        users.push(currentUser);
    }
         // notice everyone else
    socket.broadcast.emit('user connected', currentUser);
    console.log(users);
    sockets[userId] = socket;
    // notice user that he is connected
    socket.emit('connected', { userId, users });

    // receive a user message
    socket.on('message', (msg) => {
        console.log('message: ', msg);
        currentUser.script = msg.script;
        currentUser.track = msg.track;

        socket.emit('message', currentUser);
        socket.broadcast.emit('message', currentUser);
    });

    // disconnect
    socket.on('disconnect', () => {
        // if a previous deletion was scheduled, cancel it
        cancelUserDeletion(userId);
        // schedule the deletion
        socket.data.removeTimeout = setTimeout(() => {
            removeUser(socket, userId)
        }, 2000);
    });
});

function getUser(userId) {
    return users.find((u) => u.userId === userId);
}
function removeUser(socket, userId) {
    users.forEach((user, index, arr) => {
        if(user.userId === userId) {
            arr.splice(index, 1)
        }
    })
    delete sockets[userId];
    console.log('user disconnected', userId, users);
    socket.broadcast.emit('user disconnected', userId);
}

function cancelUserDeletion(userId) {
    if (sockets[userId] && sockets[userId].data.removeTimeout) {
        clearTimeout(sockets[userId].data.removeTimeout)
    }
}
server.listen(3000, () => {
    console.log('listening on *:3000');
});