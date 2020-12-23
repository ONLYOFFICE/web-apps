import React, {Fragment, useState} from 'react';
import {observer, inject} from "mobx-react";
import {List, ListItem, Icon, Row, Button, Page, Navbar, Segmented, BlockTitle} from 'framework7-react';
import { useTranslation } from 'react-i18next';
import {Device} from '../../../../../common/mobile/utils/device';

import ThemeColorPalette from '../../../../../common/mobile/lib/component/ThemeColorPalette.jsx';

const PageFonts = props => {
    const isAndroid = Device.android;
    const { t } = useTranslation();
    const storeTextSettings = props.storeTextSettings;
    const size = storeTextSettings.fontSize;
    const displaySize = typeof size === 'undefined' ? t('Edit.textAuto') : size + ' ' + t('Edit.textPt');
    const curFontName = storeTextSettings.fontName;
    const fonts = storeTextSettings.fontsArray;
    const [vlFonts, setVlFonts] = useState({
        vlData: {
            items: [],
        }
    });
    const renderExternal = (vl, vlData) => {
        setVlFonts((prevState) => {
            let fonts = [...prevState.vlData.items];
            fonts.splice(vlData.fromIndex, vlData.toIndex, ...vlData.items);
            return {vlData: {
                    items: fonts,
                }}
        });
    };
    return (
        <Page>
            <Navbar title={t('Edit.textFonts')} backLink={t('Edit.textBack')} />
            <List>
                <ListItem title={t('Edit.textSize')}>
                    {!isAndroid && <div slot='after-start'>{displaySize}</div>}
                    <div slot='after'>
                        <Segmented>
                            <Button outline className='decrement item-link' onClick={() => {props.changeFontSize(size, true)}}>
                                {isAndroid ? <Icon icon="icon-expand-down"></Icon> : ' - '}
                            </Button>
                            {isAndroid && <label>{displaySize}</label>}
                            <Button outline className='increment item-link' onClick={() => {props.changeFontSize(size, false)}}>
                                {isAndroid ? <Icon icon="icon-expand-up"></Icon> : ' + '}
                            </Button>
                        </Segmented>
                    </div>
                </ListItem>
            </List>
            <BlockTitle>{t('Edit.textFonts')}</BlockTitle>
            <List virtualList virtualListParams={{
                items: fonts,
                renderExternal: renderExternal
            }}>
                <ul>
                    {vlFonts.vlData.items.map((item, index) => (
                        <ListItem
                            key={index}
                            radio
                            checked={curFontName === item.name}
                            title={item.name}
                            style={{fontFamily: `${item.name}`}}
                            onClick={() => {props.changeFontFamily(item.name)}}
                        ></ListItem>
                    ))}
                </ul>
            </List>
        </Page>
    )
};

const PageAdditionalFormatting = props => {
    const isAndroid = Device.android;
    const { t } = useTranslation();
    const storeTextSettings = props.storeTextSettings;
    const storeFocusObjects = props.storeFocusObjects;
    const paragraph = storeFocusObjects.paragraphObject;
    const isStrikeout = paragraph.get_Strikeout();
    const isDStrikeout = paragraph.get_DStrikeout();
    const isSuperscript = storeTextSettings.isSuperscript;
    const isSubscript = storeTextSettings.isSubscript;
    const isSmallCaps = paragraph.get_SmallCaps();
    const isAllCaps = paragraph.get_AllCaps();
    const letterSpacing = Common.Utils.Metric.fnRecalcFromMM(paragraph.get_TextSpacing());
    return(
        <Page>
            <Navbar title={t('Edit.textAdditional')} backLink={t('Edit.textBack')} />
            <List>
                <ListItem title={t('Edit.textStrikethrough')} radio checked={isStrikeout} onClick={() => {props.onAdditionalStrikethrough('strikeout', !isStrikeout)}}/>
                <ListItem title={t('Edit.textDoubleStrikethrough')} radio checked={isDStrikeout} onClick={() => {props.onAdditionalStrikethrough('dbStrikeout', !isDStrikeout)}}/>
                <ListItem title={t('Edit.textSuperscript')} radio checked={isSuperscript} onClick={() => {props.onAdditionalScript('superscript', !isSuperscript)}}/>
                <ListItem title={t('Edit.textSubscript')} radio checked={isSubscript} onClick={() => {props.onAdditionalScript('subscript', !isSubscript)}}/>
                <ListItem title={t('Edit.textSmallCaps')} radio checked={isSmallCaps} onClick={() => {props.onAdditionalCaps('small', !isSmallCaps)}}/>
                <ListItem title={t('Edit.textAllCaps')} radio checked={isAllCaps} onClick={() => {props.onAdditionalCaps('all', !isAllCaps)}}/>
            </List>
            <List>
                <ListItem title={t('Edit.textLetterSpacing')}>
                    {!isAndroid && <div slot='after-start'>{letterSpacing + ' ' + Common.Utils.Metric.getCurrentMetricName()}</div>}
                    <div slot='after'>
                        <Segmented>
                            <Button outline className='decrement item-link' onClick={() => {props.changeLetterSpacing(letterSpacing, true)}}>
                                {isAndroid ? <Icon icon="icon-expand-down"></Icon> : ' - '}
                            </Button>
                            {isAndroid && <label>{letterSpacing + ' ' + Common.Utils.Metric.getCurrentMetricName()}</label>}
                            <Button outline className='increment item-link' onClick={() => {props.changeLetterSpacing(letterSpacing, false)}}>
                                {isAndroid ? <Icon icon="icon-expand-up"></Icon> : ' + '}
                            </Button>
                        </Segmented>
                    </div>
                </ListItem>
            </List>
        </Page>
    )
};

