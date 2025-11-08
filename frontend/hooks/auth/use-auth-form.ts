import { useCallback, useMemo, useRef, useState } from "react";

type ValidationFn = (value: string) => string | null;

type FieldConfig = {
  validationFn?: ValidationFn;
  requiredMessage?: string;
};

type Config<TFieldNames extends string> = Record<TFieldNames, FieldConfig>;

type FieldState = {
  value: string;
  error: string | null;
  setValue: (value: string) => void;
  handleBlur: () => void;
  ref: React.RefObject<HTMLInputElement>;
};

type UseAuthFormReturn<TFieldNames extends string> = {
  fieldState: Record<TFieldNames, FieldState>;
  isLoading: boolean;
  formError: string | null;
  handleSubmit: (onValid: () => Promise<void>) => Promise<void>;
  focusFirstField: () => () => void;
};

function defaultValidationMessage(fieldName: string) {
  return `${fieldName[0].toUpperCase()}${fieldName.slice(1)} is required`;
}

export function useAuthForm<TFieldNames extends string>(
  config: Config<TFieldNames>,
): UseAuthFormReturn<TFieldNames> {
  const fieldNames = useMemo(() => Object.keys(config) as TFieldNames[], [config]);
  const [values, setValues] = useState<Record<TFieldNames, string>>(() => {
    return fieldNames.reduce((acc, field) => {
      acc[field] = "";
      return acc;
    }, {} as Record<TFieldNames, string>);
  });
  const [errors, setErrors] = useState<Record<TFieldNames, string | null>>(() => {
    return fieldNames.reduce((acc, field) => {
      acc[field] = null;
      return acc;
    }, {} as Record<TFieldNames, string | null>);
  });
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const refs = useMemo(() => {
    return fieldNames.reduce((acc, field) => {
      acc[field] = { current: null } as React.RefObject<HTMLInputElement>;
      return acc;
    }, {} as Record<TFieldNames, React.RefObject<HTMLInputElement>>);
  }, [fieldNames]);

  const validateField = useCallback(
    (field: TFieldNames, value: string): string | null => {
      const { validationFn, requiredMessage } = config[field] ?? {};
      const trimmed = value.trim();

      if (!trimmed) {
        return requiredMessage ?? defaultValidationMessage(field);
      }

      if (validationFn) {
        return validationFn(trimmed);
      }

      return null;
    },
    [config],
  );

  const setValue = useCallback(
    (field: TFieldNames, value: string) => {
      setValues((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: null }));
      setFormError(null);
    },
    [],
  );

  const focusFirstField = useCallback(() => {
    const firstField = fieldNames[0];
    const ref = refs[firstField];
    const timeout = window.setTimeout(() => {
      ref?.current?.focus();
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [fieldNames, refs]);

  const handleSubmit = useCallback(
    async (onValid: () => Promise<void>) => {
      setIsLoading(true);
      setFormError(null);

      const nextErrors: Record<TFieldNames, string | null> = { ...errors };
      let hasError = false;

      fieldNames.forEach((field) => {
        const error = validateField(field, values[field]);
        nextErrors[field] = error;
        if (error) {
          hasError = true;
        }
      });

      setErrors(nextErrors);

      if (hasError) {
        setIsLoading(false);
        throw new Error("validation-failed");
      }

      try {
        await onValid();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Something went wrong. Please try again.";
        setFormError(message);
        setIsLoading(false);
        throw error;
      }

      setIsLoading(false);
    },
    [errors, fieldNames, validateField, values],
  );

  const fieldState = useMemo(() => {
    return fieldNames.reduce((acc, field) => {
      acc[field] = {
        value: values[field],
        error: errors[field],
        setValue: (value: string) => setValue(field, value),
        handleBlur: () => {
          const error = validateField(field, values[field]);
          setErrors((prev) => ({ ...prev, [field]: error }));
        },
        ref: refs[field],
      };
      return acc;
    }, {} as Record<TFieldNames, FieldState>);
  }, [errors, fieldNames, refs, setValue, validateField, values]);

  return {
    fieldState,
    isLoading,
    formError,
    handleSubmit,
    focusFirstField,
  };
}

