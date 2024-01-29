import React, {Fragment, useState, useEffect} from 'react';
import {observer, inject} from "mobx-react";
import {f7, List, ListItem, Icon, Button, Page, Navbar, Segmented, BlockTitle, NavRight, Link, Toggle, ListInput, Block} from 'framework7-react';
import { useTranslation } from 'react-i18next';
import {Device} from '../../../../../common/mobile/utils/device';
import { ThemeColorPalette, CustomColorPicker } from '../../../../../common/mobile/lib/component/ThemeColorPalette.jsx';
import { LocalStorage } from '../../../../../common/mobile/utils/LocalStorage.mjs';
import { Swiper, SwiperSlide } from 'swiper/react';

const EditCell = props => {
    const isAndroid = Device.android;
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const storeCellSettings = props.storeCellSettings;
    const storeWorksheets = props.storeWorksheets;
    const wsProps = storeWorksheets.wsProps;
    const cellStyles = storeCellSettings.cellStyles;
    const curStyleName = storeCellSettings.styleName;
    const curStyle = cellStyles.find(style => style.name === curStyleName);

    const fontInfo = storeCellSettings.fontInfo;
    const fontName = fontInfo.name || _t.textFonts;
    const fontSize = fontInfo.size;
    const fontColor = storeCellSettings.fontColor;
    const displaySize = typeof fontSize === 'undefined' ? _t.textAuto : fontSize + ' ' + _t.textPt;
    const fillColor = storeCellSettings.fillColor;

    const isBold = storeCellSettings.isBold;
    const isItalic = storeCellSettings.isItalic;
    const isUnderline = storeCellSettings.isUnderline;

    const fontColorPreview = fontColor !== 'auto' ?
        <span className="color-preview" style={{ background: `#${(typeof fontColor === "object" ? fontColor.color : fontColor)}`}}></span> :
        <span className="color-preview auto"></span>;
    
    const fillColorPreview = fillColor !== 'transparent' ?
        <span className="color-preview" style={{ background: `#${(typeof fillColor === "object" ? fillColor.color : fillColor)}`}}></span> :
        <span className="color-preview"></span>;

    return (
        <Fragment>
            <List>
                <ListItem title={fontName} link="/edit-cell-text-fonts/" after={displaySize} routeProps={{
                    onFontSize: props.onFontSize,
                    onFontClick: props.onFontClick
                }}/>
            </List>
                {!wsProps.FormatCells && 
                <>
                    <List>
                        <ListItem className='buttons'>
                            <div className="row">
                                <a className={'button' + (isBold ? ' active' : '')} onClick={() => {props.toggleBold(!isBold)}}><b>B</b></a>
                                <a className={'button' + (isItalic ? ' active' : '')} onClick={() => {props.toggleItalic(!isItalic)}}><i>I</i></a>
                                <a className={'button' + (isUnderline ? ' active' : '')} onClick={() => {props.toggleUnderline(!isUnderline)}} style={{textDecoration: "underline"}}>U</a>
                            </div>
                        </ListItem>
                        <ListItem title={_t.textTextColor} link="/edit-cell-text-color/" routeProps={{
                            onTextColor: props.onTextColor,
                            onTextColorAuto: props.onTextColorAuto,
                        }}>
                            {!isAndroid ?
                                <Icon slot="media" icon="icon-text-color">{fontColorPreview}</Icon> :
                                fontColorPreview
                            }
                        </ListItem>
                        <ListItem title={_t.textFillColor} link="/edit-cell-fill-color/" routeProps={{
                            onFillColor: props.onFillColor
                        }}>
                            {!isAndroid ?
                                <Icon slot="media" icon="icon-fill-color">{fillColorPreview}</Icon> :
                                fillColorPreview
                            }
                        </ListItem>
                        <ListItem title={_t.textTextFormat} link="/edit-cell-text-format/" routeProps={{
                            onHAlignChange: props.onHAlignChange,
                            onVAlignChange: props.onVAlignChange,
                            onWrapTextChange: props.onWrapTextChange,
                            onTextOrientationChange: props.onTextOrientationChange
                        }}>
                            {!isAndroid ?
                                <Icon slot="media" icon="icon-text-align-left"></Icon> : null
                            }
                        </ListItem>
                        {/* <ListItem title={_t.textTextOrientation} link="/edit-cell-text-orientation/" routeProps={{
                            onTextOrientationChange: props.onTextOrientationChange
                        }}>
                            {!isAndroid ?
                                <Icon slot="media" icon="icon-text-orientation-horizontal"></Icon> : null
                            }
                        </ListItem> */}
                        <ListItem title={_t.textBorderStyle} link="/edit-cell-border-style/" routeProps={{
                            onBorderStyle: props.onBorderStyle
                        }}>
                            {!isAndroid ?
                                <Icon slot="media" icon="icon-table-borders-all"></Icon> : null
                            }
                        </ListItem>
                    </List>
                    <List>
                        <ListItem title={_t.textFormat} link="/edit-format-cell/" routeProps={{
                            onCellFormat: props.onCellFormat,
                            onCurrencyCellFormat: props.onCurrencyCellFormat,
                            onAccountingCellFormat: props.onAccountingCellFormat,
                            dateFormats: props.dateFormats,
                            timeFormats: props.timeFormats,
                            setCustomFormat: props.setCustomFormat,
                            onCellFormat: props.onCellFormat
                        }}>
                            {!isAndroid ?
                                <Icon slot="media" icon="icon-format-general"></Icon> : null
                            }
                        </ListItem>
                    </List>
                    <List>
                        <ListItem title={t('View.Edit.textCellStyle')} link="/edit-cell-style/" routeProps={{
                            onStyleClick: props.onStyleClick
                        }}>
                            {!isAndroid && <Icon slot="media" icon="icon-cell-style" />}
                            <div slot="after">
                                <div className='preview-cell-style' style={{backgroundImage: `url(${curStyle ? curStyle.image : null})`}}></div>
                            </div>
                        </ListItem>
                    </List>
                </>}    
        </Fragment>
    )
};

