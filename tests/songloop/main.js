window.addEventListener('load', onLoad, false);

function onLoad() {
    SFX.createContext();

    SFX.loadSound('intro.ogg', function(buffer) {
        var introSource = SFX.createSource(buffer);

        SFX.loadSound('loop.ogg', function(buffer) {
            var loopSource = SFX.createSource(buffer);
            SFX.playSource(introSource, {
                gain: 0.1,
                onEnd: function() {
                    SFX.playSource(loopSource, {
                        gain: 0.1,
                        loop: true
                    });
                }
            });
        })
    });
}
