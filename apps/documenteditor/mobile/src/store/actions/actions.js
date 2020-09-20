import registerApi from '../ApiRegisterCallback';

export const INIT_API = 'INIT_API';
export const initApi = value => {
    return (dispatch, getState) => {
        registerApi(dispatch, getState, value);
        dispatch({
            type: INIT_API,
            api: value
        });
    }
};

// action of settings
export const RESET_PAGE_ORIENT = 'RESET_PAGE_ORIENT';
export const resetPageOrient = value => {
    return {
        type: RESET_PAGE_ORIENT,
        isPortrait: value
    }
};
export const changePageOrient = (value) => {
    return (dispatch, getState) => {
        const { api } = getState();
        if (api.apiObj) {
            api.apiObj.change_PageOrient(value);
        }
    };
};

