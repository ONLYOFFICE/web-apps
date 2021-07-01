import {action, observable, computed, makeObservable} from 'mobx';

export class storeChartSettings {
    constructor() {
        makeObservable(this, {
            chartStyles: observable,
            fillColor: observable,
            borderColor: observable,
            clearChartStyles: action,
            updateChartStyles: action,
            styles: computed,
            types: computed,
            setFillColor: action,
            getFillColor: action,
            setBorderColor: action,
            initBorderColor: action
        });
    }

    wrapTypesTransform () {
        const map = [
            { ui:'inline', sdk: Asc.c_oAscWrapStyle2.Inline },
            { ui:'square', sdk: Asc.c_oAscWrapStyle2.Square },
            { ui:'tight', sdk: Asc.c_oAscWrapStyle2.Tight },
            { ui:'through', sdk: Asc.c_oAscWrapStyle2.Through },
            { ui:'top-bottom', sdk: Asc.c_oAscWrapStyle2.TopAndBottom },
            { ui:'behind', sdk: Asc.c_oAscWrapStyle2.Behind },
            { ui:'infront', sdk: Asc.c_oAscWrapStyle2.InFront }
        ];
        return {
            sdkToUi: function(type) {
                let record = map.filter(function(obj) {
                    return obj.sdk === type;
                })[0];
                return record ? record.ui : '';
            },

            uiToSdk: function(type) {
                let record = map.filter(function(obj) {
                    return obj.ui === type;
                })[0];
                return record ? record.sdk : 0;
            }
        }
    }

    getWrapType (chartObject) {
        const wrapping = chartObject.get_WrappingStyle();
        const chartWrapType = this.wrapTypesTransform().sdkToUi(wrapping);
        return chartWrapType;
    }

    transformToSdkWrapType (value) {
        const sdkType = this.wrapTypesTransform().uiToSdk(value);
        return sdkType;
    }

    getAlign (chartObject) {
        return chartObject.get_PositionH().get_Align();
    }

    getMoveText (chartObject) {
        return chartObject.get_PositionV().get_RelativeFrom() == Asc.c_oAscRelativeFromV.Paragraph;
    }

    getOverlap (chartObject) {
        return chartObject.get_AllowOverlap();
    }

    getWrapDistance (chartObject) {
        return chartObject.get_Paddings().get_Top();
    }

    // style

    chartStyles = null;

    clearChartStyles () {
        this.chartStyles = null;
    }

    updateChartStyles (styles) {
        this.chartStyles = styles;
    }

    get styles () {
        if (!this.chartStyles) return null;
        const widthContainer = document.querySelector(".page-content").clientWidth;
        const columns = parseInt(widthContainer / 70); // magic
        let row = -1;
        const styles = [];
        this.chartStyles.forEach((style, index) => {
            if (0 == index % columns) {
                styles.push([]);
                row++
            }
            styles[row].push(style);
        });
        return styles;
    }

