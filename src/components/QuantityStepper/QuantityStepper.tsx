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
import { cx } from '../../lib/cx';
import { type FieldProps, labelClass, validationState } from '../Field/field';

export interface QuantityStepperProps extends FieldProps {
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  /** Lowest allowed quantity. Defaults to 1; removing an item is a separate action. */
  min?: number;
  /** Highest allowed quantity, e.g. the stock left. */
  max?: number;
  step?: number;
  size?: 'sm' | 'md';
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

  const change = (value: number) => {
    if (Number.isNaN(value)) return;
    local.onChange?.(value);
    // Typing in the focused spinbutton is already announced; button presses aren't.
    if (typeof document !== 'undefined' && document.activeElement !== input) {
      setAnnouncement(`${local.label}: ${value}`);
    }
  };

  return (
    <KNumberField.Root
      class={cx('fl-field', 'fl-stepper', local.class)}
      data-size={local.size ?? 'md'}
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
      <div class="fl-stepper__control">
        <KNumberField.DecrementTrigger
          class="fl-stepper__button"
          aria-label={local.labels?.decrement ?? `Decrease ${local.label.toLowerCase()}`}
        >
          <span aria-hidden="true">−</span>
        </KNumberField.DecrementTrigger>
        <KNumberField.Input class="fl-stepper__input" inputMode="numeric" ref={input} />
        <KNumberField.IncrementTrigger
          class="fl-stepper__button"
          aria-label={local.labels?.increment ?? `Increase ${local.label.toLowerCase()}`}
        >
          <span aria-hidden="true">+</span>
        </KNumberField.IncrementTrigger>
      </div>
      <KNumberField.HiddenInput />
      <Show when={local.description}>
        <KNumberField.Description class="fl-field__description">
          {local.description}
        </KNumberField.Description>
      </Show>
      <KNumberField.ErrorMessage class="fl-field__error">{local.error}</KNumberField.ErrorMessage>
      <span class="fl-visually-hidden" aria-live="polite">
        {announcement()}
      </span>
    </KNumberField.Root>
  );
}
