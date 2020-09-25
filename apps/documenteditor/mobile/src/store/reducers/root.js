import { combineReducers } from 'redux';
import settingsReducer from './settings'
import usersReducer from '../../../../../common/mobile/lib/store/users'

export const initialState = {
    settings: {
        isPortrait: true
    },
    users: []
};

export const rootReducer = combineReducers({
    settings: settingsReducer,
    users: usersReducer
});