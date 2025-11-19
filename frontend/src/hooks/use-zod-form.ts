import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, UseFormProps } from 'react-hook-form';
import { z } from 'zod';

interface UseZodFormProps<T extends z.ZodType>
  extends Omit<UseFormProps<z.infer<T>>, 'resolver'> {
  schema: T;
}

export function useZodForm<T extends z.ZodType>({
  schema,
  ...formProps
}: UseZodFormProps<T>) {
  return useForm({
    ...formProps,
    resolver: zodResolver(schema),
  });
}
