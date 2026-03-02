import { useState, useEffect } from 'react';
import { julkaisu, media_images } from '@xcomrade/types-server';

interface UseAPIOptions {
  immediate?: boolean; // Execute immediately on mount
}

interface UseAPIReturn<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
}

/**
 * Custom hook for handling API calls with loading and error states
 * @param apiFunction - The API function to call
 * @param options - Options for the hook
 */
export function useAPI<T>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: UseAPIOptions = { immediate: false }
): UseAPIReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = async (...args: any[]): Promise<T | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await apiFunction(...args);
      setData(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An error occurred');
      setError(error);
      console.error('API Error:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setData(null);
    setError(null);
    setIsLoading(false);
  };

  useEffect(() => {
    if (options.immediate) {
      execute();
    }
  }, []);

  return { data, isLoading, error, execute, reset };
}

/**
 * Hook for handling form submissions with loading and error states
 */
export function useFormSubmit<T, P>(
  submitFunction: (data: P) => Promise<T>
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [success, setSuccess] = useState(false);

  const submit = async (data: P): Promise<T | null> => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await submitFunction(data);
      setSuccess(true);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Submission failed');
      setError(error);
      console.error('Submit Error:', error);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setError(null);
    setSuccess(false);
    setIsSubmitting(false);
  };

  return { submit, isSubmitting, error, success, reset };
}
const postImages = async (
  image: julkaisu,
  input: Record<string, any>,
  token: string
) => {

    const formData = new FormData();
    formData.append('image', JSON.stringify(image));
    for (const key in input) {
      formData.append(key, input[key]);
    }
    const contentData = {
      imagekuvaus: image.kuvaus,
      julkaisuId: image.Date_ajakohta.getTime(),
      ...input,
    };
    formData.append('contentData', JSON.stringify(contentData));
    const options = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(contentData),
    };
    const response = await fetch(
      import.meta.env.BASE_URL +'upload',
      options
    );
    return response.json() as Promise<media_images>;
};
const useContent= () => {
  const postContents = async (contents: julkaisu[]| media_images[], token: string) => {
    const formData = new FormData();
    formData.append('contents', JSON.stringify(contents));
    const options = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    };
    return await fetch(
      import.meta.env.BASE_URL +'upload',
      options
    ).then(res => res.json());
  };

  return { postContents };
};
export { postImages, useContent };

export default {useAPI};
