import React, { useContext, useEffect } from 'react';
import { Page, Navbar, NavRight, NavTitle, Link, Icon, Tabs, Tab, f7 } from 'framework7-react';
import { useTranslation } from 'react-i18next';
import { observer, inject } from "mobx-react";
import { Device } from '../../../../../common/mobile/utils/device';
import AddSlideController from "../../controller/add/AddSlide";
import AddShapeController from "../../controller/add/AddShape";
import { AddOtherController } from "../../controller/add/AddOther";
import { MainContext } from '../../page/main';
import SvgIcon from '@common/lib/component/SvgIcon';
import IconAddShapeIos from '@common-ios-icons/icon-add-shape.svg?ios';
import IconAddShapeAndroid from '@common-android-icons/icon-add-shape.svg';
import IconAddOtherIos from '@common-ios-icons/icon-add-other.svg?ios';
import IconAddOtherAndroid from '@common-android-icons/icon-add-other.svg';
import IconAddSlideIos from '@ios-icons/icon-add-slide.svg?ios';
import IconAddSlideAndroid from '@android-icons/icon-add-slide.svg';
import IconExpandDownIos from '@common-ios-icons/icon-expand-down.svg?ios';
import IconExpandDownAndroid from '@common-android-icons/icon-expand-down.svg';


const AddLayoutNavbar = ({ tabs }) => {
    const isAndroid = Device.android;

    return (
        <Navbar>
            {tabs.length > 1 ?
                <div className='tab-buttons tabbar'>
                    {tabs.map((item, index) =>
                        <Link key={"pe-link-" + item.id} tabLink={"#" + item.id} tabLinkActive={index === 0}>
                            {/* <Icon slot="media" icon={item.icon}></Icon> */}
                            <SvgIcon symbolId={item.icon} className={'icon icon-svg'} />
                        </Link>)}
                    {isAndroid && <span className='tab-link-highlight' style={{width: 100 / tabs.lenght + '%'}}></span>}
                </div> :
                <NavTitle>{tabs[0].caption}</NavTitle>
            }
            {Device.phone && <NavRight><Link popupClose=".add-popup">
            {Device.ios ? 
                <SvgIcon symbolId={IconExpandDownIos.id} className={'icon icon-svg'} /> :
                <SvgIcon symbolId={IconExpandDownAndroid.id} className={'icon icon-svg white'} />
            }</Link></NavRight> }
        </Navbar>
    )
};

const AddLayoutContent = ({ tabs }) => {
    return (
        <Tabs animated>
            {tabs.map((item, index) =>
                <Tab key={"pe-tab-" + item.id} id={item.id} className="page-content" tabActive={index === 0}>
                    {item.component}
                </Tab>
            )}
        </Tabs>
    )
};

const AddingPage = inject("storeApplicationSettings")(observer(props => {
    const { t } = useTranslation();
    const _t = t('View.Add', {returnObjects: true});
    const api = Common.EditorApi.get();
    const storeApplicationSettings = props.storeApplicationSettings;
    const directionMode = storeApplicationSettings.directionMode;
    const countPages = api.getCountPages();
    const mainContext = useContext(MainContext);
    const showPanels = mainContext.showPanels;
    const tabs = [];

    useEffect(() => {
        f7.tab.show('#add-other', false);
    }, []);

    useEffect(() => {
        if(directionMode === 'rtl') {
            tabs.reverse();
        }
    }, [directionMode])
    
    if (!showPanels && countPages) {
        tabs.push({
            caption: _t.textSlide,
            id: 'add-slide',
            icon: Device.ios ? IconAddSlideIos.id : IconAddSlideAndroid.id,
            component: <AddSlideController />
        });

        tabs.push({
            caption: _t.textShape,
            id: 'add-shape',
            icon: Device.ios ? IconAddShapeIos.id : IconAddShapeAndroid.id,
            component: <AddShapeController/>
        });

        // tabs.push({
        //     caption: _t.textImage,
        //     id: 'add-image',
        //     icon: 'icon-add-image',
        //     component: <AddImageController/>
        // });

        tabs.push({
            caption: _t.textOther,
            id: 'add-other',
            icon: Device.ios ? IconAddOtherIos.id : IconAddOtherAndroid.id,
            component: <AddOtherController />
        });
    }

    if(!showPanels && !countPages) {
        tabs.push({
            caption: _t.textSlide,
            id: 'add-slide',
            icon: Device.ios ? IconAddSlideIos.id : IconAddSlideAndroid.id,
            component: <AddSlideController />
        });
    }

    // if (showPanels && showPanels === 'link') {
    //     tabs.push({
    //         caption: _t.textAddLink,
    //         id: 'add-link',
    //         component: <AddLinkController noNavbar={true}/>
    //     });
    // }

    return (
        <Page pageContent={false}>
            <AddLayoutNavbar tabs={tabs} />
            <AddLayoutContent tabs={tabs} />
        </Page>
    )
}));

export default AddingPage;