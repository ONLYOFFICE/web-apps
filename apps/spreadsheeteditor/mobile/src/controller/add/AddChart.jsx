import React, {Component} from 'react';
import { f7 } from 'framework7-react';
import {Device} from '../../../../../common/mobile/utils/device';
import { withTranslation } from 'react-i18next';

import AddChart from '../../view/add/AddChart';

class AddChartController extends Component {
    constructor (props) {
        super(props);
        this.onInsertChart = this.onInsertChart.bind(this);
    }

    closeModal () {
        if ( Device.phone ) {
            f7.sheet.close('.add-popup', true);
        } else {
            f7.popover.close('#add-popover');
        }
    }

    onInsertChart (type) {
        const api = Common.EditorApi.get();
        const { t } = this.props;
        const _t = t('View.Add', {returnObjects: true});
        const settings = api.asc_getChartObject(true);
        const info = api.asc_getCellInfo();
        const selType = info.asc_getSelectionType();
        const isChartEdit = (selType == Asc.c_oAscSelectionType.RangeChart || selType == Asc.c_oAscSelectionType.RangeChartText);

        if (settings) {
            isChartEdit ? settings.changeType(type) : settings.putType(type);
            let range = settings.getRange(),
                isValid = !!range ? api.asc_checkDataRange(Asc.c_oAscSelectionDialogType.Chart, range, true, !settings.getInColumns(), settings.getType()) : Asc.c_oAscError.ID.No;
            if (isValid == Asc.c_oAscError.ID.No) {
                isChartEdit ? api.asc_editChartDrawingObject(settings) : api.asc_addChartDrawingObject(settings);
                this.closeModal();
            } else {
                f7.dialog.alert((isValid == Asc.c_oAscError.ID.StockChartError) ? _t.errorStockChart : ((isValid == Asc.c_oAscError.ID.MaxDataSeriesError) ? _t.errorMaxRows : _t.txtInvalidRange), _t.notcriticalErrorTitle);
            }
        }
    }

    render () {
        return (
            <AddChart onInsertChart={this.onInsertChart}
            />
        )
    }
}

const AddChartControllerTranslated = withTranslation()(AddChartController);

export {AddChartControllerTranslated as AddChartController};