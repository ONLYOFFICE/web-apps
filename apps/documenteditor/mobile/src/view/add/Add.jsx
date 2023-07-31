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
import AddTableContentsController from '../../controller/add/AddTableContents';
import EditHyperlink from '../../controller/edit/EditHyperlink';
import AddingPage from './AddingPage';

const routes = [
    {
        path: '/adding-page/',
        component: AddingPage
    },
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
        path: '/edit-link/',
        component: EditHyperlink
    },
    {
        path: '/add-image/',
        component: AddImageController
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
    {
        path: '/add-table-contents/',
        component: AddTableContentsController
    }
];

routes.forEach(route => {
    route.options = {
        ...route.options,
        transition: 'f7-push'
    };
});

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
                    <View routes={routes} url='/adding-page/' style={{height: '410px'}}>
                        <AddingPage inPopover={true} onCloseLinkSettings={this.props.onCloseLinkSettings} showPanels={this.props.showPanels} />
                    </View>
                </Popover> :
                <Popup className="add-popup" onPopupClosed={() => this.props.onclosed()}>
                    <View routes={routes} url='/adding-page/'>
                        <AddingPage inPopover={true} onCloseLinkSettings={this.props.onCloseLinkSettings} showPanels={this.props.showPanels} />
                    </View>
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
        if ( props.onclosed ) {
            props.onclosed();
        }
    };

    return <AddView usePopover={!Device.phone} onCloseLinkSettings={props.onCloseLinkSettings} onclosed={onviewclosed} showPanels={props.showOptions} />
};

export default Add;