const PageCellStyle = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const storeCellSettings = props.storeCellSettings;
    const styleName = storeCellSettings.styleName;
    const cellStyles = storeCellSettings.cellStyles;
    const countStylesSlide = Device.phone ? 6 : 15;
    const countSlides = Math.floor(cellStyles.length / countStylesSlide);
    const arraySlides = Array(countSlides).fill(countSlides);

    return (
        <Page>
            <Navbar title={t('View.Edit.textCellStyle')} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link icon='icon-expand-down' sheetClose></Link>
                    </NavRight>
                }
            </Navbar>
            {cellStyles && cellStyles.length ? (
                <Swiper pagination={true}>
                    {arraySlides.map((_, indexSlide) => {
                        let stylesSlide = cellStyles.slice(indexSlide * countStylesSlide, (indexSlide * countStylesSlide) + countStylesSlide);
                        
                        return (
                            <SwiperSlide key={indexSlide}>
                                <List className="cell-styles-list">
                                    {stylesSlide.map((elem, index) => (
                                        <ListItem key={index} className={elem.name === styleName ? "item-theme active" : "item-theme"} onClick={() => props.onStyleClick(elem.name)}>
                                            <div className='thumb' style={{backgroundImage: `url(${elem.image})`}}></div>
                                        </ListItem> 
                                    ))}
                                </List>
                            </SwiperSlide>
                        )
                    })}
                </Swiper>
            ) : null}
        </Page>
    )
}

