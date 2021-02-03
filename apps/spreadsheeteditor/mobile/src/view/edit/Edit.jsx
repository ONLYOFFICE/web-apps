import React, {useState, useEffect} from 'react';
import {observer, inject} from "mobx-react";
import { Popover, Sheet, View, Page, Navbar, NavRight, NavLeft, NavTitle, Tabs, Tab, Link } from 'framework7-react';
import { f7 } from 'framework7-react';
import { useTranslation } from 'react-i18next';
import {Device} from '../../../../../common/mobile/utils/device';

import EditCellController from "../../controller/edit/EditCell";
import EditShapeController from "../../controller/edit/EditShape";
import EditImageController from "../../controller/edit/EditImage";

import { PageShapeStyle, PageShapeStyleNoFill, PageReplaceContainer, PageReorderContainer, PageShapeBorderColor, PageShapeCustomBorderColor, PageShapeCustomFillColor } from './EditShape';
import { PageImageReplace, PageImageReorder, PageLinkSettings } from './EditImage';

const routes = [

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
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    return (
        <Navbar>
            {
                editors.length > 1 ?
                    <div className='tab-buttons tabbar'>
                        {editors.map((item, index) => <Link key={"sse-link-" + item.id}  tabLink={"#" + item.id} tabLinkActive={index === 0}>{item.caption}</Link>)}
                        {isAndroid && <span className='tab-link-highlight' style={{width: 100 / editors.lenght + '%'}}></span>}
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
                    <Tab key={"sse-tab-" + item.id} id={item.id} className="page-content" tabActive={index === 0}>
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

    const store = props.storeFocusObjects;
    const settings = !store.focusOn ? [] : (store.focusOn === 'obj' ? store.objects : store.selections);
    let editors = [];
    if (settings.length < 1) {
        editors.push({
            caption: _t.textSettings,
            component: <EmptyEditLayout />
        });
    } else {
        if (settings.indexOf('cell') > -1) {
            editors.push({
                caption: _t.textCell,
                id: 'edit-text',
                component: <EditCellController />
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