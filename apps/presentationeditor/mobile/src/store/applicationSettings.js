import {action, observable, makeObservable} from 'mobx';

export class storeApplicationSettings {
    constructor() {
        makeObservable(this, {
            unitMeasurement: observable,
            isSpellChecking: observable,
            macrosMode: observable,
            macrosRequest: observable,
            changeUnitMeasurement: action,
            changeSpellCheck: action,
            changeMacrosSettings: action,
            changeMacrosRequest: action
        });
    }

    unitMeasurement = 1;
    isSpellChecking = true;
    macrosMode = 0;
    macrosRequest = 0;
    
    changeUnitMeasurement(value) {
        this.unitMeasurement = +value;
    }

    changeSpellCheck(value) {
        this.isSpellChecking = value;
    }

    changeMacrosSettings(value) {
        this.macrosMode = +value;
    }

    changeMacrosRequest(value) {
        this.macrosRequest = value;
    }
}