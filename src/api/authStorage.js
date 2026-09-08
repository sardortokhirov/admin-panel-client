const TOKEN_KEY = 'authToken';
export const AUTH_UNAUTHORIZED_EVENT = 'auth:unauthorized';

function readStore(store) {
    try {
        return store.getItem(TOKEN_KEY);
    } catch {
        return null;
    }
}

function writeStore(store, value) {
    try {
        if (value == null) {
            store.removeItem(TOKEN_KEY);
        } else {
            store.setItem(TOKEN_KEY, value);
        }
        return true;
    } catch {
        return false;
    }
}

export function getAuthToken() {
    return readStore(window.localStorage) || readStore(window.sessionStorage);
}

export function setAuthToken(token) {
    writeStore(window.localStorage, token);
    writeStore(window.sessionStorage, token);
}

export function clearAuthToken() {
    writeStore(window.localStorage, null);
    writeStore(window.sessionStorage, null);
}

export function encodeBasicToken(username, password) {
    const raw = `${username}:${password}`;
    try {
        return btoa(raw);
    } catch {
        return btoa(unescape(encodeURIComponent(raw)));
    }
}

export function isAuthFailure(error) {
    return error?.response?.status === 401;
}

export function emitUnauthorized() {
    window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT));
}
