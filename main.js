//IIFE setup function.
var player;

(function () {
    var head = document.head;
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'thorvg-wasm.js';
    head.appendChild(script);

    script.onload = _ => {
        Module.onRuntimeInitialized = _ => {
            player = new Player();
        };
    };
})();

class Player
{
    render()
    {
        this.canvas = document.getElementById("p-canvas");
        var context = this.canvas.getContext('2d');
        var buffer = this.thorvg.render(this.canvas.width, this.canvas.height);
        var clampedBuffer = Uint8ClampedArray.from(buffer);
        var imageData = new ImageData(clampedBuffer, this.canvas.width, this.canvas.height);
        context.putImageData(imageData, 0, 0);

        document.getElementById("p-slider-cur").innerHTML = (Math.round(this.thorvg.getScale() * 100) / 100).toString();
        document.getElementById("p-slider-max").innerHTML = this.canvas.width + " x " +  this.canvas.height;
    }

    load(data)
    {
        console.log(data);
        this.thorvg.load(data);
        console.log("After loading from string");
    }

    handleFiles(files)
    {
        for (var i = 0, f; f = files[i]; i++) {
            if (f.type.includes('svg')) {
                var read = new FileReader();
                read.readAsText(f);
                read.onloadend = ()=> {
                    this.load(read.result);
                    this.render();
                }
                break;
            }
        }
    }

    constructor()
    {
        document.getElementById("p-slider").value = 25;
        layout(document.getElementById("p-slider").value / 100);

        this.thorvg = new Module.ThorvgWasm();
        this.render();

        document.getElementById("p-selector-btn").addEventListener('click', ()=>{document.getElementById("p-selector").click();});
        document.getElementById('p-selector').addEventListener('change', ()=>{this.handleFiles(document.getElementById('p-selector').files);});
        window.addEventListener('dragover', (evt)=>{
                                                evt.stopPropagation();
                                                evt.preventDefault();
                                                evt.dataTransfer.dropEffect = 'copy';
                                            }, false);
        window.addEventListener('drop', (evt)=>{
                                            evt.stopPropagation();
                                            evt.preventDefault();
                                            this.handleFiles(evt.dataTransfer.files);
                                        }, false);
    }
}

function layout(ratio) {
  var size;
  var width = document.getElementById("p-content").clientWidth;
  var height = document.getElementById("p-content").clientHeight;

  if (width < height)
    size = width;
  else
    size = height;

  size = size - 10; 
  size = size * ratio;

  if (size < 60 )
    size = 60;

  document.getElementById("p-canvas").width  = size;
  document.getElementById("p-canvas").height  = size;
  document.getElementById("p-content").style.padding = ((height - size) / 2).toString() + "px";
  document.getElementById("p-content").style.padding = ((width - size) / 2).toString() + "px";

}

function onResizeSliderDrag(value) {
  layout(value/100);
  player.render();
}
