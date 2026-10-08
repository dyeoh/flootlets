/*
 * RadioGroup: choose exactly one of a few visible options, e.g. delivery or
 * pickup. Arrow keys move between options, as screen-reader users expect.
 */
import * as KRadioGroup from '@kobalte/core/radio-group';
import { For, Show, splitProps } from 'solid-js';
import { cx } from '../../lib/cx';
import { type FieldProps, labelClass, validationState } from '../Field/field';

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps extends FieldProps {
  options: RadioOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  orientation?: 'vertical' | 'horizontal';
}

export function RadioGroup(props: RadioGroupProps) {
  const [local] = splitProps(props, [
    'options',
    'value',
    'defaultValue',
    'onChange',
    'orientation',
    'label',
    'hideLabel',
    'description',
    'error',
    'required',
    'disabled',
    'name',
    'class',
  ]);
  return (
    <KRadioGroup.Root
      class={cx('fl-field', 'fl-radio-group', local.class)}
      data-required={local.required ? '' : undefined}
      value={local.value}
      defaultValue={local.defaultValue}
      onChange={local.onChange}
      orientation={local.orientation ?? 'vertical'}
      name={local.name}
      required={local.required}
      disabled={local.disabled}
      validationState={validationState(local.error)}
    >
      <KRadioGroup.Label class={labelClass(local.hideLabel)}>{local.label}</KRadioGroup.Label>
      <Show when={local.description}>
        <KRadioGroup.Description class="fl-field__description">
          {local.description}
        </KRadioGroup.Description>
      </Show>
      <div class="fl-radio-group__items" data-orientation={local.orientation ?? 'vertical'}>
        <For each={local.options}>
          {(option) => (
            <KRadioGroup.Item value={option.value} disabled={option.disabled} class="fl-radio">
              <div class="fl-radio__row">
                <KRadioGroup.ItemInput class="fl-radio__input" />
                <KRadioGroup.ItemControl class="fl-radio__control">
                  <KRadioGroup.ItemIndicator class="fl-radio__indicator" />
                </KRadioGroup.ItemControl>
                <KRadioGroup.ItemLabel class="fl-radio__label">
                  {option.label}
                </KRadioGroup.ItemLabel>
              </div>
              <Show when={option.description}>
                <KRadioGroup.ItemDescription class="fl-field__description fl-radio__aside">
                  {option.description}
                </KRadioGroup.ItemDescription>
              </Show>
            </KRadioGroup.Item>
          )}
        </For>
      </div>
      <KRadioGroup.ErrorMessage class="fl-field__error">{local.error}</KRadioGroup.ErrorMessage>
    </KRadioGroup.Root>
  );
}
