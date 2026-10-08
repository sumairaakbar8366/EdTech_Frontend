import { useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query';
import { useToast } from '@/components/ui/Toast/Toast';
import { errorMessage } from '@/lib/errors';

/**
 * A mutation with the app's standard feedback: a success toast, a refresh of the given
 * query keys, an optional follow-up, and an error toast. Features build their mutations on it.
 */
export function useAction<TVars, TResult = unknown>(
  fn: (vars: TVars) => Promise<TResult>,
  options: { success?: string | ((result: TResult) => string); invalidate?: QueryKey[]; onDone?: (result: TResult) => void; toastErrors?: boolean },
) {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: fn,
    onSuccess: (result) => {
      const message = typeof options.success === 'function' ? options.success(result) : options.success;
      if (message) toast.success(message);
      for (const key of options.invalidate ?? []) void queryClient.invalidateQueries({ queryKey: key });
      options.onDone?.(result);
    },
    onError: (error) => {
      if (options.toastErrors !== false) toast.error(errorMessage(error));
    },
  });
}
