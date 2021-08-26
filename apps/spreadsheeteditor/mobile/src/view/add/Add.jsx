import React, {Component, useEffect} from 'react';
import {View,Page,Navbar,NavTitle,NavRight,Link,Popup,Popover,Icon,Tabs,Tab} from 'framework7-react';
import { useTranslation } from 'react-i18next';
import {f7} from 'framework7-react';
import { observer, inject } from "mobx-react";
import {Device} from '../../../../../common/mobile/utils/device';

import {AddChartController} from "../../controller/add/AddChart";
import {AddFunctionController} from "../../controller/add/AddFunction";
import {PageFunctionGroup, PageFunctionInfo} from "./AddFunction";
import AddShapeController from "../../controller/add/AddShape";
import {AddOtherController} from "../../controller/add/AddOther";
import {AddImageController} from "../../controller/add/AddImage";
import {PageImageLinkSettings} from "./AddImage";
import {AddLinkController} from "../../controller/add/AddLink";
import {PageTypeLink, PageSheet} from "./AddLink";
import AddFilterController from "../../controller/add/AddFilter";

const routes = [
    // Functions
    {
        path: '/add-function-group/',
        component: PageFunctionGroup
    },
    {
        path: '/add-function-info/',
        component: PageFunctionInfo
    },
    // Image
    {
        path: '/add-image/',
        component: AddImageController
    },
    {
        path: '/add-image-from-url/',
        component: PageImageLinkSettings
    },
    // Link
    {
        path: '/add-link/',
        component: AddLinkController
    },
    {
        path: '/add-link-type/',
        component: PageTypeLink
    },
    {
        path: '/add-link-sheet/',
        component: PageSheet
    },
    // Other
    {
        path: '/add-sort-and-filter/',
        component: AddFilterController
    }
];

const AddLayoutNavbar = ({ tabs, inPopover }) => {
    const isAndroid = Device.android;
    return (
        <Navbar>
            {tabs.length > 1 ?
                <div className='tab-buttons tabbar'>
                    {tabs.map((item, index) =>
                        <Link key={"sse-link-" + item.id} tabLink={"#" + item.id} tabLinkActive={index === 0}>
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
                <Tab key={"sse-tab-" + item.id} id={item.id} className="page-content" tabActive={index === 0}>
                    {item.component}
                </Tab>
            )}
        </Tabs>
    )
};

const AddTabs = props => {
    const { t } = useTranslation();
    const _t = t('View.Add', {returnObjects: true});
    const showPanels = props.showPanels;
    const tabs = [];
    
    if (!showPanels) {
        tabs.push({
            caption: _t.textChart,
            id: 'add-chart',
            icon: 'icon-add-chart',
            component: <AddChartController/>
        });
    }
    if (!showPanels || showPanels === 'function') {
        tabs.push({
            caption: _t.textFunction,
            id: 'add-function',
            icon: 'icon-add-formula',
            component: <AddFunctionController onOptionClick={props.onOptionClick}/>
        });
    }
    if (!showPanels || showPanels.indexOf('shape') > 0) {
        tabs.push({
            caption: _t.textShape,
            id: 'add-shape',
            icon: 'icon-add-shape',
            component: <AddShapeController/>
        });
    }
    if (showPanels && showPanels.indexOf('image') !== -1) {
        tabs.push({
            caption: _t.textImage,
            id: 'add-image',
            icon: 'icon-add-image',
            component: <AddImageController inTabs={true}/>
        });
    }
    if (!showPanels) {
        tabs.push({
            caption: _t.textOther,
            id: 'add-other',
            icon: 'icon-add-other',
            component: <AddOtherController/>
        });
    }
    if ((showPanels && showPanels === 'hyperlink') || props.isAddShapeHyperlink) {
        tabs.push({
            caption: _t.textAddLink,
            id: 'add-link',
            icon: 'icon-link',
            component: <AddLinkController/>
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
    onoptionclick(page, props){
        f7.views.current.router.navigate(page, props);
    }
    render() {
        const show_popover = this.props.usePopover;
        return (
            show_popover ?
                <Popover id="add-popover" className="popover__titled" closeByOutsideClick={false} onPopoverClosed={() => this.props.onclosed()}>
                    <AddTabs isAddShapeHyperlink={this.props.isAddShapeHyperlink} inPopover={true} onOptionClick={this.onoptionclick} style={{height: '410px'}} showPanels={this.props.showPanels}/>
                </Popover> :
                <Popup className="add-popup" onPopupClosed={() => this.props.onclosed()}>
                    <AddTabs isAddShapeHyperlink={this.props.isAddShapeHyperlink} onOptionClick={this.onoptionclick} showPanels={this.props.showPanels}/>
                </Popup>
        )
    }
}

const Add = props => {
    useEffect(() => {
        if ( Device.phone ) {
            f7.popup.open('.add-popup');
        } else {
            const targetElem = !props.showOptions || !props.showOptions.button ? '#btn-add' : props.showOptions.button;
            f7.popover.open('#add-popover', targetElem);
        }

        return () => {
            // component will unmount
        }
    });
    const onviewclosed = () => {
        if ( props.onclosed )
            props.onclosed();
    };

    const api = Common.EditorApi.get();
    const cellinfo = api.asc_getCellInfo();
    const seltype = cellinfo.asc_getSelectionType();
    const iscelllocked = cellinfo.asc_getLocked();
    const isAddShapeHyperlink = api.asc_canAddShapeHyperlink();
    let options;

    if ( !iscelllocked ) {
        options = props.showOptions;
        if ( !options ) {
            switch (seltype) {
                case Asc.c_oAscSelectionType.RangeCells:
                case Asc.c_oAscSelectionType.RangeRow:
                case Asc.c_oAscSelectionType.RangeCol:
                case Asc.c_oAscSelectionType.RangeMax: break;
                case Asc.c_oAscSelectionType.RangeImage:
                case Asc.c_oAscSelectionType.RangeShape:
                case Asc.c_oAscSelectionType.RangeChart:
                case Asc.c_oAscSelectionType.RangeChartText:
                case Asc.c_oAscSelectionType.RangeShapeText:
                    options = {panels: ['image','shape']};
                    break;
            }
        }
    }

    return <AddView usePopover={!Device.phone}
                    onclosed={onviewclosed}
                    showPanels={options ? options.panels : undefined}
                    isAddShapeHyperlink = {isAddShapeHyperlink}
    />
};

export default Add;