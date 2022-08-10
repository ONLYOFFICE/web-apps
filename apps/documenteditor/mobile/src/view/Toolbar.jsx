import React, {Fragment} from 'react';
import {NavLeft, NavRight, NavTitle, Link, Icon} from 'framework7-react';
import { Device } from '../../../../common/mobile/utils/device';
import EditorUIController from '../lib/patch'

const ToolbarView = props => {
    const isDisconnected = props.isDisconnected;
    const disableEditBtn = props.isObjectLocked || props.stateDisplayMode || props.disabledEditControls || isDisconnected;
    const isViewer = props.isViewer;

    return (
        <Fragment>
            <NavLeft>
                {!isViewer && <Link text="Ok" onClick={() => props.turnOnViewerMode()}></Link>}
                {(props.isShowBack && isViewer) && <Link className={`btn-doc-back${props.disabledControls && ' disabled'}`} icon='icon-back' onClick={props.onBack}></Link>}
                {(Device.ios && props.isEdit && !isViewer) && EditorUIController.getUndoRedo && EditorUIController.getUndoRedo({
                    disabledUndo: !props.isCanUndo || isDisconnected,
                    disabledRedo: !props.isCanRedo || isDisconnected,
                    onUndoClick: props.onUndo,
                    onRedoClick: props.onRedo
                })}
            </NavLeft>
            {(!Device.phone || isViewer) && <NavTitle>{props.docTitle}</NavTitle>}
            <NavRight>
                {(Device.android && props.isEdit && !isViewer) && EditorUIController.getUndoRedo && EditorUIController.getUndoRedo({
                    disabledUndo: !props.isCanUndo,
                    disabledRedo: !props.isCanRedo,
                    onUndoClick: props.onUndo,
                    onRedoClick: props.onRedo
                })}
                {(props.showEditDocument && !isViewer) &&
                    <Link className={props.disabledControls ? 'disabled' : ''} icon='icon-edit' href={false} onClick={props.onEditDocument}></Link>
                }
                {props.isEdit && !isViewer && EditorUIController.getToolbarOptions && EditorUIController.getToolbarOptions({
                        disabled: disableEditBtn || props.disabledControls,
                        onEditClick: e => props.openOptions('edit'),
                        onAddClick: e => props.openOptions('add')
                })}
                {isViewer && <Link icon='icon-edit-mode' className={(props.disabledSettings || props.disabledControls || isDisconnected) && 'disabled'} href={false} onClick={() => props.turnOffViewerMode()}></Link>}
                {Device.phone ? null : <Link className={(props.disabledControls || props.readerMode) && 'disabled'} icon='icon-search' searchbarEnable='.searchbar' href={false}></Link>}
                {props.displayCollaboration && window.matchMedia("(min-width: 360px)").matches ? <Link className={props.disabledControls && 'disabled'} id='btn-coauth' href={false} icon='icon-collaboration' onClick={e => props.openOptions('coauth')}></Link> : null}
                <Link className={(props.disabledSettings || props.disabledControls || isDisconnected) && 'disabled'} id='btn-settings' icon='icon-settings' href={false} onClick={e => props.openOptions('settings')}></Link>
            </NavRight>
        </Fragment>
    )
};

export default ToolbarView;