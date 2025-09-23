import React, {Component} from 'react';
import { EditCell } from '../../view/edit/EditCell';
import { f7 } from 'framework7-react';
import {observer, inject} from "mobx-react";
import { Device } from '../../../../../common/mobile/utils/device';

class EditCellController extends Component {
    constructor (props) {
        super(props);
        this.dateFormats = this.initFormats(Asc.c_oAscNumFormatType.Date, 38822);
        this.timeFormats = this.initFormats(Asc.c_oAscNumFormatType.Time, 1.534);
        this.initCustomFormats = this.initCustomFormats.bind(this);
        this.setCustomFormat = this.setCustomFormat.bind(this);
        this.onBorderStyle = this.onBorderStyle.bind(this);
        this.initCustomFormats();
    }

    initFormats(type, exampleVal) {
        const api = Common.EditorApi.get();
        let info = new Asc.asc_CFormatCellsInfo();

        info.asc_setType(type);
        info.asc_setDecimalPlaces(0);
        info.asc_setSeparator(false);

        const formatsArr = api.asc_getFormatCells(info);
        const data = formatsArr.map(item => ({
            value: item, 
            displayValue: api.asc_getLocaleExample(item, exampleVal)
        }));

        return data;
    }

    initCustomFormats() {
        if(this.props.storeCellSettings.customFormats?.length) return;

        const api = Common.EditorApi.get();
        const storeCellSettings = this.props.storeCellSettings;
        const info = new Asc.asc_CFormatCellsInfo();
        const valSymbol = api.asc_getLocale();

        info.asc_setType(Asc.c_oAscNumFormatType.Custom);
        info.asc_setSymbol(valSymbol);

        const formatsArr = api.asc_getFormatCells(info);
        const data = formatsArr.map(item => ({
            value: api.asc_convertNumFormat2NumFormatLocal(item),
            format: item
        }));

        storeCellSettings.initCustomFormats(data);
    }

    setCustomFormat(value) {
        const api = Common.EditorApi.get();
        const format = api.asc_convertNumFormatLocal2NumFormat(value);
        const storeCellSettings = this.props.storeCellSettings;
    
        storeCellSettings.addCustomFormat({
            value: api.asc_convertNumFormat2NumFormatLocal(format),
            format
        });
        api.asc_setCellFormat(format);
    }

    toggleBold(value) {
        const api = Common.EditorApi.get();
        api.asc_setCellBold(value);
    }

    toggleItalic(value) {
        const api = Common.EditorApi.get();
        api.asc_setCellItalic(value);
        
    }

    toggleUnderline(value) {
        const api = Common.EditorApi.get();
        api.asc_setCellUnderline(value);
    }

    toggleStrikethrough(value) {
        const api = Common.EditorApi.get();
        api.asc_setCellStrikeout(value);
    }

    onStyleClick(type) {
        const api = Common.EditorApi.get();
        api.asc_setCellStyle(type);
    }

    onTextColor(color) {
        const api = Common.EditorApi.get();
        api.asc_setCellTextColor(Common.Utils.ThemeColor.getRgbColor(color));
    }

    onFillColor(color) {
        const api = Common.EditorApi.get();
        api.asc_setCellBackgroundColor(color == 'transparent' ? null : Common.Utils.ThemeColor.getRgbColor(color));
    }

    onFontSize(curSize, isDecrement) {
        const api = Common.EditorApi.get();
        let size = curSize;

        if (isDecrement) {
            typeof size === 'undefined' ? api.asc_decreaseFontSize() : size = Math.max(1, --size);
        } else {
            typeof size === 'undefined' ? api.asc_increaseFontSize() : size = Math.min(409, ++size);
        }

        if (typeof size !== 'undefined') {
            api.asc_setCellFontSize(size);
        }
    }

    onFontClick(name) {
        const api = Common.EditorApi.get();

        if (name) {
            api.asc_setCellFontName(name);
        }
    }

    onHAlignChange(value) {
        const api = Common.EditorApi.get();
        let type;

        if (value == 'center') {
            type = AscCommon.align_Center;
        } else if (value == 'right') {
            type = AscCommon.align_Right;
        } else if (value == 'justify') {
            type = AscCommon.align_Justify;
        } else if (value == 'left') {
            type = AscCommon.align_Left;
        }

        api.asc_setCellAlign(type);
    }

    onVAlignChange(value) {
        const api = Common.EditorApi.get();
        let type;

        if (value == 'top') {
            type = Asc.c_oAscVAlign.Top;
        } else if (value == 'center') {
            type = Asc.c_oAscVAlign.Center;
        } else if (value == 'bottom') {
            type = Asc.c_oAscVAlign.Bottom;
        }

        api.asc_setCellVertAlign(type);
    }

