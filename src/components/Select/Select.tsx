/*
 * Select: pick one option from a list, e.g. a size or a shipping option.
 * Built on Kobalte's Select: keyboard navigation, type-ahead, and a hidden
 * native <select> so the value is submitted with forms.
 */
import * as KSelect from '@kobalte/core/select';
import { Show, splitProps } from 'solid-js';
import { CheckIcon, ChevronDownIcon } from '../../lib/icons';
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
      data-slot="select"
      class={cn(fieldClass, local.class)}
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
        <KSelect.Item
          item={item.item}
          class="relative flex w-full items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-none select-none data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:bg-accent data-highlighted:text-accent-foreground"
        >
          <KSelect.ItemLabel>{item.item.rawValue.label}</KSelect.ItemLabel>
          <KSelect.ItemIndicator class="absolute right-2 flex size-3.5 items-center justify-center">
            <CheckIcon class="size-4" />
          </KSelect.ItemIndicator>
        </KSelect.Item>
      )}
    >
      <KSelect.HiddenSelect />
      <KSelect.Label class={labelClass(local.hideLabel)}>{local.label}</KSelect.Label>
      <KSelect.Trigger class={inputClass('items-center justify-between gap-2 py-2 text-start')}>
        <KSelect.Value<SelectOption> class="truncate data-placeholder-shown:text-muted-foreground">
          {(state) => state.selectedOption()?.label}
        </KSelect.Value>
        <KSelect.Icon class="text-muted-foreground transition-transform in-data-expanded:rotate-180 motion-reduce:transition-none">
          <ChevronDownIcon class="size-4 opacity-50" />
        </KSelect.Icon>
      </KSelect.Trigger>
      <Show when={local.description}>
        <KSelect.Description class={descriptionClass}>{local.description}</KSelect.Description>
      </Show>
      <KSelect.ErrorMessage class={errorClass}>{local.error}</KSelect.ErrorMessage>
      <KSelect.Portal>
        {/* Portalled to <body>, so it sets its own colours rather than inheriting the field's. */}
        <KSelect.Content class="relative z-50 min-w-(--kb-popper-anchor-width) origin-(--kb-select-content-transform-origin) overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-expanded:animate-fade-in motion-reduce:animate-none">
          <KSelect.Listbox class="max-h-72 overflow-y-auto p-1" />
        </KSelect.Content>
      </KSelect.Portal>
    </KSelect.Root>
  );
}
