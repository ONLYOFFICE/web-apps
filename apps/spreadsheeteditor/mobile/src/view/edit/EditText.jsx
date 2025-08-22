import React, {Fragment, useState} from 'react';
import {observer, inject} from "mobx-react";
import {List, ListItem, Icon, Button, Page, Navbar, NavRight, Segmented, BlockTitle, Link} from 'framework7-react';
import { useTranslation } from 'react-i18next';
import { Device } from '../../../../../common/mobile/utils/device';
import { ThemeColorPalette, CustomColorPicker } from '../../../../../common/mobile/lib/component/ThemeColorPalette.jsx';
import { LocalStorage } from '../../../../../common/mobile/utils/LocalStorage.mjs';
import SvgIcon from '@common/lib/component/SvgIcon';
import IconExpandDownIos from '@common-ios-icons/icon-expand-down.svg?ios';
import IconExpandDownAndroid from '@common-android-icons/icon-expand-down.svg';
import IconExpandUp from '@common-android-icons/icon-expand-up.svg';
import IconTextAlignLeft from '@common-icons/icon-text-align-left.svg';
import IconTextAlignCenter from '@common-icons/icon-text-align-center.svg';
import IconTextAlignRight from '@common-icons/icon-text-align-right.svg';
import IconTextAlignJust from '@common-icons/icon-text-align-just.svg';
import IconTextValignBottom from '@common-icons/icon-text-valign-bottom.svg';
import IconTextValignMiddle from '@common-icons/icon-text-valign-middle.svg';
import IconTextValignTop from '@common-icons/icon-text-valign-top.svg';
import IconTextOrientationHorizontal from '@common-icons/icon-text-orientation-horizontal.svg';
import IconTextOrientationAnglecount from '@common-icons/icon-text-orientation-anglecount.svg';
import IconTextOrientationRotateup from '@common-icons/icon-text-orientation-rotateup.svg';
import IconTextOrientationRotatedown from '@common-icons/icon-text-orientation-rotatedown.svg';
import IconTextColor from '@common-icons/icon-text-color.svg';
import IconTextAdditionalIos from '@common-icons/icon-text-additional.svg';

