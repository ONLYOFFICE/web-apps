import React, {Fragment, useState} from 'react';
import {observer, inject} from "mobx-react";
import {f7, List, ListItem, Icon, Row, Button, Page, Navbar, Segmented, BlockTitle, NavRight, Link, Toggle} from 'framework7-react';
import { useTranslation } from 'react-i18next';
import {Device} from '../../../../../common/mobile/utils/device';
import { ThemeColorPalette, CustomColorPicker } from '../../../../../common/mobile/lib/component/ThemeColorPalette.jsx';

const EditCell = props => {
    const isAndroid = Device.android;
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const storeCellSettings = props.storeCellSettings;
    const cellStyles = storeCellSettings.cellStyles;
    const styleName = storeCellSettings.styleName;

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
        <span className="color-preview"></span>;
    
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
                <ListItem className='buttons'>
                    <Row>
                        <a className={'button' + (isBold ? ' active' : '')} onClick={() => {props.toggleBold(!isBold)}}><b>B</b></a>
                        <a className={'button' + (isItalic ? ' active' : '')} onClick={() => {props.toggleItalic(!isItalic)}}><i>I</i></a>
                        <a className={'button' + (isUnderline ? ' active' : '')} onClick={() => {props.toggleUnderline(!isUnderline)}} style={{textDecoration: "underline"}}>U</a>
                    </Row>
                </ListItem>
                <ListItem title={_t.textTextColor} link="/edit-cell-text-color/" routeProps={{
                    onTextColor: props.onTextColor
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
                    onWrapTextChange: props.onWrapTextChange
                }}>
                    {!isAndroid ?
                        <Icon slot="media" icon="icon-text-align-left"></Icon> : null
                    }
                </ListItem>
                <ListItem title={_t.textTextOrientation} link="/edit-cell-text-orientation/" routeProps={{
                    onTextOrientationChange: props.onTextOrientationChange
                }}>
                    {!isAndroid ?
                        <Icon slot="media" icon="icon-text-orientation-horizontal"></Icon> : null
                    }
                </ListItem>
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
                    onCellFormat: props.onCellFormat
                }}>
                    {!isAndroid ?
                        <Icon slot="media" icon="icon-format-general"></Icon> : null
                    }
                </ListItem>
            </List>
            <BlockTitle>{_t.textCellStyles}</BlockTitle>
            {cellStyles.length ? (
                <List className="cell-styles-list">
                    {cellStyles.map((elem, index) => {
                        return (
                            <ListItem key={index}
                                className={elem.name === styleName ? "item-theme active" : "item-theme"} onClick={() => props.onStyleClick(elem.name)}>
                                <div className='thumb' style={{backgroundImage: `url(${elem.image})`}}></div>
                            </ListItem>
                        )
                    })}
                </List>
            ) : null}    
        </Fragment>
    )
};

