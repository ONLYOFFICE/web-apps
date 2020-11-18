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
        this.onWrapMoveText = this.onWrapMoveText.bind(this);
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
        if (api) {
            api.remTable();
            this.closeIfNeed();
        }
    }
    onAddColumnLeft () {
        const api = Common.EditorApi.get();
        if (api) {
            api.addColumnLeft();
            this.closeIfNeed();
        }
    }
    onAddColumnRight () {
        const api = Common.EditorApi.get();
        if (api) {
            api.addColumnRight();
            this.closeIfNeed();
        }
    }
    onAddRowAbove () {
        const api = Common.EditorApi.get();
        if (api) {
            api.addRowAbove();
            this.closeIfNeed();
        }
    }
    onAddRowBelow () {
        const api = Common.EditorApi.get();
        if (api) {
            api.addRowBelow();
            this.closeIfNeed();
        }
    }
    onRemoveColumn () {
        const api = Common.EditorApi.get();
        if (api) {
            api.remColumn();
            this.closeIfNeed();
        }
    }
    onRemoveRow () {
        const api = Common.EditorApi.get();
        if (api) {
            api.remRow();
            this.closeIfNeed();
        }
    }
    onCellMargins (value) {
        const api = Common.EditorApi.get();
        if (api) {
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
    }
    onOptionRepeat (value) {
        const api = Common.EditorApi.get();
        if (api) {
            const properties = new Asc.CTableProp();
            properties.put_RowsInHeader(value);
            api.tblApply(properties);
        }
    }
    onOptionResize (value) {
        const api = Common.EditorApi.get();
        if (api) {
            const properties = new Asc.CTableProp();
            properties.put_TableLayout(value ? Asc.c_oAscTableLayout.AutoFit : Asc.c_oAscTableLayout.Fixed);
            api.tblApply(properties);
        }
    }
    onWrapType (value) {
        const api = Common.EditorApi.get();
        if (api) {
            const properties = new Asc.CTableProp();
            properties.put_TableWrap(value);
            api.tblApply(properties);
        }
    }
    onWrapAlign (type) {
        const api = Common.EditorApi.get();
        if (api) {
            const properties = new Asc.CTableProp();
            properties.put_TableAlignment(type);
            api.tblApply(properties);
        }
    }
    onWrapMoveText (value) {
        const api = Common.EditorApi.get();
        if (api) {
            const properties = new Asc.CTableProp();
            const position = new Asc.CTablePositionV();
            position.put_UseAlign(false);
            position.put_RelativeFrom(value ? Asc.c_oAscVAnchor.Text : Asc.c_oAscVAnchor.Page);
            const tableObject = this.props.storeFocusObjects.tableObject;
            position.put_Value(tableObject.get_Value_Y(value ? Asc.c_oAscVAnchor.Text : Asc.c_oAscVAnchor.Page));
            properties.put_PositionV(position);
            api.tblApply(properties);
        }
    }
    onWrapDistance (value) {
        const api = Common.EditorApi.get();
        if (api) {
            const properties = new Asc.CTableProp();
            const paddings = new Asc.asc_CPaddings();
            const distance = Common.Utils.Metric.fnRecalcToMM(parseInt(value));
            paddings.put_Top(distance);
            paddings.put_Right(distance);
            paddings.put_Bottom(distance);
            paddings.put_Left(distance);
            properties.put_TablePaddings(paddings);
            api.tblApply(properties);
        }
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
                       onCellMargins={this.onCellMargins}
                       onOptionRepeat={this.onOptionRepeat}
                       onOptionResize={this.onOptionResize}
                       onWrapType={this.onWrapType}
                       onWrapAlign={this.onWrapAlign}
                       onWrapMoveText={this.onWrapMoveText}
                       onWrapDistance={this.onWrapDistance}
            />
        )
    }
}

export default inject("storeFocusObjects")(observer(EditTableController));