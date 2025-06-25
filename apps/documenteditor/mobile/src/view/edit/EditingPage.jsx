import React, { useState, useEffect } from 'react';
import { observer, inject } from "mobx-react";
import { Page, Navbar, NavRight, NavTitle, Tabs, Tab, Link } from 'framework7-react';
import { useTranslation } from 'react-i18next';
import { Device } from '../../../../../common/mobile/utils/device';
import EditTextController from "../../controller/edit/EditText";
import EditParagraphController from "../../controller/edit/EditParagraph";
import EditShapeController from "../../controller/edit/EditShape";
import EditImageController from "../../controller/edit/EditImage";
import EditTableController from "../../controller/edit/EditTable";
import EditChartController from "../../controller/edit/EditChart";
import EditHeaderController from "../../controller/edit/EditHeader";
import EditTableContentsController from "../../controller/edit/EditTableContents";
import SvgIcon from '@common/lib/component/SvgIcon'
import IconExpandDownIos from '@common-ios-icons/icon-expand-down.svg?ios';
import IconExpandDownAndroid from '@common-android-icons/icon-expand-down.svg';

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

const EditLayoutNavbar = ({ editors }) => {
    const isAndroid = Device.android;
    const { t } = useTranslation();
    const _t = t('Edit', {returnObjects: true});

    return (
        <Navbar>
            {editors.length > 1 ?
                <div className='tab-buttons tabbar'>
                    {editors.map((item, index) => <Link key={"de-link-" + item.id}  tabLink={"#" + item.id} tabLinkActive={index === 0}>{item.caption}</Link>)}
                    {isAndroid && <span className='tab-link-highlight' style={{width: 100 / editors.length + '%'}}></span>}
                </div> :
                <NavTitle>{editors[0].caption}</NavTitle>
            }
            {Device.phone && <NavRight><Link sheetClose>
                {Device.ios ? 
                    <SvgIcon symbolId={IconExpandDownIos.id} className={'icon icon-svg'} /> :
                    <SvgIcon symbolId={IconExpandDownAndroid.id} className={'icon icon-svg white'} />
                }</Link></NavRight>}
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

const EditingPage = inject('storeFocusObjects')(observer(props => {
    const { t } = useTranslation();
    const _t = t('Edit', {returnObjects: true});
    const api = Common.EditorApi.get();
    const inToc = api.asc_GetTableOfContentsPr(true);
    const settings = props.storeFocusObjects.settings;
    const headerType = props.storeFocusObjects.headerType;
    let editors = [];

    if (settings.length < 1) {
        editors.push({
            caption: _t.textSettings,
            component: <EmptyEditLayout />
        });
    } else {
        if(inToc) {
            editors.push({
                caption: _t.textTableOfCont,
                id: 'edit-table-contents',
                component: <EditTableContentsController />
            })
        }
        if (settings.indexOf('image') > -1) {
            editors.push({
                caption: _t.textImage,
                id: 'edit-image',
                component: <EditImageController />
            })
        }
        if (settings.indexOf('shape') > -1) {
            editors.push({
                caption: _t.textShape,
                id: 'edit-shape',
                component: <EditShapeController />
            })
        }
        if (settings.indexOf('chart') > -1) {
            editors.push({
                caption: _t.textChart,
                id: 'edit-chart',
                component: <EditChartController />
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
    }
   
    return (
        <Page pageContent={false}>
            <EditLayoutNavbar editors={editors} />
            <EditLayoutContent editors={editors} />
        </Page>
    )
}));

export default EditingPage;