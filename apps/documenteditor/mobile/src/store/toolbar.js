import {action, observable, makeObservable} from 'mobx';

export class storeToolbarSettings {
    constructor() {
        makeObservable(this, {
            isCanUndo: observable,
            setCanUndo: action,
            isCanRedo: observable,
            setCanRedo: action,
            disabledControls: observable,
            setDisabledControls: action,
            disabledEditControls: observable,
            setDisabledEditControls: action,
            disabledSettings: observable, 
            setDisabledSettings: action,
            isSignatureForm: observable,
            setIsSignatureForm: action
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

    isSignatureForm = false;

    setIsSignatureForm(value) {
        this.isSignatureForm = value;
    }
}