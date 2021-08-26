import {action, observable, makeObservable} from 'mobx';

export class storeApplicationSettings {
    constructor() {
        makeObservable(this, {
            unitMeasurement: observable,
            isSpellChecking: observable,
            macrosMode: observable,
            changeUnitMeasurement: action,
            changeSpellCheck: action,
            changeMacrosSettings: action
        });
    }

    unitMeasurement = 1;
    isSpellChecking = true;
    macrosMode = 0;
    
    changeUnitMeasurement(value) {
        this.unitMeasurement = +value;
    }

    changeSpellCheck(value) {
        this.isSpellChecking = value;
    }

    changeMacrosSettings(value) {
        this.macrosMode = +value;
    }
}