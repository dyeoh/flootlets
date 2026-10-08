/*
 * RadioGroup: choose exactly one of a few visible options, e.g. delivery or
 * pickup. Arrow keys move between options, as screen-reader users expect.
 */
import * as KRadioGroup from '@kobalte/core/radio-group';
import { For, Show, splitProps } from 'solid-js';
import { cn } from '../../lib/utils';
import {
  descriptionClass,
  errorClass,
  fieldClass,
  type FieldProps,
  labelClass,
  validationState,
} from '../Field/field';

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
      data-slot="radio-group"
      class={cn(fieldClass, local.class)}
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
        <KRadioGroup.Description class={descriptionClass}>
          {local.description}
        </KRadioGroup.Description>
      </Show>
      <div
        class="flex flex-col gap-3 data-[orientation=horizontal]:flex-row data-[orientation=horizontal]:flex-wrap data-[orientation=horizontal]:gap-6"
        data-orientation={local.orientation ?? 'vertical'}
      >
        <For each={local.options}>
          {(option) => (
            <KRadioGroup.Item
              value={option.value}
              disabled={option.disabled}
              class="flex flex-col gap-1.5 data-disabled:opacity-50"
            >
              <div class="flex items-center gap-3">
                {/* The real input is visually hidden; its keyboard focus shows on the circle. */}
                <KRadioGroup.ItemInput class="peer" />
                <KRadioGroup.ItemControl class="grid size-4 shrink-0 place-items-center rounded-full border border-input bg-background shadow-xs transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring data-checked:border-primary data-invalid:border-destructive dark:bg-input/30">
                  <KRadioGroup.ItemIndicator class="size-2 rounded-full bg-primary" />
                </KRadioGroup.ItemControl>
                <KRadioGroup.ItemLabel class="text-sm leading-none font-medium select-none">
                  {option.label}
                </KRadioGroup.ItemLabel>
              </div>
              <Show when={option.description}>
                <KRadioGroup.ItemDescription class={cn(descriptionClass, 'ps-7')}>
                  {option.description}
                </KRadioGroup.ItemDescription>
              </Show>
            </KRadioGroup.Item>
          )}
        </For>
      </div>
      <KRadioGroup.ErrorMessage class={errorClass}>{local.error}</KRadioGroup.ErrorMessage>
    </KRadioGroup.Root>
  );
}
