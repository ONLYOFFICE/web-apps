import { combineReducers } from 'redux';
import usersReducer from '../../../../../common/mobile/lib/store/users'

export const initialState = {
    users: []
};

export const rootReducer = combineReducers({
    users: usersReducer
});