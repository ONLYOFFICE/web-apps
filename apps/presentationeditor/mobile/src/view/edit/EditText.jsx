import React, {Fragment, useState} from 'react';
import {observer, inject} from "mobx-react";
import {f7, List, ListItem, Icon, Row, Button, Page, Navbar, Segmented, BlockTitle, NavRight, Link} from 'framework7-react';
import { useTranslation } from 'react-i18next';
import {Device} from '../../../../../common/mobile/utils/device';
import { ThemeColorPalette, CustomColorPicker } from '../../../../../common/mobile/lib/component/ThemeColorPalette.jsx';

const EditText = props => {
    const isAndroid = Device.android;
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const metricText = Common.Utils.Metric.getCurrentMetricName();
    const storeTextSettings = props.storeTextSettings;
    const storeFocusObjects = props.storeFocusObjects;
    const fontName = storeTextSettings.fontName || _t.textFonts;
    const fontSize = storeTextSettings.fontSize;
    const fontColor = storeTextSettings.textColor;
    const displaySize = typeof fontSize === 'undefined' || fontSize == '' ? _t.textAuto : fontSize + ' ' + _t.textPt;
    const isBold = storeTextSettings.isBold;
    const isItalic = storeTextSettings.isItalic;
    const isUnderline = storeTextSettings.isUnderline;
    const isStrikethrough = storeTextSettings.isStrikethrough;
    const paragraphAlign = storeTextSettings.paragraphAlign;
    const paragraphValign = storeTextSettings.paragraphValign;
    const canIncreaseIndent = storeTextSettings.canIncreaseIndent;
    const canDecreaseIndent = storeTextSettings.canDecreaseIndent;
    const paragraphObj = storeFocusObjects.paragraphObject;
    let spaceBefore;
    let spaceAfter;

    if(paragraphObj) {
        spaceBefore = paragraphObj.get_Spacing().get_Before() < 0 ? paragraphObj.get_Spacing().get_Before() : Common.Utils.Metric.fnRecalcFromMM(paragraphObj.get_Spacing().get_Before());
        spaceAfter  = paragraphObj.get_Spacing().get_After() < 0 ? paragraphObj.get_Spacing().get_After() : Common.Utils.Metric.fnRecalcFromMM(paragraphObj.get_Spacing().get_After());
    }

    const displayBefore = typeof spaceBefore === 'undefined' || spaceBefore < 0 ? _t.textAuto : parseFloat(spaceBefore.toFixed(2)) + ' ' + metricText;
    const displayAfter = typeof spaceAfter === 'undefined' || spaceAfter < 0 ? _t.textAuto : parseFloat(spaceAfter.toFixed(2)) + ' ' + metricText;

    const fontColorPreview = fontColor !== 'auto' ?
        <span className="color-preview" style={{ background: `#${(typeof fontColor === "object" ? fontColor.color : fontColor)}`}}></span> :
        <span className="color-preview auto"></span>;

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
                <ListItem title={_t.textFontColor} link="/edit-text-font-color/" routeProps={{
                    onTextColor: props.onTextColor
                }}>
                    {!isAndroid ?
                        <Icon slot="media" icon="icon-text-color">{fontColorPreview}</Icon> :
                        fontColorPreview
                    }
                </ListItem>
                <ListItem title={_t.textAdditionalFormatting} link="/edit-text-add-formatting/" routeProps={{
                    onAdditionalStrikethrough: props.onAdditionalStrikethrough,
                    onAdditionalCaps: props.onAdditionalCaps,
                    onAdditionalScript: props.onAdditionalScript,
                    changeLetterSpacing: props.changeLetterSpacing
                }}>
                    {!isAndroid && <Icon slot="media" icon="icon-text-additional"></Icon>}
                </ListItem>
            </List>
            {paragraphObj ? (
                <Fragment>
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
                                <a className={'button' + (paragraphValign === 'top' ? ' active' : '')} onClick={() => {props.onParagraphValign('top')}}>
                                    <Icon slot="media" icon="icon-text-valign-top"></Icon>
                                </a>
                                <a className={'button' + (paragraphValign === 'center' ? ' active' : '')} onClick={() => {props.onParagraphValign('center')}}>
                                    <Icon slot="media" icon="icon-text-valign-middle"></Icon>
                                </a>
                                <a className={'button' + (paragraphValign === 'bottom' ? ' active' : '')} onClick={() => {props.onParagraphValign('bottom')}}>
                                    <Icon slot="media" icon="icon-text-valign-bottom"></Icon>
                                </a>
                            </Row>
                        </ListItem>
                        <ListItem className='buttons'>
                            <Row>
                                <a className={'button item-link' + (!canDecreaseIndent ? ' disabled' : '') } onClick={() => {props.onParagraphMove('left')}}>
                                    <Icon slot="media" icon="icon-de-indent"></Icon>
                                </a>
                                <a className={'button item-link' + (!canIncreaseIndent ? ' disabled' : '') } onClick={() => {props.onParagraphMove('right')}}>
                                    <Icon slot="media" icon="icon-in-indent"></Icon>
                                </a>
                            </Row>
                        </ListItem>
                        <ListItem title={_t.textBullets} link='/edit-text-bullets/' routeProps={{
                            onBullet: props.onBullet
                        }}>
                            {!isAndroid && <Icon slot="media" icon="icon-bullets"></Icon>}
                        </ListItem>
                        <ListItem title={_t.textNumbers} link='/edit-text-numbers/' routeProps={{
                            onNumber: props.onNumber
                        }}>
                            {!isAndroid && <Icon slot="media" icon="icon-numbers"></Icon>}
                        </ListItem>
                        <ListItem title={_t.textLineSpacing} link='/edit-text-line-spacing/' routeProps={{
                            onLineSpacing: props.onLineSpacing
                        }}>
                            {!isAndroid && <Icon slot="media" icon="icon-linespacing"></Icon>}
                        </ListItem>
                    </List>
                    <BlockTitle>{_t.textDistanceFromText}</BlockTitle>
                    <List>
                        <ListItem title={_t.textBefore}>
                            {!isAndroid && <div slot='after-start'>{displayBefore}</div>}
                            <div slot='after'>
                                <Segmented>
                                    <Button outline className='decrement item-link' onClick={() => {props.onDistanceBefore(spaceBefore, true)}}>
                                        {isAndroid ? <Icon icon="icon-expand-down"></Icon> : ' - '}
                                    </Button>
                                    {isAndroid && <label>{displayBefore}</label>}
                                    <Button outline className='increment item-link' onClick={() => {props.onDistanceBefore(spaceBefore, false)}}>
                                        {isAndroid ? <Icon icon="icon-expand-up"></Icon> : ' + '}
                                    </Button>
                                </Segmented>
                            </div>
                        </ListItem>
                        <ListItem title={_t.textAfter}>
                            {!isAndroid && <div slot='after-start'>{displayAfter}</div>}
                            <div slot='after'>
                                <Segmented>
                                    <Button outline className='decrement item-link' onClick={() => {props.onDistanceAfter(spaceAfter, true)}}>
                                        {isAndroid ? <Icon icon="icon-expand-down"></Icon> : ' - '}
                                    </Button>
                                    {isAndroid && <label>{displayAfter}</label>}
                                    <Button outline className='increment item-link' onClick={() => {props.onDistanceAfter(spaceAfter, false)}}>
                                        {isAndroid ? <Icon icon="icon-expand-up"></Icon> : ' + '}
                                    </Button>
                                </Segmented>
                            </div>
                        </ListItem>
                    </List>
                </Fragment>
            ) : null}
        </Fragment>
    );
};

