import React, {useState} from 'react';
import {observer, inject} from "mobx-react";
import {List, ListItem, Page, Navbar, Icon, ListButton, BlockTitle, Segmented, Button} from 'framework7-react';
import { useTranslation } from 'react-i18next';
import {Device} from "../../../../../common/mobile/utils/device";
import SvgIcon from '../../../../../common/mobile//lib/component/SvgIcon'
import IconDraw from '../../../../../common/mobile/resources/icons/draw.svg'
import IconPageBreakIos from '@common-ios-icons/icon-pagebreak.svg?ios';
import IconPageBreakAndroid from '@common-android-icons/icon-pagebreak.svg';
import IconStringBreakIos from '@common-ios-icons/icon-stringbreak.svg?ios';
import IconStringBreakAndroid from '@common-android-icons/icon-stringbreak.svg';
import IconSectionBreakIos from '@common-ios-icons/icon-sectionbreak.svg?ios';
import IconSectionBreakAndroid from '@common-android-icons/icon-sectionbreak.svg';
import IconExpandDownAndroid from '@common-android-icons/icon-expand-down.svg';
import IconExpandUpAndroid from '@common-android-icons/icon-expand-up.svg';
import IconInsertCommentIos from '@common-ios-icons/icon-insert-comment.svg?ios';
import IconInsertCommentAndroid from '@common-android-icons/icon-insert-comment.svg';
import IconImage from '@common-icons/icon-image.svg';
import IconLinkIos from '@common-ios-icons/icon-link.svg?ios';
import IconLinkAndroid from '@common-android-icons/icon-link.svg';
import IconPageNumberIos from '@common-ios-icons/icon-pagenumber.svg?ios';
import IconPageNumberAndroid from '@common-android-icons/icon-pagenumber.svg';
import IconTableContentsIos from '@ios-icons/icon-table-contents.svg?ios';
import IconTableContentsAndroid from '@android-icons/icon-table-contents.svg';
import IconFootnoteIos from '@ios-icons/icon-footnote.svg?ios';
import IconFootnoteAndroid from '@android-icons/icon-footnote.svg';

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
                    {Device.ios ? 
                        <SvgIcon slot="media" symbolId={IconPageBreakIos.id} className={'icon icon-svg'} /> :
                        <SvgIcon slot="media" symbolId={IconPageBreakAndroid.id} className={'icon icon-svg'} />
                    }
                </ListItem>
                <ListItem title={_t.textColumnBreak} link='#' className='no-indicator' onClick={() => {
                    props.onColumnBreak();
                }}>
                    {Device.ios ? 
                        <SvgIcon slot="media" symbolId={IconStringBreakIos.id} className={'icon icon-svg'} /> :
                        <SvgIcon slot="media" symbolId={IconStringBreakAndroid.id} className={'icon icon-svg'} />
                    }
                </ListItem>
                <ListItem title={_t.textSectionBreak} link={'/add-section-break/'} routeProps={{
                    onInsertSectionBreak: props.onInsertSectionBreak
                }}>
                    {Device.ios ? 
                        <SvgIcon slot="media" symbolId={IconSectionBreakIos.id} className={'icon icon-svg'} /> :
                        <SvgIcon slot="media" symbolId={IconSectionBreakAndroid.id} className={'icon icon-svg'} />
                    }
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
                                {isAndroid ? 
                                    <SvgIcon symbolId={IconExpandDownAndroid.id} className={'icon icon-svg'} />
                                : ' - '}
                            </Button>
                            {isAndroid && <label>{stateStartAt}</label>}
                            <Button outline className='increment item-link' onClick={() => {setStartAt(props.onFootnoteStartAt(stateStartAt, false))}}>
                                {isAndroid ? 
                                    <SvgIcon symbolId={IconExpandUpAndroid.id} className={'icon icon-svg'} />
                                : ' + '}
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
    const canComments = props.storeAppOptions.canComments;

    const isShape = storeFocusObjects.settings.indexOf('shape') > -1,
        isText = storeFocusObjects.settings.indexOf('text') > -1,
        isChart = storeFocusObjects.settings.indexOf('chart') > -1,
        isHyperLink = storeFocusObjects.settings.indexOf('hyperlink') > -1,
        isHeader = storeFocusObjects.settings.indexOf('header') > -1;

    const disabledAddBreak = props.paragraphLocked || props.inFootnote || props.inControl || props.richEditLock || props.plainEditLock || props.richDelLock || props.plainDelLock;
    const disabledAddFootnote = props.paragraphLocked || props.controlPlain || props.richEditLock || props.plainEditLock;
    const disabledAddLink = props.paragraphLocked || !props.storeLinkSettings.canAddLink;
    const disabledAddPageNumber = props.controlPlain;

    return (
        <List>
            {isText && canComments && <ListItem title={_t.textComment} onClick={() => {
                props.closeModal();
                Common.Notifications.trigger('addcomment');
            }}>
                {Device.ios ? 
                    <SvgIcon slot="media" symbolId={IconInsertCommentIos.id} className={'icon icon-svg'} /> :
                    <SvgIcon slot="media" symbolId={IconInsertCommentAndroid.id} className={'icon icon-svg'} />
                }
            </ListItem>}
            <ListItem title={_t.textImage} link='/add-image/'>
                 <SvgIcon slot="media" symbolId={IconImage.id} className={'icon icon-svg'} />
            </ListItem>
            {(isText && !disabledAddLink) && <ListItem title={_t.textLink} href={isHyperLink ? '/edit-link/' : '/add-link/'} routeProps={{
                isNavigate: true
            }}>
                {Device.ios ? 
                    <SvgIcon slot="media" symbolId={IconLinkIos.id} className={'icon icon-svg'} /> :
                    <SvgIcon slot="media" symbolId={IconLinkAndroid.id} className={'icon icon-svg'} />
                }
            </ListItem>}
            {!disabledAddPageNumber &&
                <ListItem title={_t.textPageNumber} link={'/add-page-number/'} routeProps={{
                    onInsertPageNumber: props.onInsertPageNumber
                }}>
                    {Device.ios ? 
                        <SvgIcon slot="media" symbolId={IconPageNumberIos.id} className={'icon icon-svg'} /> :
                        <SvgIcon slot="media" symbolId={IconPageNumberAndroid.id} className={'icon icon-svg'} />
                    }
                </ListItem>
            }
            {(isShape || isChart) || (isText && disabledAddBreak) ? null :
                <ListItem key='break' title={_t.textBreak} link={'/add-break/'} routeProps={{
                    onPageBreak: props.onPageBreak,
                    onColumnBreak: props.onColumnBreak,
                    onInsertSectionBreak: props.onInsertSectionBreak
                }}>
                    {Device.ios ? 
                        <SvgIcon slot="media" symbolId={IconSectionBreakIos.id} className={'icon icon-svg'} /> :
                        <SvgIcon slot="media" symbolId={IconSectionBreakAndroid.id} className={'icon icon-svg'} />
                    }
                </ListItem>
            }
            {!isHeader && 
                <ListItem title={_t.textTableContents} link="/add-table-contents/">
                    {Device.ios ? 
                        <SvgIcon slot="media" symbolId={IconTableContentsIos.id} className={'icon icon-svg'} /> :
                        <SvgIcon slot="media" symbolId={IconTableContentsAndroid.id} className={'icon icon-svg'} />
                    }
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
                    {Device.ios ? 
                        <SvgIcon slot="media" symbolId={IconFootnoteIos.id} className={'icon icon-svg'} /> :
                        <SvgIcon slot="media" symbolId={IconFootnoteAndroid.id} className={'icon icon-svg'} />
                    }
                </ListItem>
            }
          <ListItem key='drawing' title={_t.textDrawing} onClick={() => {
              props.closeModal();
              Common.Notifications.trigger('draw:start');
          }}>
              <SvgIcon slot='media' symbolId={IconDraw.id} className='icon icon-svg'/>
          </ListItem>
        </List>
    )
};

const AddOtherContainer = inject("storeComments","storeFocusObjects", "storeLinkSettings", "storeAppOptions",)(observer(AddOther));

export {
    AddOtherContainer as AddOther,
        PageNumber as PageAddNumber,
        PageBreak as PageAddBreak,
        PageSectionBreak as PageAddSectionBreak,
    PageFootnote as PageAddFootnote,
};