import { useCallback, useEffect, useState } from 'react';
import api, { errMsg } from '../api/client';

// GET helper: const { data, loading, error, reload } = useApi('/manager/products', { status })
export default function useApi(url, params) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const key = JSON.stringify(params || {});

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(url, { params: JSON.parse(key) });
      setData(res.data);
      setError('');
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setLoading(false);
    }
  }, [url, key]);

  useEffect(() => { reload(); }, [reload]);
  return { data, loading, error, reload };
}
