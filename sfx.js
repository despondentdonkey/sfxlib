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
};

SFX.createSound = function(buffer, opt) {
    return new SFX.Sound(buffer, opt);
};

SFX.Sound = function(buffer, opt) {
    var source = SFX.createSource(buffer);
    var gainNode = SFX.context.createGain();
    var panNode = SFX.context.createPanner();
    var options = opt;

    Object.defineProperty(this, 'source', {
        get: function() { return source; },
    });

    Object.defineProperty(this, 'gainNode', {
        get: function() { return gainNode; },
    });

    Object.defineProperty(this, 'panNode', {
        get: function() { return panNode; },
    });

    Object.defineProperty(this, 'loop', {
        get: function() { return this.source.loop; },
        set: function(val) { this.source.loop = val; },
    });

    Object.defineProperty(this, 'loopStart', {
        get: function() { return this.source.loopStart; },
        set: function(val) { this.source.loopStart = val; },
    });

    Object.defineProperty(this, 'loopEnd', {
        get: function() { return this.source.loopEnd; },
        set: function(val) { this.source.loopEnd = val; },
    });

    Object.defineProperty(this, 'gain', {
        get: function() { return this.gainNode.gain.value; },
        set: function(val) { this.gainNode.gain.value = val; },
    });

    Object.defineProperty(this, 'onEnd', {
        get: function() { return this.source.onended; },
        set: function(val) { this.source.onended = val; },
    });

    Object.defineProperty(this, 'options', {
        get: function() { return options; },
        set: function(val) {
            options = val;
            setOptions(this, options, true);
        },
    });

    function setOptions(sound, opt, reconnect) {
        var loop = false;
        var gain = 1.0;

        if (opt) {
            if (opt.loop !== undefined) {
                loop = opt.loop;
            }
            gain = opt.gain || gain;
            sound.onEnd = opt.onEnd;
        }

        sound.loop = loop;
        sound.gain = gain;

        if (reconnect) {
            sound.source.disconnect();
            sound.gainNode.disconnect();
            sound.panNode.disconnect();
        }

        //Connect the _source to the gain node and connect the gain node to the destination.
        //_source -> Gain -> Master Gain -> Destination
        sound.source.connect(sound.gainNode);
        if (opt && opt.pan) {
            sound.gainNode.connect(sound.panNode);
            sound.panNode.connect(SFX.master.gainNode);
        } else {
            sound.gainNode.connect(SFX.master.gainNode);
        }
    }

    setOptions(this, this.options, false);

    this.play = function(delay, time) {
        this.source.start(delay || 0, time || 0);
    };

    this.playNew = function(delay, time, opt) {
        var newSound = SFX.createSound(this.source.buffer, opt || this.options);
        newSound.play(delay, time);
        return newSound;
    };

    this.stop = function(delay) {
        this.source.stop(delay);
    };

    this.fade = function(type, rate, length, onComplete) {
        var sound = this;
        var gainTarget = this.gain;
        var timer = 0;
        var interval = setInterval(function() {
            timer += rate;

            var ratio = timer / (length * 1000);
            if (type === 'out') {
                ratio = (1 - ratio);
            }

            sound.gain = (ratio * gainTarget);
        }, rate);

        this.gain = (type === 'in' ? 0 : gainTarget);

        setTimeout(function() {
            clearInterval(interval);
            sound.gain = (type === 'in' ? gainTarget : 0);
            if (onComplete) {
                onComplete();
            }
        }, length * 1000);
    };
};

//Used to load multiple sounds.
SFX.createLoader = function() {
    var holders = [];
    var loaded = 0;

    return {
        add: function(path) {
            var holder = {path: path};
            holders.push(holder);
            return holder;
        },

        //Loads all the sound paths added and fills 'buffer' in the holder object. Specify a callback function to continue after the sounds have been loaded.
        load: function(callback) {
            var onLoad = this.onLoad;

            for (var i=0; i<holders.length; i++) {
                var holder = holders[i];
                (function(holder) { //Requires an anonymous function since holder is used in another callback.
                    SFX.loadSound(holder.path, function(buffer) {
                        holder.buffer = buffer;

                        loaded++;

                        //Meant to be overidden. Gives you the ratio of sounds loaded.
                        if (onLoad) {
                            onLoad(loaded / holders.length);
                        }

                        if (loaded >= holders.length) {
                            callback();
                        }
                    });
                })(holder);
            }
        }
    };
};
