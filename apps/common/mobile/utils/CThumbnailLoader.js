
class CThumbnailLoader {
    constructor() {
        this.image = null;
        this.binaryFormat = null;
        this.data = null;
        this.width = 0;
        this.heightOne = 0;
        this.offsets = null;
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
            this.binaryFormat = new Uint8Array(e.target.response);
            callback();
        };

        xhr.send(null);
    }

    openBinary(arrayBuffer) {
        //var t1 = performance.now();

        const binaryAlpha = this.binaryFormat;
        this.width      = (binaryAlpha[0] << 24) | (binaryAlpha[1] << 16) | (binaryAlpha[2] << 8) | (binaryAlpha[3] << 0);
        this.heightOne  = (binaryAlpha[4] << 24) | (binaryAlpha[5] << 16) | (binaryAlpha[6] << 8) | (binaryAlpha[7] << 0);
        const count     = (binaryAlpha[8] << 24) | (binaryAlpha[9] << 16) | (binaryAlpha[10] << 8) | (binaryAlpha[11] << 0);
        const height    = count * this.heightOne;

        const MAX_MEMORY_SIZE = 100000000;
        const memorySize = 4 * this.width * height;
        const isOffsets = memorySize > MAX_MEMORY_SIZE;

        if (!isOffsets)
            this.data = new Uint8ClampedArray(memorySize);
        else this.offsets = new Array(count);

        var binaryIndex = 12;
        var binaryLen = binaryAlpha.length;
        var index = 0;

        var len0 = 0;
        var tmpValue = 0;

        if (!isOffsets) {
            var imagePixels = this.data;
            while (binaryIndex < binaryLen) {
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
        } else {
            var module = this.width * this.heightOne;
            var moduleCur = module - 1;
            while (binaryIndex < binaryLen) {
                tmpValue = binaryAlpha[binaryIndex++];
                if (0 == tmpValue) {
                    len0 = binaryAlpha[binaryIndex++];
                    while (len0 > 0) {
                        len0--;
                        moduleCur++;
                        if (moduleCur === module) {
                            this.offsets[index++] = { pos : binaryIndex, len : len0 + 1 };
                            moduleCur = 0;
                        }
                    }
                } else {
                    moduleCur++;
                    if (moduleCur === module) {
                        this.offsets[index++] = { pos : binaryIndex - 1, len : -1 };
                        moduleCur = 0;
                    }
                }
            }
        }

        if ( !this.offsets )
            delete this.binaryFormat;

        //var t2 = performance.now();
        //console.log(t2 - t1);
    };

    getImage = function(index, canvas, ctx) {
        if (!canvas) {
            canvas = document.createElement("canvas");
            canvas.width = this.width;
            canvas.height = this.heightOne;
            canvas.style.width = iconWidth + "px";
            canvas.style.height = iconHeight + "px";

            ctx = canvas.getContext("2d");
        }

        if (!this.data && !this.offsets) {
            this.openBinary(this.binaryFormat);
        }

        let dataTmp = ctx.createImageData(this.width, this.heightOne);
        const sizeImage = 4 * this.width * this.heightOne;

        if (!this.offsets) {
            dataTmp.data.set(new Uint8ClampedArray(this.data.buffer, index * sizeImage, sizeImage));
        } else {
            const binaryAlpha = this.binaryFormat;
            var binaryIndex = this.offsets[index].pos;
            var alphaChannel = 0;
            var pixelsCount = this.width * this.heightOne;
            var tmpValue = 0, len0 = 0;
            let imagePixels = dataTmp.data;
            if (-1 != this.offsets[index].len) {
                /*
                // this values is already 0.
                for (var i = 0; i < this.offsets[index].len; i++) {
                    pixels[alphaChannel] = 0;
                    alphaChannel += 4;
                }
                */
                alphaChannel += 4 * this.offsets[index].len;
            }
            while (pixelsCount > 0) {
                tmpValue = binaryAlpha[binaryIndex++];
                if (0 == tmpValue) {
                    len0 = binaryAlpha[binaryIndex++];
                    if (len0 > pixelsCount)
                        len0 = pixelsCount;
                    while (len0 > 0) {
                        len0--;
                        imagePixels[alphaChannel] = imagePixels[alphaChannel + 1] = imagePixels[alphaChannel + 2] = 255;
                        imagePixels[alphaChannel + 3] = 0; // this value is already 0.
                        alphaChannel += 4;
                        pixelsCount--;
                    }
                } else {
                    imagePixels[alphaChannel] = imagePixels[alphaChannel + 1] = imagePixels[alphaChannel + 2] = 255 - tmpValue;
                    imagePixels[alphaChannel + 3] = tmpValue;
                    alphaChannel += 4;
                    pixelsCount--;
                }
            }
        }
        ctx.putImageData(dataTmp, 0, 0);

        //var t2 = performance.now();
        //console.log(t2 - t1);

        return canvas;
    };
};

export default CThumbnailLoader;