const PageFonts = props => {
    const isAndroid = Device.android;
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const storeTextSettings = props.storeTextSettings;
    const size = storeTextSettings.fontSize;
    const displaySize = typeof size === 'undefined' || size == '' ? _t.textAuto : size + ' ' + _t.textPt;
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
            }};
        });
    };

    const paragraph = props.storeFocusObjects.paragraphObject;
    if (!paragraph && Device.phone) {
        $$('.sheet-modal.modal-in').length > 0 && f7.sheet.close();
        return null;
    }

    return (
        <Page>
            <Navbar title={_t.textFonts} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose='#edit-sheet'>
                            <Icon icon='icon-expand-down'/>
                        </Link>
                    </NavRight>
                }
            </Navbar>
            <List>
                <ListItem title={_t.textSize}>
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
            <BlockTitle>{_t.textFonts}</BlockTitle>
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
    );
};

const PageFontColor = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const textColor = props.storeTextSettings.textColor;
    const customColors = props.storePalette.customColors;

    const changeColor = (color, effectId) => {
        if (color !== 'empty') {
            if (effectId !== undefined ) {
                props.onTextColor({color: color, effectId: effectId});
            } else {
                props.onTextColor(color);
            }
        } else {
            // open custom color menu
            props.f7router.navigate('/edit-text-custom-font-color/', {props: {onTextColor: props.onTextColor}});
        }
    };

    const paragraph = props.storeFocusObjects.paragraphObject;
    if (!paragraph && Device.phone) {
        $$('.sheet-modal.modal-in').length > 0 && f7.sheet.close();
        return null;
    }

    return (
        <Page>
            <Navbar title={_t.textFontColors} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose='#edit-sheet'>
                            <Icon icon='icon-expand-down'/>
                        </Link>
                    </NavRight>
                }
            </Navbar>
            <ThemeColorPalette changeColor={changeColor} curColor={textColor} customColors={customColors}/>
            <List>
                <ListItem title={_t.textAddCustomColor} link={'/edit-text-custom-font-color/'} routeProps={{
                    onTextColor: props.onTextColor
                }}></ListItem>
            </List>
        </Page>
    );
};

