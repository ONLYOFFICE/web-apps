import React, {useState, useEffect} from 'react';
import {observer, inject} from "mobx-react";
import { Popover, Sheet, View, Page, Navbar, NavRight, NavLeft, NavTitle, Tabs, Tab, Link } from 'framework7-react';
import { f7 } from 'framework7-react';
import { useTranslation } from 'react-i18next';
import {Device} from '../../../../../common/mobile/utils/device';

import EditTextController from "./controller/EditText";
import EditParagraphController from "./controller/EditParagraph";
import EditShapeController from "./controller/EditShape";
import EditImageController from "./controller/EditImage";
import EditTableController from "./controller/EditTable";
import EditChartController from "./controller/EditChart";
import EditHyperlinkController from "./controller/EditHyperlink";
import EditHeaderController from "./controller/EditHeader";

import {PageAdditionalFormatting, PageBullets, PageFonts, PageLineSpacing, PageNumbers} from "./EditText";
import {PageAdvancedSettings} from "./EditParagraph";
import {PageWrap, PageReorder, PageReplace} from "./EditShape";
import {PageImageReorder, PageImageReplace, PageImageWrap, PageLinkSettings} from "./EditImage";
import {PageTableOptions, PageTableWrap, PageTableStyle} from "./EditTable";
import {PageChartWrap, PageChartReorder} from "./EditChart";

const routes = [
    //Edit text
    {
        path: '/edit-text-fonts/',
        component: PageFonts,
    },
    {
        path: '/edit-text-add-formatting/',
        component: PageAdditionalFormatting,
    },
    {
        path: '/edit-text-bullets/',
        component: PageBullets,
    },
    {
        path: '/edit-text-numbers/',
        component: PageNumbers,
    },
    {
        path: '/edit-text-line-spacing/',
        component: PageLineSpacing,
    },
    //Edit paragraph
    {
        path: '/edit-paragraph-adv/',
        component: PageAdvancedSettings,
    },
    //Edit shape
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
    //Edit chart
    {
        path: '/edit-chart-wrap/',
        component: PageChartWrap,
    },
    {
        path: '/edit-chart-reorder/',
        component: PageChartReorder,
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
    const { t } = useTranslation();
    const _t = t('Edit', {returnObjects: true});
    return (
        <Navbar>
        {
            editors.length > 1 ?
                <NavLeft tabbar>
                    {editors.map((item, index) => <Link key={"de-link-" + item.id}  tabLink={"#" + item.id} tabLinkActive={index === 0}>{item.caption}</Link>)}
                </NavLeft> :
                <NavTitle>{ editors[0].caption }</NavTitle>
        }
        { !inPopover && <NavRight><Link sheetClose>{_t.textClose}</Link></NavRight> }
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