const PageFontsCell = props => {
    const isAndroid = Device.android;
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const storeTextSettings = props.storeTextSettings;
    const storeCellSettings = props.storeCellSettings;
    const fontInfo = storeCellSettings.fontInfo;
    const size = fontInfo.size;
    const displaySize = typeof size === 'undefined' ? _t.textAuto : size + ' ' + _t.textPt;
    const curFontName = fontInfo.name;
    const fonts = storeCellSettings.fontsArray;
    const arrayRecentFonts = storeTextSettings.arrayRecentFonts;
    const iconWidth = storeTextSettings.iconWidth;
    const iconHeight = storeTextSettings.iconHeight;
    const thumbs = storeTextSettings.thumbs;
    const thumbIdx = storeTextSettings.thumbIdx;
    const thumbCanvas = storeTextSettings.thumbCanvas;
    const thumbContext = storeTextSettings.thumbContext;
    const spriteCols = storeTextSettings.spriteCols;
    const spriteThumbs = storeTextSettings.spriteThumbs;

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

    const storeFocusObjects = props.storeFocusObjects;
    if ((storeFocusObjects.focusOn !== 'cell') && Device.phone) {
        $$('.sheet-modal.modal-in').length > 0 && f7.sheet.close();
        return null;
    }

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
                            <Button outline className='decrement item-link' onClick={() => {props.onFontSize(size, true)}}>
                                {isAndroid ? <Icon icon="icon-expand-down"></Icon> : ' - '}
                            </Button>
                            {isAndroid && <label>{displaySize}</label>}
                            <Button outline className='increment item-link' onClick={() => {props.onFontSize(size, false)}}>
                                {isAndroid ? <Icon icon="icon-expand-up"></Icon> : ' + '}
                            </Button>
                        </Segmented>
                    </div>
                </ListItem>
            </List>
            <BlockTitle>{_t.textFonts}</BlockTitle>
            {!!arrayRecentFonts.length &&
                <List>
                    {arrayRecentFonts.map((item,index) => (
                        <ListItem className="font-item" key={index} radio checked={curFontName === item.name} onClick={() => {
                            props.onFontClick(item.name);
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
                                props.onFontClick(fontName);
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

const PageTextColorCell = props => {
    const { t } = useTranslation();
    const _t = t("View.Edit", { returnObjects: true });
    const storePalette = props.storePalette;
    const storeCellSettings = props.storeCellSettings;
    const customColors = storePalette.customColors;
    const fontColor = storeCellSettings.fontColor;
    
    const changeColor = (color, effectId, effectValue) => {
        if (color !== 'empty') {
            if (effectId !== undefined ) {
                const newColor = {color: color, effectId: effectId, effectValue: effectValue};
                storeCellSettings.changeFontColor(newColor);
                props.onTextColor(newColor);
            } else {
                storeCellSettings.changeFontColor(color);
                props.onTextColor(color);
            }
        } else {
            // open custom color menu
            props.f7router.navigate('/edit-cell-text-custom-color/', {props: {onTextColor: props.onTextColor}});
        }
    };

    const storeFocusObjects = props.storeFocusObjects;
    if ((storeFocusObjects.focusOn !== 'cell') && Device.phone) {
        $$('.sheet-modal.modal-in').length > 0 && f7.sheet.close();
        return null;
    }
  
    return (
        <Page>
            <Navbar title={t('View.Edit.textTextColor')} backLink={t('View.Edit.textBack')}>
                {Device.phone &&
                    <NavRight>
                        <Link icon='icon-expand-down' sheetClose></Link>
                    </NavRight>
                }
            </Navbar>
            <List>
                <ListItem  className={'item-color-auto' + (fontColor === 'auto' ? ' active' : '')} title={t('View.Edit.textAutomatic')} onClick={() => {
                   props.onTextColorAuto();
                }}>
                    <div slot="media">
                        <div id='font-color-auto' className={'color-auto'}></div>
                    </div>
                </ListItem>
            </List>
            <ThemeColorPalette changeColor={changeColor} curColor={fontColor} customColors={customColors} />
            <List>
                <ListItem title={t('View.Edit.textAddCustomColor')} link={'/edit-cell-text-custom-color/'} routeProps={{
                    onTextColor: props.onTextColor
                }}></ListItem>
            </List>
        </Page>
    );
};

const PageFillColorCell = props => {
    const { t } = useTranslation();
    const _t = t("View.Edit", { returnObjects: true });
    const storePalette = props.storePalette;
    const storeCellSettings = props.storeCellSettings;
    const customColors = storePalette.customColors;
    const fillColor = storeCellSettings.fillColor;

    const changeColor = (color, effectId, effectValue) => {
        if (color !== 'empty') {
            if (effectId !== undefined ) {
                const newColor = {color: color, effectId: effectId, effectValue: effectValue};
                storeCellSettings.changeFillColor(newColor);
                props.onFillColor(newColor);
            } else {
                storeCellSettings.changeFillColor(color);
                props.onFillColor(color);
            }
        } else {
            // open custom color menu
            props.f7router.navigate('/edit-cell-fill-custom-color/', {props: {onFillColor: props.onFillColor}});
        }
    };

    const storeFocusObjects = props.storeFocusObjects;
    if ((storeFocusObjects.focusOn !== 'cell') && Device.phone) {
        $$('.sheet-modal.modal-in').length > 0 && f7.sheet.close();
        return null;
    }
  
    return (
        <Page>
            <Navbar title={_t.textFillColor} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link icon='icon-expand-down' sheetClose></Link>
                    </NavRight>
                }
            </Navbar>
            <ThemeColorPalette changeColor={changeColor} curColor={fillColor} customColors={customColors} transparent={true} />
            <List>
                <ListItem title={_t.textAddCustomColor} link={'/edit-cell-fill-custom-color/'} routeProps={{
                    onFillColor: props.onFillColor
                }}></ListItem>
            </List>
        </Page>
    );
};

const PageCustomTextColorCell = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});

    let fontColor = props.storeCellSettings.fontColor;

    if (typeof fontColor === 'object') {
        fontColor = fontColor.color;
    }

    const autoColor = fontColor === 'auto' ? window.getComputedStyle(document.getElementById('font-color-auto')).backgroundColor : null;
    const onAddNewColor = (colors, color) => {
        props.storePalette.changeCustomColors(colors);
        props.onTextColor(color);
        props.storeCellSettings.changeFontColor(color);
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
            <CustomColorPicker autoColor={autoColor} currentColor={fontColor} onAddNewColor={onAddNewColor} />
        </Page>
    )
};

const PageCustomFillColorCell = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});

    let fillColor = props.storeCellSettings.fillColor;

    if (typeof fillColor === 'object') {
        fillColor = fillColor.color;
    }

    const onAddNewColor = (colors, color) => {
        props.storePalette.changeCustomColors(colors);
        props.onFillColor(color);
        props.storeCellSettings.changeFillColor(color);
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
            <CustomColorPicker currentColor={fillColor} onAddNewColor={onAddNewColor} />
        </Page>
    )
};

