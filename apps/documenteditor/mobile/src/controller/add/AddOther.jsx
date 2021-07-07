import React, {Component} from 'react';
import { f7 } from 'framework7-react';
import {Device} from '../../../../../common/mobile/utils/device';
import { withTranslation} from 'react-i18next';

import {AddOther} from '../../view/add/AddOther';

// footnote converting metods
const _10toS = (value) => {
    value = parseInt(value);
    let n = Math.ceil(value / 26),
        code = String.fromCharCode((value-1) % 26 + "A".charCodeAt(0)) ,
        result = '';
    for (var i=0; i<n; i++ ) {
        result += code;
    }
    return result;
};
const _Sto10 = (str) => {
    if ( str.length<1 || (new RegExp('[^' + str.charAt(0) + ']')).test(str) || !/[A-Z]/.test(str)) return 1;
    let n = str.length-1,
        result = str.charCodeAt(0) - "A".charCodeAt(0) + 1;
    result += 26*n;
    return result;
};
const _10toRome = (value) => {
    value = parseInt(value);
    let result = '',
        digits = [['M',  1000], ['CM', 900], ['D',  500], ['CD', 400], ['C',  100], ['XC', 90], ['L',  50], ['XL', 40], ['X',  10], ['IX', 9], ['V',  5], ['IV', 4], ['I',  1]];
    let val = digits[0][1],
        div = Math.floor(value / val),
        n = 0;
    for (var i=0; i<div; i++)
        result += digits[n][0];
    value -= div * val;
    n++;
    while (value>0) {
        val = digits[n][1];
        div = value - val;
        if (div>=0) {
            result += digits[n][0];
            value = div;
        } else
            n++;
    }
    return result;
};
const _Rometo10 = (str) => {
    if ( !/[IVXLCDM]/.test(str) || str.length<1 ) return 1;
    let digits = {'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100, 'D': 500, 'M': 1000};
    var n = str.length-1,
        result = digits[str.charAt(n)],
        prev = result;
    for (var i=n-1; i>=0; i-- ) {
        var val = digits[str.charAt(i)];
        if (val<prev) {
            if (prev/val>10) return 1;
            val *= -1;
        }
        result += val;
        prev = Math.abs(val);
    }
    return result;
};

class AddOtherController extends Component {
    constructor (props) {
        super(props);
        this.onInsertPageNumber = this.onInsertPageNumber.bind(this);
        this.onPageBreak = this.onPageBreak.bind(this);
        this.onColumnBreak = this.onColumnBreak.bind(this);
        this.onInsertSectionBreak = this.onInsertSectionBreak.bind(this);
        this.getFootnoteStartAt = this.getFootnoteStartAt.bind(this);
        this.onFootnoteStartAt = this.onFootnoteStartAt.bind(this);
        this.onInsertFootnote = this.onInsertFootnote.bind(this);
        this.initFootnoteStartAt = this.initFootnoteStartAt.bind(this);
        this.getFootnoteProps = this.getFootnoteProps.bind(this);
    }

    closeModal () {
        if ( Device.phone ) {
            f7.sheet.close('.add-popup', true);
        } else {
            f7.popover.close('#add-popover');
        }
    }

    onInsertPageNumber (type) {
        const api = Common.EditorApi.get();

        let value = -1;

        if (2 == type.length) {
            const c_pageNumPosition = {
                PAGE_NUM_POSITION_TOP: 0x01,
                PAGE_NUM_POSITION_BOTTOM: 0x02,
                PAGE_NUM_POSITION_RIGHT: 0,
                PAGE_NUM_POSITION_LEFT: 1,
                PAGE_NUM_POSITION_CENTER: 2
            };
            value = {};

            if (type[0] == 'l') {
                value.subtype = c_pageNumPosition.PAGE_NUM_POSITION_LEFT;
            } else if (type[0] == 'c') {
                value.subtype = c_pageNumPosition.PAGE_NUM_POSITION_CENTER;
            } else if (type[0] == 'r') {
                value.subtype = c_pageNumPosition.PAGE_NUM_POSITION_RIGHT;
            }

            if (type[1] == 't') {
                value.type = c_pageNumPosition.PAGE_NUM_POSITION_TOP;
            } else if (type[1] == 'b') {
                value.type = c_pageNumPosition.PAGE_NUM_POSITION_BOTTOM;
            }

            api.put_PageNum(value.type, value.subtype);
        } else {
            api.put_PageNum(value);
        }

        this.closeModal();
    }

    onPageBreak () {
        const api = Common.EditorApi.get();
        api.put_AddPageBreak();
        this.closeModal();
    }

    onColumnBreak () {
        const api = Common.EditorApi.get();
        api.put_AddColumnBreak();
        this.closeModal();
    }

    onInsertSectionBreak (type) {
        const api = Common.EditorApi.get();
        let value;
        if ('next' == type) {
            value = Asc.c_oAscSectionBreakType.NextPage;
        } else if ('continuous' == type) {
            value = Asc.c_oAscSectionBreakType.Continuous;
        } else if ('even' == type) {
            value = Asc.c_oAscSectionBreakType.EvenPage;
        } else if ('odd' == type) {
            value = Asc.c_oAscSectionBreakType.OddPage;
        }
        api.add_SectionBreak(value);
        this.closeModal();
    }

    // Footnote

    getFootnoteProps () {
        if (!this.footnoteProps) {
            const api = Common.EditorApi.get();
            const props = api.asc_GetFootnoteProps();
            this.footnoteProps = {propsFormat: props.get_NumFormat(), propsPos: props.get_Pos()};
        }
        return this.footnoteProps;
    }

    initFootnoteStartAt () {
        if (!this.footnoteCurStart) {
            const api = Common.EditorApi.get();
            const currValue = api.asc_GetFootnoteProps().get_NumStart();
            this.toCustomFormat = value => {
                return value;
            };
            this.fromCustomFormat = value => {
                return value;
            };
            this.footnoteCurStart = this.toCustomFormat(currValue);
        }
        return this.footnoteCurStart;
    }

    getFootnoteStartAt (value, start) {
        const currValue = this.fromCustomFormat(start);

        switch (value) {
            case Asc.c_oAscNumberingFormat.UpperRoman: // I, II, III, ...
                this.toCustomFormat = _10toRome;
                this.fromCustomFormat = _Rometo10;
                break;
            case Asc.c_oAscNumberingFormat.LowerRoman: // i, ii, iii, ...
                this.toCustomFormat = value => { return _10toRome(value).toLocaleLowerCase(); };
                this.fromCustomFormat = value => { return _Rometo10(value.toLocaleUpperCase()); };
                break;
            case Asc.c_oAscNumberingFormat.UpperLetter: // A, B, C, ...
                this.toCustomFormat = _10toS;
                this.fromCustomFormat = _Sto10;
                break;
            case Asc.c_oAscNumberingFormat.LowerLetter: // a, b, c, ...
                this.toCustomFormat = value => { return _10toS(value).toLocaleLowerCase(); };
                this.fromCustomFormat = value => { return _Sto10(value.toLocaleUpperCase()); };
                break;
            default: // 1, 2, 3, ...
                this.toCustomFormat = value => { return value; };
                this.fromCustomFormat = value => { return value; };
                break;
        }
        return this.toCustomFormat(currValue);
    }

    onFootnoteStartAt (value, isDecrement) {
        let intValue;
        const step = 1;
        const maxValue = 16383;
        if(this.fromCustomFormat) {
            intValue = parseInt(this.fromCustomFormat(value));
        } else {
            const api = Common.EditorApi.get();
            intValue = api.asc_GetFootnoteProps().get_NumStart();
        }
        if (isDecrement) {
            intValue = Math.max(1, intValue - step);
        } else {
            intValue = Math.min(maxValue, intValue + step);
        }
        return this.toCustomFormat(intValue);
    }

    onInsertFootnote (format, start, location) {
        const api = Common.EditorApi.get();
        const props   = new Asc.CAscFootnotePr();
        let startTo10;
        if (this.fromCustomFormat) {
            startTo10 =  parseInt(this.fromCustomFormat(start));
        } else {
            startTo10 = api.asc_GetFootnoteProps().get_NumStart();
        }
        props.put_Pos(location);
        props.put_NumFormat(format);
        props.put_NumStart(startTo10);
        props.put_NumRestart(Asc.c_oAscFootnoteRestart.Continuous);
        api.asc_SetFootnoteProps(props, false);
        api.asc_AddFootnote();
        this.closeModal();
    }

    render () {
        return (
            <AddOther 
                closeModal={this.closeModal}
                onInsertPageNumber={this.onInsertPageNumber}
                onPageBreak={this.onPageBreak}
                onColumnBreak={this.onColumnBreak}
                onInsertSectionBreak={this.onInsertSectionBreak}
                getFootnoteProps={this.getFootnoteProps}
                getFootnoteStartAt={this.getFootnoteStartAt}
                onFootnoteStartAt={this.onFootnoteStartAt}
                onInsertFootnote={this.onInsertFootnote}
                initFootnoteStartAt={this.initFootnoteStartAt}
                inFootnote={this.props.inFootnote} 
                inControl={this.props.inControl} 
                paragraphLocked={this.props.paragraphLocked} 
                controlPlain={this.props.controlPlain}
                richDelLock={this.props.richDelLock}
                richEditLock={this.props.richEditLock}
                plainDelLock={this.props.plainDelLock}
                plainEditLock={this.props.plainEditLock}      
            />
        )
    }
}

const AddOtherWithTranslation = withTranslation()(AddOtherController);

export {AddOtherWithTranslation as AddOtherController};