const PageFontsCell = props => {
    const isAndroid = Device.android;
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const storeCellSettings = props.storeCellSettings;
    const fontInfo = storeCellSettings.fontInfo;
    const size = fontInfo.size;
    const displaySize = typeof size === 'undefined' ? _t.textAuto : size + ' ' + _t.textPt;
    const curFontName = fontInfo.name;
    const fonts = storeCellSettings.fontsArray;

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
                            onClick={() => {props.onFontClick(item.name)}}
                        ></ListItem>
                    ))}
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
            <Navbar title={_t.textTextColor} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link icon='icon-expand-down' sheetClose></Link>
                    </NavRight>
                }
            </Navbar>
            <ThemeColorPalette changeColor={changeColor} curColor={fontColor} customColors={customColors} />
            <List>
                <ListItem title={_t.textAddCustomColor} link={'/edit-cell-text-custom-color/'} routeProps={{
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
            <CustomColorPicker currentColor={fontColor} onAddNewColor={onAddNewColor} />
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
                <ListItem title={_t.textAlignLeft} radio checked={hAlignStr === 'left'} onChange={() => {
                    props.onHAlignChange('left');
                }}>
                    {!isAndroid ?
                        <Icon slot="media" icon="icon-text-align-left"></Icon> : null
                    }
                </ListItem>
                <ListItem title={_t.textAlignCenter} radio checked={hAlignStr === 'center'} onChange={() => {
                    props.onHAlignChange('center');
                }}>
                    {!isAndroid ?
                        <Icon slot="media" icon="icon-text-align-center"></Icon> : null
                    }
                </ListItem>
                <ListItem title={_t.textAlignRight} radio checked={hAlignStr === 'right'} onChange={() => {
                    props.onHAlignChange('right');
                }}>
                    {!isAndroid ?
                        <Icon slot="media" icon="icon-text-align-right"></Icon> : null
                    }
                </ListItem>
                <ListItem title={_t.textJustified} radio checked={hAlignStr === 'justify'} onChange={() => {
                    props.onHAlignChange('justify');
                }}>
                    {!isAndroid ?
                        <Icon slot="media" icon="icon-text-align-jast"></Icon> : null
                    }
                </ListItem>
            </List>
            <List>
                <ListItem title={_t.textAlignTop} radio checked={vAlignStr === 'top'} onChange={() => {
                    props.onVAlignChange('top');
                }}>
                    {!isAndroid ? <Icon slot="media" icon="icon-text-valign-top"></Icon> : null}
                </ListItem>
                <ListItem title={_t.textAlignMiddle} radio checked={vAlignStr === 'center'} onChange={() => {
                    props.onVAlignChange('center');
                }}>
                    {!isAndroid ? <Icon slot="media" icon="icon-text-valign-middle"></Icon> : null}
                </ListItem>
                <ListItem title={_t.textAlignBottom} radio checked={vAlignStr === 'bottom'} onChange={() => {
                    props.onVAlignChange('bottom');
                }}>
                    {!isAndroid ? <Icon slot="media" icon="icon-text-valign-bottom"></Icon> : null}
                </ListItem>
            </List>
            <List>
                <ListItem title={_t.textWrapText}>
                    {!isAndroid ? <Icon slot="media" icon="icon-cell-wrap"></Icon> : null}
                    <Toggle checked={isWrapText} onChange={() => {props.onWrapTextChange(!isWrapText)}} />
                </ListItem>
            </List>
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
                    after={isAndroid ? <Icon slot="media" icon="icon-text-orientation-horizontal"></Icon> : null} onChange={() => {
                    props.onTextOrientationChange('horizontal');
                }}>
                    {!isAndroid ?
                        <Icon slot="media" icon="icon-text-orientation-horizontal"></Icon> : null
                    }
                </ListItem>
                <ListItem title={_t.textAngleCounterclockwise} radio checked={orientationStr === 'anglecount'}
                    after={isAndroid ? <Icon slot="media" icon="icon-text-orientation-anglecount"></Icon> : null} onChange={() => {
                    props.onTextOrientationChange('anglecount');
                }}>
                    {!isAndroid ?
                        <Icon slot="media" icon="icon-text-orientation-anglecount"></Icon> : null
                    }
                </ListItem>
                <ListItem title={_t.textAngleClockwise} radio checked={orientationStr === 'angleclock'}
                    after={isAndroid ? <Icon slot="media" icon="icon-text-orientation-angleclock"></Icon> : null} onChange={() => {
                    props.onTextOrientationChange('angleclock');
                }}>
                    {!isAndroid ?
                        <Icon slot="media" icon="icon-text-orientation-angleclock"></Icon> : null
                    }
                </ListItem>
                <ListItem title={_t.textVerticalText} radio checked={orientationStr === 'vertical'}
                    after={isAndroid ? <Icon slot="media" icon="icon-text-orientation-vertical"></Icon> : null} onChange={() => {
                    props.onTextOrientationChange('vertical');
                }}>
                    {!isAndroid ?
                        <Icon slot="media" icon="icon-text-orientation-vertical"></Icon> : null
                    }
                </ListItem>
                <ListItem title={_t.textRotateTextUp} radio checked={orientationStr === 'rotateup'}
                    after={isAndroid ? <Icon slot="media" icon="icon-text-orientation-rotateup"></Icon> : null} onChange={() => {
                    props.onTextOrientationChange('rotateup');
                }}>
                    {!isAndroid ?
                        <Icon slot="media" icon="icon-text-orientation-rotateup"></Icon> : null
                    }
                </ListItem>
                <ListItem title={_t.textRotateTextDown} radio checked={orientationStr === 'rotatedown'}
                    after={isAndroid ? <Icon slot="media" icon="icon-text-orientation-rotatedown"></Icon> : null} onChange={() => {
                    props.onTextOrientationChange('rotatedown');
                }}>
                    {!isAndroid ?
                        <Icon slot="media" icon="icon-text-orientation-rotatedown"></Icon> : null
                    }
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
                        style={{background:`#${(typeof borderInfo.color === "object" ? borderInfo.color.color : borderInfo.color)}`}}
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
    const _t = t("View.Edit", { returnObjects: true });
    const storePalette = props.storePalette;
    const storeCellSettings = props.storeCellSettings;
    const borderInfo = storeCellSettings.borderInfo;
    const borderColor = borderInfo.color;
    const borderStyle = storeCellSettings.borderStyle;
    const customColors = storePalette.customColors;

    const changeColor = (color, effectId, effectValue) => {
        if (color !== 'empty') {
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
            <Navbar backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link icon='icon-expand-down' sheetClose></Link>
                    </NavRight>
                }
            </Navbar>
            <ThemeColorPalette changeColor={changeColor} curColor={borderColor} customColors={customColors} />
            <List>
                <ListItem title={_t.textAddCustomColor} link={'/edit-border-custom-color-cell/'} routeProps={{
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
            <CustomColorPicker currentColor={borderColor} onAddNewColor={onAddNewColor} />
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
                <ListItem link='#' className='no-indicator' title={_t.textGeneral} onClick={() => props.onCellFormat('R2VuZXJhbA==')}>
                    <Icon slot="media" icon="icon-format-general"></Icon>
                </ListItem>
                <ListItem link='#' className='no-indicator' title={_t.textNumber} onClick={() => props.onCellFormat('MC4wMA==')}>
                    <Icon slot="media" icon="icon-format-number"></Icon>
                </ListItem>
                <ListItem link='#' className='no-indicator' title={_t.textInteger} onClick={() => props.onCellFormat('JTIzMA==')}>
                    <Icon slot="media" icon="icon-format-integer"></Icon>
                </ListItem>
                <ListItem link='#' className='no-indicator' title={_t.textScientific} onClick={() => props.onCellFormat('MC4wMEUlMkIwMA==')}>
                    <Icon slot="media" icon="icon-format-scientific"></Icon>
                </ListItem>
                <ListItem title={_t.textAccounting} link="/edit-accounting-format-cell/" routeProps={{
                    onCellFormat: props.onCellFormat
                }}>
                    <Icon slot="media" icon="icon-format-accounting"></Icon>
                </ListItem>
                <ListItem title={_t.textCurrency} link="/edit-currency-format-cell/" routeProps={{
                    onCellFormat: props.onCellFormat
                }}>
                    <Icon slot="media" icon="icon-format-currency"></Icon>
                </ListItem>
                <ListItem title={_t.textDate} link='/edit-date-format-cell/' routeProps={{
                    onCellFormat: props.onCellFormat
                }}>
                    <Icon slot="media" icon="icon-format-date"></Icon>
                </ListItem>
                <ListItem title={_t.textTime} link='/edit-time-format-cell/' routeProps={{
                    onCellFormat: props.onCellFormat
                }}>
                    <Icon slot="media" icon="icon-format-time"></Icon>
                </ListItem>
                <ListItem link='#' className='no-indicator' title={_t.textPercentage} onClick={() => props.onCellFormat('MC4wMCUyNQ==')}>
                    <Icon slot="media" icon="icon-format-percentage"></Icon>
                </ListItem>
                <ListItem link='#' className='no-indicator' title={_t.textText} onClick={() => props.onCellFormat('JTQw')}>
                    <Icon slot="media" icon="icon-format-text"></Icon>
                </ListItem>
            </List>
        </Page>
    )
}

const PageAccountingFormatCell = props => {
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
                    onClick={() => props.onCellFormat('XyglMjQqJTIwJTIzJTJDJTIzJTIzMC4wMF8pJTNCXyglMjQqJTIwKCUyMyUyQyUyMyUyMzAuMDApJTNCXyglMjQqJTIwJTIyLSUyMiUzRiUzRl8pJTNCXyglNDBfKQ==')}>
                </ListItem>
                <ListItem link='#' className='no-indicator' title={_t.textEuro} after='€'
                    onClick={() => props.onCellFormat('XyglRTIlODIlQUMqJTIwJTIzJTJDJTIzJTIzMC4wMF8pJTNCXyglRTIlODIlQUMqJTIwKCUyMyUyQyUyMyUyMzAuMDApJTNCXyglRTIlODIlQUMqJTIwJTIyLSUyMiUzRiUzRl8pJTNCXyglNDBfKQ==')}>
                </ListItem>
                <ListItem link='#' className='no-indicator' title={_t.textPound} after='£'
                    onClick={() => props.onCellFormat('XyglQzIlQTMqJTIwJTIzJTJDJTIzJTIzMC4wMF8pJTNCXyglQzIlQTMqJTIwKCUyMyUyQyUyMyUyMzAuMDApJTNCXyglQzIlQTMqJTIwJTIyLSUyMiUzRiUzRl8pJTNCXyglNDBfKQ==')}> 
                </ListItem>
                <ListItem link='#' className='no-indicator' title={_t.textRouble} after='₽'
                    onClick={() => props.onCellFormat('Xy0qJTIwJTIzJTJDJTIzJTIzMC4wMCU1QiUyNCVEMSU4MC4tNDE5JTVEXy0lM0ItKiUyMCUyMyUyQyUyMyUyMzAuMDAlNUIlMjQlRDElODAuLTQxOSU1RF8tJTNCXy0qJTIwJTIyLSUyMiUzRiUzRiU1QiUyNCVEMSU4MC4tNDE5JTVEXy0lM0JfLSU0MF8t')}>
                </ListItem>
                <ListItem link='#' className='no-indicator' title={_t.textYen} after='¥'
                    onClick={() => props.onCellFormat('XyglQzIlQTUqJTIwJTIzJTJDJTIzJTIzMC4wMF8pJTNCXyglQzIlQTUqJTIwKCUyMyUyQyUyMyUyMzAuMDApJTNCXyglQzIlQTUqJTIwJTIyLSUyMiUzRiUzRl8pJTNCXyglNDBfKQ==')}>
                </ListItem>
            </List>
        </Page>
    )
}

const PageCurrencyFormatCell = props => {
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
                    onClick={() => props.onCellFormat('JTI0JTIzJTJDJTIzJTIzMC4wMA==')}>
                </ListItem>
                <ListItem link='#' className='no-indicator' title={_t.textEuro} after='€'
                    onClick={() => props.onCellFormat('JUUyJTgyJUFDJTIzJTJDJTIzJTIzMC4wMA==')}>
                </ListItem>
                <ListItem link='#' className='no-indicator' title={_t.textPound} after='£'
                    onClick={() => props.onCellFormat('JUMyJUEzJTIzJTJDJTIzJTIzMC4wMA==')}>
                </ListItem>
                <ListItem link='#' className='no-indicator' title={_t.textRouble} after='₽'
                    onClick={() => props.onCellFormat('JTIzJTJDJTIzJTIzMC4wMCUyMiVEMSU4MC4lMjI=')}>
                </ListItem>
                <ListItem link='#' className='no-indicator' title={_t.textYen} after='¥'
                    onClick={() => props.onCellFormat('JUMyJUE1JTIzJTJDJTIzJTIzMC4wMA==')}>
                </ListItem>
            </List>
        </Page>
    )
}

const PageDateFormatCell = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});

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
                <ListItem link='#' className='no-indicator' title='07-24-88' after='MM-dd-yy'
                    onClick={() => props.onCellFormat('TU0tZGQteXk=')}></ListItem>
                <ListItem link='#' className='no-indicator' title='07-24-1988' after='MM-dd-yyyy'
                    onClick={() => props.onCellFormat('TU0tZGQteXl5eQ==')}>
                </ListItem>
                <ListItem link='#' className='no-indicator' title='24-07-88' after='dd-MM-yy'
                    onClick={() => props.onCellFormat('ZGQtTU0teXk=')}>
                </ListItem>
                <ListItem link='#' className='no-indicator' title='24-07-1988' after='dd-MM-yyyy'
                    onClick={() => props.onCellFormat('ZGQtTU0teXl5eQ==')}>
                </ListItem>
                <ListItem link='#' className='no-indicator' title='24-Jul-1988' after='dd-MMM-yyyy'
                    onClick={() => props.onCellFormat('ZGQtTU1NLXl5eXk=')}>
                </ListItem>
                <ListItem link='#' className='no-indicator' title='24-Jul' after='dd-MMM'
                    onClick={() => props.onCellFormat('ZGQtTU1N')}>
                </ListItem>
                <ListItem link='#' className='no-indicator' title='Jul-88' after='MMM-yy'
                    onClick={() => props.onCellFormat('TU1NLXl5')}>
                </ListItem>
            </List>
        </Page>
    )
}

