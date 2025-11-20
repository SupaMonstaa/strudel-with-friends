var hash = window.location.hash;
if (hash) {
    hash = hash.substring(1);
}
var socket = io("", { query: "userid=" + hash });
socket.connect();

var messages = document.getElementById('messages');
var tracks = document.getElementById('tracks');
var users = [];
var myUserId = "";

// I connected, the server returns the list of all other users
socket.on("connected", function ({ userId, users }) {
    window.location.hash = userId;
    myUserId = userId;
    console.log("connected", userId, users);
    users.forEach(user => {
        console.log("create User ", user.userId);
        createTrack(user, user.userId === myUserId);
        var item = document.createElement('li');
        item.className = (user.userId === myUserId) ? 'me' : '';
        item.textContent = `connected as ${user.userId}`;
        messages.appendChild(item);
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
    // add a message
    var item = document.createElement('li');
    item.textContent = user.userId + ' joined';
    messages.appendChild(item);
    //window.scrollTo(0, document.body.scrollHeight);
});

socket.on('user disconnected', function (userId) {
    console.log('user disconnected', userId);
    users = users.filter(u => u !== userId);
    destroyTrack(userId);
    var item = document.createElement('li');
    item.textContent = userId + ' left';
    messages.appendChild(item);
    //window.scrollTo(0, document.body.scrollHeight);
});

// receive message from other user
socket.on('message', function ({ userId, script, track }) {
    console.log('message', userId, script, track);
    var item = document.createElement('li');
    if (myUserId === userId) {
        item.className = 'me';
        item.textContent = `${userId}(me) : update`;
    } else {
        item.className = '';
        item.textContent = `${userId}: update`;
    }
    messages.appendChild(item);
    fillTrack(userId, script, track);
    //window.scrollTo(0, document.body.scrollHeight);
});

function createTrack(user, me) {
    console.log('creating track for', user.userId);
    // check if track already exists
    var trackElt = document.getElementById(`user-${user.userId}`);
    if (trackElt) {
        fillTrack(user.userId, user.script, user.track);
    } else {
        // create new track
        var trackElt = document.createElement('li');
        trackElt.id = `user-${user.userId}`;
        trackElt.innerHTML = `
        <div class="section-header">
            <div class='user'>${user.userId}'s track</div>
            <div class='buttons'>
                <button class="play" onclick="playTrack('${user.userId}')">Play</button>
                <button class="stop" onclick="stopTrack('${user.userId}')">Stop</button>
                <button class="mute" onclick="mute('${user.userId}')">Mute</button>
            </div>
        </div>
        <div class='script'>${user.script}</div>
        <div class='track'>${user.track}</div>`;
        trackElt.classList.add("track", "active");
        if (me) {
            trackElt.classList.add('me');
        }
        tracks.appendChild(trackElt);
    }
    return trackElt;
}
function fillTrack(userId, script, track) {
    var trackElt = document.getElementById(`user-${userId}`)
    console.log("fillTrack", userId, script, track)
    trackElt.querySelector('.script').innerHTML = script;
    trackElt.querySelector('.track').innerHTML = track;
    // a change occurs : play it !
    resumePlay()
}
function destroyTrack(userId) {
    var track = document.getElementById(`user-${userId}`);
    if (track) {
        track.remove();
    }
}
function mute(userId) {
    var trackId = `user-${userId}`;
    var trackElt = document.getElementById(trackId);
    trackElt.classList.toggle("active");
}