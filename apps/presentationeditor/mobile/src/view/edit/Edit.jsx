import React, { useContext, useEffect } from 'react';
import { Popover, Sheet, View, f7 } from 'framework7-react';
import { Device } from '../../../../../common/mobile/utils/device';
import { EditLinkController } from "../../controller/edit/EditLink";
import { Theme, Layout, Transition, Type, Effect, StyleFillColor, CustomFillColor } from './EditSlide';
import { PageTextFonts, PageTextFontColor, PageTextHighlightColor, PageTextCustomFontColor, PageTextAddFormatting, PageTextBulletsAndNumbers, PageTextLineSpacing, PageTextBulletsLinkSettings, PageOrientationTextShape } from './EditText';
import { PageShapeStyle, PageShapeStyleNoFill, PageReplaceContainer, PageReorderContainer, PageAlignContainer, PageShapeBorderColor, PageShapeCustomBorderColor, PageShapeCustomFillColor } from './EditShape';
import { PageImageReplace, PageImageReorder, PageImageAlign, PageLinkSettings } from './EditImage';
import { PageTableStyle, PageTableStyleOptions, PageTableCustomFillColor, PageTableBorderColor, PageTableCustomBorderColor, PageTableReorder, PageTableAlign } from './EditTable';
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