import {action, observable} from 'mobx';

export class storeApplicationSettings {
   
    @observable unitMeasurement = 1;

    @observable isSpellChecking = true;

    @observable isNonprintingCharacters = false;
    @observable isHiddenTableBorders = false;

    @observable isComments = true;
    @observable isResolvedComments = true;

    @observable macrosMode = 0;

    @action changeUnitMeasurement(value) {
        this.unitMeasurement = +value;
    }

    @action changeSpellCheck(value) {
        this.isSpellChecking = value;
    }

    @action changeNoCharacters(value) {
        this.isNonprintingCharacters = value;
    }

    @action changeShowTableEmptyLine(value) {
        this.isHiddenTableBorders = value;
    }

    @action changeDisplayComments(value) {
        this.isComments = value;
        if (!value) this.changeDisplayResolved(value);
    }

    @action changeDisplayResolved(value) {
        this.isResolvedComments = value;
    }

    @action changeMacrosSettings(value) {
        this.macrosMode = +value;
    }
}