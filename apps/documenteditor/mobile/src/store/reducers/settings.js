import { RESET_PAGE_ORIENT } from '../actions/actions'

const settingsReducer = (state = [], action) => {
    if (action.type == RESET_PAGE_ORIENT) {
        return Object.assign({}, state, {
            isPortrait: action.isPortrait
        });
    }
    return state;
};

export default settingsReducer ;