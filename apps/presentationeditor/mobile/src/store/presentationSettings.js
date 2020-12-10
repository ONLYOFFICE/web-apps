import {action, observable, computed} from 'mobx';

export class storePresentationSettings {
    @observable widthSlide;
    @observable heightSlide;
    @observable slideSize = 0;

    @action changeSlideSize(width, height) {
        this.widthSlide = width;
        this.heightSlide = height;
    }

    getSlideSizes() {
        const slideSizeArr = [[254, 190.5], [254, 143]];
        return slideSizeArr;
    }

    @action changeSlideFormat(value) {
        this.slideSize = value;
    }

    @computed get pageSizesIndex() {
        const slideSizes = this.getSlideSizes();
        let ind = -1;

        slideSizes.forEach((size, index) => {
            if(Math.abs(size[0] - this.widthSlide) < 0.001 && Math.abs(size[1] - this.heightSlide) < 0.001) {
               ind = index;
            }
        });

        if (ind === -1) {
            ind = -1;
        }

        return ind;
    }
}