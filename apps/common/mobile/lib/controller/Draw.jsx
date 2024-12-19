import React, {useEffect, useState} from 'react'
import {DrawView} from "../view/Draw";
import {f7} from 'framework7-react';

export const DrawController = ({isDrawing, setDrawing}) => {
    useEffect(() => {
        Common.Notifications.on('draw:start', () => {
            setDrawing(true);
            setCurrentToolProxy('pen');
        })

        Common.Notifications.on('draw:stop', () => {
            setDrawing(false);
            setCurrentToolProxy(null);
        })

        return () => {
            Common.Notifications.off('draw:start');
            Common.Notifications.off('draw:stop');
        }
    }, []);

    const [currentTool, setCurrentTool] = useState(null)
    const [settings, setSettings] = useState({color: 'ff0000', lineSize: 2, opacity: 100});
    // const penSettings = {
    //     highlighter: {color: 'FFFC54', opacity: 50, size: [2, 4, 6, 8, 10], idx: 1}
    // }

    const setCurrentToolProxy = val => {
        setCurrentTool(val);
        const api = Common.EditorApi.get();
        switch (val) {
            case 'pen': {
                const stroke = new Asc.asc_CStroke();
                stroke.put_type(Asc.c_oAscStrokeType.STROKE_COLOR);
                stroke.put_color(Common.Utils.ThemeColor.getRgbColor(settings.color)); // options.color
                stroke.asc_putPrstDash(Asc.c_oDashType.solid);
                stroke.put_width(settings.lineSize); // options.size.arr[options.size.idx]
                stroke.put_transparent(settings.opacity * 2.55);
                api.asc_StartDrawInk(stroke, 0);
                break;
            }
            case 'highlighter': { /* same as PEN (idx: 1) */
                const stroke = new Asc.asc_CStroke();
                stroke.put_type(Asc.c_oAscStrokeType.STROKE_COLOR);
                stroke.put_color(Common.Utils.ThemeColor.getRgbColor(settings.color));
                stroke.asc_putPrstDash(Asc.c_oDashType.solid);
                stroke.put_width(settings.lineSize);
                stroke.put_transparent(50 * 2.55);
                api.asc_StartDrawInk(stroke, 0);
                break
            }
            // 2 once buttons
            // case 'colorPicker': { break }
            case 'eraser': {
                api.asc_StartInkEraser();
                break
            }
            case 'eraseEntireScreen': {
                // method?
                break
            }
            case 'scroll':
                // scroll method?
            case null: {
                api.asc_StopInkDrawer();
                break
            }
        }
    }

    function showSettings() {
        f7.sheet.open('.draw__sheet')
    }

    return isDrawing ? <DrawView
        currentTool={currentTool}
        setTool={setCurrentToolProxy}
        settings={settings}
        setSettings={setSettings}
        showSettings={showSettings}
    /> : null
}