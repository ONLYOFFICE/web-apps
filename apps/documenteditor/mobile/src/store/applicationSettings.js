import {makeObservable, action, observable} from 'mobx';
import { LocalStorage } from '../../../../common/mobile/utils/LocalStorage';

export class storeApplicationSettings {
    constructor() {
        makeObservable(this, {
            unitMeasurement: observable, 
            isSpellChecking: observable, 
            isNonprintingCharacters: observable, 
            isHiddenTableBorders: observable, 
            isComments: observable, 
            isResolvedComments: observable, 
            macrosMode: observable, 
            changeSpellCheck: action, 
            changeUnitMeasurement: action, 
            changeNoCharacters: action, 
            changeShowTableEmptyLine: action, 
            changeDisplayComments: action, 
            changeDisplayResolved: action, 
            changeMacrosSettings: action
        })
    }

    unitMeasurement = 1;
    isSpellChecking = true;
    isNonprintingCharacters = false;
    isHiddenTableBorders = false;
    isComments = false;
    isResolvedComments = false;
    macrosMode = 0;

    changeUnitMeasurement(value) {
        this.unitMeasurement = +value;
    }

    changeSpellCheck(value) {
        this.isSpellChecking = value;
    }

    changeNoCharacters(value) {
        this.isNonprintingCharacters = value;
    }

    changeShowTableEmptyLine(value) {
        this.isHiddenTableBorders = value;
    }

    changeDisplayComments(value) {
        this.isComments = value;
        if (!value) this.changeDisplayResolved(value);
    }

    changeDisplayResolved(value) {
        this.isResolvedComments = value;
    }

    changeMacrosSettings(value) {
        this.macrosMode = +value;
    }
}