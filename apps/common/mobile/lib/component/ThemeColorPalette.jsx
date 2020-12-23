import React, { useState } from 'react';
import { ListItem, List } from 'framework7-react';
import { f7 } from 'framework7-react';
import { useTranslation } from 'react-i18next';

const ThemeColors = ({ themeColors, onColorClick, curColor }) => {
    return (
        <div className='palette'>
            {themeColors.map((row, rowIndex) => {
                return(
                    <div className='row'>
                        {row.map((effect, index) => {
                            return(
                                <a key={'tc-' + rowIndex + '-' + index}
                                   className={curColor && curColor.color === effect.color && curColor.effectId === effect.effectId ? 'active' : ''}
                                   data-effectvalue={effect.effectValue}
                                   style={{ background: '#' + effect.color}}
                                   onClick={() => {onColorClick(effect.color, effect.effectId)}}
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
            {standartColors.map((color, index) => {
                return(
                index === 0 && options.transparent ?
                    <a key={'sc-' + index}
                       className={'transparent' + ('transparent' === curColor ? ' active' : '')}
                       onClick={() => {onColorClick('transparent')}}
                    ></a> :
                    <a key={'sc-' + index}
                       className={curColor && curColor === color ? ' active' : ''}
                       style={{ background: '#' + color}}
                       onClick={() => {onColorClick(color)}}
                    ></a>
                )
            })}
        </div>
    )
};

const DynamicColors = ({ options, onColorClick, curColor }) => {
    const dynamicColors = [];//dynamiColors;
    const emptyItems = [];
    if (dynamicColors.length < options.dynamiccolors) {
        for (let i = dynamicColors.length; i < options.dynamiccolors; i++) {
            emptyItems.push(<a key={'dc-empty' + i}
                               style={{background: '#ffffff'}}
                               onClick={() => {onColorClick('empty')}}
            ></a>)
        }
    }
    return (
        <div className='palette'>
            {dynamicColors && dynamicColors.length > 0 && dynamicColors.map((color, index) => {
                return(
                    <a key={'dc-' + index}
                       className={curColor && curColor === color ? 'active' : ''}
                       style={{background: '#' + color}}
                       onClick={() => {onColorClick(color)}}
                    ></a>
                )
            })}
            {emptyItems.length > 0 && emptyItems}
        </div>
    )
};

const ThemeColorPalette = props => {
    const {t} = useTranslation();
    const _t = t('Common.ThemeColorPalette', {returnObjects: true});
    const options = {
        dynamiccolors: props.dynamiccolors || 10,
        standardcolors: props.standardcolors || 10,
        themecolors: props.themecolors || 10,
        effects: props.effects || 5,
        allowReselect: props.allowReselect !== false,
        transparent: props.transparent || false,
        value: props.value || '000000',
        cls: props.cls || ''
    };
    const curColor = props.curColor;
    const changeCurColor = props.changeCurColor;
    const themeColors = [];
    const effectColors = Common.Utils.ThemeColor.getEffectColors();
    let row = -1;
    effectColors.forEach((effect, index) => {
        if (0 == index % options.themecolors) {
            themeColors.push([]);
            row++;
        }
        themeColors[row].push(effect);
    });
    const standartColors = Common.Utils.ThemeColor.getStandartColors();
    // custom color
    //const dynamicColors = Common.localStorage.getItem('asc.'+Common.localStorage.getId()+'.colors.custom');
    //dynamicColors = this.dynamicColors ? this.dynamicColors.toLowerCase().split(',') : [];

    const onColorClick = ( color, effectId ) => {
        if (color !== 'empty') {
            if (effectId !==undefined ) {
                changeCurColor({color: color, effectId: effectId});
            } else {
                changeCurColor(color);
            }
        } else {
            // open custom color menu
        }
    };

    return (
        <div className={'color-palettes' + (props.cls ? (' ' + props.cls) : '')}>
            <List>
                <ListItem className='theme-colors'>
                    <div>{ _t.textThemeColors }</div>
                    <ThemeColors themeColors={themeColors} onColorClick={onColorClick} curColor={curColor}/>
                </ListItem>
                <ListItem className='standart-colors'>
                    <div>{ _t.textStandartColors }</div>
                    <StandartColors options={options} standartColors={standartColors} onColorClick={onColorClick} curColor={curColor}/>
                </ListItem>
                <ListItem className='dynamic-colors'>
                    <div>{ _t.textCustomColors }</div>
                    <DynamicColors options={options} onColorClick={onColorClick} curColor={curColor}/>
                </ListItem>
            </List>
        </div>
    )
};

export default ThemeColorPalette;