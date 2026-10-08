/*
 * TextField and TextArea: labelled text inputs with help text and errors,
 * built on Kobalte's TextField (labels, descriptions and aria-invalid wired up).
 */
import * as KTextField from '@kobalte/core/text-field';
import { type ComponentProps, type JSX, Show, splitProps } from 'solid-js';
import { cn } from '../../lib/utils';
import {
  descriptionClass,
  errorClass,
  fieldClass,
  type FieldProps,
  inputClass,
  labelClass,
  validationState,
} from '../Field/field';

const FIELD_KEYS = [
  'label',
  'hideLabel',
  'description',
  'error',
  'required',
  'disabled',
  'name',
  'class',
  'value',
  'defaultValue',
  'onChange',
] as const;

interface TextValueProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
}

export interface TextFieldProps
  extends
    FieldProps,
    TextValueProps,
    Omit<JSX.InputHTMLAttributes<HTMLInputElement>, keyof FieldProps | keyof TextValueProps> {}

/** A single-line text input. Extra attributes (type, autocomplete, inputmode…) go to the <input>. */
export function TextField(props: TextFieldProps) {
  const [local, input] = splitProps(props, FIELD_KEYS);
  return (
    <KTextField.Root
      data-slot="text-field"
      class={cn(fieldClass, local.class)}
      data-required={local.required ? '' : undefined}
      value={local.value}
      defaultValue={local.defaultValue}
      onChange={local.onChange}
      name={local.name}
      required={local.required}
      disabled={local.disabled}
      validationState={validationState(local.error)}
    >
      <KTextField.Label class={labelClass(local.hideLabel)}>{local.label}</KTextField.Label>
      {/* Solid types event targets precisely; Kobalte's polymorphic parts use Element. */}
      <KTextField.Input
        class={inputClass()}
        {...(input as ComponentProps<typeof KTextField.Input>)}
      />
      <Show when={local.description}>
        <KTextField.Description class={descriptionClass}>
          {local.description}
        </KTextField.Description>
      </Show>
      <KTextField.ErrorMessage class={errorClass}>{local.error}</KTextField.ErrorMessage>
    </KTextField.Root>
  );
}

export interface TextAreaProps
  extends
    FieldProps,
    TextValueProps,
    Omit<JSX.TextareaHTMLAttributes<HTMLTextAreaElement>, keyof FieldProps | keyof TextValueProps> {
  /** Grow with the text instead of scrolling. */
  autoResize?: boolean;
}

/** A multi-line text input, e.g. order notes. */
export function TextArea(props: TextAreaProps) {
  const [local, textarea] = splitProps(props, [...FIELD_KEYS, 'autoResize']);
  return (
    <KTextField.Root
      data-slot="text-area"
      class={cn(fieldClass, local.class)}
      data-required={local.required ? '' : undefined}
      value={local.value}
      defaultValue={local.defaultValue}
      onChange={local.onChange}
      name={local.name}
      required={local.required}
      disabled={local.disabled}
      validationState={validationState(local.error)}
    >
      <KTextField.Label class={labelClass(local.hideLabel)}>{local.label}</KTextField.Label>
      <KTextField.TextArea
        class={inputClass('h-auto min-h-24 resize-y py-2')}
        autoResize={local.autoResize}
        {...(textarea as ComponentProps<typeof KTextField.TextArea>)}
      />
      <Show when={local.description}>
        <KTextField.Description class={descriptionClass}>
          {local.description}
        </KTextField.Description>
      </Show>
      <KTextField.ErrorMessage class={errorClass}>{local.error}</KTextField.ErrorMessage>
    </KTextField.Root>
  );
}