const PageBullets = props => {
    const { t } = useTranslation();
    const bulletArrays = [
        [
            {type: -1, thumb: ''},
            {type: 1, thumb: 'bullet-01.png'},
            {type: 2, thumb: 'bullet-02.png'},
            {type: 3, thumb: 'bullet-03.png'}
        ],
        [
            {type: 4, thumb: 'bullet-04.png'},
            {type: 5, thumb: 'bullet-05.png'},
            {type: 6, thumb: 'bullet-06.png'},
            {type: 7, thumb: 'bullet-07.png'}
        ]
    ];
    const storeTextSettings = props.storeTextSettings;
    const typeBullets = storeTextSettings.typeBullets;
    return(
        <Page className='bullets'>
            <Navbar title={t('Edit.textBullets')} backLink={t('Edit.textBack')} />
            {bulletArrays.map((bullets, index) => (
                    <ul className="row" style={{listStyle: 'none'}} key={'bullets-' + index}>
                        {bullets.map((bullet) => (
                            <li key={'bullet-' + bullet.type} data-type={bullet.type} className={bullet.type === typeBullets ? 'active' : ''} onClick={() => {props.onBullet(bullet.type)}}>
                                {bullet.thumb.length < 1 ?
                                    <div className="thumb" style={{position: 'relative'}}>
                                        <label>{t('Edit.textNone')}</label>
                                    </div> :
                                    <div className="thumb" style={{backgroundImage: `url('resources/img/bullets/${bullet.thumb}')`}}></div>
                                }
                            </li>
                        ))}
                    </ul>
            ))}
        </Page>
    )
};

const PageNumbers = props => {
    const { t } = useTranslation();
    const numberArrays = [
        [
            {type: -1, thumb: ''},
            {type: 4, thumb: 'number-01.png'},
            {type: 5, thumb: 'number-02.png'},
            {type: 6, thumb: 'number-03.png'}
        ],
        [
            {type: 1, thumb: 'number-04.png'},
            {type: 2, thumb: 'number-05.png'},
            {type: 3, thumb: 'number-06.png'},
            {type: 7, thumb: 'number-07.png'}
        ]
    ];
    const storeTextSettings = props.storeTextSettings;
    const typeNumbers = storeTextSettings.typeNumbers;
    return(
        <Page className='numbers'>
            <Navbar title={t('Edit.textNumbers')} backLink={t('Edit.textBack')} />
            {numberArrays.map((numbers, index) => (
                <ul className="row" style={{listStyle: 'none'}} key={'numbers-' + index}>
                    {numbers.map((number) => (
                        <li key={'number-' + number.type} data-type={number.type} className={number.type === typeNumbers ? 'active' : ''} onClick={() => {props.onNumber(number.type)}}>
                            {number.thumb.length < 1 ?
                                <div className="thumb" style={{position: 'relative'}}>
                                    <label>{t('Edit.textNone')}</label>
                                </div> :
                                <div className="thumb" style={{backgroundImage: `url('resources/img/numbers/${number.thumb}')`}}></div>
                            }
                        </li>
                    ))}
                </ul>
            ))}
        </Page>
    )
};

