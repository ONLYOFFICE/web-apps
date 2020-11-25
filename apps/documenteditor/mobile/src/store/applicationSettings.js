import {action, observable, computed} from 'mobx';

export class storeApplicationSettings {
    @observable isActiveUnitCentimeter = false;
    @observable isActiveUnitPoint = true;
    @observable isActiveUnitInch = false;

    @action changeUnitMeasurement(value) {
        const api = Common.EditorApi.get();
        console.log(value);
        if(+value === Common.Utils.Metric.c_MetricUnits.inch) {
            api.asc_SetDocumentUnits(Asc.c_oAscDocumentUnits.Inch);
            this.isActiveUnitCentimeter = false;
            this.isActiveUnitPoint = false;
            this.isActiveUnitInch = true;
        }
        else if(+value === Common.Utils.Metric.c_MetricUnits.pt) {
            api.asc_SetDocumentUnits(Asc.c_oAscDocumentUnits.Point);
            this.isActiveUnitCentimeter = false;
            this.isActiveUnitPoint = true;
            this.isActiveUnitInch = false;
        }
        else {
            api.asc_SetDocumentUnits(Asc.c_oAscDocumentUnits.Millimeter);
            this.isActiveUnitCentimeter = true;
            this.isActiveUnitPoint = false;
            this.isActiveUnitInch = false;
        }
    }
   
}