/*
 * Checkbox: a labelled yes/no choice, e.g. "Send me offers". Built on
 * Kobalte's Checkbox, with a real (visually hidden) <input> for forms.
 */
import * as KCheckbox from '@kobalte/core/checkbox';
import { Show, splitProps } from 'solid-js';
import { cx } from '../../lib/cx';
import { type FieldProps, validationState } from '../Field/field';

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
      class={cx('fl-field', 'fl-checkbox', local.class)}
      checked={local.checked}
      defaultChecked={local.defaultChecked}
      onChange={local.onChange}
      name={local.name}
      value={local.value}
      required={local.required}
      disabled={local.disabled}
      validationState={validationState(local.error)}
    >
      <div class="fl-checkbox__row">
        <KCheckbox.Input class="fl-checkbox__input" />
        <KCheckbox.Control class="fl-checkbox__control">
          <KCheckbox.Indicator class="fl-checkbox__indicator" aria-hidden="true">
            ✓
          </KCheckbox.Indicator>
        </KCheckbox.Control>
        <KCheckbox.Label class="fl-checkbox__label">{local.label}</KCheckbox.Label>
      </div>
      <Show when={local.description}>
        <KCheckbox.Description class="fl-field__description fl-checkbox__aside">
          {local.description}
        </KCheckbox.Description>
      </Show>
      <KCheckbox.ErrorMessage class="fl-field__error fl-checkbox__aside">
        {local.error}
      </KCheckbox.ErrorMessage>
    </KCheckbox.Root>
  );
}
