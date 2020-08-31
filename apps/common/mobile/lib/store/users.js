import * as actionTypes from './actions/actions'

const usersReducer = (state = [], action) => {
    if (action.type == actionTypes.RESET_USERS) {
        return [...action.payload];
    }

    return state;
};

export default usersReducer