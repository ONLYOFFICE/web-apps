
class CThumbnailLoader {
    constructor() {
        this.binaryFormat = null;
        this.data = null;
        this.width = 0;
        this.heightOne = 0;
    }

    load(url, callback) {
        if (!callback)
            return;

        let xhr = new XMLHttpRequest();
        xhr.open('GET', url + ".bin", true);
        xhr.responseType = 'arraybuffer';

        if (xhr.overrideMimeType)
            xhr.overrideMimeType('text/plain; charset=x-user-defined');
        else xhr.setRequestHeader('Accept-Charset', 'x-user-defined');

        xhr.onload = e => {
            // TODO: check errors
            this.binaryFormat = e.target.response;
            callback();
        };

        xhr.send(null);
    }

    #openBinary(arrayBuffer) {
        //var t1 = performance.now();

        const binaryAlpha = new Uint8Array(arrayBuffer);
        this.width      = (binaryAlpha[0] << 24) | (binaryAlpha[1] << 16) | (binaryAlpha[2] << 8) | (binaryAlpha[3] << 0);
        this.heightOne  = (binaryAlpha[4] << 24) | (binaryAlpha[5] << 16) | (binaryAlpha[6] << 8) | (binaryAlpha[7] << 0);
        const count     = (binaryAlpha[8] << 24) | (binaryAlpha[9] << 16) | (binaryAlpha[10] << 8) | (binaryAlpha[11] << 0);
        const height    = count * this.heightOne;

        this.data = new Uint8ClampedArray(4 * this.width * height);

        var binaryIndex = 12;
        var imagePixels = this.data;
        var index = 0;

        var len0 = 0;
        var tmpValue = 0;
        while (binaryIndex < binaryAlpha.length) {
            tmpValue = binaryAlpha[binaryIndex++];
            if (0 == tmpValue) {
                len0 = binaryAlpha[binaryIndex++];
                while (len0 > 0) {
                    len0--;
                    imagePixels[index] = imagePixels[index + 1] = imagePixels[index + 2] = 255;
                    imagePixels[index + 3] = 0; // this value is already 0.
                    index += 4;
                }
            } else {
                imagePixels[index] = imagePixels[index + 1] = imagePixels[index + 2] = 255 - tmpValue;
                imagePixels[index + 3] = tmpValue;
                index += 4;
            }
        }

        //var t2 = performance.now();
        //console.log(t2 - t1);
    };

    getImage = function(index, canvas, ctx) {
        //var t1 = performance.now();
        if (!canvas) {
            canvas = document.createElement("canvas");
            canvas.width = this.width;
            canvas.height = this.heightOne;
            canvas.style.width = iconWidth + "px";
            canvas.style.height = iconHeight + "px";

            ctx = canvas.getContext("2d");
        }

        if (!this.data) {
            this.#openBinary(this.binaryFormat);
            delete this.binaryFormat;
        }

        let dataTmp = ctx.createImageData(this.width, this.heightOne);
        const sizeImage = 4 * this.width * this.heightOne;
        dataTmp.data.set(new Uint8ClampedArray(this.data.buffer, index * sizeImage, sizeImage));
        ctx.putImageData(dataTmp, 0, 0);

        //var t2 = performance.now();
        //console.log(t2 - t1);

        return canvas;
    };
};

export default CThumbnailLoader;