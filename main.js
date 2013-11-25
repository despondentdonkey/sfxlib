window.addEventListener('load', onLoad, false);

function onLoad() {
    SFX.createContext();

    SFX.loadSound('test.mp3', function(buffer) {
        var source = SFX.createSource(buffer);

        SFX.playSound(source, {
            volume: 0.2,

            onComplete: function() {
                console.log("done");
            }
        });
    });
}

//Temp namespace so we can easily refactor later when we come up with a name.
var SFX = {
    createContext: function() {
        window.AudioContext = window.AudioContext||window.webkitAudioContext;
        SFX.context = new AudioContext();
    },

    loadSound: function(url, onLoad) {
        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';

        // Decode asynchronously
        request.onload = function() {
            SFX.context.decodeAudioData(request.response, function(buffer) {
                if (onLoad) {
                    onLoad(buffer);
                }
            }, function(e) {
                console.error(e);
            });
        }

        request.send();
    },

    createSource: function(buffer) {
        var source = SFX.context.createBufferSource();
        source.buffer = buffer;
        return source;
    },

    playSound: function(source, opt) {
        var gainNode = SFX.context.createGain();

        var loop = false;
        var delay = 0;
        var volume = 1.0;

        if (opt) {
            loop = opt.loop || loop;
            delay = opt.delay || delay;
            volume = opt.volume || volume;
        }

        source.loop = loop || false;
        gainNode.gain.value = volume;

        //Connect the source to the gain node and connect the gain node to the destination.
        //Source -> Gain -> Destination
        source.connect(gainNode);
        gainNode.connect(SFX.context.destination);

        source.start(delay || 0);

        setTimeout(function() {
            if (opt && opt.onComplete) {
                opt.onComplete();
            }
        }, (source.buffer.duration + delay) * 1000);
    },

    stopSound: function(source, delay) {
        source.stop(delay);
    }
}
