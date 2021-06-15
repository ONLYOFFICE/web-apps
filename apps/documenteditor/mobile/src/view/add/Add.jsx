import React, {Component, useEffect, Fragment} from 'react';
import {View,Page,Navbar,NavRight, NavTitle, Link,Popup,Popover,Icon,Tabs,Tab} from 'framework7-react';
import { useTranslation } from 'react-i18next';
import {f7} from 'framework7-react';
import { observer, inject } from "mobx-react";
import {Device} from '../../../../../common/mobile/utils/device';

import {AddTableController} from "../../controller/add/AddTable";
import AddShapeController from "../../controller/add/AddShape";
import {AddImageController} from "../../controller/add/AddImage";
import {AddLinkController} from "../../controller/add/AddLink";
import {AddOtherController} from "../../controller/add/AddOther";

import {PageImageLinkSettings} from "../add/AddImage";
import {PageAddNumber, PageAddBreak, PageAddSectionBreak, PageAddFootnote} from "../add/AddOther";

const routes = [
    // Image
    {
        path: '/add-image-from-url/',
        component: PageImageLinkSettings,
    },
    // Other
    {
        path: '/add-link/',
        component: AddLinkController,
    },
    {
        path: '/add-page-number/',
        component: PageAddNumber,
    },
    {
        path: '/add-break/',
        component: PageAddBreak,
    },
    {
        path: '/add-section-break/',
        component: PageAddSectionBreak,
    },
    {
        path: '/add-footnote/',
        component: PageAddFootnote,
    },
];

const AddLayoutNavbar = ({ tabs, inPopover }) => {
    const isAndroid = Device.android;
    const { t } = useTranslation();
    const _t = t('Add', {returnObjects: true});
    return (
        <Navbar>
            {tabs.length > 1 ?
                <div className='tab-buttons tabbar'>
                    {tabs.map((item, index) =>
                        <Link key={"de-link-" + item.id} tabLink={"#" + item.id} tabLinkActive={index === 0}>
                            <Icon slot="media" icon={item.icon}></Icon>
                        </Link>)}
                    {isAndroid && <span className='tab-link-highlight' style={{width: 100 / tabs.lenght + '%'}}></span>}
                </div> :
                <NavTitle>{ tabs[0].caption }</NavTitle>
            }
            { !inPopover && <NavRight><Link icon='icon-expand-down' popupClose=".add-popup"></Link></NavRight> }
        </Navbar>
    )
};

const AddLayoutContent = ({ tabs }) => {
    return (
        <Tabs animated>
            {tabs.map((item, index) =>
                <Tab key={"de-tab-" + item.id} id={item.id} className="page-content" tabActive={index === 0}>
                    {item.component}
                </Tab>
            )}
        </Tabs>
    )
};

const AddTabs = inject("storeFocusObjects")(observer(({storeFocusObjects, showPanels, style, inPopover}) => {
    const { t } = useTranslation();
    const _t = t('Add', {returnObjects: true});
    const tabs = [];
    const options = storeFocusObjects.settings;
    if (!showPanels && options.indexOf('text') > -1) {
        tabs.push({
            caption: _t.textTable,
            id: 'add-table',
            icon: 'icon-add-table',
            component: <AddTableController/>
        });
    }
    if(!showPanels) {
        tabs.push({
            caption: _t.textShape,
            id: 'add-shape',
            icon: 'icon-add-shape',
            component: <AddShapeController/>
        });
    }
    if(!showPanels) {
        tabs.push({
            caption: _t.textImage,
            id: 'add-image',
            icon: 'icon-add-image',
            component: <AddImageController/>
        });
    }
    if(!showPanels) {
        tabs.push({
            caption: _t.textOther,
            id: 'add-other',
            icon: 'icon-add-other',
            component: <AddOtherController/>
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
        <View style={style} stackPages={true} routes={routes}>
            <Page pageContent={false}>
                <AddLayoutNavbar tabs={tabs} inPopover={inPopover}/>
                <AddLayoutContent tabs={tabs} />
            </Page>
        </View>
    )
}));

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
                <Popover id="add-popover" className="popover__titled" onPopoverClosed={() => this.props.onclosed()}>
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

        f7.tab.show('#add-other', false);

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