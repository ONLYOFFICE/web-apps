import React, { createContext } from "react";
import AddView from "../../view/add/Add";

export const AddingContext = createContext();

const AddingController = props => {
    const api = Common.EditorApi.get();
    const cellinfo = api.asc_getCellInfo();
    const seltype = cellinfo.asc_getSelectionType();
    const iscelllocked = cellinfo.asc_getLocked();
    const isAddShapeHyperlink = api.asc_canAddShapeHyperlink();
    let options;

    if(!iscelllocked) {
        options = props.showOptions;

        if(!options) {
            switch(seltype) {
                case Asc.c_oAscSelectionType.RangeCells:
                case Asc.c_oAscSelectionType.RangeRow:
                case Asc.c_oAscSelectionType.RangeCol:
                case Asc.c_oAscSelectionType.RangeMax: break;
                case Asc.c_oAscSelectionType.RangeImage:
                case Asc.c_oAscSelectionType.RangeShape:
                case Asc.c_oAscSelectionType.RangeChart:
                case Asc.c_oAscSelectionType.RangeChartText:
                case Asc.c_oAscSelectionType.RangeShapeText:
                    options = {panels: ['image','shape']};
                    break;
            }
        }
    }

    return (
        <AddingContext.Provider value={{
            isAddShapeHyperlink,
            showPanels: options ? options.panels : undefined
        }}>
            <AddView showOptions={props.showOptions} />
        </AddingContext.Provider>
        
    )
}

export default AddingController;