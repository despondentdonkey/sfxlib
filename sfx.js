//Temp namespace so we can easily refactor later when we come up with a name.
var SFX = {
    master: {}, //Global or master effect nodes.

    createContext: function() {
        window.AudioContext = window.AudioContext||window.webkitAudioContext;
        SFX.context = new AudioContext();

        SFX.master.gainNode = SFX.context.createGain();
        SFX.master.gainNode.connect(SFX.context.destination);
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
        var gain = 1.0;

        if (opt) {
            loop = opt.loop || loop;
            delay = opt.delay || delay;
            gain = opt.gain || gain;
        }

        source.loop = loop;
        gainNode.gain.value = gain;

        //Connect the source to the gain node and connect the gain node to the destination.
        //Source -> Gain -> Master Gain -> Destination
        source.connect(gainNode);
        gainNode.connect(SFX.master.gainNode);

        source.start(delay);

        source.onended = function() {
            if (opt && opt.onComplete) {
                opt.onComplete();
            }
        };
    },

    stopSound: function(source, delay) {
        source.stop(delay);
    }
}
