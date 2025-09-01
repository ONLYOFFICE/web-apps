import {action, observable, makeObservable} from 'mobx';

export class storePresentationSettings {
    constructor() {
        makeObservable(this, {
            slideSizes: observable,
            currentPageSize: observable,
            slideSizeIndex: observable,
            allSchemes: observable,
            isLoopSlideshow: observable,
            changeSizeIndex: action,
            addSchemes: action,
            initSlideSizes: action,
            setLoopSlideshow: action
        })
    }

    slideSizes = [];
    currentPageSize;
    slideSizeIndex;
    isLoopSlideshow = false;

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

    setLoopSlideshow(value) {
        this.isLoopSlideshow = value;
    }

    getLoopSlideshow(slideObject) {
        let loop;
        if (slideObject) {
            loop = slideObject.get_transition().get_ShowLoop();
            this.setLoopSlideshow(loop);
        }
        return this.isLoopSlideshow;
    }

    // Color Schemes

    allSchemes;

    addSchemes(arr) {
        this.allSchemes = arr;
    }

}