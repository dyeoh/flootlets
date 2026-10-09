/*
 * QuantityStepper: choose how many of something, e.g. in a cart row.
 * Built on Kobalte's NumberField: the input is a spinbutton (arrow keys, Page
 * Up/Down, Home/End), −/+ disable themselves at the limits, and you can type
 * a number. Fixes from earlier projects: the input is labelled, `max` is
 * respected, and button presses are announced (focus is on the button then,
 * so the spinbutton's own announcement wouldn't be heard).
 */
import * as KNumberField from '@kobalte/core/number-field';
import { createSignal, Show, splitProps } from 'solid-js';
import { MinusIcon, PlusIcon } from '../../lib/icons';
import { cn } from '../../lib/utils';
import {
  descriptionClass,
  errorClass,
  fieldClass,
  type FieldProps,
  labelClass,
  validationState,
} from '../Field/field';

export interface QuantityStepperProps extends FieldProps {
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  /** Lowest allowed quantity. Defaults to 1; removing an item is a separate action. */
  min?: number;
  /** Highest allowed quantity, e.g. the stock left. */
  max?: number;
  step?: number;
  size?: 'sm' | 'default';
  /** Labels for the − and + buttons, for translation. */
  labels?: { decrement?: string; increment?: string };
}

export function QuantityStepper(props: QuantityStepperProps) {
  const [local] = splitProps(props, [
    'value',
    'defaultValue',
    'onChange',
    'min',
    'max',
    'step',
    'size',
    'labels',
    'label',
    'hideLabel',
    'description',
    'error',
    'required',
    'disabled',
    'name',
    'class',
  ]);
  const [announcement, setAnnouncement] = createSignal('');
  let input: HTMLInputElement | undefined;

  // Kobalte also reports the value it starts with (and re-reports it), so only
  // a real change reaches onChange: a caller that writes it back on every call
  // (a cart re-rendering its rows) would otherwise loop.
  // eslint-disable-next-line solid/reactivity -- the starting value, read once
  let current = local.value ?? local.defaultValue ?? local.min ?? 1;
  const change = (value: number) => {
    if (Number.isNaN(value) || value === (local.value ?? current)) return;
    current = value;
    local.onChange?.(value);
    // Typing in the focused spinbutton is already announced; button presses aren't.
    if (typeof document !== 'undefined' && document.activeElement !== input) {
      setAnnouncement(`${local.label}: ${value}`);
    }
  };

  return (
    <KNumberField.Root
      data-slot="quantity-stepper"
      class={cn(fieldClass, 'group/stepper', local.class)}
      data-size={local.size ?? 'default'}
      data-required={local.required ? '' : undefined}
      // `value` is Kobalte's controlled prop (rawValue only reports); a default
      // applies only when uncontrolled, or it would override the caller's value.
      value={local.value}
      defaultValue={local.value === undefined ? (local.defaultValue ?? local.min ?? 1) : undefined}
      onRawValueChange={change}
      minValue={local.min ?? 1}
      maxValue={local.max}
      step={local.step ?? 1}
      format={false}
      name={local.name}
      required={local.required}
      disabled={local.disabled}
      validationState={validationState(local.error)}
    >
      <KNumberField.Label class={labelClass(local.hideLabel)}>{local.label}</KNumberField.Label>
      <div class="inline-flex w-fit items-stretch rounded-md border border-input bg-transparent shadow-xs focus-within:border-ring group-data-invalid/stepper:border-2 group-data-invalid/stepper:border-destructive dark:bg-input/30">
        <KNumberField.DecrementTrigger
          class="grid size-9 place-items-center rounded-md text-foreground transition-colors group-data-[size=sm]/stepper:size-8 hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
          aria-label={local.labels?.decrement ?? `Decrease ${local.label.toLowerCase()}`}
        >
          <MinusIcon class="size-4" />
        </KNumberField.DecrementTrigger>
        <KNumberField.Input
          class="w-[3.5ch] min-w-10 bg-transparent text-center text-sm font-medium tabular-nums focus-visible:-outline-offset-2"
          inputMode="numeric"
          ref={input}
        />
        <KNumberField.IncrementTrigger
          class="grid size-9 place-items-center rounded-md text-foreground transition-colors group-data-[size=sm]/stepper:size-8 hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
          aria-label={local.labels?.increment ?? `Increase ${local.label.toLowerCase()}`}
        >
          <PlusIcon class="size-4" />
        </KNumberField.IncrementTrigger>
      </div>
      <KNumberField.HiddenInput />
      <Show when={local.description}>
        <KNumberField.Description class={descriptionClass}>
          {local.description}
        </KNumberField.Description>
      </Show>
      <KNumberField.ErrorMessage class={errorClass}>{local.error}</KNumberField.ErrorMessage>
      <span class="sr-only" aria-live="polite">
        {announcement()}
      </span>
    </KNumberField.Root>
  );
}
