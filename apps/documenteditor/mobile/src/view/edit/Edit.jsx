import React, {useState, useEffect} from 'react';
import {observer, inject} from "mobx-react";
import { Popover, Sheet, View, Page, Navbar, NavRight, NavLeft, NavTitle, Tabs, Tab, Link } from 'framework7-react';
import { f7 } from 'framework7-react';
import { useTranslation } from 'react-i18next';
import {Device} from '../../../../../common/mobile/utils/device';

import EditTextController from "../../controller/edit/EditText";
import EditParagraphController from "../../controller/edit/EditParagraph";
import EditShapeController from "../../controller/edit/EditShape";
import EditImageController from "../../controller/edit/EditImage";
import EditTableController from "../../controller/edit/EditTable";
import EditChartController from "../../controller/edit/EditChart";
import EditHyperlinkController from "../../controller/edit/EditHyperlink";
import EditHeaderController from "../../controller/edit/EditHeader";

import {PageTextFonts, PageTextAddFormatting, PageTextBullets, PageTextNumbers, PageTextLineSpacing, PageTextFontColor, PageTextCustomFontColor, PageTextBackgroundColor, PageTextCustomBackColor} from "./EditText";
import {ParagraphAdvSettings, PageParagraphBackColor, PageParagraphCustomColor} from "./EditParagraph";
import {PageShapeStyleNoFill, PageShapeStyle, PageShapeCustomFillColor, PageShapeBorderColor, PageShapeCustomBorderColor, PageWrap, PageReorder, PageReplace} from "./EditShape";
import {PageImageReorder, PageImageReplace, PageImageWrap, PageLinkSettings} from "./EditImage";
import {PageTableOptions, PageTableWrap, PageTableStyle, PageTableStyleOptions, PageTableCustomFillColor, PageTableBorderColor, PageTableCustomBorderColor} from "./EditTable";
import {PageChartStyle, PageChartCustomFillColor, PageChartBorderColor, PageChartCustomBorderColor, PageChartWrap, PageChartReorder} from "./EditChart";

const routes = [
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
        path: '/edit-text-bullets/',
        component: PageTextBullets,
    },
    {
        path: '/edit-text-numbers/',
        component: PageTextNumbers,
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
        path: '/edit-text-background-color/',
        component: PageTextBackgroundColor,
    },
    {
        path: '/edit-text-custom-back-color/',
        component: PageTextCustomBackColor,
    },
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
    //Edit image
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
    //Edit table
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
        path: '/edit-chart-style/',
        component: PageChartStyle,
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
    }
];

const EmptyEditLayout = () => {
    const { t } = useTranslation();
    const _t = t('Edit', {returnObjects: true});
    return (
        <Page>
            <div className="content-block inset">
                <div className="content-block-inner">
                    <p>{_t.textSelectObjectToEdit}</p>
                </div>
            </div>
        </Page>
    )
};

const EditLayoutNavbar = ({ editors, inPopover }) => {
    const isAndroid = Device.android;
    const { t } = useTranslation();
    const _t = t('Edit', {returnObjects: true});
    return (
        <Navbar>
        {
            editors.length > 1 ?
                <div className='tab-buttons tabbar'>
                    {editors.map((item, index) => <Link key={"de-link-" + item.id}  tabLink={"#" + item.id} tabLinkActive={index === 0}>{item.caption}</Link>)}
                    {isAndroid && <span className='tab-link-highlight' style={{width: 100 / editors.length + '%'}}></span>}
                </div> :
                <NavTitle>{ editors[0].caption }</NavTitle>
        }
        { !inPopover && <NavRight><Link icon='icon-expand-down' sheetClose></Link></NavRight> }
        </Navbar>
    )
};

const EditLayoutContent = ({ editors }) => {
    if (editors.length > 1) {
        return (
            <Tabs animated>
                {editors.map((item, index) =>
                    <Tab key={"de-tab-" + item.id} id={item.id} className="page-content" tabActive={index === 0}>
                        {item.component}
                    </Tab>
                )}
            </Tabs>
        )
    } else {
        return (
            <Page>
                {editors[0].component}
            </Page>
        )
    }
};

const EditTabs = props => {
    const { t } = useTranslation();
    const _t = t('Edit', {returnObjects: true});

    const settings = props.storeFocusObjects.settings;
    const headerType = props.storeFocusObjects.headerType;
    let editors = [];
    if (settings.length < 1) {
        editors.push({
            caption: _t.textSettings,
            component: <EmptyEditLayout />
        });
    } else {
        if (settings.indexOf('text') > -1) {
            editors.push({
                caption: _t.textText,
                id: 'edit-text',
                component: <EditTextController />
            })
        }
        if (settings.indexOf('paragraph') > -1) {
            editors.push({
                caption: _t.textParagraph,
                id: 'edit-paragraph',
                component: <EditParagraphController />
            })
        }
        if (settings.indexOf('table') > -1) {
            editors.push({
                caption: _t.textTable,
                id: 'edit-table',
                component: <EditTableController />
            })
        }
        if (settings.indexOf('header') > -1) {
            editors.push({
                caption: headerType === 2 ? _t.textFooter : _t.textHeader,
                id: 'edit-header',
                component: <EditHeaderController />
            })
        }
        if (settings.indexOf('shape') > -1) {
            editors.push({
                caption: _t.textShape,
                id: 'edit-shape',
                component: <EditShapeController />
            })
        }
        if (settings.indexOf('image') > -1) {
            editors.push({
                caption: _t.textImage,
                id: 'edit-image',
                component: <EditImageController />
            })
        }
        if (settings.indexOf('chart') > -1) {
            editors.push({
                caption: _t.textChart,
                id: 'edit-chart',
                component: <EditChartController />
            })
        }
        if (settings.indexOf('hyperlink') > -1) {
            editors.push({
                caption: _t.textHyperlink,
                id: 'edit-link',
                component: <EditHyperlinkController />
            })
        }
    }

    return (
        <View style={props.style} stackPages={true} routes={routes}>
            <Page pageContent={false}>
                <EditLayoutNavbar editors={editors} inPopover={props.inPopover}/>
                <EditLayoutContent editors={editors} />
            </Page>
        </View>

    )
};

const EditTabsContainer = inject("storeFocusObjects")(observer(EditTabs));

const EditView = props => {
    const onOptionClick = (page) => {
        $f7.views.current.router.navigate(page);
    };
    const show_popover = props.usePopover;
    return (
        show_popover ?
            <Popover id="edit-popover" className="popover__titled" onPopoverClosed={() => props.onClosed()}>
                <EditTabsContainer inPopover={true} onOptionClick={onOptionClick} style={{height: '410px'}} />
            </Popover> :
            <Sheet id="edit-sheet" push onSheetClosed={() => props.onClosed()}>
                <EditTabsContainer onOptionClick={onOptionClick} />
            </Sheet>
    )
};

const EditOptions = props => {
    useEffect(() => {
        if ( Device.phone )
            f7.sheet.open('#edit-sheet');
        else f7.popover.open('#edit-popover', '#btn-edit');

        return () => {
            // component will unmount
        }
    });

    const onviewclosed = () => {
        if ( props.onclosed )
            props.onclosed();
    };

    return (
        <EditView usePopover={!Device.phone} onClosed={onviewclosed} />
    )
};

export default EditOptions;
