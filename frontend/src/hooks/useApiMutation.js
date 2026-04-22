import { useCallback, useState } from "react";
import { getApiErrorMessage } from "../utils/apiError";

export const useApiMutation = (mutator, options = {}) => {
  const { onSuccess, onError } = options;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const mutate = useCallback(
    async (...args) => {
      setIsLoading(true);
      setError("");

      try {
        const result = await mutator(...args);
        await onSuccess?.(result);
        return result;
      } catch (requestError) {
        const message = getApiErrorMessage(requestError, "Request failed.");
        setError(message);
        onError?.(requestError);
        throw requestError;
      } finally {
        setIsLoading(false);
      }
    },
    [mutator, onSuccess, onError]
  );

  return { mutate, isLoading, error, setError };
};