const PageTextFormatCell = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const isAndroid = Device.android;
    const storeCellSettings = props.storeCellSettings;
    const hAlignStr = storeCellSettings.hAlignStr;
    const vAlignStr = storeCellSettings.vAlignStr;
    const isWrapText = storeCellSettings.isWrapText;

    const storeFocusObjects = props.storeFocusObjects;
    if ((storeFocusObjects.focusOn !== 'cell') && Device.phone) {
        $$('.sheet-modal.modal-in').length > 0 && f7.sheet.close();
        return null;
    }

    return (
        <Page>
            <Navbar title={_t.textTextFormat} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link icon='icon-expand-down' sheetClose></Link>
                    </NavRight>
                }
            </Navbar>
            <List>
                <ListItem className='buttons'>
                    <div className="row">
                        <a className={'button' + (hAlignStr === 'left' ? ' active' : '')} onClick={() => {props.onHAlignChange('left')}}>
                            <Icon slot="media" icon="icon-text-align-left"></Icon>
                        </a>
                        <a className={'button' + (hAlignStr === 'center' ? ' active' : '')} onClick={() => {props.onHAlignChange('center')}}>
                            <Icon slot="media" icon="icon-text-align-center"></Icon>
                        </a>
                        <a className={'button' + (hAlignStr === 'right' ? ' active' : '')} onClick={() => {props.onHAlignChange('right')}}>
                            <Icon slot="media" icon="icon-text-align-right"></Icon>
                        </a>
                        <a className={'button' + (hAlignStr === 'justify' ? ' active' : '')} onClick={() => {props.onHAlignChange('justify')}}>
                            <Icon slot="media" icon="icon-text-align-just"></Icon>
                        </a>
                    </div>
                </ListItem>
                <ListItem className='buttons'>
                    <div className="row">
                        <a className={'button' + (vAlignStr === 'top' ? ' active' : '')} onClick={() => {props.onVAlignChange('top')}}>
                            <Icon slot="media" icon="icon-text-valign-top"></Icon>
                        </a>
                        <a className={'button' + (vAlignStr === 'center' ? ' active' : '')} onClick={() => {props.onVAlignChange('center')}}>
                            <Icon slot="media" icon="icon-text-valign-middle"></Icon>
                        </a>
                        <a className={'button' + (vAlignStr === 'bottom' ? ' active' : '')} onClick={() => {props.onVAlignChange('bottom')}}>
                            <Icon slot="media" icon="icon-text-valign-bottom"></Icon>
                        </a>
                    </div>
                </ListItem>
                <ListItem title={_t.textTextOrientation} link="/edit-cell-text-orientation/" routeProps={{
                    onTextOrientationChange: props.onTextOrientationChange
                }}>
                    {!isAndroid ?
                        <Icon slot="media" icon="icon-text-orientation-horizontal"></Icon> : null
                    }
                </ListItem>
                <ListItem title={_t.textWrapText}>
                    {!isAndroid ? <Icon slot="media" icon="icon-cell-wrap"></Icon> : null}
                    <Toggle checked={isWrapText} onToggleChange={() => {props.onWrapTextChange(!isWrapText)}} />
                </ListItem>
            </List>
            {/* <List>
                <ListItem title={_t.textWrapText}>
                    {!isAndroid ? <Icon slot="media" icon="icon-cell-wrap"></Icon> : null}
                    <Toggle checked={isWrapText} onToggleChange={() => {props.onWrapTextChange(!isWrapText)}} />
                </ListItem>
            </List> */}
        </Page>
    )
};

const PageTextOrientationCell = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const isAndroid = Device.android;
    const storeCellSettings = props.storeCellSettings;
    const orientationStr = storeCellSettings.orientationStr;

    const storeFocusObjects = props.storeFocusObjects;
    if ((storeFocusObjects.focusOn !== 'cell') && Device.phone) {
        $$('.sheet-modal.modal-in').length > 0 && f7.sheet.close();
        return null;
    }
   
    return (
        <Page>
            <Navbar title={_t.textTextOrientation} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link icon='icon-expand-down' sheetClose></Link>
                    </NavRight>
                }
            </Navbar>
            <List>
                <ListItem title={_t.textHorizontalText} radio checked={orientationStr === 'horizontal'}
                    radioIcon="end"
                    onChange={() => {
                        props.onTextOrientationChange('horizontal');
                    }
                }>
                    <Icon slot="media" icon="icon-text-orientation-horizontal"></Icon>
                </ListItem>
                <ListItem title={_t.textAngleCounterclockwise} radio checked={orientationStr === 'anglecount'}
                    radioIcon="end"
                    onChange={() => {
                        props.onTextOrientationChange('anglecount');
                    }
                }>
                    <Icon slot="media" icon="icon-text-orientation-anglecount"></Icon>
                </ListItem>
                <ListItem title={_t.textAngleClockwise} radio checked={orientationStr === 'angleclock'}
                    radioIcon="end"
                    onChange={() => {
                        props.onTextOrientationChange('angleclock');
                    }
                }>
                    <Icon slot="media" icon="icon-text-orientation-angleclock"></Icon>
                </ListItem>
                <ListItem title={_t.textVerticalText} radio checked={orientationStr === 'vertical'}
                    radioIcon="end"
                    onChange={() => {
                        props.onTextOrientationChange('vertical');
                    }
                }>
                    <Icon slot="media" icon="icon-text-orientation-vertical"></Icon>
                </ListItem>
                <ListItem title={_t.textRotateTextUp} radio checked={orientationStr === 'rotateup'}
                    radioIcon="end"
                    onChange={() => {
                        props.onTextOrientationChange('rotateup');
                    }
                }>
                    <Icon slot="media" icon="icon-text-orientation-rotateup"></Icon>
                </ListItem>
                <ListItem title={_t.textRotateTextDown} radio checked={orientationStr === 'rotatedown'}
                    radioIcon="end"
                    onChange={() => {
                        props.onTextOrientationChange('rotatedown');
                    }
                }>
                    <Icon slot="media" icon="icon-text-orientation-rotatedown"></Icon>
                </ListItem>
            </List>
        </Page>
    )
};

