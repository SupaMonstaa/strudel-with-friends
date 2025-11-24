import { decode, encode } from '/html-entities/index.js'

window.initStrudel({
    prebake: () => samples('github:tidalcycles/dirt-samples')
});

export function getEditorTrack() {
  var scriptElt = document.getElementById('script-editor')
  var trackElt = document.getElementById('track-editor')
  var script = scriptElt.value ?? ''
  var track = trackElt.value ?? ''
  return { script, track }
}

var playMode = ''
export function playTrack(userId) {
    playMode = userId;
    const trackCode = buildTrackCode(userId);
    console.log("evaluate", trackCode)
    evaluate(trackCode)
    .then(msg => console.log(msg))
    .catch(msg => console.warn(msg))
}
function buildTrackCode(userId) {
  if (userId !== 'editor') {
    var userIdClass =
      userId === 'all'
        ? ''
        : userId === 'all-editor'
        ? ':not(.me)'
        : `#user-${userId}`
    console.log('userIdClass', userIdClass)
    var tracksElt = document.getElementById('tracks-section')
    var scriptElts = tracksElt.querySelectorAll(
      `li${userIdClass}.active .script`
    )
    var trackElts = tracksElt.querySelectorAll(`li${userIdClass}.active .track`)
    console.log('trackElts', trackElts)
    var tracks = []
    for (let track of trackElts) {
      var t = track.innerHTML
      t ? tracks.push(decode(t)) : false
    }
    var scripts = []
    for (let script of scriptElts) {
      var s = script.innerHTML
      s ? scripts.push(decode(s)) : false
    }
    if (userId === 'all-editor') {
      // add the editor track
      var editor = getEditorTrack()
      editor.script ? scripts.push(editor.script) : false
      editor.track ? tracks.push(editor.track) : false
    }
    var c = {
      script: scripts.join('\n'),
      track: tracks.join(',\n'),
    }
  } else {
    // userId = editor
    var c = getEditorTrack()
  }
  var code = `${c.script}
        stack(
          ${c.track}
        )`
  console.log('playing track', code)
  return code
}

export function resumePlay() {
  if (playMode) {
    playTrack(playMode)
  }
}

export function stopTrack(userId) {
  playMode = ''
  console.log('stopping track')
  strudel.hush()
}

export function getTune() {
    // "<0 9 0 7 4 0 3 2>*16".scale("g:minor").transpose(12).note(),
//"<0 0 0 0 7 7 9 9>*8"
//.scale("g:minor").transpose(-12).note().sound("sawtooth"),
//s("bd ~ sd ~ bd ~ sd [~ ~ ~ hh:2] ,<hh hh hh hh>*16").bank("808")
    return `n("<0 4 0 9 7 0 3 2>*16").scale("g:minor"),\ns("<bd hh sd hh>*8")`;
}

export function checkTrack() {
  const trackCode = buildTrackCode('editor')
  //var msg = estimate(trackCode)
  //console.log(msg);
  return true // msg === true;
}

export function createTrack(user, me) {
  console.log('creating track for', user.userId)
  // check if track already exists
  var trackElt = document.getElementById(`user-${user.userId}`)
  if (trackElt) {
    fillTrack(user.userId, user.script, user.track)
  } else {
    // create new track
    var trackElt = document.createElement('li')
    trackElt.id = `user-${user.userId}`
    trackElt.innerHTML = `
        <div class="section-header">
            <div class='user'>${user.userId}'s track</div>
            <div class='buttons'>
                <button class="play" onclick="swf.playTrack('${user.userId}')">Play</button>
                <button class="stop" onclick="swf.stopTrack('${user.userId}')">Stop</button>
                <button class="mute" onclick="swf.mute('${user.userId}')">Mute</button>
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

export function fillEditor(script, track) {
    if (script) {
        const scriptElt = document.getElementById('script-editor');
        scriptElt.innerHTML = script;
    }
    if (track) {
        const trackElt = document.getElementById('track-editor');
        trackElt.innerHTML = track;
    }
}

export function fillTrack(userId, script, track) {
  var trackElt = document.getElementById(`user-${userId}`)
  console.log('fillTrack', userId, script, track)
  trackElt.querySelector('.script').innerHTML = encode(script)
  trackElt.querySelector('.track').innerHTML = encode(track)
  // a change occurs : play it !
  resumePlay()
}
export function destroyTrack(userId) {
  var track = document.getElementById(`user-${userId}`)
  if (track) {
    track.remove()
  }
}
