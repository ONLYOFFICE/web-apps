import {action, observable, makeObservable} from 'mobx';

export class storePresentationSettings {
    constructor() {
        makeObservable(this, {
            slideSizes: observable,
            currentPageSize: observable,
            slideSizeIndex: observable,
            allSchemes: observable,
            changeSizeIndex: action,
            addSchemes: action,
            initSlideSizes: action
        })
    }

    slideSizes = [];
    currentPageSize;
    slideSizeIndex;

    changeSizeIndex(width, height) {
        this.currentPageSize = {width, height};
        let ratio = height / width;

        this.slideSizes.forEach((array, index) => {
            if(Math.abs(array[1] / array[0] - ratio) < 0.001) {
                this.slideSizeIndex = index;
            }
        });
    }

    initSlideSizes(value) {
        this.slideSizes = value;
    }

    // Color Schemes

    allSchemes;

    addSchemes(arr) {
        this.allSchemes = arr;
    }

}