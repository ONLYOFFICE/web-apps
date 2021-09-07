import React, {Fragment, useState, useEffect} from 'react';
import {observer, inject} from "mobx-react";
import {f7, List, ListItem, Icon, Row, Button, Page, Navbar, NavRight, Segmented, BlockTitle, Link} from 'framework7-react';
import { useTranslation } from 'react-i18next';
import {Device} from '../../../../../common/mobile/utils/device';
import { ThemeColorPalette, CustomColorPicker } from '../../../../../common/mobile/lib/component/ThemeColorPalette.jsx';
import { LocalStorage } from '../../../../../common/mobile/utils/LocalStorage';

const EditText = props => {
    const isAndroid = Device.android;
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const storeTextSettings = props.storeTextSettings;
    const textIn = storeTextSettings.textIn;

    const fontName = storeTextSettings.fontName || _t.textFonts;
    const fontSize = storeTextSettings.fontSize;
    const fontColor = storeTextSettings.textColor;

    const displaySize = typeof fontSize === 'undefined' ? _t.textAuto : fontSize + ' ' + _t.textPt;
    const isBold = storeTextSettings.isBold;
    const isItalic = storeTextSettings.isItalic;
    const isUnderline = storeTextSettings.isUnderline;
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
                    <Row>
                        <a className={'button' + (isBold ? ' active' : '')} onClick={() => {props.toggleBold(!isBold)}}><b>B</b></a>
                        <a className={'button' + (isItalic ? ' active' : '')} onClick={() => {props.toggleItalic(!isItalic)}}><i>I</i></a>
                        <a className={'button' + (isUnderline ? ' active' : '')} onClick={() => {props.toggleUnderline(!isUnderline)}} style={{textDecoration: "underline"}}>U</a>
                    </Row>
                </ListItem>
                <ListItem title={_t.textTextColor} link="/edit-text-font-color/" routeProps={{
                    onTextColor: props.onTextColor
                }}>
                    {!isAndroid ?
                        <Icon slot="media" icon="icon-text-color">{fontColorPreview}</Icon> :
                        fontColorPreview
                    }
                </ListItem>
            </List>
            {textIn === 2 ? (
                <Fragment>
                    <List>
                        <ListItem className='buttons'>
                            <Row>
                                <a className={'button' + (paragraphAlign === AscCommon.align_Left ? ' active' : '')} onClick={() => {props.onParagraphAlign('left')}}>
                                    <Icon slot="media" icon="icon-text-align-left"></Icon>
                                </a>
                                <a className={'button' + (paragraphAlign === AscCommon.align_Center ? ' active' : '')} onClick={() => {props.onParagraphAlign('center')}}>
                                    <Icon slot="media" icon="icon-text-align-center"></Icon>
                                </a>
                                <a className={'button' + (paragraphAlign === AscCommon.align_Right ? ' active' : '')} onClick={() => {props.onParagraphAlign('right')}}>
                                    <Icon slot="media" icon="icon-text-align-right"></Icon>
                                </a>
                                <a className={'button' + (paragraphAlign === AscCommon.align_Justify ? ' active' : '')} onClick={() => {props.onParagraphAlign('justify')}}>
                                    <Icon slot="media" icon="icon-text-align-jast"></Icon>
                                </a>
                            </Row>
                        </ListItem>
                        <ListItem className='buttons'>
                            <Row>
                                <a className={'button' + (paragraphValign === Asc.c_oAscVAlign.Top ? ' active' : '')} onClick={() => {props.onParagraphValign('top')}}>
                                    <Icon slot="media" icon="icon-text-valign-top"></Icon>
                                </a>
                                <a className={'button' + (paragraphValign === Asc.c_oAscVAlign.Center ? ' active' : '')} onClick={() => {props.onParagraphValign('center')}}>
                                    <Icon slot="media" icon="icon-text-valign-middle"></Icon>
                                </a>
                                <a className={'button' + (paragraphValign === Asc.c_oAscVAlign.Bottom ? ' active' : '')} onClick={() => {props.onParagraphValign('bottom')}}>
                                    <Icon slot="media" icon="icon-text-valign-bottom"></Icon>
                                </a>
                            </Row>
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
    const displaySize = typeof size === 'undefined' ? _t.textAuto : size + ' ' + _t.textPt;
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

    useEffect(() => {
        setRecent(getImageUri(arrayRecentFonts));

        return () => {
        }
    }, []);

    const addRecentStorage = () => {
        let arr = [];
        arrayRecentFonts.forEach(item => arr.push(item));
        setRecent(getImageUri(arrayRecentFonts));
        LocalStorage.setItem('sse-settings-recent-fonts', JSON.stringify(arr));
    }

    const [stateRecent, setRecent] = useState([]);
    const [vlFonts, setVlFonts] = useState({
        vlData: {
            items: [],
        }
    });

    const getImageUri = fonts => {
        return fonts.map(font => {
            thumbContext.clearRect(0, 0, thumbs[thumbIdx].width, thumbs[thumbIdx].height);
            thumbContext.drawImage(spriteThumbs, 0, -thumbs[thumbIdx].height * Math.floor(font.imgidx / spriteCols));

            return thumbCanvas.toDataURL();
        });
    };

    const renderExternal = (vl, vlData) => {
        setVlFonts((prevState) => {
            let fonts = [...prevState.vlData.items];
            fonts.splice(vlData.fromIndex, vlData.toIndex, ...vlData.items);

            let images = getImageUri(fonts);

            return {vlData: {
                items: fonts,
                images,
            }};
        });
    };

    return (
        <Page>
            <Navbar title={_t.textFonts} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link icon='icon-expand-down' sheetClose></Link>
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
                    {vlFonts.vlData.items.map((item, index) => (
                        <ListItem className="font-item" key={index} radio checked={curFontName === item.name} onClick={() => {
                            props.changeFontFamily(item.name);
                            storeTextSettings.addFontToRecent(item);
                            addRecentStorage();
                        }}>
                            <img src={vlFonts.vlData.images[index]} style={{width: `${iconWidth}px`, height: `${iconHeight}px`}} />
                        </ListItem>
                    ))}
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
                        <Link icon='icon-expand-down' sheetClose></Link>
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
                        <Link icon='icon-expand-down' sheetClose></Link>
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

export {
    EditTextContainer as EditText,
    PageTextFonts,
    PageTextFontColor,
    PageTextCustomFontColor
};