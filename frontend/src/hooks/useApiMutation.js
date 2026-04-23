import { useCallback, useEffect, useRef, useState } from "react";
import { getApiErrorMessage } from "../utils/apiError";

export const useApiMutation = (mutator, options = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const mutate = useCallback(
    async (...args) => {
      setIsLoading(true);
      setError("");

      try {
        const result = await mutator(...args);
        await optionsRef.current.onSuccess?.(result);
        return result;
      } catch (requestError) {
        const message = getApiErrorMessage(requestError, "Request failed.");
        setError(message);
        optionsRef.current.onError?.(requestError);
        throw requestError;
      } finally {
        setIsLoading(false);
      }
    },
    [mutator]
  );

  return { mutate, isLoading, error, setError };
};
