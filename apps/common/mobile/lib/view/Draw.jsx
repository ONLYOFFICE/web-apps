import React from "react";
import { useTranslation } from "react-i18next";
import { Button, f7, Icon, Range, Sheet } from 'framework7-react';
import SvgIcon from '../../../../common/mobile//lib/component/SvgIcon'
import IconDrawPen from '../../../../common/mobile/resources/icons/draw-pen.svg'
import IconDrawHighlighter from '../../../../common/mobile/resources/icons/draw-highlighter.svg'
import IconClearAll from '../../../../common/mobile/resources/icons/clear-all.svg'
import IconClearObject from '../../../../common/mobile/resources/icons/clear-object.svg'
import IconScroll from '../../../../common/mobile/resources/icons/scroll.svg'
import { WheelColorPicker } from "../component/WheelColorPicker";
import { Device } from "../../utils/device";

export const DrawView = ({ currentTool, setTool, settings, setSettings, colors, addCustomColor }) => {
  const { t } = useTranslation();
  const _t = t('Draw', { returnObjects: true });

  return (
    <React.Fragment>
      <Sheet className='draw-sheet draw-sheet--color-picker' swipeToClose onSheetClosed={() => f7.sheet.open('.draw-sheet--settings')}>
        <div className='draw-sheet-label'>{_t.textCustomColor}</div>
        <WheelColorPicker
          initialColor={settings.color}
          onSelectColor={(color) => {
            f7.sheet.close('.draw-sheet--color-picker')
            addCustomColor(color)
          }}
        />
      </Sheet>
      <Sheet className="draw-sheet draw-sheet--settings" swipeToClose style={{ height: 'auto' }}>
        <div id='swipe-handler' className='swipe-container'>
          <Icon icon='icon icon-swipe'/>
        </div>
        <div className='draw-sheet-label'>{_t.textColor}</div>
        <div className='draw-sheet--settings-colors'>
          <div className="draw-sheet--settings-colors-list">
            {colors.map((color, index) => (
              <div
                key={index} className="draw-sheet--settings-colors-list-item" style={{ backgroundColor: color }}
                onClick={() => setSettings({ color })}
              />
            ))}
            <div
              className="draw-sheet--settings-colors-list-add" style={{ backgroundColor: settings.color }}
              onClick={() => {
                f7.sheet.close('.draw-sheet--settings')
                f7.sheet.open('.draw-sheet--color-picker')
              }}
            >
              <Icon icon="icon-plus" />
            </div>
          </div>
        </div>
        <div className='draw-sheet-label'>{_t.textLineSize}</div>
        <div className='draw-sheet-item'>
          {Device.android ? (
            <Range
              min={0.5} max={10} step={0.5} value={settings.lineSize}
              onRangeChange={(value) => setSettings({ lineSize: value })}
            />
          ) : (
            <input className='line-size-range--ios' type='range' min={0.5} max={10} step={0.5} value={settings.lineSize} onChange={(e) => setSettings({ lineSize: parseInt(e.target.value) })} />
          )}
        </div>
        <div className='draw-sheet-label'>{_t.textOpacity}</div>
        <div className='draw-sheet-item'>
          <input style={{ '--color': settings.color }} className={Device.android ? 'opacity-range-input--android' : 'opacity-range-input--ios'} type='range' min={0} max={100} step={1} value={settings.opacity}
                 onChange={(e) => setSettings({ opacity: parseInt(e.target.value) })}/>
        </div>
      </Sheet>
      <div className="draw-toolbar">
        <Button type='button' fill={currentTool === 'pen'} onClick={() => setTool('pen')}>
          <SvgIcon symbolId={IconDrawPen.id} className='icon icon-svg'/>
        </Button>
        <Button type='button' fill={currentTool === 'highlighter'} onClick={() => setTool('highlighter')}>
          <SvgIcon symbolId={IconDrawHighlighter.id} className='icon icon-svg'/>
        </Button>
        <Button type='button' sheetOpen=".draw-sheet--settings">
          <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50%" cy="50%" r="8" fill={settings.color}/>
          </svg>
        </Button>
        <div className='draw-toolbar-divider'/>
        <Button type='button' disabled={false} fill={currentTool === 'eraser'} onClick={() => setTool('eraser')}>
          <SvgIcon symbolId={IconClearObject.id} className='icon icon-svg'/>
        </Button>
        <Button type='button' disabled={false} onClick={() => setTool('eraseEntireScreen')}>
          <SvgIcon symbolId={IconClearAll.id} className='icon icon-svg'/>
        </Button>
        <div className='draw-toolbar-divider'/>
        <Button type='button' fill={currentTool === 'scroll'} onClick={() => setTool('scroll')}>
          <SvgIcon symbolId={IconScroll.id} className='icon icon-svg'/>
        </Button>
      </div>
    </React.Fragment>
  )
}

