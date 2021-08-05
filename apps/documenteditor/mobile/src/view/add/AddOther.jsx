import React, {useState} from 'react';
import {observer, inject} from "mobx-react";
import {List, ListItem, Page, Navbar, Icon, ListButton, ListInput, BlockTitle, Segmented, Button} from 'framework7-react';
import { useTranslation } from 'react-i18next';
import {Device} from "../../../../../common/mobile/utils/device";

const PageNumber = props => {
    const { t } = useTranslation();
    const _t = t('Add', {returnObjects: true});
    return (
        <Page>
            <Navbar title={_t.textPosition} backLink={_t.textBack}/>
            <List>
                <ListItem title={_t.textLeftTop} link='#' className='no-indicator' onClick={()=>{props.onInsertPageNumber('lt')}}></ListItem>
                <ListItem title={_t.textCenterTop} link='#' className='no-indicator' onClick={()=>{props.onInsertPageNumber('ct')}}></ListItem>
                <ListItem title={_t.textRightTop} link='#' className='no-indicator' onClick={()=>{props.onInsertPageNumber('rt')}}></ListItem>
                <ListItem title={_t.textLeftBottom} link='#' className='no-indicator' onClick={()=>{props.onInsertPageNumber('lb')}}></ListItem>
                <ListItem title={_t.textCenterBottom} link='#' className='no-indicator' onClick={()=>{props.onInsertPageNumber('cb')}}></ListItem>
                <ListItem title={_t.textRightBottom} link='#' className='no-indicator' onClick={()=>{props.onInsertPageNumber('rb')}}></ListItem>
                <ListItem title={_t.textCurrentPosition} link='#' className='no-indicator' onClick={()=>{props.onInsertPageNumber('current')}}></ListItem>
            </List>
        </Page>
    )
};

const PageBreak = props => {
    const { t } = useTranslation();
    const _t = t('Add', {returnObjects: true});
    return (
        <Page>
            <Navbar title={_t.textBreak} backLink={_t.textBack}/>
            <List>
                <ListItem title={_t.textPageBreak} link='#' className='no-indicator' onClick={() => {
                    props.onPageBreak()
                }}>
                    <Icon slot="media" icon="icon-pagebreak"></Icon>
                </ListItem>
                <ListItem title={_t.textColumnBreak} link='#' className='no-indicator' onClick={() => {
                    props.onColumnBreak();
                }}>
                    <Icon slot="media" icon="icon-stringbreak"></Icon>
                </ListItem>
                <ListItem title={_t.textSectionBreak} link={'/add-section-break/'} routeProps={{
                    onInsertSectionBreak: props.onInsertSectionBreak
                }}>
                    <Icon slot="media" icon="icon-sectionbreak"></Icon>
                </ListItem>
            </List>
        </Page>
    )
};

const PageSectionBreak = props => {
    const { t } = useTranslation();
    const _t = t('Add', {returnObjects: true});
    return (
        <Page>
            <Navbar title={_t.textSectionBreak} backLink={_t.textBack}/>
            <List>
                <ListItem title={_t.textNextPage} link='#' className='no-indicator' onClick={() => {
                    props.onInsertSectionBreak('next')
                }}></ListItem>
                <ListItem title={_t.textContinuousPage} link='#' className='no-indicator' onClick={() => {
                    props.onInsertSectionBreak('continuous')
                }}></ListItem>
                <ListItem title={_t.textEvenPage} link='#' className='no-indicator' onClick={() => {
                    props.onInsertSectionBreak('even')
                }}></ListItem>
                <ListItem title={_t.textOddPage} link='#' className='no-indicator' onClick={() => {
                    props.onInsertSectionBreak('odd')
                }}></ListItem>
            </List>
        </Page>
    )
};