const PageBorderStyleCell = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const storeCellSettings = props.storeCellSettings;
    const borderInfo = storeCellSettings.borderInfo;

    const borderSizes = {
        7: `${_t.textThin}`,
        12: `${_t.textMedium}`,
        13: `${_t.textThick}`
    };

    const storeFocusObjects = props.storeFocusObjects;
    if ((storeFocusObjects.focusOn !== 'cell') && Device.phone) {
        $$('.sheet-modal.modal-in').length > 0 && f7.sheet.close();
        return null;
    }
    
    const displayBorderColor = `#${(typeof borderInfo.color === "object" ? borderInfo.color.color : borderInfo.color)}`;
    return (
        <Page>
            <Navbar title={_t.textBorderStyle} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link icon='icon-expand-down' sheetClose></Link>
                    </NavRight>
                }
            </Navbar>
            <List>
                <ListItem link='#' className='no-indicator' title={_t.textNoBorder} onClick={() => {
                    storeCellSettings.changeBorderStyle('none');
                    props.onBorderStyle('none', borderInfo);
                }}>
                    <Icon slot="media" icon="icon-table-borders-none"></Icon>
                </ListItem>
                <ListItem link='#' className='no-indicator' title={_t.textAllBorders} onClick={() => {
                    storeCellSettings.changeBorderStyle('all');
                    props.onBorderStyle('all', borderInfo);
                }}>
                    <Icon slot="media" icon="icon-table-borders-all"></Icon>
                </ListItem>
                <ListItem link='#' className='no-indicator' title={_t.textOutsideBorders} onClick={() => {
                    storeCellSettings.changeBorderStyle('outer');
                    props.onBorderStyle('outer', borderInfo);
                }}>  
                    <Icon slot="media" icon="icon-table-borders-outer"></Icon> 
                </ListItem>
                <ListItem link='#' className='no-indicator' title={_t.textBottomBorder} onClick={() => {
                    storeCellSettings.changeBorderStyle('2');
                    props.onBorderStyle('2', borderInfo);
                }}>  
                    <Icon slot="media" icon="icon-table-borders-bottom"></Icon>
                </ListItem>
                <ListItem link='#' className='no-indicator' title={_t.textTopBorder} onClick={() => {
                    storeCellSettings.changeBorderStyle('0');
                    props.onBorderStyle('0', borderInfo);
                }}>
                    <Icon slot="media" icon="icon-table-borders-top"></Icon>  
                </ListItem>
                <ListItem link='#' className='no-indicator' title={_t.textLeftBorder} onClick={() => {
                    storeCellSettings.changeBorderStyle('3');
                    props.onBorderStyle('3', borderInfo);
                }}>
                    <Icon slot="media" icon="icon-table-borders-left"></Icon> 
                </ListItem>
                <ListItem link='#' className='no-indicator' title={_t.textRightBorder} onClick={() => {
                    storeCellSettings.changeBorderStyle('1');
                    props.onBorderStyle('1', borderInfo);
                }}>
                    <Icon slot="media" icon="icon-table-borders-right"></Icon>
                </ListItem>
                <ListItem link='#' className='no-indicator' title={_t.textInsideBorders} onClick={() => {
                    storeCellSettings.changeBorderStyle('inner');
                    props.onBorderStyle('inner', borderInfo);
                }}>
                    <Icon slot="media" icon="icon-table-borders-inner"></Icon>
                </ListItem>
                <ListItem link='#' className='no-indicator' title={_t.textInsideVerticalBorder} onClick={() => {
                    storeCellSettings.changeBorderStyle('6');
                    props.onBorderStyle('6', borderInfo);
                }}>
                    <Icon slot="media" icon="icon-table-borders-center"></Icon>
                </ListItem>
                <ListItem link='#' className='no-indicator' title={_t.textInsideHorizontalBorder} onClick={() => {
                    storeCellSettings.changeBorderStyle('7');
                    props.onBorderStyle('7', borderInfo);
                }}>
                    <Icon slot="media" icon="icon-table-borders-middle"></Icon> 
                </ListItem>
                <ListItem link='#' className='no-indicator' title={_t.textDiagonalUpBorder} onClick={() => {
                    storeCellSettings.changeBorderStyle('5');
                    props.onBorderStyle('5', borderInfo);
                }}>
                    <Icon slot="media" icon="icon-table-borders-dup"></Icon>
                </ListItem>
                <ListItem link='#' className='no-indicator' title={_t.textDiagonalDownBorder} onClick={() => {
                    storeCellSettings.changeBorderStyle('4');
                    props.onBorderStyle('4', borderInfo);
                }}>
                    <Icon slot="media" icon="icon-table-borders-ddown"></Icon>
                </ListItem>
            </List>
            <List>
                <ListItem title={_t.textColor} link='/edit-border-color-cell/' routeProps={{
                    onBorderStyle: props.onBorderStyle
                }}>
                    <span className="color-preview"
                        slot="after"
                        style={{background: storeCellSettings.colorAuto === 'auto' ? '#000' : displayBorderColor}}
                    ></span>
                </ListItem>
                <ListItem title={_t.textSize} link='/edit-border-size-cell/' after={borderSizes[borderInfo.width]} routeProps={{
                    onBorderStyle: props.onBorderStyle
                }}>
                </ListItem>
            </List>
        </Page>
    )
};

