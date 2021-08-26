import React, {Component, useEffect} from 'react';
import {View,Page,Navbar,NavRight, NavTitle, Link,Popup,Popover,Icon,Tabs,Tab} from 'framework7-react';
import { useTranslation } from 'react-i18next';
import {f7} from 'framework7-react';
import { observer, inject } from "mobx-react";
import {Device} from '../../../../../common/mobile/utils/device';

import AddSlideController from "../../controller/add/AddSlide";
import AddShapeController from "../../controller/add/AddShape";
import {AddImageController} from "../../controller/add/AddImage";
import {PageImageLinkSettings} from "./AddImage";
import {AddOtherController} from "../../controller/add/AddOther";
import {PageAddTable} from "./AddOther";
import {AddLinkController} from "../../controller/add/AddLink";
import {PageTypeLink, PageLinkTo} from "./AddLink";

const routes = [
    // Image
    {
        path: '/add-image-from-url/',
        component: PageImageLinkSettings
    },
    // Other
    {
        path: '/add-table/',
        component: PageAddTable
    },
    {
        path: '/add-link/',
        component: AddLinkController
    },
    {
        path: '/add-link-type/',
        component: PageTypeLink
    },
    {
        path: '/add-link-to/',
        component: PageLinkTo
    }
];

const AddLayoutNavbar = ({ tabs, inPopover }) => {
    const isAndroid = Device.android;
    return (
        <Navbar>
            {tabs.length > 1 ?
                <div className='tab-buttons tabbar'>
                    {tabs.map((item, index) =>
                        <Link key={"pe-link-" + item.id} tabLink={"#" + item.id} tabLinkActive={index === 0}>
                            <Icon slot="media" icon={item.icon}></Icon>
                        </Link>)}
                    {isAndroid && <span className='tab-link-highlight' style={{width: 100 / tabs.lenght + '%'}}></span>}
                </div> :
                <NavTitle>{tabs[0].caption}</NavTitle>
            }
            { !inPopover && <NavRight><Link icon='icon-expand-down' popupClose=".add-popup"></Link></NavRight> }
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

const AddTabs = props => {
    const { t } = useTranslation();
    const _t = t('View.Add', {returnObjects: true});
    const api = Common.EditorApi.get();
    const countPages = api.getCountPages();
    const showPanels = props.showPanels;
    const tabs = [];
    if (!showPanels && countPages) {
        tabs.push({
            caption: _t.textSlide,
            id: 'add-slide',
            icon: 'icon-add-slide',
            component: <AddSlideController />
        });
        tabs.push({
            caption: _t.textShape,
            id: 'add-shape',
            icon: 'icon-add-shape',
            component: <AddShapeController/>
        });
        tabs.push({
            caption: _t.textImage,
            id: 'add-image',
            icon: 'icon-add-image',
            component: <AddImageController/>
        });
        tabs.push({
            caption: _t.textOther,
            id: 'add-other',
            icon: 'icon-add-other',
            component: <AddOtherController/>
        });
    }
    if(!showPanels && !countPages) {
        tabs.push({
            caption: _t.textSlide,
            id: 'add-slide',
            icon: 'icon-add-slide',
            component: <AddSlideController />
        });
    }
    if (showPanels && showPanels === 'link') {
        tabs.push({
            caption: _t.textAddLink,
            id: 'add-link',
            component: <AddLinkController noNavbar={true}/>
        });
    }
    return (
        <View style={props.style} stackPages={true} routes={routes}>
            <Page pageContent={false}>
                <AddLayoutNavbar tabs={tabs} inPopover={props.inPopover}/>
                <AddLayoutContent tabs={tabs} />
            </Page>
        </View>
    )
};

class AddView extends Component {
    constructor(props) {
        super(props);

        this.onoptionclick = this.onoptionclick.bind(this);
    }
    onoptionclick(page){
        f7.views.current.router.navigate(page);
    }
    render() {
        const show_popover = this.props.usePopover;
        return (
            show_popover ?
                <Popover id="add-popover" className="popover__titled" closeByOutsideClick={false} onPopoverClosed={() => this.props.onclosed()}>
                    <AddTabs inPopover={true} onOptionClick={this.onoptionclick} style={{height: '410px'}} showPanels={this.props.showPanels} />
                </Popover> :
                <Popup className="add-popup" onPopupClosed={() => this.props.onclosed()}>
                    <AddTabs onOptionClick={this.onoptionclick} showPanels={this.props.showPanels} />
                </Popup>
        )
    }
}

const Add = props => {
    useEffect(() => {
        if ( Device.phone )
            f7.popup.open('.add-popup');
        else f7.popover.open('#add-popover', '#btn-add');

        return () => {
            // component will unmount
        }
    });
    const onviewclosed = () => {
        if ( props.onclosed )
            props.onclosed();
    };
    return <AddView usePopover={!Device.phone} onclosed={onviewclosed} showPanels={props.showOptions} />
};

export default Add;