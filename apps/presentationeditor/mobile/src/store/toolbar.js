import {action, observable, makeObservable} from 'mobx';

export class storeToolbarSettings {
    constructor() {
        makeObservable(this, {
            isCanUndo: observable,
            setCanUndo: action,
            isCanRedo: observable,
            setCanRedo: action,
            countPages: observable,
            setCountPages: action,
            disabledControls: observable,
            setDisabledControls: action,
            disabledEditControls: observable,
            setDisabledEditControls: action,
            disabledSettings: observable, 
            setDisabledSettings: action
        })
    }

    disabledControls = true;

    setDisabledControls(value) {
        this.disabledControls = value;
    }

    disabledEditControls = false;

    setDisabledEditControls(value) {
        this.disabledEditControls = value;
    }

    disabledSettings = false;

    setDisabledSettings(value) {
        this.disabledSettings = value;
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