import {action, observable} from 'mobx';

export class storePresentationSettings {
    
    @observable slideSizeIndex;

    get getSlideSizes() {
        return [[254, 190.5], [254, 143]];
    }

    @action changeSizeIndex(value) {
        this.slideSizeIndex = +value;
    }

    // Color Schemes

    @observable allSchemes;

    @action addSchemes(arr) {
        this.allSchemes = arr;
    }

}