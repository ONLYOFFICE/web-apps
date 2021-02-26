import {action, observable} from 'mobx';

export class storePresentationSettings {
    @observable slideSizes = [
        [9144000, 6858000, Asc.c_oAscSlideSZType.SzScreen4x3], 
        [12192000, 6858000, Asc.c_oAscSlideSZType.SzCustom]
    ];

    @observable currentPageSize;
    @observable slideSizeIndex;

    @action changeSizeIndex(width, height) {
        this.currentPageSize = {width, height};
        let ratio = height / width;

        this.slideSizes.forEach((array, index) => {
            if(Math.abs(array[1] / array[0] - ratio) < 0.001) {
                this.slideSizeIndex = index;
            }
        });
    }

    // Color Schemes

    @observable allSchemes;

    @action addSchemes(arr) {
        this.allSchemes = arr;
    }

}