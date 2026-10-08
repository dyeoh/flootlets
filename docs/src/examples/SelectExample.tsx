import { createSignal } from 'solid-js';
import { Select, Stack } from 'flootlets';

const sizes = [
  { value: 's', label: 'Small' },
  { value: 'm', label: 'Medium' },
  { value: 'l', label: 'Large' },
  { value: 'xl', label: 'Extra large (sold out)', disabled: true },
];

export default function SelectExample() {
  const [size, setSize] = createSignal<string>();
  return (
    <Stack gap={2} class="w-full max-w-72">
      <Select
        label="Size"
        options={sizes}
        value={size()}
        onChange={setSize}
        placeholder="Choose a size"
      />
      <span>Selected: {size() ?? 'nothing yet'}</span>
    </Stack>
  );
}
