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

    playSource: function(source, opt) {
        var gainNode = SFX.context.createGain();

        var loop = false;
        var delay = 0;
        var gain = 1.0;

        if (opt) {
            loop = opt.loop || loop;
            delay = opt.delay || delay;
            gain = opt.gain || gain;
            source.onended = opt.onEnd;
        }

        source.loop = loop;
        gainNode.gain.value = gain;

        //Connect the source to the gain node and connect the gain node to the destination.
        //Source -> Gain -> Master Gain -> Destination
        source.connect(gainNode);
        gainNode.connect(SFX.master.gainNode);

        source.start(delay);
    },

    //Creates a unique source from buffer, plays it and returns it.
    playSound: function(buffer, opt) {
        var source = SFX.createSource(buffer);
        SFX.playSource(source, opt);
        return source;
    },

    stopSource: function(source, delay) {
        source.stop(delay);
    }
};

SFX.createSound = function(buffer, opt) {
    return new SFX.Sound(buffer, opt);
};

SFX.Sound = function(buffer, opt) {
    var source = SFX.createSource(buffer);
    var gainNode = SFX.context.createGain();
    var panNode = SFX.context.createPanner();

    function setOptions(opt, reconnect) {
        var loop = false;
        var gain = 1.0;

        if (opt) {
            if (opt.loop !== undefined) {
                loop = opt.loop;
            }
            gain = opt.gain || gain;
            source.onended = opt.onEnd;
        }

        source.loop = loop;
        gainNode.gain.value = gain;

        if (reconnect) {
            source.disconnect();
            gainNode.disconnect();
            panNode.disconnect();
        }

        //Connect the _source to the gain node and connect the gain node to the destination.
        //_source -> Gain -> Master Gain -> Destination
        source.connect(gainNode);
        if (opt && opt.pan) {
            gainNode.connect(panNode);
            panNode.connect(SFX.master.gainNode);
        } else {
            gainNode.connect(SFX.master.gainNode);
        }
    }

    setOptions(opt, false);

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

    Object.defineProperty(this, 'gain', {
        get: function() { return this.gainNode.gain.value; },
        set: function(val) { this.gainNode.gain.value = val; },
    });

    Object.defineProperty(this, 'onEnd', {
        get: function() { return this.source.onended; },
        set: function(val) { this.source.onended = val; },
    });

    this.play = function(delay, time) {
        this.source.start(delay || 0, time || 0);
    };

    this.playNew = function(delay, opt) {
        var newSound = SFX.createSound(this.source.buffer, opt || opt);
        newSound.play(delay);
        return newSound;
    };

    this.stop = function(delay) {
        this.source.stop(delay);
    };

    this.fade = function(type, rate, length, onComplete) {
        var setGain = setGain;
        var gainTarget = getGain();
        var timer = 0;
        var interval = setInterval(function() {
            timer += rate;

            var ratio = timer / (length * 1000);
            if (type === 'out') {
                ratio = (1 - ratio);
            }

            setGain(ratio * gainTarget);
        }, rate);

        setGain(type === 'in' ? 0 : gainTarget);

        setTimeout(function() {
            clearInterval(interval);
            setGain(type === 'in' ? gainTarget : 0);
            if (onComplete) {
                onComplete();
            }
        }, length * 1000);
    };

    this.setOptions = function(options) {
        opt = options;
        setOptions(opt, true);
    };

    this.getOptions = function() {
        return opt;
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
