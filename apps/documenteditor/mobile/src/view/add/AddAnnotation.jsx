import React, { useContext, useEffect } from 'react';
import { View, Sheet, Popover } from 'framework7-react';
import { f7 } from 'framework7-react';
import { Device } from '../../../../../common/mobile/utils/device';
import { AnnotationPage, PageAddMark, PageCustomMarkColor, PageMarkColor } from './AnnotationPage';
import { MainContext } from '../../page/main';
import { AddCommentController } from '../../../../../common/mobile/lib/controller/collaboration/Comments';

const routes = [
    {
        path: '/annotation-page/',
        component: AnnotationPage,
    },
    {
        path: '/add-annotation-mark/',
        component: PageAddMark
    },
    {
        path: '/add-mark-color/',
        component: PageMarkColor
    },
    {
        path: '/add-custom-mark-color/',
        component: PageCustomMarkColor
    }
];

routes.forEach(route => {
    route.options = {
        ...route.options,
        transition: 'f7-push'
    };
});

export const AddAnnotationView = () => {
    const mainContext = useContext(MainContext);

    useEffect(() => {
        if (Device.phone) {
            f7.sheet.open('#annotation-sheet');
        } else {
            f7.popover.open('#annotation-popover', '#btn-add-annotation');
        }
    }, []);

    return (
        !Device.phone ?
            <Popover id="annotation-popover" className="popover__titled" closeByOutsideClick={false} onPopoverClosed={() => mainContext.closeOptions('annotation')}>
                <View routes={routes} url='/annotation-page/' style={{ height: '410px' }}>
                    <AnnotationPage />
                </View>
            </Popover> :
            <Sheet id="annotation-sheet" className="annotation-sheet" onSheetClosed={() => mainContext.closeOptions('annotation')}>
                <View routes={routes} url='/annotation-page/'>
                    <AnnotationPage />
                </View>
            </Sheet>
    )
}