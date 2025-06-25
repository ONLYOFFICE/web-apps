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

export const DrawView = ({ currentTool, setTool, settings, setSettings, colors, addCustomColor, enableErasing }) => {
  const { t } = useTranslation();
  const _t = t('Draw', { returnObjects: true });
  const isDrawingTool = currentTool === 'pen' || currentTool === 'highlighter';

  return (
    <React.Fragment>
      {isDrawingTool && (<>
        <Sheet className='draw-sheet draw-sheet--color-picker' backdrop swipeToClose onSheetClosed={() => f7.sheet.open('.draw-sheet--settings')}>
          <div className='draw-sheet-label'><span>{_t.textCustomColor}</span></div>
          <WheelColorPicker
            initialColor={settings[currentTool].color}
            onSelectColor={(color) => {
              f7.sheet.close('.draw-sheet--color-picker')
              addCustomColor(color)
            }}
          />
        </Sheet>
        <Sheet className="draw-sheet draw-sheet--settings" backdrop swipeToClose style={{ height: 'auto' }}>
          <div id='swipe-handler' className='swipe-container'>
            <Icon icon='icon icon-swipe'/>
          </div>
          <div className='draw-sheet-label'><span>{_t.textColor}</span></div>
          <div className='draw-sheet--settings-colors'>
            <div className="draw-sheet--settings-colors-list">
              {colors.map((color, index) => (
                <div
                  key={index}
                  className="draw-sheet--settings-colors-list-item" style={{ backgroundColor: color }}
                  onClick={() => setSettings({ color })}
                  onTouchStart={() => setSettings({ color })}
                />
              ))}
              <div
                className="draw-sheet--settings-colors-list-add" style={{ backgroundColor: settings[currentTool].color }}
                onClick={() => {
                  f7.sheet.close('.draw-sheet--settings')
                  f7.sheet.open('.draw-sheet--color-picker')
                }}
              >
                <Icon icon="icon-plus"/>
              </div>
            </div>
          </div>
          <div className='draw-sheet-label'><span>{_t.textLineSize}</span></div>
          <div className='draw-sheet-item'>
            {/*{Device.android ? (*/}
            <Range
              min={0.5} max={10} step={0.5} value={settings[currentTool].lineSize}
              onRangeChange={(value) => setSettings({ lineSize: value })}
            />
            {/*) : (*/}
            {/*   <input className='line-size-range--ios' type='range' min={0.5} max={10} step={0.5} value={settings[currentTool].lineSize} onChange={(e) => setSettings({ lineSize: parseInt(e.target.value) })} />*/}
            {/* )}*/}
          </div>
          <div className='draw-sheet-label'><span>{_t.textOpacity}</span></div>
          <div className='draw-sheet-item'>
            <input style={{ '--color': settings[currentTool].color }}
                   className={Device.android ? 'opacity-range-input--android' : 'opacity-range-input--ios'} type='range' min={0} max={100} step={1}
                   value={settings[currentTool].opacity}
                   onChange={(e) => setSettings({ opacity: parseInt(e.target.value) })}/>
          </div>
        </Sheet>
      </>)}
      <div className="draw-toolbar">
        <div className="draw-toolbar-item">
          <Button type='button' fill={currentTool === 'pen'} onClick={() => setTool('pen')}>
            <SvgIcon symbolId={IconDrawPen.id} className='icon icon-svg'/>
          </Button>
        </div>
        <div className="draw-toolbar-item">
          <Button type='button' fill={currentTool === 'highlighter'} onClick={() => setTool('highlighter')}>
            <SvgIcon symbolId={IconDrawHighlighter.id} className='icon icon-svg'/>
          </Button>
        </div>
        <div className="draw-toolbar-item">
          <Button type='button' sheetOpen={isDrawingTool ? ".draw-sheet--settings" : undefined} disabled={!isDrawingTool}>
            <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50%" cy="50%" r="8" fill={settings[currentTool]?.color || '#808080'}/>
            </svg>
          </Button>
        </div>
        <div className="draw-toolbar-item">
          <div className='draw-toolbar-divider'/>
        </div>
        <div className="draw-toolbar-item">
          <Button type='button' disabled={!enableErasing} fill={currentTool === 'eraser'} onClick={() => setTool('eraser')}>
            <SvgIcon symbolId={IconClearObject.id} className='icon icon-svg'/>
          </Button>
        </div>
        <div className="draw-toolbar-item">
          <Button type='button' disabled={!enableErasing} onClick={() => setTool('eraseEntireScreen')}>
            <SvgIcon symbolId={IconClearAll.id} className='icon icon-svg'/>
          </Button>
        </div>
        <div className="draw-toolbar-item">
          <div className='draw-toolbar-divider'/>
        </div>
        <div className="draw-toolbar-item">
          <Button type='button' fill={currentTool === 'scroll'} onClick={() => setTool('scroll')} tabIndex='-1'>
            <SvgIcon symbolId={IconScroll.id} className='icon icon-svg'/>
          </Button>
        </div>
      </div>
    </React.Fragment>
  )
}

