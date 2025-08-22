import React, {Component} from 'react';
import { f7 } from 'framework7-react';
import {Device} from '../../../../../common/mobile/utils/device';
import {observer, inject} from "mobx-react";

import { EditTable } from '../../view/edit/EditTable';

class EditTableController extends Component {
    constructor (props) {
        super(props);
        this.closeIfNeed = this.closeIfNeed.bind(this);
        this.onRemoveTable = this.onRemoveTable.bind(this);
        this.onAddColumnLeft = this.onAddColumnLeft.bind(this);
        this.onAddColumnRight = this.onAddColumnRight.bind(this);
        this.onAddRowAbove = this.onAddRowAbove.bind(this);
        this.onAddRowBelow = this.onAddRowBelow.bind(this);
        this.onRemoveColumn = this.onRemoveColumn.bind(this);
        this.onRemoveRow = this.onRemoveRow.bind(this);
        this.onGetTableStylesPreviews = this.onGetTableStylesPreviews.bind(this);
    }

    closeIfNeed () {
        if (!this.props.storeFocusObjects.isTableInStack) {
            if ( Device.phone ) {
                f7.sheet.close('#edit-sheet', true);
            } else {
                f7.popover.close('#edit-popover');
            }
        }
    }

    onRemoveTable () {
        const api = Common.EditorApi.get();
        api.remTable();
        this.closeIfNeed();
    }

    onAddColumnLeft () {
        const api = Common.EditorApi.get();
        api.addColumnLeft();
        this.closeIfNeed();
    }

    onAddColumnRight () {
        const api = Common.EditorApi.get();
        api.addColumnRight();
        this.closeIfNeed();
    }

    onAddRowAbove () {
        const api = Common.EditorApi.get();
        api.addRowAbove();
        this.closeIfNeed();   
    }

    onAddRowBelow () {
        const api = Common.EditorApi.get();
        api.addRowBelow();
        this.closeIfNeed();
    }

    onRemoveColumn () {
        const api = Common.EditorApi.get();
        api.remColumn();
        this.closeIfNeed();
    }

    onRemoveRow () {
        const api = Common.EditorApi.get();
        api.remRow();
        this.closeIfNeed(); 
    }

    onOptionMargin (value) {
        const api = Common.EditorApi.get();
        const properties = new Asc.CTableProp();
        const margins = new Asc.CMargins();
        const val = Common.Utils.Metric.fnRecalcToMM(value);
        margins.put_Top(val);
        margins.put_Right(val);
        margins.put_Bottom(val);
        margins.put_Left(val);
        margins.put_Flag(2);
        properties.put_CellMargins(margins);
        api.tblApply(properties);
    }

    onChangeTableDimension (type, value, isDecrement) {
        const api = Common.EditorApi.get();
        const properties = new Asc.CTableProp();
        const maxValue = Common.Utils.Metric.fnRecalcFromMM(558.8);
        const step = Common.Utils.Metric.getCurrentMetric() === Common.Utils.Metric.c_MetricUnits.pt ? 1 : 0.1;
        const newValue = isDecrement
            ? Math.max(0, value - step)
            : Math.min(maxValue, value + step);
        const convertedValue = Common.Utils.Metric.fnRecalcToMM(newValue);
        if (type === 'row') {
            properties.put_RowHeight(convertedValue);
        } else if (type === 'column') {
            properties.put_ColumnWidth(convertedValue);
        }
        api.tblApply(properties);
    }

    onDistributeTable (isColumn) {
        const api = Common.EditorApi.get();
        api.asc_DistributeTableCells(isColumn)
    }

    onStyleClick (type) {
        const api = Common.EditorApi.get();
        const properties = new Asc.CTableProp();
        properties.put_TableStyle(type.toString());
        api.tblApply(properties);
    }