const PageFootnote = props => {
    const isAndroid = Device.android;
    const { t } = useTranslation();
    const _t = t('Add', {returnObjects: true});

    const dataFormatFootnote = [
        { text: '1, 2, 3,...', value: Asc.c_oAscNumberingFormat.Decimal },
        { text: 'a, b, c,...', value: Asc.c_oAscNumberingFormat.LowerLetter },
        { text: 'A, B, C,...', value: Asc.c_oAscNumberingFormat.UpperLetter },
        { text: 'i, ii, iii,...', value: Asc.c_oAscNumberingFormat.LowerRoman },
        { text: 'I, II, III,...', value: Asc.c_oAscNumberingFormat.UpperRoman }
    ];
    const dataPosFootnote = [
        {value: Asc.c_oAscFootnotePos.PageBottom, displayValue: _t.textBottomOfPage },
        {value: Asc.c_oAscFootnotePos.BeneathText, displayValue: _t.textBelowText }
    ];

    const [stateStartAt, setStartAt] = useState(props.initFootnoteStartAt());
    const [stateLocation, setLocation] = useState(props.getFootnoteProps().propsPos);
    const [stateFormat, setFormat] = useState(props.getFootnoteProps().propsFormat);

    return (
        <Page>
            <Navbar title={_t.textInsertFootnote} backLink={_t.textBack}/>
            <BlockTitle>{_t.textFormat}</BlockTitle>
            <List>
                {dataFormatFootnote.map((format, index)=>{
                    return (
                        <ListItem key={`format-${index}`}
                                  title={format.text}
                                  radio
                                  checked={stateFormat === format.value}
                                  onClick={() => {
                                      setStartAt(props.getFootnoteStartAt(format.value, stateStartAt));
                                      setFormat(format.value)
                                  }}></ListItem>
                    )
                })}
            </List>
            <List>
                <ListItem title={_t.textStartAt}>
                    {!isAndroid && <div slot='after-start'>{stateStartAt}</div>}
                    <div slot='after'>
                        <Segmented>
                            <Button outline className='decrement item-link' onClick={() => {setStartAt(props.onFootnoteStartAt(stateStartAt, true))}}>
                                {isAndroid ? <Icon icon="icon-expand-down"></Icon> : ' - '}
                            </Button>
                            {isAndroid && <label>{stateStartAt}</label>}
                            <Button outline className='increment item-link' onClick={() => {setStartAt(props.onFootnoteStartAt(stateStartAt, false))}}>
                                {isAndroid ? <Icon icon="icon-expand-up"></Icon> : ' + '}
                            </Button>
                        </Segmented>
                    </div>
                </ListItem>
            </List>
            <BlockTitle>{_t.textLocation}</BlockTitle>
            <List>
                {dataPosFootnote.map((location, index)=>{
                    return (
                        <ListItem key={`location-${index}`}
                                  title={location.displayValue}
                                  radio
                                  checked={stateLocation === location.value}
                                  onClick={() => {setLocation(location.value)}}></ListItem>
                    )
                })}
            </List>
            <List className="buttons-list">
                <ListButton className={'button-fill button-raised'} title={_t.textInsertFootnote} onClick={() => {
                    props.onInsertFootnote(stateFormat, stateStartAt, stateLocation);
                }}></ListButton>
            </List>
        </Page>
    )
};

const AddOther = props => {
    const { t } = useTranslation();
    const _t = t('Add', {returnObjects: true});
    const storeFocusObjects = props.storeFocusObjects;
    const storeLinkSettings = props.storeLinkSettings;
    const canAddLink = storeLinkSettings.canAddLink;

    let isShape = storeFocusObjects.settings.indexOf('shape') > -1,
        isText = storeFocusObjects.settings.indexOf('text') > -1,
        isChart = storeFocusObjects.settings.indexOf('chart') > -1;

    let disabledAddLink = false,
        disabledAddBreak = false,
        disabledAddFootnote = false,
        disabledAddPageNumber = false,
        inFootnote = props.inFootnote,
        inControl = props.inControl, 
        paragraphLocked = props.paragraphLocked, 
        controlPlain = props.controlPlain,
        richDelLock = props.richDelLock,
        richEditLock = props.richEditLock,
        plainDelLock = props.plainDelLock,
        plainEditLock = props.plainEditLock;

    disabledAddBreak = paragraphLocked || inFootnote || inControl || richEditLock || plainEditLock || richDelLock || plainDelLock;
    disabledAddFootnote = paragraphLocked || controlPlain || richEditLock || plainEditLock;
    disabledAddLink = paragraphLocked || !canAddLink;
    disabledAddPageNumber = controlPlain;

    return (
        <List>
            {isText && <ListItem title={_t.textComment} onClick={() => {
                props.closeModal();
                Common.Notifications.trigger('addcomment');
            }}>
                <Icon slot="media" icon="icon-insert-comment"></Icon>
            </ListItem>}
            {(isText && !disabledAddLink) && <ListItem title={_t.textLink} link={'/add-link/'} routeProps={{
                onInsertLink: props.onInsertLink,
                getDisplayLinkText: props.getDisplayLinkText
            }}>
                <Icon slot="media" icon="icon-link"></Icon>
            </ListItem>}
            {!disabledAddPageNumber &&
                <ListItem title={_t.textPageNumber} link={'/add-page-number/'} routeProps={{
                    onInsertPageNumber: props.onInsertPageNumber
                }}>
                    <Icon slot="media" icon="icon-pagenumber"></Icon>
                </ListItem>
            }
            {(isShape || isChart) || (isText && disabledAddBreak) ? null :
                <ListItem key='break' title={_t.textBreak} link={'/add-break/'} routeProps={{
                    onPageBreak: props.onPageBreak,
                    onColumnBreak: props.onColumnBreak,
                    onInsertSectionBreak: props.onInsertSectionBreak
                }}>
                    <Icon slot="media" icon="icon-sectionbreak"></Icon>
                </ListItem>
            }
            {(isShape || isChart) || (isText && disabledAddFootnote) ? null :
                <ListItem key='footnote' title={_t.textFootnote} link={'/add-footnote/'} routeProps={{
                    getFootnoteProps: props.getFootnoteProps,
                    getFootnoteStartAt: props.getFootnoteStartAt,
                    onFootnoteStartAt: props.onFootnoteStartAt,
                    onInsertFootnote: props.onInsertFootnote,
                    initFootnoteStartAt: props.initFootnoteStartAt
                }}>
                    <Icon slot="media" icon="icon-footnote"></Icon>
                </ListItem>
            }
        </List>
    )
};

const AddOtherContainer = inject("storeComments","storeFocusObjects", "storeLinkSettings")(observer(AddOther));

export {AddOtherContainer as AddOther,
        PageNumber as PageAddNumber,
        PageBreak as PageAddBreak,
        PageSectionBreak as PageAddSectionBreak,
        PageFootnote as PageAddFootnote};