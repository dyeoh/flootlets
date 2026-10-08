/*
 * Checkbox: a labelled yes/no choice, e.g. "Send me offers". Built on
 * Kobalte's Checkbox, with a real (visually hidden) <input> for forms.
 */
import * as KCheckbox from '@kobalte/core/checkbox';
import { Show, splitProps } from 'solid-js';
import { CheckIcon } from '../../lib/icons';
import { cn } from '../../lib/utils';
import {
  descriptionClass,
  errorClass,
  fieldClass,
  type FieldProps,
  validationState,
} from '../Field/field';

export interface CheckboxProps extends Omit<FieldProps, 'hideLabel'> {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  /** Value submitted with the form when checked. Defaults to "on". */
  value?: string;
}

export function Checkbox(props: CheckboxProps) {
  const [local] = splitProps(props, [
    'label',
    'description',
    'error',
    'required',
    'disabled',
    'name',
    'class',
    'checked',
    'defaultChecked',
    'onChange',
    'value',
  ]);
  return (
    <KCheckbox.Root
      data-slot="checkbox"
      class={cn(fieldClass, 'data-disabled:opacity-50', local.class)}
      checked={local.checked}
      defaultChecked={local.defaultChecked}
      onChange={local.onChange}
      name={local.name}
      value={local.value}
      required={local.required}
      disabled={local.disabled}
      validationState={validationState(local.error)}
    >
      <div class="flex items-center gap-3">
        {/* The real input is visually hidden; its keyboard focus shows on the box. */}
        <KCheckbox.Input class="peer" />
        <KCheckbox.Control class="grid size-4 shrink-0 place-items-center rounded-[4px] border border-input bg-background text-primary-foreground shadow-xs transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring data-checked:border-primary data-checked:bg-primary data-indeterminate:border-primary data-indeterminate:bg-primary data-invalid:border-destructive dark:bg-input/30">
          <KCheckbox.Indicator>
            <CheckIcon class="size-3.5" />
          </KCheckbox.Indicator>
        </KCheckbox.Control>
        <KCheckbox.Label class="text-sm leading-none font-medium select-none">
          {local.label}
        </KCheckbox.Label>
      </div>
      <Show when={local.description}>
        <KCheckbox.Description class={cn(descriptionClass, 'ps-7')}>
          {local.description}
        </KCheckbox.Description>
      </Show>
      <KCheckbox.ErrorMessage class={cn(errorClass, 'ps-7')}>{local.error}</KCheckbox.ErrorMessage>
    </KCheckbox.Root>
  );
}
