import { useAuth } from '@clerk/clerk-react';
import { useCallback } from 'react';
import axios from 'axios';

export function useApi() {
    const { getToken } = useAuth();

    const authHeaders = useCallback(async () => {
        const token = await getToken();
        return { Authorization: `Bearer ${token}` };
    }, [getToken]);

    const get = useCallback(async (url, config = {}) => {
        const headers = await authHeaders();
        const { data } = await axios.get(url, { ...config, headers: { ...headers, ...config.headers } });
        return data;
    }, [authHeaders]);

    const post = useCallback(async (url, body, config = {}) => {
        const headers = await authHeaders();
        const { data } = await axios.post(url, body, { ...config, headers: { ...headers, ...config.headers } });
        return data;
    }, [authHeaders]);

    const put = useCallback(async (url, body, config = {}) => {
        const headers = await authHeaders();
        const { data } = await axios.put(url, body, { ...config, headers: { ...headers, ...config.headers } });
        return data;
    }, [authHeaders]);

    const patch = useCallback(async (url, body, config = {}) => {
        const headers = await authHeaders();
        const { data } = await axios.patch(url, body, { ...config, headers: { ...headers, ...config.headers } });
        return data;
    }, [authHeaders]);

    const del = useCallback(async (url, config = {}) => {
        const headers = await authHeaders();
        const { data } = await axios.delete(url, { ...config, headers: { ...headers, ...config.headers } });
        return data;
    }, [authHeaders]);

    return { get, post, put, patch, del, authHeaders };
}
