import React, {Fragment, useState, useEffect} from 'react';
import {observer, inject} from "mobx-react";
import {f7, View, List, ListItem, ListButton, ListInput, Icon,  Button, Page, Navbar, Segmented, BlockTitle, NavRight, Link} from 'framework7-react';
import { useTranslation } from 'react-i18next';
import {Device} from '../../../../../common/mobile/utils/device';
import { ThemeColorPalette, CustomColorPicker } from '../../../../../common/mobile/lib/component/ThemeColorPalette.jsx';
import { Swiper, SwiperSlide } from 'swiper/react';
import { LocalStorage } from '../../../../../common/mobile/utils/LocalStorage.mjs';
import HighlightColorPalette from '../../../../../common/mobile/lib/component/HighlightColorPalette.jsx';

const EditText = props => {
    const isAndroid = Device.android;
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const metricText = Common.Utils.Metric.getCurrentMetricName();
    const storeTextSettings = props.storeTextSettings;
    const storeFocusObjects = props.storeFocusObjects;
    const shapeObject = storeFocusObjects.shapeObject;
    const fontName = storeTextSettings.fontName || _t.textFonts;
    const fontSize = storeTextSettings.fontSize;
    const fontColor = storeTextSettings.textColor;
    const highlightColor = storeTextSettings.highlightColor;
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
    let previewList;
    switch(storeTextSettings.listType) {
        case -1: 
            previewList = '';
            break;
        case 0: 
            previewList = t('View.Edit.textBullets');
            break;
        case 1: 
            previewList = t('View.Edit.textNumbers');
            break;
    }

    if(paragraphObj) {
        spaceBefore = paragraphObj.get_Spacing().get_Before() < 0 ? paragraphObj.get_Spacing().get_Before() : Common.Utils.Metric.fnRecalcFromMM(paragraphObj.get_Spacing().get_Before());
        spaceAfter  = paragraphObj.get_Spacing().get_After() < 0 ? paragraphObj.get_Spacing().get_After() : Common.Utils.Metric.fnRecalcFromMM(paragraphObj.get_Spacing().get_After());
    }

    const displayBefore = typeof spaceBefore === 'undefined' || spaceBefore < 0 ? _t.textAuto : parseFloat(spaceBefore.toFixed(2)) + ' ' + metricText;
    const displayAfter = typeof spaceAfter === 'undefined' || spaceAfter < 0 ? _t.textAuto : parseFloat(spaceAfter.toFixed(2)) + ' ' + metricText;

    const fontColorPreview = fontColor !== 'auto' ?
        <span className="color-preview" style={{ background: `#${(typeof fontColor === "object" ? fontColor.color : fontColor)}`}}></span> :
        <span className="color-preview auto"></span>;

    const highlightColorPreview = highlightColor !== 'transparent' ?
        <span className="color-preview" style={{ background: `#${(typeof highlightColor === "object" ? highlightColor.color : highlightColor)}`}}></span> :
        <span className="color-preview"></span>;

    return (
        <Fragment>
            <List>
                <ListItem title={fontName} link="/edit-text-fonts/" after={displaySize} routeProps={{
                    changeFontSize: props.changeFontSize,
                    changeFontFamily: props.changeFontFamily
                }}/>
                <ListItem className='buttons'>
                    <div className="row">
                        <a className={'button' + (isBold ? ' active' : '')} onClick={() => { props.toggleBold(!isBold)}}><b>B</b></a>
                        <a className={'button' + (isItalic ? ' active' : '')} onClick={() => {props.toggleItalic(!isItalic)}}><i>I</i></a>
                        <a className={'button' + (isUnderline ? ' active' : '')} onClick={() => {props.toggleUnderline(!isUnderline)}} style={{textDecoration: "underline"}}>U</a>
                        <a className={'button' + (isStrikethrough ? ' active' : '')} onClick={() => {props.toggleStrikethrough(!isStrikethrough)}} style={{textDecoration: "line-through"}}>S</a>
                    </div>
                </ListItem>
                <ListItem title={_t.textFontColor} link="/edit-text-font-color/" routeProps={{
                    onTextColor: props.onTextColor
                }}>
                    {!isAndroid ?
                        <Icon slot="media" icon="icon-text-color">{fontColorPreview}</Icon> :
                        fontColorPreview
                    }
                </ListItem>
                <ListItem title={t("View.Edit.textHighlightColor")} link="/edit-text-highlight-color/" routeProps={{
                    onHighlightColor: props.onHighlightColor
                }}>
                    {!isAndroid ?
                        <Icon slot="media" icon="icon-text-selection">{highlightColorPreview}</Icon> : highlightColorPreview
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
            {paragraphObj || storeFocusObjects.settings.includes('text') ? (
                <Fragment>
                    <List>
                        <ListItem className='buttons'>
                            <div className="row">
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
                            </div>
                        </ListItem>
                        <ListItem className='buttons'>
                            <div className="row">
                                <a className={'button' + (paragraphValign === 'top' ? ' active' : '')} onClick={() => {props.onParagraphValign('top')}}>
                                    <Icon slot="media" icon="icon-text-valign-top"></Icon>
                                </a>
                                <a className={'button' + (paragraphValign === 'center' ? ' active' : '')} onClick={() => {props.onParagraphValign('center')}}>
                                    <Icon slot="media" icon="icon-text-valign-middle"></Icon>
                                </a>
                                <a className={'button' + (paragraphValign === 'bottom' ? ' active' : '')} onClick={() => {props.onParagraphValign('bottom')}}>
                                    <Icon slot="media" icon="icon-text-valign-bottom"></Icon>
                                </a>
                            </div>
                        </ListItem>
                        <ListItem className='buttons'>
                            <div className="row">
                                <a className={'button item-link' + (!canDecreaseIndent ? ' disabled' : '') } onClick={() => {props.onParagraphMove('left')}}>
                                    <Icon slot="media" icon="icon-de-indent"></Icon>
                                </a>
                                <a className={'button item-link' + (!canIncreaseIndent ? ' disabled' : '') } onClick={() => {props.onParagraphMove('right')}}>
                                    <Icon slot="media" icon="icon-in-indent"></Icon>
                                </a>
                            </div>
                        </ListItem>
                        {shapeObject &&
                            <ListItem title={t('View.Edit.textTextOrientation')} link='/edit-text-shape-orientation/' routeProps={{
                                setOrientationTextShape: props.setOrientationTextShape,
                                shapeObject
                            }}>
                                {!isAndroid && <Icon slot="media" icon="icon-text-orientation-anglecount"></Icon>}
                            </ListItem>
                        }
                        <ListItem title={_t.textBulletsAndNumbers} link='/edit-bullets-and-numbers/' routeProps={{
                            onBullet: props.onBullet,
                            onNumber: props.onNumber,
                            getIconsBulletsAndNumbers: props.getIconsBulletsAndNumbers,
                            onImageSelect: props.onImageSelect,
                            onInsertByUrl: props.onInsertByUrl
                            
                        }}>
                            <div className="preview">{previewList}</div>
                            {!isAndroid && <Icon slot="media" icon="icon-bullets"></Icon>}
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

const PageOrientationTextShape = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const shapeObject = props.shapeObject;
    const [directionTextShape, setDirectionTextShape] = useState(shapeObject.get_Vert());

    return (
        <Page>
            <Navbar title={t('View.Edit.textTextOrientation')} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose='#edit-sheet'>
                            <Icon icon='icon-expand-down'/>
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
                    <Icon slot="media" icon="icon-text-orientation-horizontal"></Icon>
                </ListItem>
                <ListItem title={t('View.Edit.textRotateTextDown')} radio
                    checked={directionTextShape === Asc.c_oAscVertDrawingText.vert}
                    radioIcon="end"
                    onChange={() => {
                        setDirectionTextShape(Asc.c_oAscVertDrawingText.vert);
                        props.setOrientationTextShape(Asc.c_oAscVertDrawingText.vert);
                }}>
                    <Icon slot="media" icon="icon-text-orientation-rotatedown"></Icon>
                </ListItem>
                <ListItem title={t('View.Edit.textRotateTextUp')} radio
                    checked={directionTextShape === Asc.c_oAscVertDrawingText.vert270}
                    radioIcon="end"
                    onChange={() => {
                        setDirectionTextShape(Asc.c_oAscVertDrawingText.vert270);
                        props.setOrientationTextShape(Asc.c_oAscVertDrawingText.vert270);
                }}>
                    <Icon slot="media" icon="icon-text-orientation-rotateup"></Icon>
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
    const displaySize = typeof size === 'undefined' || size == '' ? _t.textAuto : size + ' ' + _t.textPt;
    const curFontName = storeTextSettings.fontName;
    const fonts = storeTextSettings.fontsArray;
    const iconWidth = storeTextSettings.iconWidth;
    const iconHeight = storeTextSettings.iconHeight;
    const thumbs = storeTextSettings.thumbs;
    const thumbIdx = storeTextSettings.thumbIdx;
    const thumbCanvas = storeTextSettings.thumbCanvas;
    const thumbContext = storeTextSettings.thumbContext;
    const spriteCols = storeTextSettings.spriteCols;
    const spriteThumbs = storeTextSettings.spriteThumbs;
    const arrayRecentFonts = storeTextSettings.arrayRecentFonts;

    const addRecentStorage = () => {
        setRecent(getImageUri(arrayRecentFonts));
        LocalStorage.setItem('ppe-settings-recent-fonts', JSON.stringify(arrayRecentFonts));
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

    const paragraph = props.storeFocusObjects.paragraphObject;
    const shapeObj = props.storeFocusObjects.shapeObject;
    if (!shapeObj && !paragraph && Device.phone) {
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
    const shapeObj = props.storeFocusObjects.shapeObject;
    if (!shapeObj && !paragraph && Device.phone) {
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

const PageHighlightColor = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const highlightColor = props.storeTextSettings.highlightColor;

    const changeColor = (color, effectId) => {
        if (color !== 'empty') {
            if (effectId !== undefined ) {
                props.onHighlightColor({color: color, effectId: effectId});
            } else {
                props.onHighlightColor(color);
            }
        }
    };

    return (
        <Page>
            <Navbar title={_t.textHighlightColor} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose='#edit-sheet'>
                            <Icon icon='icon-expand-down'/>
                        </Link>
                    </NavRight>
                }
            </Navbar>
            <HighlightColorPalette changeColor={changeColor} curColor={highlightColor} />
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
    const shapeObj = storeFocusObjects.shapeObject;
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

    if (!shapeObj && !paragraphObj && Device.phone) {
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

const PageBulletLinkSettings = (props) => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const [stateValue, setValue] = useState('');

    return (
        <Page>
            <Navbar title={_t.textLinkSettings} backLink={_t.textBack}></Navbar>
            <BlockTitle>{_t.textAddress}</BlockTitle>
            <List className='add-image'>
                <ListInput
                    type='text'
                    placeholder={_t.textImageURL}
                    value={stateValue}
                    onChange={(event) => {setValue(event.target.value)}}
                >
                </ListInput>
            </List>
            <List className="buttons-list">
                <ListButton 
                    className={'button-fill button-raised' + (stateValue.length < 1 ? ' disabled' : '')}
                    onClick={() => {props.onInsertByUrl(stateValue)}}
                >
                    {_t.textInsertImage}
                </ListButton>
            </List>
        </Page>
    )
}

const PageAddImage = (props) => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});

    return (
        <List className='bullet-menu-image'>
            <ListItem title={_t.textPictureFromLibrary} onClick={props.onImageSelect}>
                <Icon slot="media" icon="icon-image-library" />
            </ListItem>
            <ListItem title={_t.textPictureFromURL} link="#" onClick={() =>  
                props.f7router.navigate('/edit-bullets-and-numbers/image-link/',
                {props: {onInsertByUrl: props.onInsertByUrl}}) }>
                <Icon slot="media" icon="icon-link" />
            </ListItem>
        </List>
    )
}

const PageBullets = observer(props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});

    const storeTextSettings = props.storeTextSettings;
    const typeBullets = storeTextSettings.typeBullets;
    const bulletArrays = [
        {id: 'id-markers-0', type: 0, subtype: -1, numberingInfo: 'undefined'},
        {id: 'id-markers-1', type: 0, subtype: 1, numberingInfo: '{"bulletTypeface":{"type":"bufont","typeface":"Symbol"},"bulletType":{"type":"char","char":"·","startAt":null}}' },
        {id: 'id-markers-2', type: 0, subtype: 2, numberingInfo: '{"bulletTypeface":{"type":"bufont","typeface":"Courier New"},"bulletType":{"type":"char","char":"o","startAt":null}}'},
        {id: 'id-markers-3', type: 0, subtype: 3, numberingInfo: '{"bulletTypeface":{"type":"bufont","typeface":"Wingdings"},"bulletType":{"type":"char","char":"§","startAt":null}}' },
        {id: 'id-markers-4', type: 0, subtype: 4, numberingInfo: '{"bulletTypeface":{"type":"bufont","typeface":"Wingdings"},"bulletType":{"type":"char","char":"v","startAt":null}}' },
        {id: 'id-markers-5', type: 0, subtype: 5, numberingInfo: '{"bulletTypeface":{"type":"bufont","typeface":"Wingdings"},"bulletType":{"type":"char","char":"Ø","startAt":null}}' },
        {id: 'id-markers-6', type: 0, subtype: 6, numberingInfo: '{"bulletTypeface":{"type":"bufont","typeface":"Wingdings"},"bulletType":{"type":"char","char":"ü","startAt":null}}' },
        {id: 'id-markers-7', type: 0, subtype: 7, numberingInfo: '{"bulletTypeface":{"type":"bufont","typeface":"Symbol"},"bulletType":{"type":"char","char":"¨","startAt":null}}' }
    ];

    useEffect(() => {
        props.getIconsBulletsAndNumbers(bulletArrays, 0);
    }, []);

    const paragraph = props.storeFocusObjects.paragraphObject;
    const shapeObj = props.storeFocusObjects.shapeObject;
    if (!shapeObj && !paragraph && Device.phone) {
        $$('.sheet-modal.modal-in').length > 0 && f7.sheet.close();
        return null;
    }

    return(
        <View className='bullets dataview'>
            <List className="row" style={{listStyle: 'none'}}>
                {bulletArrays.map( bullet => (
                    <ListItem key={'bullet-' + bullet.subtype} data-type={bullet.subtype} className={(bullet.subtype === typeBullets) && 
                        (storeTextSettings.listType === 0 || storeTextSettings.listType === -1) ? 'active' : ''}
                        onClick={() => {
                            storeTextSettings.resetBullets(bullet.subtype);
                            props.onBullet(bullet.subtype);
                        }}>
                        <div id={bullet.id} className='item-marker'>
                        
                        </div>
                    </ListItem>
                ))}
            </List>
            { !Device.isPhone && 
                <PageAddImage
                    f7router={props.f7router} 
                    onImageSelect={props.onImageSelect}
                    onInsertByUrl={props.onInsertByUrl} 
                />
            }
        </View>
    )
});

const PageNumbers = observer(props => {
    const storeTextSettings = props.storeTextSettings;
    const typeNumbers = storeTextSettings.typeNumbers;
    const numberArrays = [
            {id: 'id-numbers-0', type: 1, subtype: -1, numberingInfo: 'undefined'},
            {id: 'id-numbers-4', type: 1, subtype: 4, numberingInfo: '{"bulletTypeface":{"type":"bufont","typeface":"Arial"},"bulletType":{"type":"autonum","char":null,"autoNumType":"alphaUcPeriod","startAt":null}}'},
            {id: 'id-numbers-5', type: 1, subtype: 5, numberingInfo: '{"bulletTypeface":{"type":"bufont","typeface":"Arial"},"bulletType":{"type":"autonum","char":null,"autoNumType":"alphaLcParenR","startAt":null}}'},
            {id: 'id-numbers-6', type: 1, subtype: 6, numberingInfo: '{"bulletTypeface":{"type":"bufont","typeface":"Arial"},"bulletType":{"type":"autonum","char":null,"autoNumType":"alphaLcPeriod","startAt":null}}'},
            {id: 'id-numbers-1', type: 1, subtype: 1, numberingInfo: '{"bulletTypeface":{"type":"bufont","typeface":"Arial"},"bulletType":{"type":"autonum","char":null,"autoNumType":"arabicPeriod","startAt":null}}'},
            {id: 'id-numbers-2', type: 1, subtype: 2, numberingInfo: '{"bulletTypeface":{"type":"bufont","typeface":"Arial"},"bulletType":{"type":"autonum","char":null,"autoNumType":"arabicParenR","startAt":null}}'},
            {id: 'id-numbers-3', type: 1, subtype: 3, numberingInfo: '{"bulletTypeface":{"type":"bufont","typeface":"Arial"},"bulletType":{"type":"autonum","char":null,"autoNumType":"romanUcPeriod","startAt":null}}'},
            {id: 'id-numbers-7', type: 1, subtype: 7, numberingInfo: '{"bulletTypeface":{"type":"bufont","typeface":"Arial"},"bulletType":{"type":"autonum","char":null,"autoNumType":"romanLcPeriod","startAt":null}}'}
    ];

    useEffect(() => {
        props.getIconsBulletsAndNumbers(numberArrays, 1);
    }, []);

    const paragraph = props.storeFocusObjects.paragraphObject;
    const shapeObj = props.storeFocusObjects.shapeObject;
    if (!shapeObj && !paragraph && Device.phone) {
        $$('.sheet-modal.modal-in').length > 0 && f7.sheet.close();
        return null;
    }

    return (
        <View className='numbers dataview'>
            <List className="row" style={{listStyle: 'none'}}>
                {numberArrays.map( number => (
                    <ListItem key={'number-' + number.subtype} data-type={number.subtype} className={(number.subtype === typeNumbers) &&
                        (storeTextSettings.listType === 1 || storeTextSettings.listType === -1) ? 'active' : ''}
                        onClick={() => {
                            storeTextSettings.resetNumbers(number.subtype);
                            props.onNumber(number.subtype);
                        }}>
                        <div id={number.id} className='item-number'></div>
                    </ListItem>
                ))}
            </List>
        </View>
    );
});

const PageBulletsAndNumbers = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const storeTextSettings = props.storeTextSettings;
    const storeFocusObjects = props.storeFocusObjects;
    
    return (
        <Page>
            <Navbar title={_t.textBulletsAndNumbers} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose='#edit-sheet'>
                            <Icon icon='icon-expand-down'/>
                        </Link>
                    </NavRight>
                }
            </Navbar>
            <Swiper pagination>
                <SwiperSlide> 
                    <PageNumbers 
                        f7router={props.f7router} 
                        storeFocusObjects={storeFocusObjects} 
                        storeTextSettings={storeTextSettings} 
                        onNumber={props.onNumber}
                        getIconsBulletsAndNumbers={props.getIconsBulletsAndNumbers}
                    />
                </SwiperSlide> 
                <SwiperSlide> 
                    <PageBullets 
                        f7router={props.f7router} 
                        storeFocusObjects={storeFocusObjects} 
                        storeTextSettings={storeTextSettings} 
                        onBullet={props.onBullet}
                        getIconsBulletsAndNumbers={props.getIconsBulletsAndNumbers}
                        onImageSelect={props.onImageSelect}
                        onInsertByUrl={props.onInsertByUrl}
                    />
                </SwiperSlide>
                { Device.phone &&
                    <SwiperSlide> 
                        <PageAddImage
                            f7router={props.f7router}
                            onImageSelect={props.onImageSelect}
                            onInsertByUrl={props.onInsertByUrl}
                        />
                    </SwiperSlide>
                }
            </Swiper>
        </Page>
    )
}

const PageLineSpacing = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const storeTextSettings = props.storeTextSettings;
    const lineSpacing = storeTextSettings.lineSpacing;

    const paragraph = props.storeFocusObjects.paragraphObject;
    const shapeObj = props.storeFocusObjects.shapeObject;
    if (!shapeObj && !paragraph && Device.phone) {
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
const PageTextHighlightColor = inject("storeTextSettings")(observer(PageHighlightColor));
const PageTextCustomFontColor = inject("storeTextSettings", "storePalette")(observer(PageCustomFontColor));
const PageTextAddFormatting = inject("storeTextSettings", "storeFocusObjects")(observer(PageAdditionalFormatting));
const PageTextBulletsAndNumbers = inject("storeTextSettings", "storeFocusObjects")(observer(PageBulletsAndNumbers));
const PageTextLineSpacing = inject("storeTextSettings", "storeFocusObjects")(observer(PageLineSpacing));
const PageTextBulletsLinkSettings = inject("storeTextSettings", "storeFocusObjects")(observer(PageBulletLinkSettings));

export {
    EditTextContainer as EditText,
    PageTextFonts,
    PageTextFontColor,
    PageTextHighlightColor,
    PageTextCustomFontColor,
    PageTextAddFormatting,
    PageTextBulletsAndNumbers,
    PageTextLineSpacing,
    PageTextBulletsLinkSettings,
    PageOrientationTextShape
};