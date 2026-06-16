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

import React, { useContext, useEffect } from 'react';
import { Popover, Sheet, View } from 'framework7-react';
import { f7 } from 'framework7-react';
import { Device } from '../../../../../common/mobile/utils/device';
// import { EditLinkController } from "../../controller/edit/EditLink";
import { PageShapeStyle, PageShapeStyleNoFill, PageReplaceContainer, PageReorderContainer, PageShapeBorderColor, PageShapeCustomBorderColor, PageShapeCustomFillColor } from './EditShape';
import { PageImageReplace, PageImageReorder, PageLinkSettings } from './EditImage';
import { TextColorCell, FillColorCell, CustomTextColorCell, CustomFillColorCell, FontsCell, TextFormatCell, TextOrientationCell, BorderStyleCell, BorderColorCell, CustomBorderColorCell, BorderSizeCell, PageFormatCell, PageAccountingFormatCell, PageCurrencyFormatCell, PageDateFormatCell, PageTimeFormatCell, CellStyle, PageCreationCustomFormat, CustomFormats, PageCellTextDirection } from './EditCell';
import { PageTextFonts, PageTextFontColor, PageTextCustomFontColor, PageOrientationTextShape, PageTextAdditionalFormatting, PageTextDirection } from './EditText';
import { PageChartDesign,  PageChartDesignType, PageChartDesignStyle, PageChartDesignFill, PageChartDesignBorder, PageChartCustomFillColor, PageChartBorderColor, PageChartCustomBorderColor, PageChartReorder, PageChartLayout, PageLegend, PageChartTitle, PageHorizontalAxisTitle, PageVerticalAxisTitle, PageHorizontalGridlines, PageVerticalGridlines, PageDataLabels, PageChartVerticalAxis, PageVertAxisCrosses, PageDisplayUnits, PageVertMajorType, PageVertMinorType, PageVertLabelPosition, PageChartHorizontalAxis, PageHorAxisCrosses, PageHorAxisPosition, PageHorMajorType, PageHorMinorType, PageHorLabelPosition } from './EditChart';
import { PageEditTypeLink, PageEditSheet } from './EditLink';
import EditingPage from './EditingPage';
import { MainContext } from '../../page/main';

