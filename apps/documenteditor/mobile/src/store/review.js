import {action, observable, makeObservable} from 'mobx';

export class storeReview {
    constructor() {
        makeObservable(this, {
            displayMode: observable,
            dataChanges: observable,
            changeDisplayMode: action,
            changeArrReview: action
        });
    }

    displayMode = 'markup';

    changeDisplayMode (mode) {
        this.displayMode = mode;
    }

    dataChanges = [];

    changeArrReview (data) {
        this.dataChanges = data && data.length > 0 ? data : [];
    }
}