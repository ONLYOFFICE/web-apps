import React from "react";
import {Button, Range, Sheet} from 'framework7-react';
import SvgIcon from '../../../../common/mobile//lib/component/SvgIcon'
import IconDrawPen from '../../../../common/mobile/resources/icons/draw-pen.svg'
import IconDrawHighlighter from '../../../../common/mobile/resources/icons/draw-highlighter.svg'
import IconClearAll from '../../../../common/mobile/resources/icons/clear-all.svg'
import IconClearObject from '../../../../common/mobile/resources/icons/clear-object.svg'
import IconScroll from '../../../../common/mobile/resources/icons/scroll.svg'

export const DrawView = ({currentTool, setTool, showSettings, settings}) => {
    return (
        <React.Fragment>
            <Sheet className="draw__sheet">
                <div className='draw__sheet-item'>
                    Line size
                </div>
                <div className='draw__sheet-item'>
                    <Range min={0} max={100} step={1} value={10}/>
                </div>
            </Sheet>
            <div className="draw__buttons">
                <Button type='button' fill={currentTool === 'pen'} onClick={() => setTool('pen')}>
                    <SvgIcon symbolId={IconDrawPen.id} className='icon icon-svg'/>
                </Button>
                <Button type='button' fill={currentTool === 'highlighter'} onClick={() => setTool('highlighter')}>
                    <SvgIcon symbolId={IconDrawHighlighter.id} className='icon icon-svg'/>
                </Button>
                <Button type='button' onClick={showSettings}>
                    <svg width="22" height="22" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="50%" cy="50%" r="11" fill={`#${settings.color}`}/>
                    </svg>
                </Button>
                <div className='draw__divider'/>
                <Button type='button' disabled={false} fill={currentTool === 'eraser'}
                        onClick={() => setTool('eraser')}>
                    <SvgIcon symbolId={IconClearObject.id} className='icon icon-svg'/>
                </Button>
                <Button type='button' disabled={false} onClick={() => setTool('eraseEntireScreen')}>
                    <SvgIcon symbolId={IconClearAll.id} className='icon icon-svg'/>
                </Button>
                <div className='draw__divider'/>
                <Button type='button' fill={currentTool === 'scroll'} onClick={() => setTool('scroll')}>
                    <SvgIcon symbolId={IconScroll.id} className='icon icon-svg'/>
                </Button>
            </div>
        </React.Fragment>
    )
}

