import React, { useEffect, useState } from 'react';
import { inject } from 'mobx-react';
import { f7 } from 'framework7-react';
import { useTranslation } from 'react-i18next';
import Preview from "../view/Preview";
import ContextMenu from './ContextMenu';

const PreviewController = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true})

    let _view, _touches, _touchStart, _touchEnd;

    useEffect(() => {
        const onDocumentReady = () => {
            const api = Common.EditorApi.get();

            api.asc_registerCallback('asc_onEndDemonstration', onEndDemonstration);
            api.DemonstrationEndShowMessage(_t.textFinalMessage);
        };

        ContextMenu.closeContextMenu();
        show();
        onDocumentReady();

        _view = $$('#pe-preview');
        _view.on('touchstart', onTouchStart);
        _view.on('touchmove', onTouchMove);
        _view.on('touchend', onTouchEnd);

        return () => {
            const api = Common.EditorApi.get();

            api.asc_unregisterCallback('asc_onEndDemonstration', onEndDemonstration);
        
            _view.off('touchstart', onTouchStart);
            _view.off('touchmove', onTouchMove);
            _view.off('touchend', onTouchEnd);
        };
    }, []);

    const show = () => {
        const api = Common.EditorApi.get();
        api.StartDemonstration('presentation-preview', api.getCurrentPage());
    };

    const onTouchStart = e => {
        e.preventDefault();

        _touches = [];

        for (let i = 0; i < e.touches.length; i++) {
            _touches.push([e.touches[i].pageX, e.touches[i].pageY]);
        }
        _touchEnd = _touchStart = [e.touches[0].pageX, e.touches[0].pageY];
    };

    const onTouchMove = e => {
        e.preventDefault();

        const api = Common.EditorApi.get();

        _touchEnd = [e.touches[0].pageX, e.touches[0].pageY];

        if (e.touches.length < 2 ) return;

        for (let i = 0; i < e.touches.length; i++) {
            if (Math.abs(e.touches[i].pageX - _touches[i][0]) > 20 || Math.abs(e.touches[i].pageY - _touches[i][1]) > 20 ) {
                api.EndDemonstration();
                break;
            }
        }
    };

    const onTouchEnd = e => {
        e.preventDefault();

        const api = Common.EditorApi.get();

        if (_touchEnd[0] - _touchStart[0] > 20)
            api.DemonstrationPrevSlide();
        else if (_touchStart[0] - _touchEnd[0] > 20 || (Math.abs(_touchEnd[0] - _touchStart[0]) < 1 && Math.abs(_touchEnd[1] - _touchStart[1]) < 1))
            api.DemonstrationNextSlide();
    };

    // API Handlers

    const onEndDemonstration = () => {
        props.onclosed();
    };

    return (
        <Preview />
    )
};

export {PreviewController as Preview};



