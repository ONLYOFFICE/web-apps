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
        const _settings = [];
        let no_text = true;
        for (let object of this._focusObjects) {
            const type = object.get_ObjectType(),
                objectValue = object.get_ObjectValue();
            if (Asc.c_oAscTypeSelectElement.Paragraph == type) {
                if ( !objectValue.get_Locked() )
                    no_text = false;
            } else if (Asc.c_oAscTypeSelectElement.Table == type) {
                if ( !objectValue.get_Locked() ) {
                    _settings.push('table');
                    no_text = false;
                }
            } else if (Asc.c_oAscTypeSelectElement.Slide == type) {
                if ( !(objectValue.get_LockLayout() || objectValue.get_LockBackground() || objectValue.get_LockTransition() || objectValue.get_LockTiming() ))
                    _settings.push('slide');
            } else if (Asc.c_oAscTypeSelectElement.Image == type) {
                if ( !objectValue.get_Locked() )
                    _settings.push('image');
            } else if (Asc.c_oAscTypeSelectElement.Chart == type) {
                if ( !objectValue.get_Locked() )
                    _settings.push('chart');
            } else if (Asc.c_oAscTypeSelectElement.Shape == type && !objectValue.get_FromChart()) {
                if ( !objectValue.get_Locked() ) {
                    _settings.push('shape');
                    no_text = false;
                }
            } else if (Asc.c_oAscTypeSelectElement.Hyperlink == type) {
                _settings.push('hyperlink');
            }
        }
        if (!no_text && _settings.indexOf('image') < 0)
            _settings.unshift('text');
        const resultArr = _settings.filter((value, index, self) => self.indexOf(value) === index); //get uniq array
        // Exclude hyperlink if text is locked
        if (resultArr.indexOf('hyperlink') > -1 && resultArr.indexOf('text') < 0) {
            resultArr.splice(resultArr.indexOf('hyperlink'), 1);
        }
        // Exclude shapes if chart exist
        if (resultArr.indexOf('chart') > -1 && resultArr.indexOf('shape') > -1) {
            resultArr.splice(resultArr.indexOf('shape'), 1);
        }
        return resultArr;
    }

    get slideObject() {
        const slides = [];
        for (let object of this._focusObjects) {
            if (object.get_ObjectType() === Asc.c_oAscTypeSelectElement.Slide) {
                slides.push(object);
            }
        }
        if (slides.length > 0) {
            const object = slides[slides.length - 1]; // get top
            return object.get_ObjectValue();
        } else {
            return undefined;
        }
    }

    get paragraphObject() {
        const paragraphs = [];
        for (let object of this._focusObjects) {
            if (object.get_ObjectType() === Asc.c_oAscTypeSelectElement.Paragraph) {
                paragraphs.push(object);
            }
        }
        if (paragraphs.length > 0) {
            const object = paragraphs[paragraphs.length - 1]; // get top
            return object.get_ObjectValue();
        } else {
            return undefined;
        }
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
        const shapes = [];
        for (let object of this._focusObjects) {
            if (object.get_ObjectType() === Asc.c_oAscTypeSelectElement.Shape) {
                shapes.push(object);
            }
        }
        if (shapes.length > 0) {
            const object = shapes[shapes.length - 1]; // get top
            return object.get_ObjectValue();
        } else {
            return undefined;
        }
    }

    get imageObject() {
        const images = [];
        for (let object of this._focusObjects) {
            if (object.get_ObjectType() == Asc.c_oAscTypeSelectElement.Image && object.get_ObjectValue()) {
                images.push(object);
            }
        }
        if (images.length > 0) {
            const object = images[images.length - 1]; // get top
            return object.get_ObjectValue();
        } else {
            return undefined;
        }
    }

    get tableObject() {
        const tables = [];
        for (let object of this._focusObjects) {
            if (object.get_ObjectType() == Asc.c_oAscTypeSelectElement.Table) {
                tables.push(object);
            }
        }
        if (tables.length > 0) {
            const object = tables[tables.length - 1]; // get top table
            return object.get_ObjectValue();
        } else {
            return undefined;
        }
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
        const charts = [];
        
        for (let object of this._focusObjects) {
            if (object.get_ObjectType() == Asc.c_oAscTypeSelectElement.Chart) {
                charts.push(object);
            }
        }

        if (charts.length > 0) {
            const object = charts[charts.length - 1]; // get top
            return object.get_ObjectValue();
        } else {
            return undefined;
        }
    }

    get linkObject() {
        const links = [];
        for (let object of this._focusObjects) {
            if (object.get_ObjectType() == Asc.c_oAscTypeSelectElement.Hyperlink) {
                links.push(object);
            }
        }
        if (links.length > 0) {
            const object = links[links.length - 1]; // get top
            return  object.get_ObjectValue();
        } else {
            return undefined;
        }
    }
}