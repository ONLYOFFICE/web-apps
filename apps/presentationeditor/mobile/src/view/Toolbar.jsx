import React, {Fragment, useEffect} from 'react';
import {NavLeft, NavRight, NavTitle, Link, Icon} from 'framework7-react';
import { Device } from '../../../../common/mobile/utils/device';
import EditorUIController from '../lib/patch'

const ToolbarView = props => {
    const isDisconnected = props.isDisconnected;
    const docTitle = props.docTitle;
    const docTitleLength = docTitle.length;

    const correctOverflowedText = el => {
        if(el) {
            el.innerText = docTitle;

            if(el.scrollWidth > el.clientWidth) {
                const arrDocTitle = docTitle.split('.');
                const ext = arrDocTitle[1];
                const name = arrDocTitle[0];
                const diff = Math.floor(docTitleLength * el.clientWidth / el.scrollWidth - ext.length - 6);
                const shortName = name.substring(0, diff).trim();

                return `${shortName}...${ext}`;
            }

            return docTitle;
        }
    };

    useEffect(() => {
        if(!Device.phone) {
            const elemTitle = document.querySelector('.subnavbar .title');

            if (elemTitle) {
                elemTitle.innerText = correctOverflowedText(elemTitle);
            }
        }
    }, [docTitle]);

    return (
        <Fragment>
            <NavLeft>
                {props.isShowBack && <Link className={`btn-doc-back${props.disabledControls && ' disabled'}`} icon='icon-back' onClick={() => Common.Notifications.trigger('goback')}></Link>}
                {Device.ios && props.isEdit && EditorUIController.getUndoRedo && EditorUIController.getUndoRedo({
                    disabledUndo: !props.isCanUndo || isDisconnected,
                    disabledRedo: !props.isCanRedo || isDisconnected,
                    onUndoClick: props.onUndo,
                    onRedoClick: props.onRedo
                })}
            </NavLeft>
            {!Device.phone && <NavTitle style={{width: '71%'}}>{props.docTitle}</NavTitle>}
            <NavRight>
                {Device.android && props.isEdit && EditorUIController.getUndoRedo && EditorUIController.getUndoRedo({
                    disabledUndo: !props.isCanUndo || isDisconnected,
                    disabledRedo: !props.isCanRedo || isDisconnected,
                    onUndoClick: props.onUndo,
                    onRedoClick: props.onRedo
                })}
                <Link className={(props.disabledControls || props.disabledPreview) && 'disabled'} icon='icon-play' href={false} onClick={() => {props.openOptions('preview')}}></Link>
                {props.showEditDocument &&
                    <Link className={props.disabledControls ? 'disabled' : ''} icon='icon-edit' href={false} onClick={props.onEditDocument}></Link>
                }
                {props.isEdit && EditorUIController.getToolbarOptions && EditorUIController.getToolbarOptions({
                    disabledEdit: props.disabledEdit || props.disabledControls || isDisconnected || props.disabledPreview,
                    disabledAdd: props.disabledControls || isDisconnected,
                    onEditClick: () => props.openOptions('edit'),
                    onAddClick: () => props.openOptions('add')
                })}
                { Device.phone ? null : <Link className={(props.disabledControls || props.disabledPreview) && 'disabled'} icon='icon-search' searchbarEnable='.searchbar' href={false}></Link> }
                {props.displayCollaboration && window.matchMedia("(min-width: 375px)").matches ? <Link className={props.disabledControls && 'disabled'} id='btn-coauth' href={false} icon='icon-collaboration' onClick={() => props.openOptions('coauth')}></Link> : null}
                <Link className={(props.disabledSettings || props.disabledControls || isDisconnected) && 'disabled'} id='btn-settings' icon='icon-settings' href={false} onClick={() => props.openOptions('settings')}></Link>
            </NavRight>
        </Fragment>
    )
};

export default ToolbarView;