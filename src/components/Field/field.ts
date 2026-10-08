/*
 * Props and classes every form component shares. Kobalte links the label,
 * description and error message to the control (aria-labelledby /
 * aria-describedby) and sets aria-invalid when there's an error; these props
 * just feed it.
 */
import { cn } from '../../lib/utils';

export interface FieldProps {
  /** Visible label. Required: every form control needs a name. */
  label: string;
  /** Hide the label visually (it's still read by screen readers), e.g. in a cart row. */
  hideLabel?: boolean;
  /** Help text under the control. */
  description?: string;
  /** Error message. When set, the field is marked invalid and the message is announced with it. */
  error?: string;
  required?: boolean;
  disabled?: boolean;
  /** Form field name, so the value is submitted with a native form. */
  name?: string;
  class?: string;
}

export const validationState = (error?: string) => (error ? 'invalid' : 'valid');

/** The field wrapper: label, control, help text and error stacked. */
export const fieldClass = 'group/field flex flex-col gap-2 text-foreground';

/** Required fields get a red asterisk after a visible label. */
export const labelClass = (hidden?: boolean) =>
  hidden
    ? 'sr-only'
    : "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-required/field:after:text-destructive group-data-required/field:after:content-['*'] group-data-disabled/field:opacity-50";

export const descriptionClass = 'text-sm text-muted-foreground';

export const errorClass = 'text-sm font-medium text-destructive';

/**
 * The input box, as shadcn's Input. Invalid fields get a thicker destructive
 * border, so the state isn't shown by colour alone.
 */
export const inputClass = (...extra: (string | undefined)[]) =>
  cn(
    'flex h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow,border-color] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-offset-0 disabled:cursor-not-allowed disabled:opacity-50 data-disabled:opacity-50 aria-invalid:border-2 aria-invalid:border-destructive data-invalid:border-2 data-invalid:border-destructive md:text-sm dark:bg-input/30',
    ...extra,
  );
