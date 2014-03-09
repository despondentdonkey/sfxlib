window.addEventListener('load', onLoad, false);

function onLoad() {
    SFX.createContext();

    SFX.loadSound('test.mp3', function(buffer) {
        var source = SFX.createSource(buffer);

        SFX.playSource(source, {
            gain: 0.1,
            loop: true,

            onEnd: function() {
                console.log("done");
            }
        });

        SFX.stopSource(source, 1);
    });
}
