import {action, observable} from 'mobx';

export class storePresentationSettings {
    slideSize = [[254, 190.5], [254, 143]];
    @observable slideSizeIndex;

    get getSlideSizes() {
        return this.slideSize;
    }

    @action changeSizeIndex(width, height) {
        this.slideSize.forEach((array, index) => {
            if(Math.abs(array[0] - width) < 0.001 && Math.abs((array[1] - height)) < 0.001) {
                this.slideSizeIndex = index;
            }
        })
    }

    // Color Schemes

    @observable allSchemes;

    @action addSchemes(arr) {
        this.allSchemes = arr;
    }

}