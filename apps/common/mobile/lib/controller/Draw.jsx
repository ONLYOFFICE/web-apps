import React, { useEffect, useState } from 'react'
import { DrawView } from "../view/Draw";
import { inject, observer } from "mobx-react";
import { Device } from "../../utils/device";
import { LocalStorage } from '../../utils/LocalStorage.mjs';

const DEFAULT_TOOL_SETTINGS = { color: '#3D8A44', opacity: 100, lineSize: 1 }
const DEFAULT_ANDROID_COLORS = ['#FF0000', '#FFC000', '#FFFF00', '#92D050', '#00B050', '#00B0F0', '#0070C0', '#002060', '#C00000']
const DEFAULT_IOS_COLORS = []

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

  useEffect(() => {
    Common.Notifications.on('draw:start', () => {
      storeAppOptions.changeDrawMode(true);
      setCurrentToolAndApply('pen');
    })

    Common.Notifications.on('draw:stop', () => {
      storeAppOptions.changeDrawMode(false);
      setCurrentToolAndApply('scroll');
    })

    return () => {
      Common.Notifications.off('draw:start');
      Common.Notifications.off('draw:stop');
    }
  }, []);

  const createStroke = (color, lineSize, opacity) => {
    const stroke = new Asc.asc_CStroke();
    stroke.put_type(Asc.c_oAscStrokeType.STROKE_COLOR);
    stroke.put_color(Common.Utils.ThemeColor.getRgbColor(color));
    stroke.asc_putPrstDash(Asc.c_oDashType.solid);
    stroke.put_width(lineSize);
    stroke.put_transparent(opacity * 2.55);
    return stroke;
  };

  const toolActions = {
    pen: (api, settings) => api.asc_StartDrawInk(createStroke(settings.color, settings.lineSize, settings.opacity), 0),
    highlighter: (api, settings) => api.asc_StartDrawInk(createStroke(settings.color, settings.lineSize, 50), 1),
    eraser: (api) => api.asc_StartInkEraser(),
    eraseEntireScreen: (api) => {/* method */
    },
    scroll: (api) => api.asc_StopInkDrawer(),
  };

  const setCurrentToolAndApply = (tool) => {
    const api = Common.EditorApi.get();
    toolActions[tool]?.(api, toolSettings);
    setCurrentTool(tool);
  };

  const updateToolSettings = (newSettings) => {
    setToolSettings(prev => {
      const updatedSettings = { ...prev, ...newSettings };
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

  return storeAppOptions.isDrawMode ? <DrawView
    currentTool={currentTool}
    setTool={setCurrentToolAndApply}
    settings={toolSettings}
    setSettings={updateToolSettings}
    colors={colors}
    addCustomColor={addCustomColor}
  /> : null
}));