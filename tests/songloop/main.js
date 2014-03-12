window.addEventListener('load', onLoad, false);

function onLoad() {
    SFX.createContext();

    SFX.loadSound('song.ogg', function(buffer) {
        var sound = SFX.createSound(buffer, {
            loop: true,
        });
        sound.loopStart = 5.887;
        sound.loopEnd = sound.source.buffer.duration;
        sound.play();
    });
}
