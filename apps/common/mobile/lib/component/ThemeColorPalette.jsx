import React, { useState, useEffect } from 'react';
import { f7, ListItem, List, Icon } from 'framework7-react';
import { useTranslation } from 'react-i18next';
import { LocalStorage } from '../../utils/LocalStorage.mjs';

const ThemeColors = ({ themeColors, onColorClick, curColor, isTypeColors, isTypeCustomColors }) => {
    return (
        <div className='palette'>
            {themeColors?.length && themeColors.map((row, rowIndex) => {
                return(
                    <div key={`tc-row-${rowIndex}`} className='row'>
                        {row.map((effect, index) => {
                            return(
                                <a key={`tc-${rowIndex}-${index}`}
                                   className={(curColor && !isTypeCustomColors && !isTypeColors && ((curColor.color === effect.color && curColor.effectValue === effect.effectValue) || (curColor === effect.color)))  ? 'active' : ''}
                                   style={{ background: `#${effect.color}`}}
                                   onClick={() => {onColorClick(effect.color, effect.effectId, effect.effectValue)}}
                                ></a>
                            )
                        })}
                    </div>
                )
            })}
        </div>
    )
};

const StandartColors = ({ options, standartColors, onColorClick, curColor }) => {
    return (
        <div className='palette'>
            {standartColors?.length && standartColors.map((color, index) => {
                return (
                    index === 0 && options.transparent ?
                        <a key={`sc-${index}`}
                           className={`transparent ${'transparent' === curColor ? 'active' : ''}`}
                           onClick={() => {onColorClick('transparent')}}
                        ></a> :
                        <a key={`sc-${index}`}
                           className={curColor && (curColor?.color === color?.color || curColor === color?.color) ? ' active' : ''}
                           style={{ background: `#${color?.color}` }}
                           onClick={() => {onColorClick(color)}}
                        ></a>
                )
            })}
        </div>
    )
};

const CustomColors = ({ options, customColors, isTypeColors, onColorClick, curColor }) => {
    const colors = customColors.length > 0 ? customColors : [];
    const emptyItems = [];

    if (colors.length < options.customcolors) {
        for (let i = colors.length; i < options.customcolors; i++) {
            emptyItems.push(<a className='empty-color'
                                key={`dc-empty${i}`}
                                onClick={() => {onColorClick('empty')}}
            ></a>)
        }
    }

    let indexCurColor = colors.indexOf(curColor);
    
    return (
        <div className='palette'>
            {colors && colors.length > 0 ? colors.map((color, index) => {
                return (
                    <a key={`dc-${index}`}
                       className={curColor && curColor === color && index === indexCurColor && !isTypeColors ? 'active' : ''}
                       style={{background: `#${color}`}}
                       onClick={() => {onColorClick(color)}}
                    ></a>
                )
            }) : null}
            {emptyItems.length > 0 && emptyItems}
        </div>
    )
};

const ThemeColorPalette = props => {
    const {t} = useTranslation();
    const _t = t('Common.ThemeColorPalette', {returnObjects: true});
    const options = {
        customcolors: props.customcolors || 10,
        standardcolors: props.standardcolors || 10,
        themecolors: props.themecolors || 10,
        effects: props.effects || 5,
        //allowReselect: props.allowReselect !== false,
        transparent: props.transparent || false,
        value: props.value || '000000',
        cls: props.cls || ''
    };
    const curColor = props.curColor;
    const themeColors = [];
    const effectColors = Common.Utils.ThemeColor.getEffectColors();
    let row = -1;

    if(effectColors?.length) {
        effectColors.forEach((effect, index) => {
            if (0 == index % options.themecolors) {
                themeColors.push([]);
                row++;
            }
            themeColors[row].push(effect);
        });
    }

    const standartColors = Common.Utils.ThemeColor.getStandartColors();
    let isTypeColors = standartColors?.length && standartColors.some( value => value === curColor );
    // custom color
    let customColors = props.customColors;

    if (customColors.length < 1) {
        customColors = LocalStorage.getItem('mobile-custom-colors');
        customColors = customColors ? customColors.toLowerCase().split(',') : [];
    }

    let isTypeCustomColors = customColors.some( value => value === curColor );

    return (
        <div className={'color-palettes' + (props.cls ? (' ' + props.cls) : '')}>
            <List>
                <ListItem className='theme-colors'>
                    <div>{ _t.textThemeColors }</div>
                    <ThemeColors isTypeCustomColors={isTypeCustomColors} isTypeColors={isTypeColors} themeColors={themeColors} onColorClick={props.changeColor} curColor={curColor}/>
                </ListItem>
                <ListItem className='standart-colors'>
                    <div>{ _t.textStandartColors }</div>
                    <StandartColors options={options} standartColors={standartColors} onColorClick={props.changeColor} curColor={curColor}/>
                </ListItem>
                <ListItem className='dynamic-colors'>
                    <div>{ _t.textCustomColors }</div>
                    <CustomColors options={options} isTypeColors={isTypeColors} customColors={customColors} onColorClick={props.changeColor} curColor={curColor}/>
                </ListItem>
            </List>
        </div>
    )
};

const CustomColorPicker = props => {
    //Function to convert rgb color to hex format
    const hexDigits = new Array("0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f");
    const hex = x => {
        return isNaN(x) ? "00" : hexDigits[(x - x % 16) / 16] + hexDigits[x % 16];
    };
    const rgb2hex = rgb => {
        rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        return hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
    };

    let currentColor = props.currentColor;

    if (props.autoColor) {
        currentColor = rgb2hex(props.autoColor);
    }

    if (currentColor === 'transparent' || !currentColor) {
        currentColor = 'ffffff';
    }

    const countDynamicColors = props.countdynamiccolors || 10;
    const [stateColor, setColor] = useState(`#${currentColor}`);

    useEffect(() => {
        if (document.getElementsByClassName('color-picker-wheel').length < 1) {
            const colorPicker = f7.colorPicker.create({
                containerEl: document.getElementsByClassName('color-picker-container')[0],
                value: {
                    hex: `#${currentColor}`
                },
                on: {
                    change: function (value) {
                        setColor(value.getValue().hex);
                    }
                }
            });
        }
    });

    const addNewColor = (color) => {
        let colors = LocalStorage.getItem('mobile-custom-colors');
        colors = colors ? colors.split(',') : [];
        const newColor = color.slice(1);
        if (colors.push(newColor) > countDynamicColors) colors.shift(); // 10 - dynamiccolors
        LocalStorage.setItem('mobile-custom-colors', colors.join().toLowerCase());
        props.onAddNewColor && props.onAddNewColor(colors, newColor);
    };

    return (
        <div id='color-picker'>
            <div className='color-picker-container'></div>
            <div className='right-block'>
                <div className='color-hsb-preview'>
                    <div className='new-color-hsb-preview' style={{backgroundColor: stateColor}}></div>
                    <div className='current-color-hsb-preview' style={{backgroundColor: `#${currentColor}`}}></div>
                </div>
                <a href='#' id='add-new-color' className='button button-round' onClick={()=>{addNewColor(stateColor)}}>
                    <Icon icon={'icon-plus'} slot="media" />
                </a>
            </div>
        </div>
    )
};

export { ThemeColorPalette, CustomColorPicker };