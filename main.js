window.addEventListener('load', onLoad, false);

function onLoad() {
    SFX.createContext();

    var loader = SFX.createLoader();

    var test = loader.add('test.mp3');
    var test2 = loader.add('tests/walking/walk.mp3');

    loader.load(function() {
        var sound = SFX.createSound(test.buffer, {
            gain: 0.1,
        });

        var walkSound = SFX.createSound(test2.buffer, {
            gain: 0.1,
        });

        sound.play(0);
        sound.stop(0.5);

        walkSound.playNew(0.5);
        walkSound.playNew(0.1);
    });
}