const PageBorderColorCell = props => {
    const { t } = useTranslation();
    const storePalette = props.storePalette;
    const storeCellSettings = props.storeCellSettings;
    const borderInfo = storeCellSettings.borderInfo;
    const borderColor = borderInfo.color;
    const borderStyle = storeCellSettings.borderStyle;
    const customColors = storePalette.customColors;
    const changeColor = (color, effectId, effectValue) => {
        if (color !== 'empty') {
            storeCellSettings.setAutoColor(null);
            if (effectId !== undefined ) {
                const newColor = {color: color, effectId: effectId, effectValue: effectValue};
                storeCellSettings.changeBorderColor(newColor);
                props.onBorderStyle(borderStyle, borderInfo);
            } else {
                storeCellSettings.changeBorderColor(color);
                props.onBorderStyle(borderStyle, borderInfo);
            }
        } else {
            // open custom color menu
            props.f7router.navigate('/edit-border-custom-color-cell/', {props: {onBorderStyle: props.onBorderStyle}});
        }
    };
  
    return (
        <Page>
            <Navbar backLink={t('View.Edit.textBack')}>
                {Device.phone &&
                    <NavRight>
                        <Link icon='icon-expand-down' sheetClose></Link>
                    </NavRight>
                }
            </Navbar>
            <List>
                <ListItem className={'item-color-auto' + (storeCellSettings.colorAuto === 'auto' ? ' active' : '')} title={t('View.Edit.textAutomatic')} onClick={() => {
                   storeCellSettings.setAutoColor('auto');
                }}>
                    <div slot="media">
                        <div id='font-color-auto' className={'color-auto'}></div>
                    </div>
                </ListItem>
            </List>
            <ThemeColorPalette changeColor={changeColor} curColor={storeCellSettings.colorAuto || borderColor} customColors={customColors} />
            <List>
                <ListItem title={t('View.Edit.textAddCustomColor')} link={'/edit-border-custom-color-cell/'} routeProps={{
                    onBorderStyle: props.onBorderStyle
                }}></ListItem>
            </List>
        </Page>
    );
};

const PageCustomBorderColorCell = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const storeCellSettings = props.storeCellSettings;
    const storePalette = props.storePalette;
    const borderInfo = storeCellSettings.borderInfo;
    let borderColor = borderInfo.color;
    
    if(typeof borderColor === "object") {
       borderColor = borderInfo.color.color;
    }

    const borderStyle = storeCellSettings.borderStyle;
    const autoColor = storeCellSettings.colorAuto === 'auto' ? window.getComputedStyle(document.getElementById('font-color-auto')).backgroundColor : null;
    const onAddNewColor = (colors, color) => {
        storePalette.changeCustomColors(colors);
        storeCellSettings.changeBorderColor(color);
        props.onBorderStyle(borderStyle, borderInfo);
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
            <CustomColorPicker autoColor={autoColor} currentColor={borderColor} onAddNewColor={onAddNewColor} />
        </Page>
    )
};

const PageBorderSizeCell = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const storeCellSettings = props.storeCellSettings;
    const borderInfo = storeCellSettings.borderInfo;
    const borderStyle = storeCellSettings.borderStyle;

    const borderSizes = {
        7: `${_t.textThin}`,
        12: `${_t.textMedium}`,
        13: `${_t.textThick}`
    }

    return (
        <Page>
            <Navbar title={_t.textSize} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link icon='icon-expand-down' sheetClose></Link>
                    </NavRight>
                }
            </Navbar>
            <List>
                {Object.keys(borderSizes).map(key => {
                    return (
                        <ListItem key={key} title={borderSizes[key]} radio checked={+key === borderInfo.width} onChange={() => {
                            storeCellSettings.changeBorderSize(+key);
                            props.onBorderStyle(borderStyle, borderInfo);
                        }}></ListItem>
                    )
                })}
            </List>
        </Page>
    )
}