    onWrapTextChange(checked) {
        const api = Common.EditorApi.get();
        api.asc_setCellTextWrap(checked);
    }

    onTextOrientationChange(value) {
        const api = Common.EditorApi.get();
        let angle = 0;

        switch (value) {
            case 'anglecount': angle =  45; break;
            case 'angleclock': angle = -45; break;
            case 'vertical': angle =  255; break;
            case 'rotateup': angle =  90; break;
            case 'rotatedown': angle = -90; break;
        }

        api.asc_setCellAngle(angle);
    }

    onCellFormat(format) {
        const api = Common.EditorApi.get();
        api.asc_setCellFormat(format);
    }

    onAccountingCellFormat(value) {
        const api = Common.EditorApi.get();
        let info = new Asc.asc_CFormatCellsInfo();

        info.asc_setType(Asc.c_oAscNumFormatType.Accounting);
        info.asc_setSeparator(false);
        info.asc_setSymbol(value);

        let format = api.asc_getFormatCells(info);

        if (format && format.length > 0)
            api.asc_setCellFormat(format[0]);
    }

    onBorderStyle(type, borderInfo) {
        const api = Common.EditorApi.get();
        let newBorders = [],
            bordersWidth = borderInfo.width,
            bordersColor;
            
        if (this.props.storeCellSettings.colorAuto === 'auto') {
            bordersColor = new Asc.asc_CColor();
            bordersColor.put_auto(true);
        } else {
            bordersColor = Common.Utils.ThemeColor.getRgbColor(borderInfo.color);
        }

        if (type == 'inner') {
            newBorders[Asc.c_oAscBorderOptions.InnerV] = new Asc.asc_CBorder(bordersWidth, bordersColor);
            newBorders[Asc.c_oAscBorderOptions.InnerH] = new Asc.asc_CBorder(bordersWidth, bordersColor);
        } else if (type == 'all') {
            newBorders[Asc.c_oAscBorderOptions.InnerV] = new Asc.asc_CBorder(bordersWidth, bordersColor);
            newBorders[Asc.c_oAscBorderOptions.InnerH] = new Asc.asc_CBorder(bordersWidth, bordersColor);
            newBorders[Asc.c_oAscBorderOptions.Left]   = new Asc.asc_CBorder(bordersWidth, bordersColor);
            newBorders[Asc.c_oAscBorderOptions.Top]    = new Asc.asc_CBorder(bordersWidth, bordersColor);
            newBorders[Asc.c_oAscBorderOptions.Right]  = new Asc.asc_CBorder(bordersWidth, bordersColor);
            newBorders[Asc.c_oAscBorderOptions.Bottom] = new Asc.asc_CBorder(bordersWidth, bordersColor);
        } else if (type == 'outer') {
            newBorders[Asc.c_oAscBorderOptions.Left]   = new Asc.asc_CBorder(bordersWidth, bordersColor);
            newBorders[Asc.c_oAscBorderOptions.Top]    = new Asc.asc_CBorder(bordersWidth, bordersColor);
            newBorders[Asc.c_oAscBorderOptions.Right]  = new Asc.asc_CBorder(bordersWidth, bordersColor);
            newBorders[Asc.c_oAscBorderOptions.Bottom] = new Asc.asc_CBorder(bordersWidth, bordersColor);
        } else if (type != 'none') {
            var borderId = parseInt(type);
            newBorders[borderId] = new Asc.asc_CBorder(bordersWidth, bordersColor);
        }

        api.asc_setCellBorders(newBorders);
    }

    onTextColorAuto() {
        const api = Common.EditorApi.get();
        const color = new Asc.asc_CColor();
        color.put_auto(true);
        api.asc_setCellTextColor(color);
    }

    render () {
        return (
            <EditCell 
                toggleBold={this.toggleBold}
                toggleItalic={this.toggleItalic}
                toggleUnderline={this.toggleUnderline}
                toggleStrikethrough={this.toggleStrikethrough}
                onStyleClick={this.onStyleClick}
                onTextColor={this.onTextColor}
                onFillColor={this.onFillColor}
                onFontSize={this.onFontSize}
                onFontClick={this.onFontClick}
                onHAlignChange={this.onHAlignChange}
                onVAlignChange={this.onVAlignChange}
                onWrapTextChange={this.onWrapTextChange}
                onCellFormat={this.onCellFormat}
                onTextOrientationChange={this.onTextOrientationChange}
                onBorderStyle={this.onBorderStyle}
                onAccountingCellFormat={this.onAccountingCellFormat}
                dateFormats={this.dateFormats}
                timeFormats={this.timeFormats}
                onTextColorAuto={this.onTextColorAuto}
                setCustomFormat={this.setCustomFormat}
            />
        )
    }
}

export default inject("storeCellSettings")(observer(EditCellController));