    get types () {
        const types = [
            { type: Asc.c_oAscChartTypeSettings.barNormal,               thumb: 'chart-03.png'},
            { type: Asc.c_oAscChartTypeSettings.barStacked,              thumb: 'chart-02.png'},
            { type: Asc.c_oAscChartTypeSettings.barStackedPer,           thumb: 'chart-01.png'},
            { type: Asc.c_oAscChartTypeSettings.barNormal3d,             thumb: 'chart-17.png'},
            { type: Asc.c_oAscChartTypeSettings.barStacked3d,            thumb: 'chart-18.png'},
            { type: Asc.c_oAscChartTypeSettings.barStackedPer3d,         thumb: 'chart-19.png'},
            { type: Asc.c_oAscChartTypeSettings.barNormal3dPerspective,  thumb: 'chart-20.png'},
            { type: Asc.c_oAscChartTypeSettings.lineNormal,              thumb: 'chart-06.png'},
            { type: Asc.c_oAscChartTypeSettings.lineStacked,             thumb: 'chart-05.png'},
            { type: Asc.c_oAscChartTypeSettings.lineStackedPer,          thumb: 'chart-04.png'},
            { type: Asc.c_oAscChartTypeSettings.hBarNormal,              thumb: 'chart-09.png'},
            { type: Asc.c_oAscChartTypeSettings.hBarStacked,             thumb: 'chart-08.png'},
            { type: Asc.c_oAscChartTypeSettings.hBarStackedPer,          thumb: 'chart-07.png'},
            { type: Asc.c_oAscChartTypeSettings.hBarNormal3d,            thumb: 'chart-25.png'},
            { type: Asc.c_oAscChartTypeSettings.hBarStacked3d,           thumb: 'chart-24.png'},
            { type: Asc.c_oAscChartTypeSettings.hBarStackedPer3d,        thumb: 'chart-23.png'},
            { type: Asc.c_oAscChartTypeSettings.areaNormal,              thumb: 'chart-12.png'},
            { type: Asc.c_oAscChartTypeSettings.areaStacked,             thumb: 'chart-11.png'},
            { type: Asc.c_oAscChartTypeSettings.areaStackedPer,          thumb: 'chart-10.png'},
            { type: Asc.c_oAscChartTypeSettings.pie,                     thumb: 'chart-13.png'},
            { type: Asc.c_oAscChartTypeSettings.doughnut,                thumb: 'chart-14.png'},
            { type: Asc.c_oAscChartTypeSettings.pie3d,                   thumb: 'chart-22.png'},
            { type: Asc.c_oAscChartTypeSettings.scatter,                 thumb: 'chart-15.png'},
            { type: Asc.c_oAscChartTypeSettings.stock,                   thumb: 'chart-16.png'},
            { type: Asc.c_oAscChartTypeSettings.line3d,                  thumb: 'chart-21.png'},
        ];
        const columns = 3;
        const arr = [];
        let row = -1;
        types.forEach((type, index) => {
            if (0 == index % columns) {
                arr.push([]);
                row++
            }
            arr[row].push(type);
        });
        return arr;
    }

    // Fill Color

    fillColor = undefined;

    setFillColor (color) {
        this.fillColor = color;
    }

    getFillColor (shapeProperties) {
        let fill = shapeProperties.get_fill();
        const fillType = fill.get_type();
        let color = 'transparent';
        if (fillType == Asc.c_oAscFill.FILL_TYPE_SOLID) {
            fill = fill.get_fill();
            const sdkColor = fill.get_color();
            if (sdkColor) {
                if (sdkColor.get_type() == Asc.c_oAscColor.COLOR_TYPE_SCHEME) {
                    color = {color: Common.Utils.ThemeColor.getHexColor(sdkColor.get_r(), sdkColor.get_g(), sdkColor.get_b()), effectValue: sdkColor.get_value()};
                } else {
                    color = Common.Utils.ThemeColor.getHexColor(sdkColor.get_r(), sdkColor.get_g(), sdkColor.get_b());
                }
            }
        }
        this.fillColor = color;
        return color;
    }

    // Border size and border color

    borderColor;

    setBorderColor (color) {
        this.borderColor = color;
    }

    initBorderColor (stroke) {
        let color = 'transparent';
        if (stroke && stroke.get_type() == Asc.c_oAscStrokeType.STROKE_COLOR) {
            const sdkColor = stroke.get_color();
            if (sdkColor) {
                if (sdkColor.get_type() == Asc.c_oAscColor.COLOR_TYPE_SCHEME) {
                    color = {color: Common.Utils.ThemeColor.getHexColor(sdkColor.get_r(), sdkColor.get_g(), sdkColor.get_b()), effectValue: sdkColor.get_value()};
                }
                else {
                    color = Common.Utils.ThemeColor.getHexColor(sdkColor.get_r(), sdkColor.get_g(), sdkColor.get_b());
                }
            }
        }
        this.borderColor = color;
        return color;
    }

    borderSizeTransform () {
        const _sizes = [0, 0.5, 1, 1.5, 2.25, 3, 4.5, 6];

        return {
            sizeByIndex: function (index) {
                if (index < 1) return _sizes[0];
                if (index > _sizes.length - 1) return _sizes[_sizes.length - 1];
                return _sizes[index];
            },

            indexSizeByValue: function (value) {
                let index = 0;
                _sizes.forEach((size, idx) => {
                    if (Math.abs(size - value) < 0.25) {
                        index = idx;
                    }
                });
                return index;
            },

            sizeByValue: function (value) {
                return _sizes[this.indexSizeByValue(value)];
            }
        }
    }
}