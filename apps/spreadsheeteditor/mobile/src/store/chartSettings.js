import {action, observable, computed, makeObservable} from 'mobx';
import SvgIcon from '@common/lib/component/SvgIcon';
import Chart01 from '@common/resources/img/charts/chart-01.svg';
import Chart02 from '@common/resources/img/charts/chart-02.svg';
import Chart03 from '@common/resources/img/charts/chart-03.svg';
import Chart04 from '@common/resources/img/charts/chart-04.svg';
import Chart05 from '@common/resources/img/charts/chart-05.svg';
import Chart06 from '@common/resources/img/charts/chart-06.svg';
import Chart07 from '@common/resources/img/charts/chart-07.svg';
import Chart08 from '@common/resources/img/charts/chart-08.svg';
import Chart09 from '@common/resources/img/charts/chart-09.svg';
import Chart10 from '@common/resources/img/charts/chart-10.svg';
import Chart11 from '@common/resources/img/charts/chart-11.svg';
import Chart12 from '@common/resources/img/charts/chart-12.svg';
import Chart13 from '@common/resources/img/charts/chart-13.svg';
import Chart14 from '@common/resources/img/charts/chart-14.svg';
import Chart15 from '@common/resources/img/charts/chart-15.svg';
import Chart16 from '@common/resources/img/charts/chart-16.svg';
import Chart17 from '@common/resources/img/charts/chart-17.svg';
import Chart18 from '@common/resources/img/charts/chart-18.svg';
import Chart19 from '@common/resources/img/charts/chart-19.svg';
import Chart20 from '@common/resources/img/charts/chart-20.svg';
import Chart21 from '@common/resources/img/charts/chart-21.svg';
import Chart22 from '@common/resources/img/charts/chart-22.svg';
import Chart23 from '@common/resources/img/charts/chart-23.svg';
import Chart24 from '@common/resources/img/charts/chart-24.svg';
import Chart25 from '@common/resources/img/charts/chart-25.svg';
import Chart26 from '@common/resources/img/charts/chart-26.svg';
import Chart27 from '@common/resources/img/charts/chart-27.svg';
import Chart28 from '@common/resources/img/charts/chart-28.svg';
import Chart29 from '@common/resources/img/charts/chart-29.svg';
import Chart30 from '@common/resources/img/charts/chart-30.svg';
import Chart31 from '@common/resources/img/charts/chart-31.svg';
import Chart32 from '@common/resources/img/charts/chart-32.svg';
import Chart33 from '@common/resources/img/charts/chart-33.svg';
import Chart34 from '@common/resources/img/charts/chart-34.svg';
import Chart35 from '@common/resources/img/charts/chart-35.svg';
import Chart36 from '@common/resources/img/charts/chart-36.svg';
import Chart37 from '@common/resources/img/charts/chart-37.svg';
import Chart38 from '@common/resources/img/charts/chart-38.svg';

export class storeChartSettings {
    constructor() {
        makeObservable(this, {
            borderColor: observable,
            fillColor: observable,
            chartStyles: observable,
            setBorderColor: action,
            initBorderColor: action,
            setFillColor: action,
            getFillColor: action,
            clearChartStyles: action,
            updateChartStyles: action,
            styles: computed,
            types: computed,
        });
    }
    
    borderColor = undefined;

    setBorderColor (color) {
        this.borderColor = color;
    }

    initBorderColor(shapeProperties) {
        let stroke = shapeProperties.get_stroke();
        this.borderColor = (stroke && stroke.get_type() == Asc.c_oAscStrokeType.STROKE_COLOR) ? this.resetColor(stroke.get_color()) : 'transparent';
    }

    fillColor = undefined;

    setFillColor (color) {
        this.fillColor = color;
    }

