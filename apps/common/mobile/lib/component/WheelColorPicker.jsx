import React, { useEffect, useState } from 'react'
import { f7, Icon } from 'framework7-react';

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
          <Icon icon='icon-plus' slot="media"/>
        </a>
      </div>
    </div>
  )
}