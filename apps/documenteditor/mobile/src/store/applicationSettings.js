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

    @action changeUnitMeasurement(value) {
        value = (value !== null) ? parseInt(value) : Common.Utils.Metric.getDefaultMetric();
        console.log(value);

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
        console.log(this.isSpellChecking);
    }

    @action changeNoCharacters(value) {
        this.isNonprintingCharacters = value;
        console.log(this.isNonprintingCharacters);
    }

    @action changeShowTableEmptyLine(value) {
        this.isHiddenTableBorders = value;
        console.log(this.isHiddenTableBorders);
    }

    @action changeDisplayComments(value) {
        this.isComments = value;
        if (!value) this.changeDisplayResolved(value);
        console.log(this.isComments);
    }

    @action changeDisplayResolved(value) {
        this.isResolvedComments = value;
        console.log(this.isResolvedComments);
    }
}