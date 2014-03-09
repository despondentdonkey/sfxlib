window.addEventListener('load', onLoad, false);

function onLoad() {
    SFX.createContext();

    var loader = SFX.createLoader();

    var test = loader.add('test.mp3');
    var test2 = loader.add('tests/walking/walk.mp3');

    loader.load(function() {
        var source = SFX.createSource(test.buffer);

        window.addEventListener('keydown', function() {
            console.log(source);
        });

        SFX.playSource(source, {
            gain: 1,
            loop: true,

            onEnd: function() {
                console.log("done");
            }
        });

        SFX.playSound(test2.buffer,{gain:0.1});

        SFX.stopSource(source, 1);
    });
}
