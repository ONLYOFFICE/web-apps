import {action, observable, computed} from 'mobx';

export class storeChartSettings {

    @observable borderColor;

    setBorderColor (color) {
        this.borderColor = color;
    }

    @action initBorderColor(shapeProperties) {
        let stroke = shapeProperties.get_stroke();
        this.borderColor = (stroke && stroke.get_type() == Asc.c_oAscStrokeType.STROKE_COLOR) ? this.resetColor(stroke.get_color()) : 'transparent';
        return this.borderColor;
    }

    @observable fillColor = undefined;

    setFillColor (color) {
        this.fillColor = color;
    }

    @action getFillColor (shapeProperties) {
        const fill = shapeProperties.asc_getFill();
        const fillType = fill.asc_getType();

        if (fillType == Asc.c_oAscFill.FILL_TYPE_SOLID) {
            this.fillColor = this.resetColor(fill.asc_getFill().asc_getColor());
        }
    }

    @observable chartTitle = undefined;
    @observable chartLegend = undefined;
    @observable chartAxisHorTitle = undefined;
    @observable chartAxisVertTitle = undefined;
    @observable chartHorGridlines = undefined;
    @observable chartVertGridlines = undefined;
    @observable chartDataLabel = undefined;

    @action initChartLayout(chartProperties) {
        this.chartTitle = chartProperties.getTitle() ? chartProperties.getTitle() : 0;
        this.chartLegend = chartProperties.getLegendPos() ? chartProperties.getLegendPos() : 0;
        this.chartAxisHorTitle = chartProperties.getHorAxisLabel() ? chartProperties.getHorAxisLabel() : 0;
        this.chartAxisVertTitle = chartProperties.getVertAxisLabel() ? chartProperties.getVertAxisLabel() : 0;
        this.chartHorGridlines = chartProperties.getHorGridLines() ? chartProperties.getHorGridLines() : 0;
        this.chartVertGridlines = chartProperties.getVertGridLines() ? chartProperties.getVertGridLines() : 0;
        this.chartDataLabel = chartProperties.getDataLabelsPos() ? chartProperties.getDataLabelsPos() : 0;
    }

    @action changeChartTitle(value) {
        this.chartTitle = value;
    }

    @action changeChartLegend(value) {
        this.chartLegend = value;
    }

    @action changeChartAxisHorTitle(value) {
        this.chartAxisHorTitle = value;
    }

    @action changeChartAxisVertTitle(value) {
        this.chartAxisVertTitle = value;
    }

    @action changeChartHorGridlines(value) {
        this.chartHorGridlines = value;
    }

    @action changeChartVertGridlines(value) {
        this.chartVertGridlines = value;
    }

    @action changeChartDataLabel(value) {
        this.chartDataLabel = value;
    }

    @observable chartStyles = null;

    @action clearChartStyles () {
        this.chartStyles = null;
    }

    @action updateChartStyles (styles) {
        this.chartStyles = styles;
    }

    @computed get styles () {
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

    @computed get types () {
        const _types = [
            { type: Asc.c_oAscChartTypeSettings.barNormal,               thumb: 'bar-normal'},
            { type: Asc.c_oAscChartTypeSettings.barStacked,              thumb: 'bar-stacked'},
            { type: Asc.c_oAscChartTypeSettings.barStackedPer,           thumb: 'bar-pstacked'},
            { type: Asc.c_oAscChartTypeSettings.lineNormal,              thumb: 'line-normal'},
            { type: Asc.c_oAscChartTypeSettings.lineStacked,             thumb: 'line-stacked'},
            { type: Asc.c_oAscChartTypeSettings.lineStackedPer,          thumb: 'line-pstacked'},
            { type: Asc.c_oAscChartTypeSettings.hBarNormal,              thumb: 'hbar-normal'},
            { type: Asc.c_oAscChartTypeSettings.hBarStacked,             thumb: 'hbar-stacked'},
            { type: Asc.c_oAscChartTypeSettings.hBarStackedPer,          thumb: 'hbar-pstacked'},
            { type: Asc.c_oAscChartTypeSettings.areaNormal,              thumb: 'area-normal'},
            { type: Asc.c_oAscChartTypeSettings.areaStacked,             thumb: 'area-stacked'},
            { type: Asc.c_oAscChartTypeSettings.areaStackedPer,          thumb: 'area-pstacked'},
            { type: Asc.c_oAscChartTypeSettings.pie,                     thumb: 'pie'},
            { type: Asc.c_oAscChartTypeSettings.doughnut,                thumb: 'doughnut'},
            { type: Asc.c_oAscChartTypeSettings.pie3d,                   thumb: 'pie3d'},
            { type: Asc.c_oAscChartTypeSettings.scatter,                 thumb: 'scatter'},
            { type: Asc.c_oAscChartTypeSettings.stock,                   thumb: 'stock'},
            { type: Asc.c_oAscChartTypeSettings.line3d,                  thumb: 'line3d'},
            { type: Asc.c_oAscChartTypeSettings.barNormal3d,             thumb: 'bar3dnormal'},
            { type: Asc.c_oAscChartTypeSettings.barStacked3d,            thumb: 'bar3dstack'},
            { type: Asc.c_oAscChartTypeSettings.barStackedPer3d,         thumb: 'bar3dpstack'},
            { type: Asc.c_oAscChartTypeSettings.hBarNormal3d,            thumb: 'hbar3dnormal'},
            { type: Asc.c_oAscChartTypeSettings.hBarStacked3d,           thumb: 'hbar3dstack'},
            { type: Asc.c_oAscChartTypeSettings.hBarStackedPer3d,        thumb: 'hbar3dpstack'},
            { type: Asc.c_oAscChartTypeSettings.barNormal3dPerspective,  thumb: 'bar3dpsnormal'}
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