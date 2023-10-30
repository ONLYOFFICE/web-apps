import React, { Fragment, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLeft, NavRight, Link } from 'framework7-react';
import { Device } from '../../../../common/mobile/utils/device';
import EditorUIController from '../lib/patch';

const FormsToolbarView = props => {
    const isDisconnected = props.isDisconnected;
    const isOpenModal = props.isOpenModal;
    
    return (
        <Fragment>
            <NavLeft>
                {props.isShowBack && 
                    <Link className={`btn-doc-back${(props.disabledControls || isOpenModal) && ' disabled'}`} icon='icon-return' onClick={() => Common.Notifications.trigger('goback')}></Link>
                }
                {props.isEdit && EditorUIController.getUndoRedo && 
                    EditorUIController.getUndoRedo({
                        disabledUndo: !props.isCanUndo || isDisconnected,
                        disabledRedo: !props.isCanRedo || isDisconnected,
                        onUndoClick: props.onUndo,
                        onRedoClick: props.onRedo
                    })
                }
            </NavLeft>
            <NavRight>
                <Link className={(props.disabledSettings || props.disabledControls || isDisconnected || isOpenModal) && 'disabled'} id='btn-prev-field' icon='icon-prev-field' href={false} onClick={() => console.log('prev field')}></Link>
                <Link className={(props.disabledSettings || props.disabledControls || isDisconnected || isOpenModal) && 'disabled'} id='btn-next-field' icon='icon-next-field' href={false} onClick={() => console.log('next field')}></Link>
                <Link className={(props.disabledSettings || props.disabledControls || isDisconnected || isOpenModal) && 'disabled'} id='btn-export' icon='icon-export' href={false} onClick={() => console.log('export')}></Link>
                <Link className={(props.disabledSettings || props.disabledControls || isDisconnected || isOpenModal) && 'disabled'} id='btn-settings' icon='icon-settings' href={false} onClick={() => props.openOptions('settings')}></Link>
            </NavRight>
        </Fragment>
    )
};

export default FormsToolbarView;