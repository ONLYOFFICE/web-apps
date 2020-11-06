import {action, observable, computed} from 'mobx';

export class storeChartSettings {
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
}