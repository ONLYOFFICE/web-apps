import {action, observable, computed} from 'mobx';

export class storeReview {
    @observable displayMode = 'markup';

    @action changeDisplayMode (mode) {
        this.displayMode = mode;
    }

    @observable dataChanges = [];

    @action changeArrReview (data) {
        this.dataChanges = data && data.length > 0 ? data : [];
    }
}