import React, {useState, useEffect} from 'react';
import {observer, inject} from "mobx-react";
import { Popover, Sheet, View, Page, Navbar, NavRight, NavLeft, NavTitle, Tabs, Tab, Link } from 'framework7-react';
import { f7 } from 'framework7-react';
import { useTranslation } from 'react-i18next';
import {Device} from '../../../../../common/mobile/utils/device';

import EditSlideController from "../../controller/edit/EditSlide";
import EditTextController from "../../controller/edit/EditText";
import EditShapeController from "../../controller/edit/EditShape";
import EditImageController from "../../controller/edit/EditImage";
import EditTableController from "../../controller/edit/EditTable";
import EditChartController from "../../controller/edit/EditChart";
import { EditLinkController } from "../../controller/edit/EditLink";

import { Theme, Layout, Transition, Type, Effect, StyleFillColor, CustomFillColor } from './EditSlide';
import { PageTextFonts, PageTextFontColor, PageTextCustomFontColor, PageTextAddFormatting, PageTextBullets, PageTextNumbers, PageTextLineSpacing } from './EditText';
import { PageShapeStyle, PageShapeStyleNoFill, PageReplaceContainer, PageReorderContainer, PageAlignContainer, PageShapeBorderColor, PageShapeCustomBorderColor, PageShapeCustomFillColor } from './EditShape';
import { PageImageReplace, PageImageReorder, PageImageAlign, PageLinkSettings } from './EditImage';
import { PageTableStyle, PageTableStyleOptions, PageTableCustomFillColor, PageTableBorderColor, PageTableCustomBorderColor, PageTableReorder, PageTableAlign } from './EditTable';
import { PageChartStyle, PageChartCustomFillColor, PageChartBorderColor, PageChartCustomBorderColor, PageChartReorder, PageChartAlign } from './EditChart'
import { PageLinkTo, PageTypeLink } from './EditLink'

const routes = [

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
        path: '/edit-text-custom-font-color/',
        component: PageTextCustomFontColor
    },
    {
        path: '/edit-text-add-formatting/',
        component: PageTextAddFormatting
    },
    {
        path: '/edit-text-bullets/',
        component: PageTextBullets
    },
    {
        path: '/edit-text-numbers/',
        component: PageTextNumbers
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
        path: '/edit-chart-style/',
        component: PageChartStyle
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
        path: '/edit-link-type/',
        component: PageTypeLink
    },
    {
        path: '/edit-link-to/',
        component: PageLinkTo
    }
];

const EmptyEditLayout = () => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
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
    return (
        <Navbar>
            {
                editors.length > 1 ?
                    <div className='tab-buttons tabbar'>
                        {editors.map((item, index) => <Link key={"pe-link-" + item.id}  tabLink={"#" + item.id} tabLinkActive={index === 0}>{item.caption}</Link>)}
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
                    <Tab key={"pe-tab-" + item.id} id={item.id} className="page-content" tabActive={index === 0}>
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
    const _t = t('View.Edit', {returnObjects: true});

    const settings = props.storeFocusObjects.settings;
    
    let editors = [];
    if (settings.length < 1) {
        editors.push({
            caption: _t.textSettings,
            component: <EmptyEditLayout />
        });
    } else {
        if (settings.indexOf('slide') > -1) {
            editors.push({
                caption: _t.textSlide,
                id: 'edit-slide',
                component: <EditSlideController />
            })
        }
        if (settings.indexOf('text') > -1) {
            editors.push({
                caption: _t.textText,
                id: 'edit-text',
                component: <EditTextController />
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
        if (settings.indexOf('table') > -1) {
            editors.push({
                caption: _t.textTable,
                id: 'edit-table',
                component: <EditTableController />
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
                component: <EditLinkController />
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