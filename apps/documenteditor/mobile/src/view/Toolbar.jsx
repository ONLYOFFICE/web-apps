import React, {Fragment} from 'react';
import {NavLeft, NavRight, NavTitle, Link, Icon} from 'framework7-react';
import { Device } from '../../../../common/mobile/utils/device';

const ToolbarView = props => {
    const disableEditBtn = props.isObjectLocked || props.stateDisplayMode || props.disabledEditControls;
    return (
        <Fragment>
            <NavLeft>
                {props.isShowBack && <Link className={`btn-doc-back${props.disabledControls && ' disabled'}`} icon='icon-back' onClick={props.onBack}></Link>}
                <Link icon='icon-undo' className={!props.isCanUndo && 'disabled'} onClick={props.onUndo}></Link>
                <Link icon='icon-redo' className={!props.isCanRedo && 'disabled'} onClick={props.onRedo}></Link>
            </NavLeft>
            {!Device.phone && <NavTitle>{props.docTitle}</NavTitle>}
            <NavRight>
                <Link className={(disableEditBtn || props.disabledControls) && 'disabled'} id='btn-edit' icon='icon-edit-settings' href={false} onClick={e => props.openOptions('edit')}></Link>
                <Link className={(disableEditBtn || props.disabledControls) && 'disabled'} id='btn-add' icon='icon-plus' href={false} onClick={e => props.openOptions('add')}></Link>
                { Device.phone ? null : <Link className={props.disabledControls && 'disabled'} icon='icon-search' searchbarEnable='.searchbar' href={false}></Link> }
                {props.displayCollaboration && <Link className={props.disabledControls && 'disabled'} id='btn-coauth' href={false} icon='icon-collaboration' onClick={e => props.openOptions('coauth')}></Link>}
                <Link className={(props.disabledSettings || props.disabledControls) && 'disabled'} id='btn-settings' icon='icon-settings' href={false} onClick={e => props.openOptions('settings')}></Link>
            </NavRight>
        </Fragment>
    )
};

export default ToolbarView;