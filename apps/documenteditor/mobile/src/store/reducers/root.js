import { combineReducers } from 'redux';
import apiReducer from "./initApi";
import usersReducer from '../../../../../common/mobile/lib/store/users'
import settingsReducer from './settings'

export const initialState = {
    users: []
};

export const rootReducer = combineReducers({
    api: apiReducer,
    users: usersReducer,
    settings: settingsReducer
});