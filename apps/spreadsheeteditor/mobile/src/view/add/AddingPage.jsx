import React, { useContext, useEffect } from 'react';
import { Page, Navbar, NavTitle, NavRight, Link, Icon, Tabs, Tab, f7 } from 'framework7-react';
import { observer, inject } from "mobx-react";
import { useTranslation } from 'react-i18next';
import { AddChartController } from "../../controller/add/AddChart";
import { AddFunctionController } from "../../controller/add/AddFunction";
import AddShapeController from "../../controller/add/AddShape";
import { AddOtherController } from "../../controller/add/AddOther";
import { Device } from "../../../../../common/mobile/utils/device";
import { MainContext } from '../../page/main';
import { AddingContext } from '../../controller/add/Add';

const AddLayoutNavbar = ({ tabs }) => {
    const isAndroid = Device.android;
    if(!tabs.length) return null;

    return (
        <Navbar>
            {tabs.length > 1 ?
                <div className='tab-buttons tabbar'>
                    {tabs.map((item, index) =>
                        <Link key={"sse-link-" + item.id} tabLink={"#" + item.id} tabLinkActive={index === 0}>
                            <Icon slot="media" icon={item.icon}></Icon>
                        </Link>)}
                    {isAndroid && <span className='tab-link-highlight' style={{width: 100 / tabs.lenght + '%'}}></span>}
                </div> : <NavTitle>{tabs[0].caption}</NavTitle>
            }
            {Device.phone && <NavRight><Link icon='icon-expand-down' popupClose=".add-popup"></Link></NavRight> }
        </Navbar>
    )
};

const AddLayoutContent = ({ tabs }) => {
    if(!tabs.length) return null;

    return (
        <Tabs animated>
            {tabs.map((item, index) =>
                <Tab key={"sse-tab-" + item.id} id={item.id} className="page-content" tabActive={index === 0}>
                    {item.component}
                </Tab>
            )}
        </Tabs>
    )
};

const AddingPage = inject("storeApplicationSettings")(observer(props => {
    const { t } = useTranslation();
    const _t = t('View.Add', {returnObjects: true});
    const mainContext = useContext(MainContext);
    const addingContext = useContext(AddingContext);
    const storeApplicationSettings = props.storeApplicationSettings;
    const directionMode = storeApplicationSettings.directionMode;
    // const wsLock = mainContext.wsLock;
    const wsProps = mainContext.wsProps;
    const showPanels = addingContext.showPanels;
    const tabs = [];

    useEffect(() => {
        if(directionMode === 'rtl') {
            tabs.reverse();
        }
    }, [directionMode])
    
    if(!wsProps.Objects) {
        if(!showPanels) {
            tabs.push({
                caption: _t.textChart,
                id: 'add-chart',
                icon: 'icon-add-chart',
                component: <AddChartController />
            });
        }

        if(!showPanels || showPanels === 'function') {
            tabs.push({
                caption: _t.textFunction,
                id: 'add-function',
                icon: 'icon-add-formula',
                component: <AddFunctionController />
            });
        }

        if(!showPanels || showPanels.indexOf('shape') > 0) {
            tabs.push({
                caption: _t.textShape,
                id: 'add-shape',
                icon: 'icon-add-shape',
                component: <AddShapeController />
            });
        }

        // if (showPanels && showPanels.indexOf('image') !== -1) {
        //     tabs.push({
        //         caption: _t.textImage,
        //         id: 'add-image',
        //         icon: 'icon-add-image',
        //         component: <AddImageController inTabs={true}/>
        //     });
        // }
    }

    if (!showPanels && (!wsProps.InsertHyperlinks || !wsProps.Objects || !wsProps.Sort)) {
        tabs.push({
            caption: _t.textOther,
            id: 'add-other',
            icon: 'icon-add-other',
            component: <AddOtherController />
        });
    }
    
    // if (((showPanels && showPanels === 'hyperlink') || props.isAddShapeHyperlink) && !wsProps.InsertHyperlinks) {
    //     tabs.push({
    //         caption: _t.textAddLink,
    //         id: 'add-link',
    //         icon: 'icon-link',
    //         component: <AddLinkController/>
    //     });
    // }

    if(!tabs.length) {
        if (Device.phone) {
            f7.popup.close('.add-popup', false);
        } else {
            f7.popover.close('#add-popover', false);
        }

        return null;
    }

    return (
        <Page pageContent={false}>
            <AddLayoutNavbar tabs={tabs} />
            <AddLayoutContent tabs={tabs} />
        </Page>
    )
}));

export default AddingPage;