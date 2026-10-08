// Form components render on the server (Astro) with their labels in place.
import { renderToString } from 'solid-js/web';
import { expect, test } from 'vitest';
import { Checkbox, QuantityStepper, RadioGroup, Select, TextArea, TextField } from '../src';

test('form components render to HTML on the server', () => {
  const html = renderToString(() => (
    <form>
      <TextField label="Email" name="email" error="Enter an email address" />
      <TextArea label="Notes" />
      <Select
        label="Size"
        name="size"
        options={[{ value: 's', label: 'Small' }]}
        defaultValue="s"
      />
      <Checkbox label="Send me offers" name="offers" />
      <RadioGroup label="Delivery" options={[{ value: 'd', label: 'Delivery' }]} />
      <QuantityStepper label="Quantity" name="qty" defaultValue={2} max={5} />
    </form>
  ));
  for (const text of [
    'Email',
    'Enter an email address',
    'Notes',
    'Small',
    'Send me offers',
    'Delivery',
    'Quantity',
  ]) {
    expect(html).toContain(text);
  }
  expect(html).toContain('aria-invalid="true"');
  expect(html).toContain('role="spinbutton"');
});
