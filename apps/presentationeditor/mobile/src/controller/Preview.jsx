import React, { useEffect, useState } from 'react';
import { inject } from 'mobx-react';
import { f7 } from 'framework7-react';
import { useTranslation } from 'react-i18next';
import Preview from "../view/Preview";

const PreviewController = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true})

    let _view, _touches, _touchStart, _touchEnd;

    _view = $$('#pe-preview');

    useEffect(() => {
        const onDocumentReady = () => {
            const api = Common.EditorApi.get();

            api.asc_registerCallback('asc_onEndDemonstration', onEndDemonstration);
            api.DemonstrationEndShowMessage(_t.textFinalMessage);
        };

        show();
        onDocumentReady();

        _view.on('touchstart', onTouchStart);
        _view.on('touchmove', onTouchMove);
        _view.on('touchend', onTouchEnd);
        _view.on('click', onClick);

        return () => {
            const api = Common.EditorApi.get();

            api.asc_unregisterCallback('asc_onEndDemonstration', onEndDemonstration);
        
            _view.off('touchstart', onTouchStart);
            _view.off('touchmove', onTouchMove);
            _view.off('touchend', onTouchEnd);
            _view.off('click', onClick);
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
        else if (_touchStart[0] - _touchEnd[0] > 20)
            api.DemonstrationNextSlide();
    };

    const onClick = e => {
        const api = Common.EditorApi.get();
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



