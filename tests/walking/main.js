window.addEventListener('load', onLoad, false);

function onLoad() {
    SFX.createContext();

    SFX.loadSound('walk.mp3', function(buffer) {
        var canvas = document.createElement('canvas');
        var gc = canvas.getContext('2d');
        var srcImg = document.getElementById('img');
        var slices = [];

        var anim = document.createElement('img');
        var speedSlider = document.getElementById('speed');
        var speedValSpan = document.getElementById('speedVal');
        var index = 1;

        canvas.width = srcImg.width/7;
        canvas.height = srcImg.height;

        //Slice image for animation
        for (var i=0; i<=7; ++i) {
            gc.drawImage(srcImg, i * canvas.width, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
            slices[i] = canvas.toDataURL();
            canvas.width = canvas.width;
        }

        document.body.appendChild(anim);

        //Increments the index, sets the new image for the animation, plays the walk sound on index 2 and 5, and updates everything else.
        function walk() {
            anim.src = slices[index];

            //Update the index and reset if necessary.
            index++;
            if (index >= 7) {
                index = 1;
            }

            //This is specific to each sprite sheet. On this particular sprite sheet the indices 2 and 5 look like they should give a walk sound.
            if (index === 2 || index === 5) {
                var source = SFX.createSource(buffer);
                SFX.playSound(source, {
                    gain: 0.1,
                });
            }

            speedValSpan.innerHTML = speedSlider.value;
            setTimeout(walk, speedSlider.value);
        }
        walk();
    });
}
