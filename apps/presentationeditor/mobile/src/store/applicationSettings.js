import {action, observable, makeObservable} from 'mobx';
import { LocalStorage } from '../../../../common/mobile/utils/LocalStorage.mjs';

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
            changeMacrosRequest: action,
            directionMode: observable,
            changeDirectionMode: action
        });
    }

    unitMeasurement = 1;
    isSpellChecking = true;
    macrosMode = 0;
    macrosRequest = 0;
    directionMode = LocalStorage.getItem('mode-direction') || 'ltr';

    changeDirectionMode(value) {
        this.directionMode = value;
    }
    
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