const PageLineSpacing = props => {
    const { t } = useTranslation();
    const storeTextSettings = props.storeTextSettings;
    const lineSpacing = storeTextSettings.lineSpacing;
    return(
        <Page>
            <Navbar title={t('Edit.textLineSpacing')} backLink={t('Edit.textBack')} />
            <List>
                <ListItem radio checked={lineSpacing === 1.0} title={1.0} onClick={() => {props.onLineSpacing(1.0)}}></ListItem>
                <ListItem radio checked={lineSpacing === 1.15} title={1.15} onClick={() => {props.onLineSpacing(1.15)}}></ListItem>
                <ListItem radio checked={lineSpacing === 1.5} title={1.5} onClick={() => {props.onLineSpacing(1.5)}}></ListItem>
                <ListItem radio checked={lineSpacing === 2.0} title={2.0} onClick={() => {props.onLineSpacing(2.0)}}></ListItem>
                <ListItem radio checked={lineSpacing === 2.5} title={2.5} onClick={() => {props.onLineSpacing(2.5)}}></ListItem>
                <ListItem radio checked={lineSpacing === 3.0} title={3.0} onClick={() => {props.onLineSpacing(3.0)}}></ListItem>
            </List>
        </Page>
    )
};

const PageFontColor = props => {
    const { t } = useTranslation();
    const _t = t('Edit', {returnObjects: true});
    const [stateColor, setColor] = useState();
    const changeCurColor = (color) => {
        setColor(color);
    };
    const onAddCustomColor = () => {
        console.log('add custom color');
    };
    return(
        <Page>
            <Navbar title={_t.textFontColors} backLink={_t.textBack} />
            <List>
                <ListItem className={'font-color-auto' + (stateColor === 'auto' ? ' active' : '')} title={_t.textAutomatic} onClick={() => {
                    props.onTextColorAuto();
                    setColor('auto');
                }}>
                    <div slot="media">
                        <div className={'color-auto'}></div>
                    </div>
                </ListItem>
            </List>
            <ThemeColorPalette changeCurColor={changeCurColor} curColor={stateColor}/>
            <List>
                <ListItem title={_t.textAddCustomColor} onClick={() => {onAddCustomColor()}}></ListItem>
            </List>
        </Page>
    )
};