const PageFormatCell = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const isIos = Device.ios;

    return (
        <Page>
            <Navbar title={_t.textFormat} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link icon='icon-expand-down' sheetClose></Link>
                    </NavRight>
                }
            </Navbar>
            <List>
                <ListItem link='/custom-format/' className='no-indicator' title={t('View.Edit.textCustomFormat')} routeProps={{
                    setCustomFormat: props.setCustomFormat,
                    onCellFormat: props.onCellFormat
                }}>
                    <Icon slot="media" icon={isIos ? 'icon-plus' : 'icon-add-custom-format'}></Icon>
                </ListItem>
                <ListItem link='#' className='no-indicator' title={_t.textGeneral} onClick={() => props.onCellFormat('General')}>
                    <Icon slot="media" icon="icon-format-general"></Icon>
                </ListItem>
                <ListItem link='#' className='no-indicator' title={_t.textNumber} onClick={() => props.onCellFormat('0.00')}>
                    <Icon slot="media" icon="icon-format-number"></Icon>
                </ListItem>
                <ListItem link='#' className='no-indicator' title={_t.textFraction} onClick={() => props.onCellFormat('# ?/?')}>
                    <Icon slot="media" icon="icon-format-integer"></Icon>
                </ListItem>
                <ListItem link='#' className='no-indicator' title={_t.textScientific} onClick={() => props.onCellFormat('0.00E+00')}>
                    <Icon slot="media" icon="icon-format-scientific"></Icon>
                </ListItem>
                <ListItem title={_t.textAccounting} link="/edit-accounting-format-cell/" routeProps={{
                    onAccountingCellFormat: props.onAccountingCellFormat
                }}>
                    <Icon slot="media" icon="icon-format-accounting"></Icon>
                </ListItem>
                <ListItem title={_t.textCurrency} link="/edit-currency-format-cell/" routeProps={{
                    onCellFormat: props.onCellFormat
                }}>
                    <Icon slot="media" icon="icon-format-currency"></Icon>
                </ListItem>
                <ListItem title={_t.textDate} link='/edit-date-format-cell/' routeProps={{
                    onCellFormat: props.onCellFormat,
                    dateFormats: props.dateFormats
                }}>
                    <Icon slot="media" icon="icon-format-date"></Icon>
                </ListItem>
                <ListItem title={_t.textTime} link='/edit-time-format-cell/' routeProps={{
                    onCellFormat: props.onCellFormat,
                    timeFormats: props.timeFormats
                }}>
                    <Icon slot="media" icon="icon-format-time"></Icon>
                </ListItem>
                <ListItem link='#' className='no-indicator' title={_t.textPercentage} onClick={() => props.onCellFormat('0.00%')}>
                    <Icon slot="media" icon="icon-format-percentage"></Icon>
                </ListItem>
                <ListItem link='#' className='no-indicator' title={_t.textText} onClick={() => props.onCellFormat('@')}>
                    <Icon slot="media" icon="icon-format-text"></Icon>
                </ListItem>
            </List>
        </Page>
    )
}

const PageCustomFormats = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const storeCellSettings = props.storeCellSettings;
    const customFormats = storeCellSettings.customFormats;
    const [renderList, setRenderList] = useState(false);

    useEffect(() => {
        if (customFormats?.length) {
            setRenderList(true);
        }
    }, [customFormats]);

    const handleCellFormatClick = (format) => {
        props.onCellFormat(format);
        props.f7router.back();
    };

    return (
        <Page>
            <Navbar title={t('View.Edit.textCustomFormat')} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link icon='icon-expand-down' sheetClose></Link>
                    </NavRight>
                }
            </Navbar>
            <List>
                <ListItem title={t('View.Edit.textCreateCustomFormat')} link="/create-custom-format/" className='no-indicator' routeProps={{
                    setCustomFormat: props.setCustomFormat,
                    customFormats: props.customFormats
                }}></ListItem>
            </List>
            {renderList && (
                <List>
                    {customFormats.map((item, idx) => (
                        <ListItem
                            link='#'
                            className='no-indicator'
                            key={idx}
                            title={item.format}
                            value={item.value}
                            onClick={() => handleCellFormatClick(item.value)}
                        />
                    ))}
                </List>
            )}
        </Page>
    )
}

const PageCreationCustomFormat = observer(props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const [formatValue, setFormatValue] = useState('');
    const isIos = Device.ios;

    const handleSetCustomFormat = (value) => {
        props.setCustomFormat(value);
        props.f7router.back();
    }

    return (
        <Page>
            <Navbar title={t('View.Edit.textCreateFormat')} backLink={_t.textBack}>
                <NavRight>
                    <Link text={isIos ? t('View.Edit.textSave') : ''} icon={!isIos ? 'icon-check' : null} className={!formatValue && 'disabled'} onClick={() => handleSetCustomFormat(formatValue)}></Link>
                </NavRight>
            </Navbar>
            <>
                <List className="inputs-list">
                    <ListInput 
                        label={!isIos ? t('View.Edit.textFormat') : null}
                        type="text"
                        placeholder={t('View.Edit.textEnterFormat')}
                        value={formatValue}
                        onInput={e => setFormatValue(e.target.value)}
                        clearButton={isIos ? true : false}
                    />
                </List>
                <Block>
                    <p>{t('View.Edit.textCustomFormatWarning')}</p>
                </Block>
            </>
        </Page>
    )
});