const routes = [
    {
        path: '/editing-page/',
        component: EditingPage,
        keepAlive: true
    },
    // Shape
    {
        path: '/edit-style-shape/',
        component: PageShapeStyle
    },
    {
        path: '/edit-style-shape-no-fill/',
        component: PageShapeStyleNoFill
    },
    {
        path: '/edit-replace-shape/',
        component: PageReplaceContainer
    },
    {
        path: '/edit-reorder-shape',
        component: PageReorderContainer
    },
    {
        path: '/edit-shape-border-color/',
        component: PageShapeBorderColor
    },
    {
        path: '/edit-shape-custom-border-color/',
        component: PageShapeCustomBorderColor
    }, 
    {
        path: '/edit-shape-custom-fill-color/',
        component: PageShapeCustomFillColor
    },
    {
        path: '/edit-text-shape-orientation/',
        component: PageOrientationTextShape
    },

    // Image

    {
        path: '/edit-replace-image/',
        component: PageImageReplace
    },
    {
        path: '/edit-reorder-image/',
        component: PageImageReorder
    },
    {
        path: '/edit-image-link/',
        component: PageLinkSettings
    },

    // Cell

    {
        path: '/edit-cell-text-color/',
        component: TextColorCell
    },
    {
        path: '/edit-cell-fill-color/',
        component: FillColorCell
    },
    {
        path: '/edit-cell-text-custom-color/',
        component: CustomTextColorCell
    },
    {
        path: '/edit-cell-fill-custom-color/',
        component: CustomFillColorCell
    },
    {
        path: '/edit-cell-text-fonts/',
        component: FontsCell
    },
    {
        path: '/edit-cell-text-format/',
        component: TextFormatCell
    },
    {
        path: '/edit-cell-text-orientation/',
        component: TextOrientationCell
    },
    {
        path: '/edit-cell-text-direction/',
        component: PageCellTextDirection
    },
    {
        path: '/edit-text-direction/',
        component: PageTextDirection
    },
    {
        path: '/edit-cell-border-style/',
        component: BorderStyleCell
    },
    {
        path: '/edit-border-color-cell/',
        component: BorderColorCell
    },
    {
        path: '/edit-border-custom-color-cell/',
        component: CustomBorderColorCell
    },
    {
        path: '/edit-border-size-cell/',
        component: BorderSizeCell
    },
    {
        path: '/edit-format-cell/',
        component: PageFormatCell
    },
    {
        path: '/edit-accounting-format-cell/',
        component: PageAccountingFormatCell
    },
    {
        path: '/edit-currency-format-cell/',
        component: PageCurrencyFormatCell
    },
    {
        path: '/edit-date-format-cell/',
        component: PageDateFormatCell
    },
    {
        path: '/edit-time-format-cell/',
        component: PageTimeFormatCell
    }, 
    {
        path: '/edit-cell-style/',
        component: CellStyle
    },

    // Text

    {
        path: '/edit-text-fonts/',
        component: PageTextFonts
    },
    {
        path: '/edit-text-font-color/',
        component: PageTextFontColor
    }, 
    {
        path: '/edit-text-custom-font-color/',
        component: PageTextCustomFontColor
    },
    {
        path: '/edit-text-add-formatting/',
        component: PageTextAdditionalFormatting
    },

    // Chart 

    {
        path: '/edit-chart-design/',
        component: PageChartDesign,
    },
    {
        path: '/edit-chart-type/',
        component: PageChartDesignType
    },
    {
        path: '/edit-chart-style/',
        component: PageChartDesignStyle
    },
    {
        path: '/edit-chart-fill/',
        component: PageChartDesignFill
    },
    {
        path: '/edit-chart-border/',
        component: PageChartDesignBorder
    },
    {
        path: '/edit-chart-border-color/',
        component: PageChartBorderColor
    },
    {
        path: '/edit-chart-custom-fill-color/',
        component: PageChartCustomFillColor
    },
    {
        path: '/edit-chart-custom-border-color/',
        component: PageChartCustomBorderColor
    },
    {
        path: '/edit-chart-reorder/',
        component: PageChartReorder
    },
    {
        path: '/edit-chart-layout/',
        component: PageChartLayout
    },
    {
        path: '/edit-chart-title/',
        component: PageChartTitle
    },
    {
        path: '/edit-chart-legend/',
        component: PageLegend
    },
    {
        path: '/edit-horizontal-axis-title/',
        component: PageHorizontalAxisTitle
    },
    {
        path: '/edit-vertical-axis-title/',
        component: PageVerticalAxisTitle
    },
    {
        path: '/edit-horizontal-gridlines/',
        component: PageHorizontalGridlines
    },
    {
        path: '/edit-vertical-gridlines/',
        component: PageVerticalGridlines
    },
    {
        path: '/edit-data-labels/',
        component: PageDataLabels
    },

    // Vertical Axis

    {
        path: '/edit-chart-vertical-axis/',
        component: PageChartVerticalAxis
    },
    {
        path: '/edit-vert-axis-crosses/',
        component: PageVertAxisCrosses
    },
    {
        path: '/edit-display-units/',
        component: PageDisplayUnits
    },
    {
        path: '/edit-vert-major-type/',
        component: PageVertMajorType
    },
    {
        path: '/edit-vert-minor-type/',
        component: PageVertMinorType
    },
    {
        path: '/edit-vert-label-position/',
        component: PageVertLabelPosition
    },

    // Horizontal Axis

    {
        path: '/edit-chart-horizontal-axis/',
        component: PageChartHorizontalAxis
    },
    {
        path: '/edit-hor-axis-crosses/',
        component: PageHorAxisCrosses
    },
    {
        path: '/edit-hor-axis-position/',
        component: PageHorAxisPosition
    },
    {
        path: '/edit-hor-major-type/',
        component: PageHorMajorType
    },
    {
        path: '/edit-hor-minor-type/',
        component: PageHorMinorType
    },
    {
        path: '/edit-hor-label-position/',
        component: PageHorLabelPosition
    },

    // Link 
    {
        path: '/edit-link-type/',
        component: PageEditTypeLink
    },
    {
        path: '/edit-link-sheet',
        component: PageEditSheet
    },

    // Add custom format
    {
        path: '/custom-format/',
        component: CustomFormats
    },
    {
        path: '/create-custom-format/',
        component: PageCreationCustomFormat
    }
];

routes.forEach(route => {
    route.options = {
        ...route.options,
        transition: 'f7-push'
    };
});

const EditView = () => {
    const mainContext = useContext(MainContext);
    // const api = Common.EditorApi.get();
    // const cellinfo = api.asc_getCellInfo();
    // const hyperinfo = cellinfo.asc_getHyperlink();
    // const isAddShapeHyperlink = api.asc_canAddShapeHyperlink();

    useEffect(() => {
        if(Device.phone) {
            f7.sheet.open('#edit-sheet');
        } else {
            f7.popover.open('#edit-popover', '#btn-edit');
        }
    }, []);

    return (
        !Device.phone ?
            <Popover id="edit-popover" className="popover__titled" closeByOutsideClick={false} onPopoverClosed={() => mainContext.closeOptions('edit')}>
                <View style={{ height: '410px' }} routes={routes} url='/editing-page/'>
                    <EditingPage />
                </View>
            </Popover> :
            <Sheet id="edit-sheet" onSheetClosed={() => mainContext.closeOptions('edit')}>
                <View routes={routes} url='/editing-page/'>
                    <EditingPage />
                </View>
            </Sheet>
    )
};

export default EditView;
