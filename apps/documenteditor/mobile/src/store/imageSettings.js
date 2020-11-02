import {action, observable, computed} from 'mobx';

export class storeImageSettings {
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

    getWrapType (imageObject) {
        const wrapping = imageObject.get_WrappingStyle();
        const imageWrapType = this.wrapTypesTransform().sdkToUi(wrapping);
        return imageWrapType;
    }

    transformToSdkWrapType (value) {
        const sdkType = this.wrapTypesTransform().uiToSdk(value);
        return sdkType;
    }

    getAlign (imageObject) {
        return imageObject.get_PositionH().get_Align();
    }

    getMoveText (imageObject) {
        return imageObject.get_PositionV().get_RelativeFrom() === Asc.c_oAscRelativeFromV.Paragraph;
    }

    getOverlap (imageObject) {
        return imageObject.get_AllowOverlap();
    }

    getWrapDistance (imageObject) {
        return imageObject.get_Paddings().get_Top();
    }
}