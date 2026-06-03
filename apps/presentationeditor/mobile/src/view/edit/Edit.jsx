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
import { Popover, Sheet, View, f7 } from 'framework7-react';
import { Device } from '../../../../../common/mobile/utils/device';
import { EditLinkController } from "../../controller/edit/EditLink";
import { Theme, Layout, Transition, Type, Effect, StyleFillColor, CustomFillColor } from './EditSlide';
import { PageTextFonts, PageTextFontColor, PageTextHighlightColor, PageTextCustomFontColor, PageTextAddFormatting, PageTextBulletsAndNumbers, PageTextDirection, PageTextLineSpacing, PageTextBulletsLinkSettings, PageOrientationTextShape, PageOrientationTextTable } from './EditText';
import { PageShapeStyle, PageShapeStyleNoFill, PageReplaceContainer, PageReorderContainer, PageAlignContainer, PageShapeBorderColor, PageShapeCustomBorderColor, PageShapeCustomFillColor } from './EditShape';
import { PageImageReplace, PageImageReorder, PageImageAlign, PageLinkSettings } from './EditImage';
import { PageTableStyle, PageTableStyleOptions, PageTableCustomFillColor, PageTableBorderColor, PageTableCustomBorderColor, PageTableReorder, PageTableAlign, PageTableSize } from './EditTable';
import { PageChartDesign, PageChartDesignType, PageChartDesignStyle, PageChartDesignFill, PageChartDesignBorder, PageChartCustomFillColor, PageChartBorderColor, PageChartCustomBorderColor, PageChartReorder, PageChartAlign } from './EditChart'
import EditingPage from './EditingPage';
import { MainContext } from '../../page/main';

const routes = [
    {
        path: '/editing-page/',
        component: EditingPage,
        keepAlive: true
    },

    // Slides
    {
        path: '/layout/',
        component: Layout
    },
    {
        path: '/theme/',
        component: Theme
    },
    {
        path: '/transition/',
        component: Transition
    },
    {
        path: '/effect/',
        component: Effect
    },
    {
        path: '/type/',
        component: Type
    },
    {
        path: '/style/',
        component: StyleFillColor
    },
    {
        path: '/edit-custom-color/',
        component: CustomFillColor
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
        path: '/edit-text-highlight-color/',
        component: PageTextHighlightColor
    },
    {
        path: '/edit-text-custom-font-color/',
        component: PageTextCustomFontColor
    },
    {
        path: '/edit-text-add-formatting/',
        component: PageTextAddFormatting
    },
    {
        path: '/edit-bullets-and-numbers/',
        component: PageTextBulletsAndNumbers,
        routes: [
            {
                path: 'image-link/',
                component: PageTextBulletsLinkSettings
            }
        ]
    },
    {
        path: '/edit-text-direction/',
        component: PageTextDirection
    },
    {
        path: '/edit-text-line-spacing/',
        component: PageTextLineSpacing
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
        path: '/edit-align-shape/',
        component: PageAlignContainer
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
        path: '/edit-align-image', 
        component: PageImageAlign
    },
    {
        path: '/edit-image-link/',
        component: PageLinkSettings
    },

    // Table

    {
        path: '/edit-table-reorder/',
        component: PageTableReorder
    },
    {
        path: '/edit-table-align/',
        component: PageTableAlign
    },
    {
        path: '/edit-table-style/',
        component: PageTableStyle
    },
    {
        path: '/edit-table-size/',
        component: PageTableSize
    },
    {
        path: '/edit-table-style-options/',
        component: PageTableStyleOptions
    },
    {
        path: '/edit-table-border-color/',
        component: PageTableBorderColor
    },
    {
        path: '/edit-table-custom-border-color/',
        component: PageTableCustomBorderColor
    },
    {
        path: '/edit-table-custom-fill-color/',
        component: PageTableCustomFillColor
    }, 
    {
        path: '/edit-text-table-orientation/',
        component: PageOrientationTextTable
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
        path: '/edit-chart-reorder/',
        component: PageChartReorder
    },
    {
        path: '/edit-chart-align/',
        component: PageChartAlign
    },
    {
        path: '/edit-chart-border-color/',
        component: PageChartBorderColor
    },
    {
        path: '/edit-chart-custom-border-color/',
        component: PageChartCustomBorderColor
    },
    {
        path: '/edit-chart-custom-fill-color/',
        component: PageChartCustomFillColor
    },

    // Link
    {
        path: '/edit-link/',
        component: EditLinkController
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