const EditText = props => {
    const isAndroid = Device.android;
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const storeFocusObjects = props.storeFocusObjects;
    const shapeObject = storeFocusObjects.shapeObject;
    const storeTextSettings = props.storeTextSettings;
    const textIn = storeTextSettings.textIn;

    const fontName = storeTextSettings.fontName || _t.textFonts;
    const fontSize = storeTextSettings.fontSize;
    const fontColor = storeTextSettings.textColor;

    const displaySize = typeof fontSize === 'undefined' ? _t.textAuto : fontSize + ' ' + _t.textPt;
    const isBold = storeTextSettings.isBold;
    const isItalic = storeTextSettings.isItalic;
    const isUnderline = storeTextSettings.isUnderline;
    const isStrikethrough = storeTextSettings.isStrikethrough;
    const paragraphAlign = storeTextSettings.paragraphAlign;
    const paragraphValign = storeTextSettings.paragraphValign;

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
                    <div className="row">
                        <a className={'button' + (isBold ? ' active' : '')} onClick={() => {props.toggleBold(!isBold)}}><b>B</b></a>
                        <a className={'button' + (isItalic ? ' active' : '')} onClick={() => {props.toggleItalic(!isItalic)}}><i>I</i></a>
                        <a className={'button' + (isUnderline ? ' active' : '')} onClick={() => {props.toggleUnderline(!isUnderline)}} style={{textDecoration: "underline"}}>U</a>
                        <a className={'button' + (isStrikethrough ? ' active' : '')} onClick={() => {props.toggleStrikethrough(!isStrikethrough)}} style={{textDecoration: "line-through"}}>S</a>
                    </div>
                </ListItem>
                <ListItem title={_t.textTextColor} link="/edit-text-font-color/" routeProps={{
                    onTextColor: props.onTextColor
                }}>
                    {!isAndroid ?
                        <SvgIcon slot="media" symbolId={IconTextColor.id} className={'icon icon-svg'} /> :
                        fontColorPreview
                    }
                </ListItem>
                <ListItem title={_t.textAdditionalFormatting} link="/edit-text-add-formatting/" routeProps={{
                    onAdditionalStrikethrough: props.onAdditionalStrikethrough,
                    onAdditionalCaps: props.onAdditionalCaps,
                    onAdditionalScript: props.onAdditionalScript,
                    changeLetterSpacing: props.changeLetterSpacing
                }}>
                    {!isAndroid && 
                        <SvgIcon slot="media" symbolId={IconTextAdditionalIos.id} className={'icon icon-svg'} />
                    }
                </ListItem>
            </List>
            {textIn === 2 ? (
                <Fragment>
                    <List>
                        <ListItem className='buttons'>
                            <div className="row">
                                <a className={'button' + (paragraphAlign === AscCommon.align_Left ? ' active' : '')} onClick={() => {props.onParagraphAlign('left')}}>
                                    <SvgIcon slot="media" symbolId={IconTextAlignLeft.id} className='icon icon-svg' />
                                </a>
                                <a className={'button' + (paragraphAlign === AscCommon.align_Center ? ' active' : '')} onClick={() => {props.onParagraphAlign('center')}}>
                                    <SvgIcon slot="media" symbolId={IconTextAlignCenter.id} className='icon icon-svg' />
                                </a>
                                <a className={'button' + (paragraphAlign === AscCommon.align_Right ? ' active' : '')} onClick={() => {props.onParagraphAlign('right')}}>
                                    <SvgIcon slot="media" symbolId={IconTextAlignRight.id} className='icon icon-svg' />
                                </a>
                                <a className={'button' + (paragraphAlign === AscCommon.align_Justify ? ' active' : '')} onClick={() => {props.onParagraphAlign('justify')}}>
                                    <SvgIcon slot="media" symbolId={IconTextAlignJust.id} className='icon icon-svg' />
                                </a>
                            </div>
                        </ListItem>
                        <ListItem className='buttons'>
                            <div className="row">
                                <a className={'button' + (paragraphValign === Asc.c_oAscVAlign.Top ? ' active' : '')} onClick={() => {props.onParagraphValign('top')}}>
                                    <SvgIcon slot="media" symbolId={IconTextValignTop.id} className='icon icon-svg' />
                                </a>
                                <a className={'button' + (paragraphValign === Asc.c_oAscVAlign.Center ? ' active' : '')} onClick={() => {props.onParagraphValign('center')}}>
                                    <SvgIcon slot="media" symbolId={IconTextValignMiddle.id} className='icon icon-svg' />
                                </a>
                                <a className={'button' + (paragraphValign === Asc.c_oAscVAlign.Bottom ? ' active' : '')} onClick={() => {props.onParagraphValign('bottom')}}>
                                    <SvgIcon slot="media" symbolId={IconTextValignBottom.id} className='icon icon-svg' />
                                </a>
                            </div>
                        </ListItem>
                        {shapeObject &&
                            <ListItem title={t('View.Edit.textTextOrientation')} link='/edit-text-shape-orientation/' routeProps={{
                                setOrientationTextShape: props.setOrientationTextShape,
                                shapeObject
                            }}>
                                {!isAndroid && <SvgIcon slot="media" symbolId={IconTextOrientationAnglecount.id} className={'icon icon-svg'} />}
                            </ListItem>
                        }
                    </List>
                </Fragment>
            ) : null}
        </Fragment>
    );
};

