import React, { useEffect, useState } from 'react'
import { DrawView } from "../view/Draw";
import { inject, observer } from "mobx-react";
import { Device } from "../../utils/device";
import { LocalStorage } from '../../utils/LocalStorage.mjs';
import { f7 } from 'framework7-react';

const DEFAULT_TOOL_SETTINGS = {
    pen: { color: '#FF0000', opacity: 100, lineSize: 2 },
    highlighter: { color: '#FFFC54', opacity: 50, lineSize: 5 },
}
const DEFAULT_ANDROID_COLORS = ['#FF0000', '#FFC000', '#FFFF00', '#92D050', '#00B050', '#00B0F0', '#0070C0', '#002060', '#C00000']
const DEFAULT_IOS_COLORS = ['#FFFC54', '#72F54A', '#74F9FD', '#EB51F7', '#A900F9', '#FF0303', '#EF8B3A', '#D3D3D4', '#000000']

const createStroke = (color, lineSize, opacity) => {
    const stroke = new Asc.asc_CStroke();
    stroke.put_type(Asc.c_oAscStrokeType.STROKE_COLOR);
    stroke.put_color(Common.Utils.ThemeColor.getRgbColor(color));
    stroke.asc_putPrstDash(Asc.c_oDashType.solid);
    stroke.put_width(lineSize);
    stroke.put_transparent(opacity * 2.55);
    return stroke;
};

export const DrawController = inject('storeAppOptions')(observer(({ storeAppOptions }) => {
    const [currentTool, setCurrentTool] = useState(null);
    const [toolSettings, setToolSettings] = useState(() => {
        const stored = LocalStorage.getJson('draw-settings');
        return stored || DEFAULT_TOOL_SETTINGS;
    });
    const [colors, setColors] = useState(() => {
        const storageColors = LocalStorage.getJson('draw-colors', []);
        if (!storageColors.length) {
            return Device.android ? DEFAULT_ANDROID_COLORS : DEFAULT_IOS_COLORS
        }
        return storageColors
    })
    const [enableErasing, setEnableErasing] = useState(true);

    const onApiFocusObject = React.useCallback(() => {
        if (storeAppOptions.isDrawMode && currentTool !== 'scroll') {
            const api = Common.EditorApi.get();
            setEnableErasing(api.asc_HaveInks());
        }
    }, [storeAppOptions.isDrawMode, currentTool]);

    const toolActions = React.useMemo(() => ({
        pen: (api, settings) => api.asc_StartDrawInk(createStroke(settings.pen.color, settings.pen.lineSize, settings.pen.opacity)),
        highlighter: (api, settings) => api.asc_StartDrawInk(createStroke(settings.highlighter.color, settings.highlighter.lineSize, settings.highlighter.opacity)),
        eraser: (api) => api.asc_StartInkEraser(),
        eraseEntireScreen: (api) => api.asc_RemoveAllInks(),
        scroll: (api) => api.asc_StopInkDrawer(),
    }), []);

    useEffect(() => {
        const handleDrawStart = () => {
            storeAppOptions.changeDrawMode(true);
            setCurrentToolAndApply('pen');
        };

        const handleDrawStop = () => {
            storeAppOptions.changeDrawMode(false);
            setCurrentToolAndApply('scroll');
        };

        const handleEngineCreated = (api) => {
            api.asc_registerCallback(
                window.editorType === 'sse' ? 'asc_onSelectionChanged' : 'asc_onFocusObject',
                onApiFocusObject
            );
        };

        Common.Notifications.on('draw:start', handleDrawStart);
        Common.Notifications.on('draw:stop', handleDrawStop);
        Common.Notifications.on('engineCreated', handleEngineCreated);

        return () => {
            Common.Notifications.off('draw:start', handleDrawStart);
            Common.Notifications.off('draw:stop', handleDrawStop);
            Common.Notifications.off('engineCreated', handleEngineCreated);
        };
    }, [storeAppOptions, toolActions, toolSettings, onApiFocusObject]);

    const setCurrentToolAndApply = (tool) => {
        const api = Common.EditorApi.get();
        if (tool === 'eraseEntireScreen') {
            toolActions.eraseEntireScreen(api);
            toolActions[currentTool]?.(api, toolSettings);
            setEnableErasing(false);
        } else {
            setCurrentTool(tool);
            toolActions[tool]?.(api, toolSettings);
        }
    };

    const updateToolSettings = (newSettings) => {
        setToolSettings(prev => {
            const updatedSettings = { ...prev, [currentTool]: { ...prev[currentTool], ...newSettings } };
            const api = Common.EditorApi.get();
            toolActions[currentTool]?.(api, updatedSettings);
            LocalStorage.setJson('draw-settings', updatedSettings)
            return updatedSettings;
        });
    };

    const addCustomColor = (color) => {
        const updatedColors = [...colors, color]
        setColors(updatedColors)
        updateToolSettings({ color })
        LocalStorage.setJson('draw-colors', updatedColors)
    }

    const closeBackdropSheet = (e) => {
        e.preventDefault();
        f7.sheet.close();
    }

    const attachBackdropSwipeClose = () => {
        document.querySelector('.sheet-backdrop')?.addEventListener('touchmove', closeBackdropSheet);
    }

    const removeBackdropSwipeClose = () => {
        document.querySelector('.sheet-backdrop')?.removeEventListener('touchmove', closeBackdropSheet);
    }

    return storeAppOptions.isDrawMode ? <DrawView
        currentTool={currentTool}
        setTool={setCurrentToolAndApply}
        settings={toolSettings}
        setSettings={updateToolSettings}
        colors={colors}
        addCustomColor={addCustomColor}
        enableErasing={enableErasing}
        attachBackdropSwipeClose={attachBackdropSwipeClose}
        removeBackdropSwipeClose={removeBackdropSwipeClose}
    /> : null
}));