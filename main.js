window.addEventListener('load', onLoad, false);

function onLoad() {
    SFX.createContext();

    var loader = SFX.createLoader();

    var test = loader.add('test.mp3');
    var test2 = loader.add('tests/walking/walk.mp3');

    loader.load(function() {
        var source = SFX.createSource(test.buffer);

        var sound = SFX.createSound(test.buffer, {
            gain: 0.1,
        });

        window.addEventListener('keydown', function() {
            console.log(source);
        });

        sound.play(0);

        sound.stop(0.5);

        SFX.playSound(test2.buffer,{gain:0.1});
    });
}
