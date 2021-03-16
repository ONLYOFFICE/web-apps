import {makeObservable, action, observable, computed} from 'mobx';
import {f7} from 'framework7-react';

export class storeTableSettings {
    constructor() {
        makeObservable(this, {
            _templates: observable,
            cellBorders: observable,
            cellBorderWidth: observable,
            cellBorderColor: observable,
            initTableTemplates: action,
            styles: computed,
            updateCellBorderWidth: action,
            updateCellBorderColor: action,
        });
    }

    _templates = [];

    initTableTemplates (templates) {
        this._templates = templates;
    }

    get styles () {
        let styles = [];
        for (let template of this._templates) {
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

    // Fill color
    getFillColor (tableObject) {
        const background = tableObject.get_CellsBackground();
        let fillColor = 'transparent';
        if (background) {
            if (background.get_Value()==0) {
                const color = background.get_Color();
                if (color) {
                    if (color.get_type() == Asc.c_oAscColor.COLOR_TYPE_SCHEME) {
                        fillColor = {color: Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b()), effectValue: color.get_value()};
                    } else {
                        fillColor = Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b());
                    }
                }
            }
        }
        return fillColor;
    }

    // Border style

    cellBorders;
    cellBorderWidth = 0.5;
    cellBorderColor = '000000';

    borderSizeTransform () {
        const _sizes = [0, 0.5, 1, 1.5, 2.25, 3, 4.5, 6];

        return {
            sizeByIndex: function (index) {
                if (index < 1) return _sizes[0];
                if (index > _sizes.length - 1) return _sizes[_sizes.length - 1];
                return _sizes[index];
            },

            indexSizeByValue: function (value) {
                let index = 0;
                _sizes.forEach((size, idx) => {
                    if (Math.abs(size - value) < 0.25) {
                        index = idx;
                    }
                });
                return index;
            },

            sizeByValue: function (value) {
                return _sizes[this.indexSizeByValue(value)];
            }
        }
    }

    updateCellBorderWidth (value) {
        this.cellBorderWidth = value;
    }

    updateCellBorderColor (value) {
        this.cellBorderColor = value;
    }

    updateBordersStyle (border) {
        this.cellBorders = new Asc.CBorders();
        const visible = (border != '');

        if (border.indexOf('l') > -1 || !visible) {
            if (this.cellBorders.get_Left()===null || this.cellBorders.get_Left()===undefined)
                this.cellBorders.put_Left(new Asc.asc_CTextBorder());
            this.updateBorderStyle (this.cellBorders.get_Left(), visible);
        }
        if (border.indexOf('t') > -1 || !visible) {
            if (this.cellBorders.get_Top()===null || this.cellBorders.get_Top()===undefined)
                this.cellBorders.put_Top(new Asc.asc_CTextBorder());
            this.updateBorderStyle (this.cellBorders.get_Top(), visible);
        }
        if (border.indexOf('r') > -1 || !visible) {
            if (this.cellBorders.get_Right()===null || this.cellBorders.get_Right()===undefined)
                this.cellBorders.put_Right(new Asc.asc_CTextBorder());
            this.updateBorderStyle (this.cellBorders.get_Right(), visible);
        }
        if (border.indexOf('b') > -1 || !visible) {
            if (this.cellBorders.get_Bottom()===null || this.cellBorders.get_Bottom()===undefined)
                this.cellBorders.put_Bottom(new Asc.asc_CTextBorder());
            this.updateBorderStyle (this.cellBorders.get_Bottom(), visible);
        }
        if (border.indexOf('c') > -1 || !visible) {
            if (this.cellBorders.get_InsideV()===null || this.cellBorders.get_InsideV()===undefined)
                this.cellBorders.put_InsideV(new Asc.asc_CTextBorder());
            this.updateBorderStyle (this.cellBorders.get_InsideV(), visible);
        }
        if (border.indexOf('m') > -1 || !visible) {
            if (this.cellBorders.get_InsideH()===null || this.cellBorders.get_InsideH()===undefined)
                this.cellBorders.put_InsideH(new Asc.asc_CTextBorder());
            this.updateBorderStyle (this.cellBorders.get_InsideH(), visible);
        }
    }

    updateBorderStyle (border, visible) {
        if (!border) {
            border = new Asc.asc_CTextBorder();
        }
        if (visible && this.cellBorderWidth > 0){
            const size = parseFloat(this.cellBorderWidth);
            border.put_Value(1);
            border.put_Size(size * 25.4 / 72.0);
            const color = Common.Utils.ThemeColor.getRgbColor(this.cellBorderColor);
            border.put_Color(color);
        }
        else {
            border.put_Value(0);
        }
    }

}