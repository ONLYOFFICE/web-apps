import {action, observable, computed} from 'mobx';

export class storeFocusObjects {
    @observable _focusObjects = [];
    @observable _headerType = 1;

    @action resetFocusObjects (objects) {
        this._focusObjects = objects;
    }

    @computed get settings() {
        let _settings = [];
        for (let object of this._focusObjects) {
            let type = object.get_ObjectType();
            if (Asc.c_oAscTypeSelectElement.Paragraph === type) {
                _settings.push('text', 'paragraph');
            } else if (Asc.c_oAscTypeSelectElement.Table === type) {
                _settings.push('table');
            } else if (Asc.c_oAscTypeSelectElement.Image === type) {
                if (object.get_ObjectValue().get_ChartProperties()) {
                    // Exclude shapes if chart exist
                    let si = _settings.indexOf('shape');
                    si < 0 ? _settings.push('chart') : _settings.splice(si,1,'chart');
                } else if (object.get_ObjectValue().get_ShapeProperties() && !_settings.includes('chart')) {
                    _settings.push('shape');
                } else {
                    _settings.push('image');
                }
            } else if (Asc.c_oAscTypeSelectElement.Hyperlink === type) {
                _settings.push('hyperlink');
            } else if (Asc.c_oAscTypeSelectElement.Header === type) {
                _settings.push('header');
            }
        }
        return _settings.filter((value, index, self) => self.indexOf(value) === index);
    }
    @computed get headerType() {
        for (let object of this._focusObjects) {
            let type = object.get_ObjectType();
            if (Asc.c_oAscTypeSelectElement.Header === type) {
                return object.get_ObjectValue().get_Type();
            }
        }
        return this._headerType;
    }
    @computed get paragraphObject() {
        let paragraphs = [];
        for (let object of this._focusObjects) {
            if (object.get_ObjectType() == Asc.c_oAscTypeSelectElement.Paragraph) {
                paragraphs.push(object);
            }
        }
        if (paragraphs.length > 0) {
            let object = paragraphs[paragraphs.length - 1]; // get top
            return object.get_ObjectValue();
        } else {
            return undefined;
        }
    }
}