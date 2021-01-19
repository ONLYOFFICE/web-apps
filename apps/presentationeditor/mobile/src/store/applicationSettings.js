import {action, observable} from 'mobx';

export class storeApplicationSettings {
   
    @observable unitMeasurement = 1;
    @observable isSpellChecking = true;
    @observable macrosMode = 0;
    
    @action changeUnitMeasurement(value) {
        this.unitMeasurement = +value;
    }

    @action changeSpellCheck(value) {
        this.isSpellChecking = value;
    }

    @action changeMacrosSettings(value) {
        this.macrosMode = +value;
    }
}