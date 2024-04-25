import React, { useContext, useEffect } from 'react';
import { View, Popup, Popover } from 'framework7-react';
import { f7 } from 'framework7-react';
import { Device } from '../../../../../common/mobile/utils/device';
import { AddImageController } from "../../controller/add/AddImage";
import { AddLinkController } from "../../controller/add/AddLink";
import { PageImageLinkSettings } from "../add/AddImage";
import { PageAddNumber, PageAddBreak, PageAddSectionBreak, PageAddFootnote } from "../add/AddOther";
import AddTableContentsController from '../../controller/add/AddTableContents';
import EditHyperlink from '../../controller/edit/EditHyperlink';
import AddingPage from './AddingPage';
import { MainContext } from '../../page/main';

const routes = [
    {
        path: '/adding-page/',
        component: AddingPage,
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

const AddView = () => {
    const mainContext = useContext(MainContext);

    useEffect(() => {
        if(Device.phone) {
            f7.popup.open('.add-popup');
        } else {
            f7.popover.open('#add-popover', '#btn-add');
        }
    }, []);

    return (
        !Device.phone ?
            <Popover id="add-popover" className="popover__titled" closeByOutsideClick={false} onPopoverClosed={() => mainContext.closeOptions('add')}>
                <View routes={routes} url='/adding-page/' style={{height: '410px'}}>
                    <AddingPage />
                </View>
            </Popover> :
            <Popup className="add-popup" onPopupClosed={() => mainContext.closeOptions('add')}>
                <View routes={routes} url='/adding-page/'>
                    <AddingPage />
                </View>
            </Popup>
    )
}

export default AddView;