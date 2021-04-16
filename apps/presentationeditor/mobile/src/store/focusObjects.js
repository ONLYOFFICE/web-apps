import {action, observable, computed, makeObservable} from 'mobx';

export class storeFocusObjects {
    constructor() {
        makeObservable(this, {
            _focusObjects: observable,
            resetFocusObjects: action,
            settings: computed,
            slideObject: computed,
            paragraphObject: computed,
            paragraphLocked: computed,
            shapeObject: computed,
            imageObject: computed,
            tableObject: computed,
            isTableInStack: computed,
            chartObject: computed,
            linkObject: computed
        });
    }

    _focusObjects = [];

    resetFocusObjects(objects) {
        this._focusObjects = objects;
    }

    get settings() {
        return !!this.intf ? this.intf.filterFocusObjects() : null;
    }

    get slideObject() {
        return !!this.intf ? this.intf.getSlideObject() : null;
    }

    get paragraphObject() {
        return !!this.intf ? this.intf.getParagraphObject() : null;
    }

    get paragraphLocked() {
        let _paragraphLocked = false;
        for (let object of this._focusObjects) {
            if (Asc.c_oAscTypeSelectElement.Paragraph == object.get_ObjectType()) {
                _paragraphLocked = object.get_ObjectValue().get_Locked();
            }
        }
        return _paragraphLocked;
    }

    get shapeObject() {
        return !!this.intf ? this.intf.getShapeObject() : null;
    }

    get imageObject() {
        return !!this.intf ? this.intf.getImageObject() : null;
    }

    get tableObject() {
        return !!this.intf ? this.intf.getTableObject() : null;
    }

    get isTableInStack() {
        for (let object of this._focusObjects) {
            if (object.get_ObjectType() == Asc.c_oAscTypeSelectElement.Table) {
                return true;
            }
        }
        return false;
    }

    get chartObject() {
        return !!this.intf ? this.intf.getChartObject() : null;
    }

    get linkObject() {
        return !!this.intf ? this.intf.getLinkObject() : null;
    }
}