const EditText = props => {
    const isAndroid = Device.android;
    const { t } = useTranslation();
    const storeTextSettings = props.storeTextSettings;
    const fontName = storeTextSettings.fontName || t('Edit.textFonts');
    const fontSize = storeTextSettings.fontSize;
    const displaySize = typeof fontSize === 'undefined' ? t('Edit.textAuto') : fontSize + ' ' + t('Edit.textPt');
    const isBold = storeTextSettings.isBold;
    const isItalic = storeTextSettings.isItalic;
    const isUnderline = storeTextSettings.isUnderline;
    const isStrikethrough = storeTextSettings.isStrikethrough;
    const paragraphAlign = storeTextSettings.paragraphAlign;
    return (
        <Fragment>
            <List>
                <ListItem title={fontName} link="/edit-text-fonts/" after={displaySize} routeProps={{
                    changeFontSize: props.changeFontSize,
                    changeFontFamily: props.changeFontFamily
                }}/>
                <ListItem className='buttons'>
                    <Row>
                        <a className={'button' + (isBold ? ' active' : '')} onClick={() => { props.toggleBold(!isBold)}}><b>B</b></a>
                        <a className={'button' + (isItalic ? ' active' : '')} onClick={() => {props.toggleItalic(!isItalic)}}><i>I</i></a>
                        <a className={'button' + (isUnderline ? ' active' : '')} onClick={() => {props.toggleUnderline(!isUnderline)}} style={{textDecoration: "underline"}}>U</a>
                        <a className={'button' + (isStrikethrough ? ' active' : '')} onClick={() => {props.toggleStrikethrough(!isStrikethrough)}} style={{textDecoration: "line-through"}}>S</a>
                    </Row>
                </ListItem>
                <ListItem title={t("Edit.textFontColor")} link="/edit-text-font-color/" routeProps={{
                    onTextColorAuto: props.onTextColorAuto
                }}>
                    {!isAndroid && <Icon slot="media" icon="icon-text-color"></Icon>}
                    <span className="color-preview"></span>
                </ListItem>
                <ListItem title={t("Edit.textHighlightColor")} link="#">
                    {!isAndroid && <Icon slot="media" icon="icon-text-selection"></Icon>}
                </ListItem>
                <ListItem title={t("Edit.textAdditionalFormatting")} link="/edit-text-add-formatting/" routeProps={{
                    onAdditionalStrikethrough: props.onAdditionalStrikethrough,
                    onAdditionalCaps: props.onAdditionalCaps,
                    onAdditionalScript: props.onAdditionalScript,
                    changeLetterSpacing: props.changeLetterSpacing
                }}>
                    {!isAndroid && <Icon slot="media" icon="icon-text-additional"></Icon>}
                </ListItem>
            </List>
            <List>
                <ListItem className='buttons'>
                    <Row>
                        <a className={'button' + (paragraphAlign === 'left' ? ' active' : '')} onClick={() => {props.onParagraphAlign('left')}}>
                            <Icon slot="media" icon="icon-text-align-left"></Icon>
                        </a>
                        <a className={'button' + (paragraphAlign === 'center' ? ' active' : '')} onClick={() => {props.onParagraphAlign('center')}}>
                            <Icon slot="media" icon="icon-text-align-center"></Icon>
                        </a>
                        <a className={'button' + (paragraphAlign === 'right' ? ' active' : '')} onClick={() => {props.onParagraphAlign('right')}}>
                            <Icon slot="media" icon="icon-text-align-right"></Icon>
                        </a>
                        <a className={'button' + (paragraphAlign === 'just' ? ' active' : '')} onClick={() => {props.onParagraphAlign('just')}}>
                            <Icon slot="media" icon="icon-text-align-just"></Icon>
                        </a>
                    </Row>
                </ListItem>
                <ListItem className='buttons'>
                    <Row>
                        <a className='button item-link' onClick={() => {props.onParagraphMove(true)}}>
                            <Icon slot="media" icon="icon-de-indent"></Icon>
                        </a>
                        <a className='button item-link' onClick={() => {props.onParagraphMove(false)}}>
                            <Icon slot="media" icon="icon-in-indent"></Icon>
                        </a>
                    </Row>
                </ListItem>
                <ListItem title={t("Edit.textBullets")} link='/edit-text-bullets/' routeProps={{
                    onBullet: props.onBullet
                }}>
                    {!isAndroid && <Icon slot="media" icon="icon-bullets"></Icon>}
                </ListItem>
                <ListItem title={t("Edit.textNumbers")} link='/edit-text-numbers/' routeProps={{
                    onNumber: props.onNumber
                }}>
                    {!isAndroid && <Icon slot="media" icon="icon-numbers"></Icon>}
                </ListItem>
                <ListItem title={t("Edit.textLineSpacing")} link='/edit-text-line-spacing/' routeProps={{
                    onLineSpacing: props.onLineSpacing
                }}>
                    {!isAndroid && <Icon slot="media" icon="icon-linespacing"></Icon>}
                </ListItem>
            </List>
            </Fragment>
        )
};

const EditTextContainer = inject("storeTextSettings", "storeFocusObjects")(observer(EditText));
const PageFontsContainer = inject("storeTextSettings", "storeFocusObjects")(observer(PageFonts));
const PageAddFormattingContainer = inject("storeTextSettings", "storeFocusObjects")(observer(PageAdditionalFormatting));
const PageBulletsContainer = inject("storeTextSettings")(observer(PageBullets));
const PageNumbersContainer = inject("storeTextSettings")(observer(PageNumbers));
const PageLineSpacingContainer = inject("storeTextSettings")(observer(PageLineSpacing));

export {
    EditTextContainer as EditText,
    PageFontsContainer as PageFonts,
    PageAddFormattingContainer as PageAdditionalFormatting,
    PageBulletsContainer as PageBullets,
    PageNumbersContainer as PageNumbers,
    PageLineSpacingContainer as PageLineSpacing,
    PageFontColor
};