const PageOrientationTextShape = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const shapeObject = props.shapeObject;
    const [directionTextShape, setDirectionTextShape] = useState(shapeObject.get_Vert());
    const isAndroid = Device.android;

    return (
        <Page>
            <Navbar title={t('View.Edit.textTextOrientation')} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose='#edit-sheet'>
                            {Device.ios ? 
                                <SvgIcon symbolId={IconExpandDownIos.id} className={'icon icon-svg'} /> :
                                <SvgIcon symbolId={IconExpandDownAndroid.id} className={'icon icon-svg'} />
                            }
                        </Link>
                    </NavRight>
                }
            </Navbar>
            <List>
                <ListItem title={t('View.Edit.textHorizontalText')} radio 
                    checked={directionTextShape === Asc.c_oAscVertDrawingText.normal}
                    radioIcon="end"
                    onChange={() => {
                        setDirectionTextShape(Asc.c_oAscVertDrawingText.normal);
                        props.setOrientationTextShape(Asc.c_oAscVertDrawingText.normal);
                }}>
                    <SvgIcon slot="media" symbolId={IconTextOrientationHorizontal.id} className={'icon icon-svg'} />
                </ListItem>
                <ListItem title={t('View.Edit.textRotateTextDown')} radio
                    checked={directionTextShape === Asc.c_oAscVertDrawingText.vert}
                    radioIcon="end"
                    onChange={() => {
                        setDirectionTextShape(Asc.c_oAscVertDrawingText.vert);
                        props.setOrientationTextShape(Asc.c_oAscVertDrawingText.vert);
                }}>
                    <SvgIcon slot="media" symbolId={IconTextOrientationRotatedown.id} className={'icon icon-svg'} />
                </ListItem>
                <ListItem title={t('View.Edit.textRotateTextUp')} radio
                    checked={directionTextShape === Asc.c_oAscVertDrawingText.vert270}
                    radioIcon="end"
                    onChange={() => {
                        setDirectionTextShape(Asc.c_oAscVertDrawingText.vert270);
                        props.setOrientationTextShape(Asc.c_oAscVertDrawingText.vert270);
                }}>
                    <SvgIcon slot="media" symbolId={IconTextOrientationRotateup.id} className={'icon icon-svg'} />
                </ListItem>
            </List>
        </Page>
    )
}

const PageFonts = props => {
    const isAndroid = Device.android;
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const storeTextSettings = props.storeTextSettings;
    const size = storeTextSettings.fontSize;
    const displaySize = typeof size === 'undefined' ? _t.textAuto : size + ' ' + _t.textPt;
    const curFontName = storeTextSettings.fontName;
    const fonts = storeTextSettings.fontsArray;
    const iconWidth = storeTextSettings.iconWidth;
    const iconHeight = storeTextSettings.iconHeight;
    // const thumbs = storeTextSettings.thumbs;
    // const thumbIdx = storeTextSettings.thumbIdx;
    const thumbCanvas = storeTextSettings.thumbCanvas;
    const thumbContext = storeTextSettings.thumbContext;
    const spriteCols = storeTextSettings.spriteCols;
    const spriteThumbs = storeTextSettings.spriteThumbs;
    const arrayRecentFonts = storeTextSettings.arrayRecentFonts;

    const addRecentStorage = () => {
        setRecent(getImageUri(arrayRecentFonts));
        LocalStorage.setItem('sse-settings-recent-fonts', JSON.stringify(arrayRecentFonts));
    };

    const getImageUri = fonts => {
        return fonts.map(font => {
            let index = Math.floor(font.imgidx/spriteCols);
            return spriteThumbs.getImage(index, thumbCanvas, thumbContext).toDataURL();
        });
    };

    const [stateRecent, setRecent] = useState(() => getImageUri(arrayRecentFonts));
    const [vlFonts, setVlFonts] = useState({
        vlData: {
            items: [],
        }
    });

    const renderExternal = (vl, vlData) => {
        setVlFonts((prevState) => {
            let fonts = [...prevState.vlData.items],
                drawFonts = [...vlData.items];

            let images = [],
                drawImages = getImageUri(drawFonts);
            for (let i = 0; i < drawFonts.length; i++) {
                fonts[i + vlData.fromIndex] = drawFonts[i];
                images[i + vlData.fromIndex] = drawImages[i];
            }
            return {vlData: {
                    items: fonts,
                    images,
                }}
        });
    };

    return (
        <Page>
            <Navbar title={_t.textFonts} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose>
                            {Device.ios ? 
                                <SvgIcon symbolId={IconExpandDownIos.id} className={'icon icon-svg'} /> :
                                <SvgIcon symbolId={IconExpandDownAndroid.id} className={'icon icon-svg'} />
                            }
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
                                {isAndroid ? 
                                    <SvgIcon symbolId={IconExpandDownAndroid.id} className='icon icon-svg' />
                                : ' - '}
                            </Button>
                            {isAndroid && <label>{displaySize}</label>}
                            <Button outline className='increment item-link' onClick={() => {props.changeFontSize(size, false)}}>
                                {isAndroid ? 
                                    <SvgIcon symbolId={IconExpandUp.id} className='icon icon-svg' />
                                : ' + '}
                            </Button>
                        </Segmented>
                    </div>
                </ListItem>
            </List>
            <BlockTitle>{_t.textFonts}</BlockTitle>
            {!!arrayRecentFonts.length &&
                <List>
                    {arrayRecentFonts.map((item, index) => (
                        <ListItem className="font-item" key={index} radio checked={curFontName === item.name} onClick={() => {
                            props.changeFontFamily(item.name);
                        }}> 
                            <img src={stateRecent[index]} style={{width: `${iconWidth}px`, height: `${iconHeight}px`}} />
                        </ListItem>
                    ))}
                </List>
            }
            <List virtualList virtualListParams={{
                items: fonts,
                renderExternal: renderExternal
            }}>
                <ul>
                    {vlFonts.vlData.items.map((item, index) => {
                        const font = item || fonts[index];
                        const fontName = font.name;
                        return (
                            <ListItem className="font-item" key={index} radio checked={curFontName === fontName} onClick={() => {
                                props.changeFontFamily(fontName);
                                storeTextSettings.addFontToRecent(font);
                                addRecentStorage();
                            }}>
                                {vlFonts.vlData.images[index] && <img src={vlFonts.vlData.images[index]} style={{width: `${iconWidth}px`, height: `${iconHeight}px`}} />}
                            </ListItem>
                        )
                    })}
                </ul>
            </List>
        </Page>
    );
};

