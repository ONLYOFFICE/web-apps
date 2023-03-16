import React, {Fragment, useEffect} from 'react';
import { useTranslation } from 'react-i18next';
import {NavLeft, NavRight, NavTitle, Link, Icon} from 'framework7-react';
import { Device } from '../../../../common/mobile/utils/device';
import EditorUIController from '../lib/patch';

const ToolbarView = props => {
    const { t } = useTranslation();
    const isDisconnected = props.isDisconnected;
    const docExt = props.docExt;
    const isAvailableExt = docExt && docExt !== 'djvu' && docExt !== 'pdf' && docExt !== 'xps' && docExt !== 'oform';
    const disableEditBtn = props.isObjectLocked || props.stateDisplayMode || props.disabledEditControls || isDisconnected;
    const isViewer = props.isViewer;
    const isMobileView = props.isMobileView;
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
        const elemTitle = document.querySelector('.subnavbar .title');

        if (elemTitle) {
            elemTitle.innerText = correctOverflowedText(elemTitle);
        }
    }, [docTitle, isViewer]);

    return (
        <Fragment>
            <NavLeft>
                {!isViewer && <Link text={Device.ios ? t("Toolbar.textOk") : ''} icon={Device.android ? 'icon-back-reader-mode' : null} className='back-reader-mode' onClick={() => props.turnOnViewerMode()}></Link>}
                {(props.isShowBack && isViewer) && <Link className={`btn-doc-back${props.disabledControls && ' disabled'}`} icon='icon-back' onClick={props.onBack}></Link>}
                {(Device.ios && props.isEdit && !isViewer) && EditorUIController.getUndoRedo && EditorUIController.getUndoRedo({
                    disabledUndo: !props.isCanUndo || isDisconnected,
                    disabledRedo: !props.isCanRedo || isDisconnected,
                    onUndoClick: props.onUndo,
                    onRedoClick: props.onRedo
                })}
            </NavLeft>
            {(!Device.phone || isViewer) && <div className='title' style={{width: '71%'}}>{docTitle}</div>}
            <NavRight>
                {(Device.android && props.isEdit && !isViewer) && EditorUIController.getUndoRedo && EditorUIController.getUndoRedo({
                    disabledUndo: !props.isCanUndo,
                    disabledRedo: !props.isCanRedo,
                    onUndoClick: props.onUndo,
                    onRedoClick: props.onRedo
                })}
                {/*isAvailableExt && !props.disabledControls &&*/}
                {((isViewer || !Device.phone) && isAvailableExt && !props.disabledControls) && <Link icon={isMobileView ? 'icon-standard-view' : 'icon-mobile-view'} href={false} onClick={() => {
                    props.changeMobileView();
                    props.openOptions('snackbar');
                }}></Link>}
                {(props.showEditDocument && !isViewer) &&
                    <Link className={props.disabledControls ? 'disabled' : ''} icon='icon-edit' href={false} onClick={props.onEditDocument}></Link>
                }
                {props.isEdit && isAvailableExt && !isViewer && EditorUIController.getToolbarOptions && EditorUIController.getToolbarOptions({
                    disabled: disableEditBtn || props.disabledControls,
                    onEditClick: e => props.openOptions('edit'),
                    onAddClick: e => props.openOptions('add')
                })}
                {/*props.displayCollaboration &&*/}
                {Device.phone ? null : <Link className={(props.disabledControls || props.readerMode) && 'disabled'} icon='icon-search' searchbarEnable='.searchbar' href={false}></Link>}
                {window.matchMedia("(min-width: 360px)").matches ? <Link className={props.disabledControls && 'disabled'} id='btn-coauth' href={false} icon='icon-collaboration' onClick={() => props.openOptions('coauth')}></Link> : null}
                <Link className={(props.disabledSettings || props.disabledControls || isDisconnected) && 'disabled'} id='btn-settings' icon='icon-settings' href={false} onClick={() => props.openOptions('settings')}></Link>
            </NavRight>
        </Fragment>
    )
};

export default ToolbarView;