const PageAccountingFormatCell = observer(props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});

    return (
        <Page>
            <Navbar title={_t.textAccounting} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link icon='icon-expand-down' sheetClose></Link>
                    </NavRight>
                }
            </Navbar>
            <List>
                <ListItem link='#' className='no-indicator' title={_t.textDollar} after='$'
                    onClick={() => props.onAccountingCellFormat(1033)}>
                </ListItem>
                <ListItem link='#' className='no-indicator' title={_t.textEuro} after='€'
                    onClick={() => props.onAccountingCellFormat(1031)}>
                </ListItem>
                <ListItem link='#' className='no-indicator' title={_t.textPound} after='£'
                    onClick={() => props.onAccountingCellFormat(2057)}> 
                </ListItem>
                <ListItem link='#' className='no-indicator' title={_t.textRouble} after='₽'
                    onClick={() => props.onAccountingCellFormat(1049)}>
                </ListItem>
                <ListItem link='#' className='no-indicator' title={_t.textYen} after='¥'
                    onClick={() => props.onAccountingCellFormat(1041)}>
                </ListItem>
            </List>
        </Page>
    )
});

const PageCurrencyFormatCell = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});

    return (
        <Page>
            <Navbar title={_t.textCurrency} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link icon='icon-expand-down' sheetClose></Link>
                    </NavRight>
                }
            </Navbar>
            <List>
                <ListItem link='#' className='no-indicator' title={_t.textDollar} after='$'
                    onClick={() => props.onCellFormat('[$$-409]#,##0.00')}>
                </ListItem>
                <ListItem link='#' className='no-indicator' title={_t.textEuro} after='€'
                    onClick={() => props.onCellFormat('#,##0.00\ [$€-407]')}>
                </ListItem>
                <ListItem link='#' className='no-indicator' title={_t.textPound} after='£'
                    onClick={() => props.onCellFormat('[$£-809]#,##0.00')}>
                </ListItem>
                <ListItem link='#' className='no-indicator' title={_t.textRouble} after='₽'
                    onClick={() => props.onCellFormat('#,##0.00\ [$₽-419]')}>
                </ListItem>
                <ListItem link='#' className='no-indicator' title={_t.textYen} after='¥'
                    onClick={() => props.onCellFormat('[$¥-411]#,##0.00')}>
                </ListItem>
            </List>
        </Page>
    )
}

const PageDateFormatCell = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const dateFormats = props.dateFormats;

    return (
        <Page>
            <Navbar title={_t.textDate} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link icon='icon-expand-down' sheetClose></Link>
                    </NavRight>
                }
            </Navbar>
            <List>
                {dateFormats.map((format, index) => {
                    return (
                        <ListItem link='#' key={index} className='no-indicator' title={format.displayValue}
                            onClick={() => props.onCellFormat(format.value)}></ListItem>
                    )
                })}
            </List>
        </Page>
    )
}

const PageTimeFormatCell = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const timeFormats = props.timeFormats;

    return (
        <Page>
            <Navbar title={_t.textTime} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link icon='icon-expand-down' sheetClose></Link>
                    </NavRight>
                }
            </Navbar>
            <List>
                {timeFormats.map((format, index) => {
                    return (
                        <ListItem link='#' key={index} className='no-indicator' title={format.displayValue}
                            onClick={() => props.onCellFormat(format.value)}></ListItem>
                    )
                })}
            </List>
        </Page>
    )
}


const PageEditCell = inject("storeCellSettings", "storeWorksheets")(observer(EditCell));
const TextColorCell = inject("storeCellSettings", "storePalette", "storeFocusObjects")(observer(PageTextColorCell));
const FillColorCell = inject("storeCellSettings", "storePalette", "storeFocusObjects")(observer(PageFillColorCell));
const CustomTextColorCell = inject("storeCellSettings", "storePalette", "storeFocusObjects")(observer(PageCustomTextColorCell));
const CustomFillColorCell = inject("storeCellSettings", "storePalette", "storeFocusObjects")(observer(PageCustomFillColorCell));
const FontsCell = inject("storeCellSettings", "storeTextSettings" , "storeFocusObjects")(observer(PageFontsCell));
const TextFormatCell = inject("storeCellSettings", "storeFocusObjects")(observer(PageTextFormatCell));
const TextOrientationCell = inject("storeCellSettings", "storeFocusObjects")(observer(PageTextOrientationCell));
const BorderStyleCell = inject("storeCellSettings", "storeFocusObjects")(observer(PageBorderStyleCell));
const BorderColorCell = inject("storeCellSettings", "storePalette")(observer(PageBorderColorCell));
const CustomBorderColorCell = inject("storeCellSettings", "storePalette")(observer(PageCustomBorderColorCell));
const BorderSizeCell = inject("storeCellSettings")(observer(PageBorderSizeCell));
const CellStyle = inject("storeCellSettings")(observer(PageCellStyle));
const CustomFormats = inject("storeCellSettings")(observer(PageCustomFormats));

export {
    PageEditCell as EditCell,
    TextColorCell,
    FillColorCell,
    CustomFillColorCell,
    CustomTextColorCell,
    FontsCell,
    TextFormatCell,
    TextOrientationCell,
    BorderStyleCell,
    BorderColorCell,
    CustomBorderColorCell,
    BorderSizeCell,
    PageFormatCell,
    PageAccountingFormatCell,
    PageCurrencyFormatCell,
    PageDateFormatCell,
    PageTimeFormatCell,
    CellStyle,
    CustomFormats,
    PageCreationCustomFormat
};
