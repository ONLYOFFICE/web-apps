import React, {Component} from 'react';
import { f7 } from 'framework7-react';
import {Device} from '../../../../../common/mobile/utils/device';
import {observer, inject} from "mobx-react";

import { EditText } from '../../view/edit/EditText';

class EditTextController extends Component {
    constructor (props) {
        super(props);
    }

    toggleBold(value) {
        const api = Common.EditorApi.get();
        api.put_TextPrBold(value);
    };

    toggleItalic(value) {
        const api = Common.EditorApi.get();
        api.put_TextPrItalic(value);
    };

    toggleUnderline(value) {
        const api = Common.EditorApi.get();
        api.put_TextPrUnderline(value);
    };

    toggleStrikethrough(value) {
        const api = Common.EditorApi.get();
        api.put_TextPrStrikeout(value);
    };

    onParagraphAlign(type) {
        const api = Common.EditorApi.get();
        let value;
        
        switch (type) {
            case 'just':
                value = 3;
                break;
            case 'right':
                value = 0;
                break;
            case 'center':
                value = 2;
                break;
            default:
                value = 1;
                break;
        }

        api.put_PrAlign(value);
    };

    onParagraphValign(type) {
        const api = Common.EditorApi.get();
        let value;

        switch(type) {
            case 'top':
                value = Asc.c_oAscVAlign.Top;
                break;
            case 'center':
                value = Asc.c_oAscVAlign.Center;
                break;
            case 'bottom':
                value = Asc.c_oAscVAlign.Bottom;
                break;
        }

        api.setVerticalAlign(value);
    };

    onParagraphMove(type) {
        const api = Common.EditorApi.get();

        if(type === 'left') {
            api.DecreaseIndent();
        } else {
            api.IncreaseIndent();
        }
    };

    onDistanceBefore(distance, isDecrement) {
        const api = Common.EditorApi.get();
        let step;
        let newDistance;

        if (Common.Utils.Metric.getCurrentMetric() == Common.Utils.Metric.c_MetricUnits.pt) {
            step = 1;
        } else {
            step = 0.01;
        }

        const maxValue = Common.Utils.Metric.fnRecalcFromMM(558.8);

        if(isDecrement) {
            newDistance = Math.max(-1, distance - step);
        } else {
            newDistance = (distance < 0) ? 0 : Math.min(maxValue, distance + step);
        }

        newDistance = parseFloat(newDistance.toFixed(2));

        api.put_LineSpacingBeforeAfter(0, (newDistance < 0) ? -1 : Common.Utils.Metric.fnRecalcToMM(newDistance));
    };

    onDistanceAfter(distance, isDecrement) {
        const api = Common.EditorApi.get();
        let step;
        let newDistance;

        if (Common.Utils.Metric.getCurrentMetric() == Common.Utils.Metric.c_MetricUnits.pt) {
            step = 1;
        } else {
            step = 0.01;
        }

        const maxValue = Common.Utils.Metric.fnRecalcFromMM(558.8);

        if(isDecrement) {
            newDistance = Math.max(-1, distance - step);
        } else {
            newDistance = (distance < 0) ? 0 : Math.min(maxValue, distance + step);
        }

        newDistance = parseFloat(newDistance.toFixed(2));

        api.put_LineSpacingBeforeAfter(1, (newDistance < 0) ? -1 : Common.Utils.Metric.fnRecalcToMM(newDistance));
    };

    changeFontSize(curSize, isDecrement) {
        const api = Common.EditorApi.get();
        let size = curSize;

        if (isDecrement) {
            typeof size === 'undefined' || size == '' ? api.FontSizeOut() : size = Math.max(1, --size);
        } else {
            typeof size === 'undefined' || size == '' ? api.FontSizeIn() : size = Math.min(300, ++size);
        }
        if (typeof size !== 'undefined' || size == '') {
            api.put_TextPrFontSize(size);
        }
    };

    changeFontFamily(name) {
        const api = Common.EditorApi.get();
        if (name) {
            api.put_TextPrFontName(name);
        }
    }

    onTextColor(color) {
        const api = Common.EditorApi.get();
        api.put_TextColor(Common.Utils.ThemeColor.getRgbColor(color));
    }

    // Additional

    onAdditionalStrikethrough(type, value) {
        const api = Common.EditorApi.get();
        const paragraphProps = new Asc.asc_CParagraphProperty();

        if ('strikethrough' === type) {
            paragraphProps.put_DStrikeout(false);
            paragraphProps.put_Strikeout(value);
        } else {
            paragraphProps.put_DStrikeout(value);
            paragraphProps.put_Strikeout(false);
        }

        api.paraApply(paragraphProps);
    }

    onAdditionalCaps(type, value) {
        const api = Common.EditorApi.get();
        const paragraphProps = new Asc.asc_CParagraphProperty();

        if ('small' === type) {
            paragraphProps.put_AllCaps(false);
            paragraphProps.put_SmallCaps(value);
        } else {
            paragraphProps.put_AllCaps(value);
            paragraphProps.put_SmallCaps(false);
        }

        api.paraApply(paragraphProps);
    }

    onAdditionalScript(type, value) {
        const api = Common.EditorApi.get();
        
        if ('superscript' === type) {
            api.put_TextPrBaseline(value ? 1 : 0);
        } else {
            api.put_TextPrBaseline(value ? 2 : 0);
        }   
    }

    changeLetterSpacing(curSpacing, isDecrement) {
        const api = Common.EditorApi.get();
        let spacing = curSpacing;

        if (isDecrement) {
            spacing = (spacing === null || spacing === undefined || spacing === NaN) ? 0 : Math.max(-100, --spacing);
        } else {
            spacing = (spacing === null || spacing === undefined || spacing === NaN) ? 0 : Math.min(100, ++spacing);
        }
    
        const properties = new Asc.asc_CParagraphProperty();
        properties.put_TextSpacing(Common.Utils.Metric.fnRecalcToMM(spacing));
        api.paraApply(properties);
    }

    onBullet(type) {
        const api = Common.EditorApi.get();
        api.put_ListType(0, parseInt(type));
    }

    onNumber(type) {
        const api = Common.EditorApi.get();
        api.put_ListType(1, parseInt(type));
    }

    onLineSpacing(value) {
        const api = Common.EditorApi.get();
        const LINERULE_AUTO = 1;
        api.put_PrLineSpacing(LINERULE_AUTO, value);
    }

    render () {
        return (
            <EditText
                toggleBold={this.toggleBold}
                toggleItalic={this.toggleItalic}
                toggleUnderline={this.toggleUnderline}
                toggleStrikethrough={this.toggleStrikethrough}
                onParagraphAlign={this.onParagraphAlign}
                onParagraphValign={this.onParagraphValign}
                onParagraphMove={this.onParagraphMove}
                onDistanceBefore={this.onDistanceBefore}
                onDistanceAfter={this.onDistanceAfter}
                changeFontSize={this.changeFontSize}
                changeFontFamily={this.changeFontFamily}
                onTextColor={this.onTextColor}
                onAdditionalStrikethrough={this.onAdditionalStrikethrough}
                onAdditionalCaps={this.onAdditionalCaps}
                onAdditionalScript={this.onAdditionalScript}
                changeLetterSpacing={this.changeLetterSpacing}
                onBullet={this.onBullet}
                onNumber={this.onNumber}
                onLineSpacing={this.onLineSpacing}
            />
        )
    }
}

export default EditTextController;