const PageFontColor = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const storeTextSettings = props.storeTextSettings;
    const storePalette = props.storePalette;
    const textColor = storeTextSettings.textColor;
    const customColors = storePalette.customColors;

    const changeColor = (color, effectId, effectValue) => {
        if (color !== 'empty') {
            if (effectId !== undefined) {
                const newColor = {color: color, effectId: effectId, effectValue: effectValue};
                props.onTextColor(newColor);
                storeTextSettings.changeTextColor(newColor);
            } else {
                props.onTextColor(color);
                storeTextSettings.changeTextColor(color);
            }
        } else {
            // open custom color menu
            props.f7router.navigate('/edit-text-custom-font-color/', {props: {onTextColor: props.onTextColor}});
        }
    };

    return (
        <Page>
            <Navbar title={_t.textTextColor} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose>
                            {Device.ios ? 
                                <SvgIcon symbolId={IconExpandDownIos.id} className={'icon icon-svg'} /> :
                                <SvgIcon symbolId={IconExpandDownAndroid.id} className={'icon icon-svg'} />
                            }
                        </Link>
                    </NavRight>
                }
            </Navbar>
            <ThemeColorPalette changeColor={changeColor} curColor={textColor} customColors={customColors} />
            <List>
                <ListItem title={_t.textAddCustomColor} link={'/edit-text-custom-font-color/'} routeProps={{
                    onTextColor: props.onTextColor
                }}></ListItem>
            </List>
        </Page>
    );
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
    let isStrikeout, isDStrikeout, isSmallCaps, isAllCaps, letterSpacing;

    if(paragraphObj) {
        isStrikeout = paragraphObj.asc_getStrikeout();
        isDStrikeout = paragraphObj.asc_getDStrikeout();
        isSmallCaps = paragraphObj.get_SmallCaps();
        isAllCaps = paragraphObj.get_AllCaps();
        letterSpacing = (paragraphObj.get_TextSpacing() === null || paragraphObj.get_TextSpacing() === undefined) ? paragraphObj.get_TextSpacing() : Common.Utils.Metric.fnRecalcFromMM(paragraphObj.get_TextSpacing());
    }

    if (!storeTextSettings && Device.phone) {
        $$('.sheet-modal.modal-in').length > 0 && f7.sheet.close();
        return null;
    }

    return (
        <Page>
            <Navbar title={_t.textAdditional} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose='#edit-sheet'>
                            {Device.ios ? 
                                <SvgIcon symbolId={IconExpandDownIos.id} className={'icon icon-svg'} /> :
                                <SvgIcon symbolId={IconExpandDownAndroid.id} className={'icon icon-svg white'} />
                            }
                        </Link>
                    </NavRight>
                }
            </Navbar>
            <BlockTitle>{_t.textStrikethrough}</BlockTitle>
            <List title={_t.textStrikethrough}>
                <ListItem title={_t.textStrikethrough} radio checked={isStrikeout} onClick={() => {props.onAdditionalStrikethrough('strikeout', !isStrikeout)}}/>
                <ListItem title={_t.textDoubleStrikethrough} radio checked={isDStrikeout} onClick={() => {props.onAdditionalStrikethrough('dbStrikethrough', !isDStrikeout)}}/>
            </List>
            <BlockTitle>{_t.textBaseline}</BlockTitle>
            <List>
                <ListItem title={_t.textSuperscript} radio checked={isSuperscript} onClick={() => {props.onAdditionalScript('superscript', !isSuperscript)}}/>
                <ListItem title={_t.textSubscript} radio checked={isSubscript} onClick={() => {props.onAdditionalScript('subscript', !isSubscript)}}/>
            </List>
            <BlockTitle>{_t.textCapitalization}</BlockTitle>
            <List>
                <ListItem title={_t.textSmallCaps} radio checked={isSmallCaps} onClick={() => {props.onAdditionalCaps('small', !isSmallCaps)}}/>
                <ListItem title={_t.textAllCaps} radio checked={isAllCaps} onClick={() => {props.onAdditionalCaps('all', !isAllCaps)}}/>
            </List>
            <List>
                <ListItem title={_t.textLetterSpacing}>
                    {!isAndroid && <div slot='after-start'>{(Number.isInteger(letterSpacing) ? letterSpacing : letterSpacing?.toFixed(2)) + ' ' + Common.Utils.Metric.getCurrentMetricName()}</div>}
                    <div slot='after'>
                        <Segmented>
                            <Button outline className='decrement item-link' onClick={() => {props.changeLetterSpacing(letterSpacing, true)}}>
                                {isAndroid ? 
                                    <SvgIcon symbolId={IconExpandDownAndroid.id} className='icon icon-svg' />
                                : ' - '}
                            </Button>
                            {isAndroid && <label>{(Number.isInteger(letterSpacing) ? letterSpacing : letterSpacing?.toFixed(2)) + ' ' + Common.Utils.Metric.getCurrentMetricName()}</label>}
                            <Button outline className='increment item-link' onClick={() => {props.changeLetterSpacing(letterSpacing, false)}}>
                                {isAndroid ? 
                                    <SvgIcon symbolId={IconExpandUp.id} className='icon icon-svg' />
                                : ' + '}
                            </Button>
                        </Segmented>
                    </div>
                </ListItem>
            </List>
        </Page>
    )
};

