import React, { useEffect, useState, useImperativeHandle } from 'react'
import { f7 } from 'framework7-react';
import { Device } from '../../../../common/mobile/utils/device';
import SvgIcon from '@common/lib/component/SvgIcon'
import IconPlusIos from '@common-ios-icons/icon-plus.svg?ios';
import IconPlusAndroid from '@common-android-icons/icon-plus.svg?android';

export const WheelColorPicker = ({ initialColor = '#ffffff', onSelectColor, ref }) => {
    const [color, setColor] = useState(initialColor);
    const pickerInstance = React.useRef(null);

    useImperativeHandle(ref, () => ({
        update: () => {
            if (pickerInstance.current?.modules) {
                pickerInstance.current.update();
            }
        },
        setValue: (hex) => {
            if (pickerInstance.current) {
                pickerInstance.current.setValue({ hex });
            }
        }
    }), []);

    useEffect(() => {
        const container = document.querySelector('.color-picker-container');
        if (!container || pickerInstance.current) return;

        pickerInstance.current = f7.colorPicker.create({
            containerEl: container,
            value: { hex: initialColor },
            on: {
                change: (value) => setColor(value.getValue().hex)
            }
        });

        return () => {
            pickerInstance.current?.destroy();
            pickerInstance.current = null;
        };
    }, []);

    useEffect(() => {
        if (pickerInstance.current) {
            pickerInstance.current.setValue({ hex: initialColor });
            setColor(initialColor);
        }
    }, [initialColor]);

    return (
        <div id='color-picker'>
            <div className='color-picker-container'/>
            <div className='right-block'>
                <div className='color-hsb-preview'>
                    <div className='new-color-hsb-preview' style={{ backgroundColor: color }}/>
                    <div className='current-color-hsb-preview' style={{ backgroundColor: initialColor }}/>
                </div>
                <a href='#' id='add-new-color' className='button button-round' onClick={() => onSelectColor(color)}>
                    {Device.ios ?
                        <SvgIcon slot="media" symbolId={IconPlusIos.id} className='icon icon-svg'/> :
                        <SvgIcon slot="media" symbolId={IconPlusAndroid.id} className='icon icon-svg white'/>
                    }
                </a>
            </div>
        </div>
    )
}