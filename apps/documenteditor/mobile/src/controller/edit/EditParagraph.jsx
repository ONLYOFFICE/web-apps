import React, {Component} from 'react';
import { EditParagraph } from '../../view/edit/EditParagraph';
import {observer, inject} from "mobx-react";

class EditParagraphController extends Component {
    constructor (props) {
        super(props);
        props.storeParagraphSettings.setBackColor(undefined);
    }

    onStyleClick (name) {
        const api = Common.EditorApi.get();
        if (api) {
            api.put_Style(name);
        }
    }

    onDistanceBefore (distance, isDecrement) {
        const api = Common.EditorApi.get();
        if (api) {
            let step;
            let newDistance;
            if (Common.Utils.Metric.getCurrentMetric() == Common.Utils.Metric.c_MetricUnits.pt) {
                step = 1;
            } else {
                step = 0.01;
            }
            const maxValue = Common.Utils.Metric.fnRecalcFromMM(558.8);

            if (isDecrement) {
                newDistance = Math.max(-1, distance - step);
            } else {
                newDistance = Math.min(maxValue, distance + step);
            }

            api.put_LineSpacingBeforeAfter(0, (newDistance < 0) ? -1 : Common.Utils.Metric.fnRecalcToMM(newDistance));
        }
    }

    onDistanceAfter (distance, isDecrement) {
        const api = Common.EditorApi.get();
        if (api) {
            let step;
            let newDistance;
            if (Common.Utils.Metric.getCurrentMetric() === Common.Utils.Metric.c_MetricUnits.pt) {
                step = 1;
            } else {
                step = 0.01;
            }

            const maxValue = Common.Utils.Metric.fnRecalcFromMM(558.8);

            if (isDecrement) {
                newDistance = Math.max(-1, distance - step);
            } else {
                newDistance = Math.min(maxValue, distance + step);
            }

            api.put_LineSpacingBeforeAfter(1, (newDistance < 0) ? -1 : Common.Utils.Metric.fnRecalcToMM(newDistance));
        }
    }

    onSpinFirstLine (paragraphProperty, isDecrement) {
        const api = Common.EditorApi.get();
        if (api) {
            let distance = paragraphProperty.get_Ind().get_FirstLine();
            let step;
            distance = Common.Utils.Metric.fnRecalcFromMM(distance);

            if (Common.Utils.Metric.getCurrentMetric() === Common.Utils.Metric.c_MetricUnits.pt) {
                step = 1;
            } else {
                step = 0.1;
            }

            const minValue = Common.Utils.Metric.fnRecalcFromMM(-558.7);
            const maxValue = Common.Utils.Metric.fnRecalcFromMM(558.7);

            if (isDecrement) {
                distance = Math.max(minValue, distance - step);
            } else {
                distance = Math.min(maxValue, distance + step);
            }

            var newParagraphProp = new Asc.asc_CParagraphProperty();
            newParagraphProp.get_Ind().put_FirstLine(Common.Utils.Metric.fnRecalcToMM(distance));
            api.paraApply(newParagraphProp);
        }
    }

    onSpaceBetween (checked) {
        const api = Common.EditorApi.get();
        if (api) {
            api.put_AddSpaceBetweenPrg(checked);
        }
    }

    onBreakBefore (checked) {
        const api = Common.EditorApi.get();
        if (api) {
            const properties = new Asc.asc_CParagraphProperty();
            properties.put_PageBreakBefore(checked);
            api.paraApply(properties);
        }
    }

    onOrphan (checked) {
        const api = Common.EditorApi.get();
        if (api) {
            const properties = new Asc.asc_CParagraphProperty();
            properties.put_WidowControl(checked);
            api.paraApply(properties);
        }
    }

    onKeepTogether (checked) {
        const api = Common.EditorApi.get();
        if (api) {
            const properties = new Asc.asc_CParagraphProperty();
            properties.put_KeepLines(checked);
            api.paraApply(properties);
        }
    }

    onKeepNext (checked) {
        const api = Common.EditorApi.get();
        if (api) {
            const properties = new Asc.asc_CParagraphProperty();
            properties.put_KeepNext(checked);
            api.paraApply(properties);
        }
    }

    onBackgroundColor (color) {
        const api = Common.EditorApi.get();
        const properties = new Asc.asc_CParagraphProperty();
        properties.put_Shade(new Asc.asc_CParagraphShd());
        if (color == 'transparent') {
            properties.get_Shade().put_Value(Asc.c_oAscShdNil);
        } else {
            properties.get_Shade().put_Value(Asc.c_oAscShdClear);
            properties.get_Shade().put_Color(Common.Utils.ThemeColor.getRgbColor(color));
        }
        api.paraApply(properties);
    }

    render () {
        return (
            <EditParagraph onStyleClick={this.onStyleClick}
                           onDistanceBefore={this.onDistanceBefore}
                           onDistanceAfter={this.onDistanceAfter}
                           onSpinFirstLine={this.onSpinFirstLine}
                           onSpaceBetween={this.onSpaceBetween}
                           onBreakBefore={this.onBreakBefore}
                           onOrphan={this.onOrphan}
                           onKeepTogether={this.onKeepTogether}
                           onKeepNext={this.onKeepNext}
                           onBackgroundColor={this.onBackgroundColor}
            />
        )
    }
}

export default inject("storeParagraphSettings")(observer(EditParagraphController));