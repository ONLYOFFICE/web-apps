import {action, observable} from 'mobx';

export class storePresentationSettings {
    @observable slideSize = [];
    @observable slideSizeValue;

    get getSlideSizes() {
        return [[254, 190.5], [254, 143]];
    }

    @action changeSlideSize(width, height) {
        this.slideSize[0] = width;
        this.slideSize[1] = height;
    }

    @action changeSlideFormat(value) {
        this.slideSizeValue = +value;
    }

    // Color Schemes

    @observable allSchemes;

    @action addSchemes(arr) {
        this.allSchemes = arr;
    }

}