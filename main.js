window.addEventListener('load', onLoad, false);

function onLoad() {
    SFX.createContext();

    SFX.loadSound('test.mp3', function(buffer) {
        var source = SFX.createSource(buffer);

        SFX.playSound(source, {
            gain: 0.1,

            onComplete: function() {
                console.log("done");
            }
        });
    });
}
