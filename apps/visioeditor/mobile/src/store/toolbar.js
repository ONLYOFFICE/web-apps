import {action, observable, makeObservable} from 'mobx';

export class storeToolbarSettings {
    constructor() {
        makeObservable(this, {
            countPages: observable,
            setCountPages: action,
            disabledControls: observable,
            setDisabledControls: action,
            disabledSettings: observable,
            setDisabledSettings: action
        })
    }

    disabledControls = true;

    setDisabledControls(value) {
        this.disabledControls = value;
    }

    disabledSettings = false;

    setDisabledSettings(value) {
        this.disabledSettings = value;
    }

    countPages = 0;

    setCountPages(count) {
        this.countPages = count;
    }
}