const PageTimeFormatCell = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});

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
                <ListItem link='#' className='no-indicator' title='10:56' after='HH:mm'
                    onClick={() => props.onCellFormat('aCUzQW1tJTNCJTQw')}>
                </ListItem>
                <ListItem link='#' className='no-indicator' title='21:56:00' after='HH:MM:ss'
                    onClick={() => props.onCellFormat('aCUzQW1tJTNBc3MlM0IlNDA=')}>
                </ListItem>
                <ListItem link='#' className='no-indicator' title='05:56 AM' after='hh:mm tt'
                    onClick={() => props.onCellFormat('aCUzQW1tJTIwQU0lMkZQTSUzQiU0MA==')}>
                </ListItem>
                <ListItem link='#' className='no-indicator' title='05:56:00 AM' after='hh:mm:ss tt'
                    onClick={() => props.onCellFormat('aCUzQW1tJTNBc3MlMjBBTSUyRlBNJTNCJTQw')}>
                </ListItem>
                <ListItem link='#' className='no-indicator' title='38:56:00' after='[h]:mm:ss'
                    onClick={() => props.onCellFormat('JTVCaCU1RCUzQW1tJTNBc3MlM0IlNDA=')}>
                </ListItem>
            </List>
        </Page>
    )
}


const PageEditCell = inject("storeCellSettings")(observer(EditCell));
const TextColorCell = inject("storeCellSettings", "storePalette", "storeFocusObjects")(observer(PageTextColorCell));
const FillColorCell = inject("storeCellSettings", "storePalette", "storeFocusObjects")(observer(PageFillColorCell));
const CustomTextColorCell = inject("storeCellSettings", "storePalette", "storeFocusObjects")(observer(PageCustomTextColorCell));
const CustomFillColorCell = inject("storeCellSettings", "storePalette", "storeFocusObjects")(observer(PageCustomFillColorCell));
const FontsCell = inject("storeCellSettings", "storeFocusObjects")(observer(PageFontsCell));
const TextFormatCell = inject("storeCellSettings", "storeFocusObjects")(observer(PageTextFormatCell));
const TextOrientationCell = inject("storeCellSettings", "storeFocusObjects")(observer(PageTextOrientationCell));
const BorderStyleCell = inject("storeCellSettings", "storeFocusObjects")(observer(PageBorderStyleCell));
const BorderColorCell = inject("storeCellSettings", "storePalette")(observer(PageBorderColorCell));
const CustomBorderColorCell = inject("storeCellSettings", "storePalette")(observer(PageCustomBorderColorCell));
const BorderSizeCell = inject("storeCellSettings")(observer(PageBorderSizeCell));

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
    PageTimeFormatCell
};