    getFillColor (shapeProperties) {
        const fill = shapeProperties.asc_getFill();
        const fillType = fill.asc_getType();

        if (fillType == Asc.c_oAscFill.FILL_TYPE_SOLID) {
            this.fillColor = this.resetColor(fill.asc_getFill().asc_getColor());
        }

        return this.fillColor;
    }

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
        const _types = [
            { type: Asc.c_oAscChartTypeSettings.barNormal,               icon: Chart03.id},
            { type: Asc.c_oAscChartTypeSettings.barStacked,              icon: Chart02.id},
            { type: Asc.c_oAscChartTypeSettings.barStackedPer,           icon: Chart01.id},
            { type: Asc.c_oAscChartTypeSettings.barNormal3d,             icon: Chart17.id},
            { type: Asc.c_oAscChartTypeSettings.barStacked3d,            icon: Chart18.id},
            { type: Asc.c_oAscChartTypeSettings.barStackedPer3d,         icon: Chart19.id},
            { type: Asc.c_oAscChartTypeSettings.barNormal3dPerspective,  icon: Chart20.id},
            { type: Asc.c_oAscChartTypeSettings.lineNormal,              icon: Chart04.id},
            { type: Asc.c_oAscChartTypeSettings.lineStacked,             icon: Chart05.id},
            { type: Asc.c_oAscChartTypeSettings.lineStackedPer,          icon: Chart06.id},
            { type: Asc.c_oAscChartTypeSettings.lineNormalMarker,        icon: Chart29.id},
            { type: Asc.c_oAscChartTypeSettings.lineStackedMarker,       icon: Chart30.id},
            { type: Asc.c_oAscChartTypeSettings.lineStackedPerMarker,    icon: Chart31.id},
            { type: Asc.c_oAscChartTypeSettings.line3d,                  icon: Chart15.id},
            { type: Asc.c_oAscChartTypeSettings.pie,                     icon: Chart13.id},
            { type: Asc.c_oAscChartTypeSettings.doughnut,                icon: Chart14.id},
            { type: Asc.c_oAscChartTypeSettings.pie3d,                   icon: Chart22.id},
            { type: Asc.c_oAscChartTypeSettings.hBarNormal,              icon: Chart09.id},
            { type: Asc.c_oAscChartTypeSettings.hBarStacked,             icon: Chart08.id},
            { type: Asc.c_oAscChartTypeSettings.hBarStackedPer,          icon: Chart07.id},
            { type: Asc.c_oAscChartTypeSettings.hBarNormal3d,            icon: Chart25.id},
            { type: Asc.c_oAscChartTypeSettings.hBarStacked3d,           icon: Chart24.id},
            { type: Asc.c_oAscChartTypeSettings.hBarStackedPer3d,        icon: Chart23.id},
            { type: Asc.c_oAscChartTypeSettings.areaNormal,              icon: Chart12.id},
            { type: Asc.c_oAscChartTypeSettings.areaStacked,             icon: Chart11.id},
            { type: Asc.c_oAscChartTypeSettings.areaStackedPer,          icon: Chart10.id},
            { type: Asc.c_oAscChartTypeSettings.stock,                   icon: Chart16.id},
            { type: Asc.c_oAscChartTypeSettings.scatter,                 icon: Chart21.id},
            { type: Asc.c_oAscChartTypeSettings.scatterSmoothMarker,     icon: Chart32.id},
            { type: Asc.c_oAscChartTypeSettings.scatterSmooth,           icon: Chart33.id},
            { type: Asc.c_oAscChartTypeSettings.scatterLineMarker,       icon: Chart34.id},
            { type: Asc.c_oAscChartTypeSettings.scatterLine,             icon: Chart35.id},
            { type: Asc.c_oAscChartTypeSettings.radar,                   icon: Chart26.id},
            { type: Asc.c_oAscChartTypeSettings.radarMarker,             icon: Chart27.id},
            { type: Asc.c_oAscChartTypeSettings.radarFilled,             icon: Chart28.id},
            { type: Asc.c_oAscChartTypeSettings.comboBarLine,            icon: Chart36.id},
            { type: Asc.c_oAscChartTypeSettings.comboBarLineSecondary,   icon: Chart37.id},
            { type: Asc.c_oAscChartTypeSettings.comboAreaBar,            icon: Chart38.id},
        ];
        const columns = 3;
        let row = -1;
        const groups = [];
        _types.forEach((type, index) => {
            if (0 == index % columns) {
                groups.push([]);
                row++
            }
            groups[row].push(type);
        });
        return groups;
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

    resetColor(color) {
        let clr = 'transparent';

        if(color) {
            if (color.get_auto()) {
                clr = 'auto'
            } else {
                if (color.get_type() == Asc.c_oAscColor.COLOR_TYPE_SCHEME) {
                    clr = {
                        color: Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b()),
                        effectValue: color.get_value()
                    }
                } else {
                    clr = Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b());
                }
            }
        }

        return clr;
    }

}