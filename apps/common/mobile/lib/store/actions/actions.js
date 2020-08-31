export const RESET_USERS = 'RESET_USERS';

export const resetUsers = list => {
    return {
        type: RESET_USERS,
        payload: list
    }
};
