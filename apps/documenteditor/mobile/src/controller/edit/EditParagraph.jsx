/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, {Component} from 'react';
import { EditParagraph } from '../../view/edit/EditParagraph';
import {observer, inject} from "mobx-react";

class EditParagraphController extends Component {
    constructor (props) {
        super(props);
        props.storeParagraphSettings.setBackColor(undefined);

        this.onStyleClick = this.onStyleClick.bind(this);
        this.onSaveStyle = this.onSaveStyle.bind(this);
        this.onStyleMenuDelete = this.onStyleMenuDelete.bind(this);
    }

    onStyleClick (name) {
        const api = Common.EditorApi.get();
        if (api) {
            api.put_Style(name);
            this.props.storeParagraphSettings.changeParaStyleName(name);
        }
    }

    onSaveStyle(title, nextParagraphStyle) {
        const api = Common.EditorApi.get();
        const style = api.asc_GetStyleFromFormatting();

        style.put_Name(title);
        style.put_Next(nextParagraphStyle ? nextParagraphStyle : null);
        
        api.asc_AddNewStyle(style);
        this.props.storeParagraphSettings.changeParaStyleName(title);
    }

    onStyleMenuDelete(styleName) {
        const api = Common.EditorApi.get();
        api.asc_RemoveStyle(styleName);
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

            api.put_LineSpacingBeforeAfter(0, (isDecrement && newDistance < 0) ? -1 : (!isDecrement && newDistance > -1 && newDistance < 0) ? 0 : Common.Utils.Metric.fnRecalcToMM(newDistance));
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

            api.put_LineSpacingBeforeAfter(1, (isDecrement && newDistance < 0) ? -1 : (!isDecrement && newDistance > -1 && newDistance < 0) ? 0 : Common.Utils.Metric.fnRecalcToMM(newDistance));
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
    
        if (color == 'transparent') {
            api.put_ParagraphShade(false);
        } else {
            api.put_ParagraphShade(true, Common.Utils.ThemeColor.getRgbColor(color));
        }
        
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
                           onSaveStyle={this.onSaveStyle}
                           onStyleMenuDelete={this.onStyleMenuDelete}
            />
        )
    }
}

export default inject("storeParagraphSettings")(observer(EditParagraphController));