const PageCustomFontColor = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const store = props.storeTextSettings;
    let textColor = store.textColor;

    if (typeof textColor === 'object') {
        textColor = textColor.color;
    }

    const autoColor = textColor === 'auto' ? window.getComputedStyle(document.getElementById('font-color-auto')).backgroundColor : null;

    const onAddNewColor = (colors, color) => {
        props.storePalette.changeCustomColors(colors);
        props.onTextColor(color);
        props.f7router.back();
    };
    return(
        <Page>
            <Navbar title={_t.textCustomColor} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose='#edit-sheet'>
                            <Icon icon='icon-expand-down'/>
                        </Link>
                    </NavRight>
                }
            </Navbar>
            <CustomColorPicker autoColor={autoColor} currentColor={textColor} onAddNewColor={onAddNewColor}/>
        </Page>
    )
};

const PageAdditionalFormatting = props => {
    const isAndroid = Device.android;
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const storeTextSettings = props.storeTextSettings;
    const storeFocusObjects = props.storeFocusObjects;
    const paragraphObj = storeFocusObjects.paragraphObject;
    const isSuperscript = storeTextSettings.isSuperscript;
    const isSubscript = storeTextSettings.isSubscript;
    
    let isStrikeout = false;
    let isDStrikeout = false;
    let isSmallCaps = false;
    let isAllCaps = false;
    let letterSpacing = 0;

    if(paragraphObj) {
        isStrikeout = paragraphObj.get_Strikeout();
        isDStrikeout = paragraphObj.get_DStrikeout();
        isSmallCaps = paragraphObj.get_SmallCaps();
        isAllCaps = paragraphObj.get_AllCaps();
        letterSpacing = (paragraphObj.get_TextSpacing() === null || paragraphObj.get_TextSpacing() === undefined) ? paragraphObj.get_TextSpacing() : Common.Utils.Metric.fnRecalcFromMM(paragraphObj.get_TextSpacing());
    }

    if (!paragraphObj && Device.phone) {
        $$('.sheet-modal.modal-in').length > 0 && f7.sheet.close();
        return null;
    }

    return (
        <Page>
            <Navbar title={_t.textAdditional} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose='#edit-sheet'>
                            <Icon icon='icon-expand-down'/>
                        </Link>
                    </NavRight>
                }
            </Navbar>
            <List>
                <ListItem title={_t.textStrikethrough} radio checked={isStrikeout} onClick={() => {props.onAdditionalStrikethrough('strikethrough', !isStrikeout)}}/>
                <ListItem title={_t.textDoubleStrikethrough} radio checked={isDStrikeout} onClick={() => {props.onAdditionalStrikethrough('dbStrikethrough', !isDStrikeout)}}/>
                <ListItem title={_t.textSuperscript} radio checked={isSuperscript} onClick={() => {props.onAdditionalScript('superscript', !isSuperscript)}}/>
                <ListItem title={_t.textSubscript} radio checked={isSubscript} onClick={() => {props.onAdditionalScript('subscript', !isSubscript)}}/>
                <ListItem title={_t.textSmallCaps} radio checked={isSmallCaps} onClick={() => {props.onAdditionalCaps('small', !isSmallCaps)}}/>
                <ListItem title={_t.textAllCaps} radio checked={isAllCaps} onClick={() => {props.onAdditionalCaps('all', !isAllCaps)}}/>
            </List>
            <List>
                <ListItem title={_t.textLetterSpacing}>
                    {!isAndroid && <div slot='after-start'>{(Number.isInteger(letterSpacing) ? letterSpacing : letterSpacing.toFixed(2)) + ' ' + Common.Utils.Metric.getCurrentMetricName()}</div>}
                    <div slot='after'>
                        <Segmented>
                            <Button outline className='decrement item-link' onClick={() => {props.changeLetterSpacing(letterSpacing, true)}}>
                                {isAndroid ? <Icon icon="icon-expand-down"></Icon> : ' - '}
                            </Button>
                            {isAndroid && <label>{(Number.isInteger(letterSpacing) ? letterSpacing : letterSpacing.toFixed(2)) + ' ' + Common.Utils.Metric.getCurrentMetricName()}</label>}
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
    const _t = t('View.Edit', {returnObjects: true});
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

    const paragraph = props.storeFocusObjects.paragraphObject;
    if (!paragraph && Device.phone) {
        $$('.sheet-modal.modal-in').length > 0 && f7.sheet.close();
        return null;
    }

    return (
        <Page className='bullets dataview'>
            <Navbar title={_t.textBullets} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose='#edit-sheet'>
                            <Icon icon='icon-expand-down'/>
                        </Link>
                    </NavRight>
                }
            </Navbar>
            {bulletArrays.map((bullets, index) => (
                    <ul className="row" style={{listStyle: 'none'}} key={'bullets-' + index}>
                        {bullets.map((bullet) => (
                            <li key={'bullet-' + bullet.type} data-type={bullet.type} className={bullet.type === typeBullets ? 'active' : ''} onClick={() => {props.onBullet(bullet.type)}}>
                                {bullet.thumb.length < 1 ?
                                    <div className="thumb" style={{position: 'relative'}}>
                                        <label>{_t.textNone}</label>
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
    const _t = t('View.Edit', {returnObjects: true});
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

    const paragraph = props.storeFocusObjects.paragraphObject;
    if (!paragraph && Device.phone) {
        $$('.sheet-modal.modal-in').length > 0 && f7.sheet.close();
        return null;
    }

    return (
        <Page className='numbers dataview'>
            <Navbar title={_t.textNumbers} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose='#edit-sheet'>
                            <Icon icon='icon-expand-down'/>
                        </Link>
                    </NavRight>
                }
            </Navbar>
            {numberArrays.map((numbers, index) => (
                <ul className="row" style={{listStyle: 'none'}} key={'numbers-' + index}>
                    {numbers.map((number) => (
                        <li key={'number-' + number.type} data-type={number.type} className={number.type === typeNumbers ? 'active' : ''} onClick={() => {props.onNumber(number.type)}}>
                            {number.thumb.length < 1 ?
                                <div className="thumb" style={{position: 'relative'}}>
                                    <label>{_t.textNone}</label>
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
    const _t = t('View.Edit', {returnObjects: true});
    const storeTextSettings = props.storeTextSettings;
    const lineSpacing = storeTextSettings.lineSpacing;

    const paragraph = props.storeFocusObjects.paragraphObject;
    if (!paragraph && Device.phone) {
        $$('.sheet-modal.modal-in').length > 0 && f7.sheet.close();
        return null;
    }

    return (
        <Page>
            <Navbar title={_t.textLineSpacing} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose='#edit-sheet'>
                            <Icon icon='icon-expand-down'/>
                        </Link>
                    </NavRight>
                }
            </Navbar>
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

const EditTextContainer = inject("storeTextSettings", "storeFocusObjects")(observer(EditText));
const PageTextFonts = inject("storeTextSettings", "storeFocusObjects")(observer(PageFonts));
const PageTextFontColor = inject("storeTextSettings", "storePalette", "storeFocusObjects")(observer(PageFontColor));
const PageTextCustomFontColor = inject("storeTextSettings", "storePalette")(observer(PageCustomFontColor));
const PageTextAddFormatting = inject("storeTextSettings", "storeFocusObjects")(observer(PageAdditionalFormatting));
const PageTextBullets = inject("storeTextSettings", "storeFocusObjects")(observer(PageBullets));
const PageTextNumbers = inject("storeTextSettings", "storeFocusObjects")(observer(PageNumbers));
const PageTextLineSpacing = inject("storeTextSettings", "storeFocusObjects")(observer(PageLineSpacing));

export {
    EditTextContainer as EditText,
    PageTextFonts,
    PageTextFontColor,
    PageTextCustomFontColor,
    PageTextAddFormatting,
    PageTextBullets,
    PageTextNumbers,
    PageTextLineSpacing
};