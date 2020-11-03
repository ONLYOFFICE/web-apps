import {action, observable, computed} from 'mobx';

export class storeTableSettings {
    @observable _templates = [];
    @action initTableTemplates (templates) {
        this._templates = templates;
    }
    @computed get styles () {
        let styles = [];
        for (let template of templates) {
            styles.push({
                imageUrl    : template.asc_getImage(),
                templateId  : template.asc_getId()
            });
        }
        return styles;
    }
    getTableLook (tableObject) {
        return tableObject.get_TableLook()
    }
    getCellMargins (tableObject) {
        const margins = tableObject.get_CellMargins();
        return margins.get_Left();
    }
    getRepeatOption (tableObject) {
        if (tableObject.get_RowsInHeader() === null) {
            return null;
        }
        return !!tableObject.get_RowsInHeader();
    }
    getResizeOption (tableObject) {
        return tableObject.get_TableLayout()==Asc.c_oAscTableLayout.AutoFit;
    }
    getWrapType (tableObject) {
        return tableObject.get_TableWrap() === 0 ? 'inline' : 'flow';
    }
    getAlign (tableObject) {
        return tableObject.get_TableAlignment();
    }
    getMoveText (tableObject) {
        return (tableObject.get_PositionV() && tableObject.get_PositionV().get_RelativeFrom() === Asc.c_oAscVAnchor.Text);
    }
    getWrapDistance (tableObject) {
        return tableObject.get_TablePaddings().get_Top();
    }
}