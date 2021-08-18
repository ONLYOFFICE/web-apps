import {action, observable, makeObservable} from 'mobx';

export class storeToolbarSettings {
    constructor() {
        makeObservable(this, {
            isCanUndo: observable,
            setCanUndo: action,
            isCanRedo: observable,
            setCanRedo: action,
            countPages: observable,
            setCountPages: action
        })
    }

    isCanUndo = false;

    setCanUndo(can) {
        this.isCanUndo = can;
    }

    isCanRedo = false;

    setCanRedo(can) {
        this.isCanRedo = can;
    }

    countPages = 0;

    setCountPages(count) {
        this.countPages = count;
    }
}