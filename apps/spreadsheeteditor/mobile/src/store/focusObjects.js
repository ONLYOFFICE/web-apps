import {action, observable, computed} from 'mobx';

export class storeFocusObjects {
    @observable focusOn = undefined;

    @observable _focusObjects = [];

    @action resetFocusObjects(objects) {
        this.focusOn = 'obj';
        this._focusObjects = objects;
    }

    @computed get objects() {
        const _objects = [];
        for (let object of this._focusObjects) {
            const type = object.get_ObjectType();

            if (Asc.c_oAscTypeSelectElement.Paragraph == type) {
                _objects.push('text', 'paragraph');
            } else if (Asc.c_oAscTypeSelectElement.Table == type) {
                _objects.push('table');
            } else if (Asc.c_oAscTypeSelectElement.Image == type) {
                if (object.get_ObjectValue().get_ChartProperties()) {
                    _objects.push('chart');
                } else if (object.get_ObjectValue().get_ShapeProperties()) {
                    _objects.push('shape');
                } else {
                    _objects.push('image');
                }
            } else if (Asc.c_oAscTypeSelectElement.Hyperlink == type) {
                _objects.push('hyperlink');
            }
        }
        const resultArr = _objects.filter((value, index, self) => self.indexOf(value) === index); //get uniq array
        // Exclude shapes if chart exist
        if (resultArr.indexOf('chart') > -1) {
            resultArr.splice(resultArr.indexOf('shape'), 1);
        }
        return resultArr;
    }

    @observable _cellInfo;

    @action resetCellInfo (cellInfo) {
        this.focusOn = 'cell';
        this._cellInfo = cellInfo;
    }

    @computed get selections () {
        const _selections = [];

        let isCell, isRow, isCol, isAll, isChart, isImage, isTextShape, isShape, isTextChart,
            selType             = this._cellInfo.asc_getSelectionType(),
            isObjLocked         = false;

        switch (selType) {
            case Asc.c_oAscSelectionType.RangeCells:    isCell  = true; break;
            case Asc.c_oAscSelectionType.RangeRow:      isRow   = true; break;
            case Asc.c_oAscSelectionType.RangeCol:      isCol   = true; break;
            case Asc.c_oAscSelectionType.RangeMax:      isAll   = true; break;
            case Asc.c_oAscSelectionType.RangeImage:    isImage = true; break;
            case Asc.c_oAscSelectionType.RangeShape:    isShape = true; break;
            case Asc.c_oAscSelectionType.RangeChart:    isChart = true; break;
            case Asc.c_oAscSelectionType.RangeChartText:isTextChart = true; break;
            case Asc.c_oAscSelectionType.RangeShapeText: isTextShape = true; break;
        }

        if (isImage || isShape || isChart) {
            isImage = isShape = isChart = false;
            let has_chartprops = false;
            let selectedObjects = Common.EditorApi.get().asc_getGraphicObjectProps();

            for (let i = 0; i < selectedObjects.length; i++) {
                if (selectedObjects[i].asc_getObjectType() == Asc.c_oAscTypeSelectElement.Image) {
                    const elValue = selectedObjects[i].asc_getObjectValue();
                    isObjLocked = isObjLocked || elValue.asc_getLocked();
                    const shapeProps = elValue.asc_getShapeProperties();

                    if (shapeProps) {
                        if (shapeProps.asc_getFromChart()) {
                            isChart = true;
                        } else {
                            isShape = true;

                        }
                    } else if (elValue.asc_getChartProperties()) {
                        isChart = true;
                        has_chartprops = true;
                    } else {
                        isImage = true;
                    }
                }
            }
        } else if (isTextShape || isTextChart) {
            const selectedObjects = this.api.asc_getGraphicObjectProps();
            let isEquation = false;

            for (var i = 0; i < selectedObjects.length; i++) {
                const elType = selectedObjects[i].asc_getObjectType();
                if (elType == Asc.c_oAscTypeSelectElement.Image) {
                    const value = selectedObjects[i].asc_getObjectValue();
                    isObjLocked = isObjLocked || value.asc_getLocked();
                } else if (elType == Asc.c_oAscTypeSelectElement.Paragraph) {
                } else if (elType == Asc.c_oAscTypeSelectElement.Math) {
                    isEquation = true;
                }
            }
        }
        if (isChart || isTextChart) {
            _selections.push('chart');

            if (isTextChart) {
                _selections.push('text');
            }
        } else if ((isShape || isTextShape) && !isImage) {
            _selections.push('shape');

            if (isTextShape) {
                _selections.push('text');
            }
        } else if (isImage) {
            _selections.push('image');

            if (isShape) {
                _selections.push('shape');
            }
        } else {
            _selections.push('cell');

            if (this._cellInfo.asc_getHyperlink()) {
                _selections.push('hyperlink');
            }
        }
        return _selections;
    }

    @computed get shapeObject() {
        const shapes = [];
        console.log(this._focusObjects);
        for (let object of this._focusObjects) {
            if (object.get_ObjectType() === Asc.c_oAscTypeSelectElement.Image) {
                if (object.get_ObjectValue() && object.get_ObjectValue().get_ShapeProperties()) {
                    console.log(object);
                    shapes.push(object);    
                }
            }
        }
        if (shapes.length > 0) {
            const object = shapes[shapes.length - 1]; // get top
            return object.get_ObjectValue();
        } else {
            return undefined;
        }
    }

    @computed get imageObject() {
        const images = [];
        console.log(this._focusObjects);
        for (let object of this._focusObjects) {
            if (object.get_ObjectType() === Asc.c_oAscTypeSelectElement.Image) {
                console.log(object);
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
}