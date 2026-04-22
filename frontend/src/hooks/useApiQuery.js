import { useCallback, useEffect, useRef, useState } from "react";
import { getApiErrorMessage } from "../utils/apiError";

export const useApiQuery = (fetcher, deps = [], options = {}) => {
  const { enabled = true, initialData = null, onSuccess } = options;
  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(Boolean(enabled));
  const [error, setError] = useState("");
  const requestIdRef = useRef(0);

  const refetch = useCallback(async () => {
    if (!enabled) {
      return;
    }

    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    setError("");

    try {
      const response = await fetcher();
      if (requestId !== requestIdRef.current) {
        return;
      }
      setData(response);
      onSuccess?.(response);
    } catch (requestError) {
      if (requestId !== requestIdRef.current) {
        return;
      }
      setError(getApiErrorMessage(requestError, "Unable to load data."));
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [enabled, onSuccess, fetcher, ...deps]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, setData, isLoading, error, refetch };
};

