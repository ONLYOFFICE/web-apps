import {action, observable, computed} from 'mobx';

export class storeChartSettings {
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
}