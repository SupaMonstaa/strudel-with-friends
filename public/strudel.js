window.initStrudel();

function getEditorTrack() {
    var scriptElt = document.getElementById("script-editor");
    var trackElt = document.getElementById("track-editor");
    var script = scriptElt.value ?? '';
    var track = trackElt.value ?? '';
    return { script, track }
}

function sendTrack() {
    var code = getEditorTrack();
    console.log('sending track', code);
    socket.emit('message', { script: code.script, track: code.track });
}

function getCode(userId) {
    var code = '';
    if (userId === 'all') {
        var tracks = document.getElementsByClassName('track');
        var codes = [];
        for (let track of tracks) {
            var c = track.innerHTML;
            codes.push(c);
        }
        codes.join(',\n');
    } else if (!userId) {
        // me
        code = getEditorTrack()
    } else {
        var track = document.getElementById(userId);
        code = track.querySelector('.track').innerHTML;
    }
    return code;
}
var playMode = "";
function playTrack(userId) {
    playMode = userId;
    if (userId !== "editor") {
        var userIdClass = (userId === 'all') ? '' : (userId === 'all-editor' ? ":not(.me)" :  `#user-${userId}`);
        console.log("userIdClass", userIdClass);
        var tracksElt = document.getElementById("tracks-section");
        var scriptElts = tracksElt.querySelectorAll(`li${userIdClass}.active .script`);
        var trackElts = tracksElt.querySelectorAll(`li${userIdClass}.active .track`);
        console.log("trackElts", trackElts)
        var tracks = [];
        for (let track of trackElts) {
            var t = track.innerHTML;
            t ? tracks.push(t) : false;
        }
        var scripts = [];
        for (let script of scriptElts) {
            var s = script.innerHTML;
            s ? scripts.push(s) : false;
        }
        if (userId === 'all-editor') {
            // add the editor track
            var editor = getEditorTrack()
            editor.script ? scripts.push(editor.script) : false;
            editor.track ? tracks.push(editor.track) : false;
        }
        var c = {
            script: scripts.join("\n"),
            track: tracks.join(',\n')
        };
    } else {
        // userId = editor
        var c = getEditorTrack()
    }
    var code = `${c.script}
        stack(
          ${c.track}
        )`;
    console.log('playing track', code);
    evaluate(code);
}

function resumePlay() {
    if (playMode) {
        playTrack(playMode)
    }
}

async function stopTrack(userId) {
    playMode = "";
    console.log('stopping track');
    strudel.hush();
}

function getTune() {
    return `n("0 1 2 3 4 5 6 7").scale("g:minor")`;
}
