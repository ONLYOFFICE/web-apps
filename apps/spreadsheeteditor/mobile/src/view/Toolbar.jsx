import React, {Fragment} from 'react';
import {NavLeft, NavRight, NavTitle, Link, Icon} from 'framework7-react';
import { Device } from '../../../../common/mobile/utils/device';
import EditorUIController from '../lib/patch'

const ToolbarView = props => {
    const isDisconnected = props.isDisconnected;
    const undo_box = props.isEdit && EditorUIController.toolbarOptions ? EditorUIController.toolbarOptions.getUndoRedo({
            disabledUndo: !props.isCanUndo || isDisconnected,
            disabledRedo: !props.isCanRedo || isDisconnected,
            onUndoClick: props.onUndo,
            onRedoClick: props.onRedo
        }) : null;
    return (
        <Fragment>
            <NavLeft>
                {props.isShowBack && <Link className={`btn-doc-back${props.disabledControls && ' disabled'}`} icon='icon-back' onClick={props.onBack}></Link>}
                {Device.ios && undo_box}
            </NavLeft>
            {!Device.phone && <NavTitle>{props.docTitle}</NavTitle>}
            <NavRight>
                {Device.android && undo_box}
                {props.showEditDocument &&
                    <Link className={props.disabledControls ? 'disabled' : ''} icon='icon-edit' href={false} onClick={props.onEditDocument}></Link>
                }
                {props.isEdit && EditorUIController.toolbarOptions && EditorUIController.toolbarOptions.getEditOptions({
                    disabled: props.disabledEditControls || props.disabledControls || isDisconnected,
                    onEditClick: () => props.openOptions('edit'),
                    onAddClick: () => props.openOptions('add')
                })}
                { Device.phone ? null : <Link className={(props.disabledControls || props.disabledSearch) && 'disabled'} icon='icon-search' searchbarEnable='.searchbar' href={false}></Link> }
                {props.displayCollaboration && window.matchMedia("(min-width: 360px)").matches ? <Link className={(props.disabledControls || props.disabledCollaboration) && 'disabled'} id='btn-coauth' href={false} icon='icon-collaboration' onClick={() => props.openOptions('coauth')}></Link> : null}
                <Link className={(props.disabledSettings || props.disabledControls) && 'disabled'} id='btn-settings' icon='icon-settings' href={false} onClick={() => props.openOptions('settings')}></Link>
            </NavRight>
        </Fragment>
    )
};

export default ToolbarView;