
import * as actionTypes from '../actions/actions'

const settingsReducer = (state = [], action) => {
    if (action.type == actionTypes.SETTINGS_PAGE_ORIENTATION_CHANGED) {
        return {isPortrait: action.isPortrait};
    }

    return state;
};

export default settingsReducer;