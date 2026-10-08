/*
 * Props every form component shares. Kobalte links the label, description and
 * error message to the control (aria-labelledby / aria-describedby) and sets
 * aria-invalid when there's an error; these props just feed it.
 */
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

export const labelClass = (hidden?: boolean) =>
  hidden ? 'fl-field__label fl-visually-hidden' : 'fl-field__label';
