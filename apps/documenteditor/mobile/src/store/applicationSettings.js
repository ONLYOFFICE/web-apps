import {action, observable} from 'mobx';

export class storeApplicationSettings {
    @observable isActiveUnitCentimeter = false;
    @observable isActiveUnitPoint = true;
    @observable isActiveUnitInch = false;

    @observable isSpellChecking = true;

    @observable isNonprintingCharacters = false;
    @observable isHiddenTableBorders = false;

    @observable isComments = true;
    @observable isResolvedComments = true;

    @observable isDisabledAllMacros = false;
    @observable isShowNotification = true;
    @observable isEnabledAllMacros = false;

    @action changeUnitMeasurement(value) {
        value = (value !== null) ? +value : Common.Utils.Metric.getDefaultMetric();
    
        if(value === Common.Utils.Metric.c_MetricUnits.inch) {
            this.isActiveUnitCentimeter = false;
            this.isActiveUnitPoint = false;
            this.isActiveUnitInch = true;
        }
        else if(value === Common.Utils.Metric.c_MetricUnits.pt) {
            this.isActiveUnitCentimeter = false;
            this.isActiveUnitPoint = true;
            this.isActiveUnitInch = false;
        }
        else {
            this.isActiveUnitCentimeter = true;
            this.isActiveUnitPoint = false;
            this.isActiveUnitInch = false;
        }
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
        if(+value === 2) {
            this.isDisabledAllMacros = true;
            this.isShowNotification = false;
            this.isEnabledAllMacros = false;  
        }
        else if(+value === 1) {
            this.isDisabledAllMacros = false;
            this.isShowNotification = false;
            this.isEnabledAllMacros = true;  
        }
        else {
            this.isDisabledAllMacros = false;
            this.isShowNotification = true;
            this.isEnabledAllMacros = false; 
        }
    }
}