    onCheckTemplateChange (tableLook, type, isChecked) {
        const api = Common.EditorApi.get();
        const properties = new Asc.CTableProp();

        switch (type) {
            case 0:
                tableLook.put_FirstRow(isChecked);
                break;
            case 1:
                tableLook.put_LastRow(isChecked);
                break;
            case 2:
                tableLook.put_BandHor(isChecked);
                break;
            case 3:
                tableLook.put_FirstCol(isChecked);
                break;
            case 4:
                tableLook.put_LastCol(isChecked);
                break;
            case 5:
                tableLook.put_BandVer(isChecked);
                break;
        }

        properties.put_TableLook(tableLook);
        api.tblApply(properties);
    }

    onFillColor (color) {
        const api = Common.EditorApi.get();
        const properties = new Asc.CTableProp();
        const background = new Asc.CBackground();
        properties.put_CellsBackground(background);

        if ('transparent' == color) {
            background.put_Value(1);
        } else {
            background.put_Value(0);
            background.put_Color(Common.Utils.ThemeColor.getRgbColor(color));
        }

        properties.put_CellSelect(true);
        api.tblApply(properties);
    }

    onBorderTypeClick (cellBorders) {
        const api = Common.EditorApi.get();
        const properties = new Asc.CTableProp();
        const _cellBorders = !cellBorders ? new Asc.CBorders() : cellBorders;
        properties.put_CellBorders(_cellBorders);
        properties.put_CellSelect(true);
        api.tblApply(properties);
    }

    onReorder(type) {
        const api = Common.EditorApi.get();

        switch(type) {
            case 'all-up':
                api.shapes_bringToFront();
                break;
            case 'all-down':
                api.shapes_bringToBack();
                break;
            case 'move-up':
                api.shapes_bringForward();
                break;
            case 'move-down':
                api.shapes_bringBackward();
                break;
            
        }
    }

    onAlign(type) {
        const api = Common.EditorApi.get();

        switch(type) {
            case 'align-left':
                api.put_ShapesAlign(Asc.c_oAscAlignShapeType.ALIGN_LEFT);
                break;
            case 'align-center':
                api.put_ShapesAlign(Asc.c_oAscAlignShapeType.ALIGN_CENTER);
                break;
            case 'align-right':
                api.put_ShapesAlign(Asc.c_oAscAlignShapeType.ALIGN_RIGHT);
                break;
            case 'align-top':
                api.put_ShapesAlign(Asc.c_oAscAlignShapeType.ALIGN_TOP);
                break;
            case 'align-middle':
                api.put_ShapesAlign(Asc.c_oAscAlignShapeType.ALIGN_MIDDLE);
                break;
            case 'align-bottom':
                api.put_ShapesAlign(Asc.c_oAscAlignShapeType.ALIGN_BOTTOM);
                break;
            case 'distrib-hor':
                api.DistributeHorizontally();
                break;
            case 'distrib-vert':
                api.DistributeVertically();
                break;
        }
    }

    onGetTableStylesPreviews() {
        const api = Common.EditorApi.get();
        setTimeout(() => this.props.storeTableSettings.setStyles(api.asc_getTableStylesPreviews()), 1);
    }

    render () {
        return (
            <EditTable onRemoveTable={this.onRemoveTable}
                       onAddColumnLeft={this.onAddColumnLeft}
                       onAddColumnRight={this.onAddColumnRight}
                       onAddRowAbove={this.onAddRowAbove}
                       onAddRowBelow={this.onAddRowBelow}
                       onRemoveColumn={this.onRemoveColumn}
                       onRemoveRow={this.onRemoveRow}
                       onOptionMargin={this.onOptionMargin}
                       onStyleClick={this.onStyleClick}
                       onCheckTemplateChange={this.onCheckTemplateChange}
                       onFillColor={this.onFillColor}
                       onBorderTypeClick={this.onBorderTypeClick}
                       onReorder={this.onReorder}
                       onAlign={this.onAlign}
                       onGetTableStylesPreviews={this.onGetTableStylesPreviews}
                       onDistributeTable = {this.onDistributeTable}
                       onChangeTableDimension = {this.onChangeTableDimension}
            />
        )
    }
}

export default inject("storeFocusObjects", "storeTableSettings")(observer(EditTableController));