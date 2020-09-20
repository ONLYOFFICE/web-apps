import { INIT_API } from '../actions/actions'

const apiReducer = (state = [], action) => {
    if (action.type == INIT_API) {
        return Object.assign({}, state, {
            apiObj: action.api
        });
    }
    return state;
};

export default apiReducer ;