const PageCustomFontColor = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const storeTextSettings = props.storeTextSettings;
    const storePalette = props.storePalette;
    let textColor = storeTextSettings.textColor;

    if (typeof textColor === 'object') {
        textColor = textColor.color;
    }

    const autoColor = textColor === 'auto' ? window.getComputedStyle(document.getElementById('font-color-auto')).backgroundColor : null;

    const onAddNewColor = (colors, color) => {
        storePalette.changeCustomColors(colors);
        storeTextSettings.changeTextColor(color);
        props.onTextColor(color);
        props.f7router.back();
    };
    return (
        <Page>
            <Navbar title={_t.textCustomColor} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose>
                            {Device.ios ? 
                                <SvgIcon symbolId={IconExpandDownIos.id} className={'icon icon-svg'} /> :
                                <SvgIcon symbolId={IconExpandDownAndroid.id} className={'icon icon-svg'} />
                            }
                        </Link>
                    </NavRight>
                }
            </Navbar>
            <CustomColorPicker autoColor={autoColor} currentColor={textColor} onAddNewColor={onAddNewColor}/>
        </Page>
    )
};

const EditTextContainer = inject("storeTextSettings", "storeFocusObjects")(observer(EditText));
const PageTextFonts = inject("storeTextSettings", "storeFocusObjects")(observer(PageFonts));
const PageTextFontColor = inject("storeTextSettings", "storePalette")(observer(PageFontColor));
const PageTextCustomFontColor = inject("storeTextSettings", "storePalette")(observer(PageCustomFontColor));
const PageTextAdditionalFormatting = inject("storeTextSettings", "storeFocusObjects")(observer(PageAdditionalFormatting));

export {
    EditTextContainer as EditText,
    PageTextFonts,
    PageTextFontColor,
    PageTextCustomFontColor,
    PageOrientationTextShape,
    PageTextAdditionalFormatting
};