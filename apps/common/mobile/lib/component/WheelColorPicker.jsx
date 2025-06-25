import React, { useEffect, useState } from 'react'
import { f7, Icon } from 'framework7-react';
import { Device } from '../../../../common/mobile/utils/device';
import SvgIcon from '@common/lib/component/SvgIcon'
import IconPlusIos from '@common-ios-icons/icon-plus.svg?ios';
import IconPlusAndroid from '@common-android-icons/icon-plus.svg?android';

export const WheelColorPicker = ({ initialColor = '#ffffff', onSelectColor }) => {
  const [color, setColor] = useState(initialColor);

  useEffect(() => {
    if (!document.getElementsByClassName('color-picker-wheel').length) {
      f7.colorPicker.create({
        containerEl: document.getElementsByClassName('color-picker-container')[0],
        value: { hex: initialColor },
        on: { change: (value) => setColor(value.getValue().hex) }
      });
    }
  });

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
          <SvgIcon slot="media" symbolId={IconPlusIos.id} className='icon icon-svg' /> :
          <SvgIcon slot="media" symbolId={IconPlusAndroid.id} className='icon icon-svg white' />
        } 
        </a>
      </div>
    </div>
  )
}