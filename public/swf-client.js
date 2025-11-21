import { io } from "/socket.io/socket.io.esm.min.js";
import {
    getEditorTrack,
    playTrack as pTrack,
    resumePlay as rTrack,
    stopTrack as sTrack,
    getTune as gTune,
    createTrack,
    fillTrack,
    checkTrack,
    destroyTrack
} from './strudel-utils.js';

import {
    setMyUserId,
    add as addMsg
} from './msg-utils.js'

export function playTrack(userId) {
    return pTrack(userId)
}
export function resumePlay() {
    return rTrack()
}
export function stopTrack(userId) {
    return sTrack(userId)
}
export function getTune() {
    return gTune()
}

var hash = window.location.hash;
if (hash) {
    hash = hash.substring(1);
}
var socket = io("", { query: "userid=" + hash });
socket.connect();

var tracks = document.getElementById('tracks');
var users = [];
var myUserId = "";

export function sendTrack() {
    var check = checkTrack("editor");
    console.log(check)
    var code = getEditorTrack();
    console.log('sending track', code);
    socket.emit('message', { script: code.script, track: code.track });
}

// I connected, the server returns the list of all other users
socket.on("connected", function ({ userId, users }) {
    window.location.hash = userId;
    myUserId = userId;
    setMyUserId(myUserId)
    console.log("connected", userId, users);
    users.forEach(user => {
        console.log("create User ", user.userId);
        createTrack(user, user.userId === myUserId);
        addMsg( user.userId, "connected");
    })
})

// new user
socket.on('user connected', function (user) {
    if (users.includes(user.userId)) {
        return;
    }
    users.push(user.userId);
    console.log('user connected', user.userId);
    // add a track
    createTrack(user, false);
    addMsg(user.userId, "joined");
    //window.scrollTo(0, document.body.scrollHeight);
});

socket.on('user disconnected', function (userId) {
    console.log('user disconnected', userId);
    users = users.filter(u => u !== userId);
    destroyTrack(userId);
    addMsg(userId, "bye !")
});

// receive message from other user
socket.on('message', function ({ userId, script, track }) {
    console.log('message', userId, script, track);
    addMsg("update")
    fillTrack(userId, script, track);
    //window.scrollTo(0, document.body.scrollHeight);
});

export function mute(userId) {
    var trackId = `user-${userId}`;
    var trackElt = document.getElementById(trackId);
    trackElt.classList.toggle("active");
}