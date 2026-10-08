/*
 * Select: pick one option from a list, e.g. a size or a shipping option.
 * Built on Kobalte's Select: keyboard navigation, type-ahead, and a hidden
 * native <select> so the value is submitted with forms.
 */
import * as KSelect from '@kobalte/core/select';
import { Show, splitProps } from 'solid-js';
import { cx } from '../../lib/cx';
import { type FieldProps, labelClass, validationState } from '../Field/field';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends FieldProps {
  options: SelectOption[];
  /** The selected option's value (controlled). */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string | undefined) => void;
  placeholder?: string;
}

export function Select(props: SelectProps) {
  const [local] = splitProps(props, [
    'options',
    'value',
    'defaultValue',
    'onChange',
    'placeholder',
    'label',
    'hideLabel',
    'description',
    'error',
    'required',
    'disabled',
    'name',
    'class',
  ]);
  const find = (value: string | undefined) => local.options.find((o) => o.value === value);
  return (
    <KSelect.Root<SelectOption>
      class={cx('fl-field', 'fl-select', local.class)}
      data-required={local.required ? '' : undefined}
      options={local.options}
      optionValue="value"
      optionTextValue="label"
      optionDisabled="disabled"
      value={local.value === undefined ? undefined : (find(local.value) ?? null)}
      defaultValue={find(local.defaultValue)}
      onChange={(option) => local.onChange?.(option?.value)}
      placeholder={local.placeholder ?? 'Choose…'}
      name={local.name}
      required={local.required}
      disabled={local.disabled}
      validationState={validationState(local.error)}
      itemComponent={(item) => (
        <KSelect.Item item={item.item} class="fl-select__item">
          <KSelect.ItemLabel>{item.item.rawValue.label}</KSelect.ItemLabel>
          <KSelect.ItemIndicator class="fl-select__check" aria-hidden="true">
            ✓
          </KSelect.ItemIndicator>
        </KSelect.Item>
      )}
    >
      <KSelect.HiddenSelect />
      <KSelect.Label class={labelClass(local.hideLabel)}>{local.label}</KSelect.Label>
      <KSelect.Trigger class="fl-input fl-select__trigger">
        <KSelect.Value<SelectOption> class="fl-select__value">
          {(state) => state.selectedOption()?.label}
        </KSelect.Value>
        <KSelect.Icon class="fl-select__icon" aria-hidden="true">
          ▾
        </KSelect.Icon>
      </KSelect.Trigger>
      <Show when={local.description}>
        <KSelect.Description class="fl-field__description">{local.description}</KSelect.Description>
      </Show>
      <KSelect.ErrorMessage class="fl-field__error">{local.error}</KSelect.ErrorMessage>
      <KSelect.Portal>
        <KSelect.Content class="fl-select__content">
          <KSelect.Listbox class="fl-select__listbox" />
        </KSelect.Content>
      </KSelect.Portal>
    </KSelect.Root>
  );
}
