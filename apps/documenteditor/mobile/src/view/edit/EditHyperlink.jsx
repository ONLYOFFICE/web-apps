import React, {Fragment, useState} from 'react';
import {observer, inject} from "mobx-react";
import {List, ListInput, ListButton} from 'framework7-react';
import { useTranslation } from 'react-i18next';

const EditHyperlink = props => {
    const { t } = useTranslation();
    const _t = t('Edit', {returnObjects: true});
    const linkObject = props.storeFocusObjects.linkObject;
    const link = linkObject.get_Value() ? linkObject.get_Value().replace(new RegExp(" ", 'g'), "%20") : '';
    const display = !(linkObject.get_Text() === null) ? linkObject.get_Text() : '';
    const tip = linkObject.get_ToolTip();
    const [stateLink, setLink] = useState(link);
    const [stateDisplay, setDisplay] = useState(display);
    const [stateTip, setTip] = useState(tip);
    return (
        <Fragment>
            <List inlineLabels className='inputs-list'>
                <ListInput
                    label={_t.textLink}
                    type="text"
                    placeholder={_t.textLink}
                    value={stateLink}
                    onChange={(event) => {setLink(event.target.value)}}
                ></ListInput>
                <ListInput
                    label={_t.textDisplay}
                    type="text"
                    placeholder={_t.textDisplay}
                    value={stateDisplay}
                    onChange={(event) => {setDisplay(event.target.value)}}
                ></ListInput>
                <ListInput
                    label={_t.textScreenTip}
                    type="text"
                    placeholder={_t.textScreenTip}
                    value={stateTip}
                    onChange={(event) => {setTip(event.target.value)}}
                ></ListInput>
            </List>
            <List className="buttons-list">
                <ListButton className={'button-fill button-raised' + (stateLink.length < 1 ? ' disabled' : '')} title={_t.textEditLink} onClick={() => {
                    props.onEditLink(stateLink, stateDisplay, stateTip)
                }}></ListButton>
                <ListButton title={_t.textRemoveLink} onClick={() => {props.onRemoveLink()}} className='button-red button-fill button-raised'/>
            </List>
        </Fragment>
    )
};

export default inject("storeFocusObjects")(observer(EditHyperlink));