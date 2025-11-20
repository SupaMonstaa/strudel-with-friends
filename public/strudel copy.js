
import { controls, repl, evalScope } from 'https://cdn.skypack.dev/@strudel/core@0.11.0';
import { mini } from 'https://cdn.skypack.dev/@strudel/mini@0.11.0';
import { transpiler } from 'https://cdn.skypack.dev/@strudel/transpiler@0.11.0';
import {
    getAudioContext,
    webaudioOutput,
    initAudioOnFirstClick,
    registerSynthSounds,
} from 'https://cdn.skypack.dev/@strudel/webaudio@0.11.0';

const ctx = getAudioContext();
const input = document.getElementById('track-editor');
input.innerHTML = getTune();

const loadModules = evalScope(
    controls,
    import('https://cdn.skypack.dev/@strudel/core@0.11.0'),
    import('https://cdn.skypack.dev/@strudel/mini@0.11.0'),
    import('https://cdn.skypack.dev/@strudel/tonal@0.11.0'),
    import('https://cdn.skypack.dev/@strudel/webaudio@0.11.0'),
);
async function playTrack(userId) {
    if (userId === 'all') {
        var tracks = document.getElementsByClassName('track');
        var codes = [];
        for (let track of tracks) {
            var c = track.innerHTML;
            codes.push(c);
        }
        var code = codes.join(',\n');
        console.log('playing all tracks', code);
    } else if (!userId) {
        var track = document.getElementById("track-editor");
        var code = track.value;
    } else {
        var track = document.getElementById(userId);
        var code = track.querySelector('.track').innerHTML;
    }
    code = `samples('github:tidalcycles/dirt-samples');\nstack(${code})`;
    console.log('playing track', userId, code);
    await loadModules;
    await initAudio;
    evaluate(code);
}

async function stopTrack(userId) {
    console.log('stopping track');
    await loadModules;
    await initAudio;
    hush()
}

const initAudio = Promise.all([initAudioOnFirstClick(), registerSynthSounds()]);

const { evaluate } = repl({
    defaultOutput: webaudioOutput,
    getTime: () => ctx.currentTime,
    transpiler,
});

function getTune() {
    return `n("0 1 2 3 4 5 6 7").scale("g:minor")`;
}

export { playTrack, stopTrack };