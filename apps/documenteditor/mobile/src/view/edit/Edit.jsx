import React, { useContext, useEffect } from 'react';
import { Popover, Sheet, View, f7 } from 'framework7-react';
import { Device } from '../../../../../common/mobile/utils/device';
import { PageTextFonts, PageTextAddFormatting, PageTextBulletsAndNumbers, PageTextLineSpacing, PageTextFontColor, PageTextCustomFontColor, PageTextHighlightColor, PageOrientationTextShape } from "./EditText";
import { ParagraphAdvSettings, PageParagraphBackColor, PageParagraphCustomColor, PageParagraphStyle, PageCreateTextStyle, PageChangeNextParagraphStyle } from "./EditParagraph";
import { PageShapeStyleNoFill, PageShapeStyle, PageShapeCustomFillColor, PageShapeBorderColor, PageShapeCustomBorderColor, PageWrap, PageReorder, PageReplace } from "./EditShape";
import { PageImageReorder, PageImageReplace, PageImageWrap, PageLinkSettings, PageWrappingStyle } from "./EditImage";
import { PageTableOptions, PageTableWrap, PageTableStyle, PageTableStyleOptions, PageTableCustomFillColor, PageTableBorderColor, PageTableCustomBorderColor } from "./EditTable";
import { PageChartDesign,  PageChartDesignType, PageChartDesignStyle, PageChartDesignFill, PageChartDesignBorder, PageChartCustomFillColor, PageChartBorderColor, PageChartCustomBorderColor, PageChartWrap, PageChartReorder } from "./EditChart";
import { PageEditLeaderTableContents, PageEditStylesTableContents, PageEditStructureTableContents } from './EditTableContents';
import EditingPage from './EditingPage';
import { MainContext } from '../../page/main';

const routes = [
    {
        path: '/editing-page/',
        component: EditingPage,
        keepAlive: true
    },
    //Edit text
    {
        path: '/edit-text-fonts/',
        component: PageTextFonts,
    },
    {
        path: '/edit-text-add-formatting/',
        component: PageTextAddFormatting,
    },
    {
        path: '/edit-bullets-and-numbers/',
        component: PageTextBulletsAndNumbers,
    },
    {
        path: '/edit-text-line-spacing/',
        component: PageTextLineSpacing,
    },
    {
        path: '/edit-text-font-color/',
        component: PageTextFontColor,
    },
    {
        path: '/edit-text-custom-font-color/',
        component: PageTextCustomFontColor,
    },
    {
        path: '/edit-text-highlight-color/',
        component: PageTextHighlightColor,
    },
    {
        path: '/edit-text-shape-orientation/',
        component: PageOrientationTextShape
    },

    // Edit link
    // {
    //     path: '/edit-link/',
    //     component: EditHyperlinkController
    // },

    //Edit paragraph
    {
        path: '/edit-paragraph-adv/',
        component: ParagraphAdvSettings,
    },
    {
        path: '/edit-paragraph-back-color/',
        component: PageParagraphBackColor,
    },
    {
        path: '/edit-paragraph-custom-color/',
        component: PageParagraphCustomColor,
    },
    {
        path: '/edit-paragraph-style/',
        component: PageParagraphStyle
    },
    {
        path: '/create-text-style/',
        component: PageCreateTextStyle
    },
    {
        path: '/change-next-paragraph-style/',
        component: PageChangeNextParagraphStyle
    },
    //Edit shape
    {
        path: '/edit-shape-style/',
        component: PageShapeStyle,
    },
    {
        path: '/edit-shape-style-no-fill/',
        component: PageShapeStyleNoFill,
    },
    {
        path: '/edit-shape-custom-fill-color/',
        component: PageShapeCustomFillColor,
    },
    {
        path: '/edit-shape-border-color/',
        component: PageShapeBorderColor,
    },
    {
        path: '/edit-shape-custom-border-color/',
        component: PageShapeCustomBorderColor,
    },
    {
        path: '/edit-shape-wrap/',
        component: PageWrap,
    },
    {
        path: '/edit-shape-reorder/',
        component: PageReorder,
    },
    {
        path: '/edit-shape-replace/',
        component: PageReplace,
    },

    // Edit image
    {
        path: '/edit-image-wrap/',
        component: PageImageWrap,
    },
    {
        path: '/edit-image-replace/',
        component: PageImageReplace,
    },
    {
        path: '/edit-image-reorder/',
        component: PageImageReorder,
    },
    {
        path: '/edit-image-link/',
        component: PageLinkSettings,
    },
    {
        path: '/edit-image-wrapping-style/',
        component: PageWrappingStyle
    },

    // Edit table
    {
        path: '/edit-table-options/',
        component: PageTableOptions,
    },
    {
        path: '/edit-table-wrap/',
        component: PageTableWrap,
    },
    {
        path: '/edit-table-style/',
        component: PageTableStyle,
    },
    {
        path: '/edit-table-style-options/',
        component: PageTableStyleOptions,
    },
    {
        path: '/edit-table-custom-fill-color/',
        component: PageTableCustomFillColor,
    },
    {
        path: '/edit-table-border-color/',
        component: PageTableBorderColor,
    },
    {
        path: '/edit-table-custom-border-color/',
        component: PageTableCustomBorderColor,
    },
    //Edit chart
    {
        path: '/edit-chart-wrap/',
        component: PageChartWrap,
    },
    {
        path: '/edit-chart-reorder/',
        component: PageChartReorder,
    },
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
        path: '/edit-chart-custom-fill-color/',
        component: PageChartCustomFillColor,
    },
    {
        path: '/edit-chart-border-color/',
        component: PageChartBorderColor,
    },
    {
        path: '/edit-chart-custom-border-color/',
        component: PageChartCustomBorderColor,
    }, 

    // Table Contents 

    {
        path: '/edit-style-table-contents/',
        component: PageEditStylesTableContents
    },
    {
        path: '/edit-leader-table-contents/',
        component: PageEditLeaderTableContents
    },
    {
        path: '/edit-structure-table-contents/',
        component: PageEditStructureTableContents
    },
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
            <Sheet id="edit-sheet" closeByOutsideClick={false} onSheetClosed={() =>  mainContext.closeOptions('edit')}>
                <View routes={routes} url='/editing-page/'>
                    <EditingPage />
                </View>
            </Sheet>
    )
};

export default EditView;
