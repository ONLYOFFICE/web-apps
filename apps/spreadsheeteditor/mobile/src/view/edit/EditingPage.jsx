import React, { useContext } from 'react';
import { observer, inject } from "mobx-react";
import { Page, Navbar, NavRight, NavTitle, Tabs, Tab, Link, f7 } from 'framework7-react';
import { useTranslation } from 'react-i18next';
import EditCellController from "../../controller/edit/EditCell";
import EditShapeController from "../../controller/edit/EditShape";
import EditImageController from "../../controller/edit/EditImage";
import EditTextController from "../../controller/edit/EditText";
import EditChartController from "../../controller/edit/EditChart";
import { Device } from "../../../../../common/mobile/utils/device";
import { MainContext } from '../../page/main';
import SvgIcon from '@common/lib/component/SvgIcon';
import IconExpandDownIos from '@common-ios-icons/icon-expand-down.svg?ios';
import IconExpandDownAndroid from '@common-android-icons/icon-expand-down.svg';

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

const EditLayoutNavbar = ({ editors }) => {
    const isAndroid = Device.android;
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});

    if(!editors.length) return null;

    return (
        <Navbar>
            {editors.length > 1 ?
                <div className='tab-buttons tabbar'>
                    {editors.map((item, index) => <Link key={"sse-link-" + item.id}  tabLink={"#" + item.id} tabLinkActive={index === 0}>{item.caption}</Link>)}
                    {isAndroid && <span className='tab-link-highlight' style={{width: 100 / editors.length + '%'}}></span>}
                </div> : 
                <NavTitle>{editors[0].caption}</NavTitle>
            }
            {Device.phone && 
                <NavRight>
                    <Link sheetClose>
                        {Device.ios ? 
                            <SvgIcon symbolId={IconExpandDownIos.id} className={'icon icon-svg'} /> :
                            <SvgIcon symbolId={IconExpandDownAndroid.id} className={'icon icon-svg'} />
                        }
                    </Link>
                </NavRight> 
            }
        </Navbar>
    )
};

const EditLayoutContent = ({ editors }) => {
    if(!editors.length) return null;

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

const EditingPage = inject('storeFocusObjects')(observer(props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const mainContext = useContext(MainContext);
    const store = props.storeFocusObjects;
    const wsProps = mainContext.wsProps;
    const settings = !store.focusOn ? [] : (store.focusOn === 'obj' ? store.objects : store.selections);
    let editors = [];

    if (settings.length < 1) {
        editors.push({
            caption: _t.textSettings,
            component: <EmptyEditLayout />
        });
    } else {
        if (!(wsProps.Objects && store.isLockedShape) && settings.indexOf('image') > -1) {
            editors.push({
                caption: _t.textImage,
                id: 'edit-image',
                component: <EditImageController />
            })
        }
        if (!(wsProps.Objects && store.isLockedShape) && settings.indexOf('shape') > -1) {
            editors.push({
                caption: _t.textShape,
                id: 'edit-shape',
                component: <EditShapeController />
            })
        }
        if (settings.indexOf('cell') > -1) {
            editors.push({
                caption: _t.textCell,
                id: 'edit-text',
                component: <EditCellController />
            })
        }
        if (!(wsProps.Objects && store.isLockedShape) && settings.indexOf('chart') > -1) {
            editors.push({
                caption: _t.textChart,
                id: 'edit-chart',
                component: <EditChartController />
            })
        }
        if (!(wsProps.Objects && store.isLockedText) && settings.indexOf('text') > -1) {
            editors.push({
                caption: _t.textText,
                id: 'edit-text',
                component: <EditTextController />
            })
        }

        // if(!wsProps.Objects) {
        //     if (settings.indexOf('hyperlink') > -1 || (props.hyperinfo && props.isAddShapeHyperlink)) {
        //         editors.push({
        //             caption: _t.textHyperlink,
        //             id: 'edit-link',
        //             component: <EditLinkController />
        //         })
        //     }
        // }    
    }

    if(!editors.length) {
        if (Device.phone) {
            f7.sheet.close('#edit-sheet', false);
        } else { 
            f7.popover.close('#edit-popover', false);
        }

        return null;
    }

    return (
        <Page pageContent={false}>
            <EditLayoutNavbar editors={editors} />
            <EditLayoutContent editors={editors} />
        </Page>
    )
}));

export default EditingPage;