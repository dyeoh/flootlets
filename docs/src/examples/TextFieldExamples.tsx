import { createSignal } from 'solid-js';
import { Stack, TextArea, TextField } from 'flootlets';

export default function TextFieldExamples() {
  const [email, setEmail] = createSignal('siti@');
  const error = () =>
    /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email())
      ? undefined
      : 'Enter an email address, like siti@example.com';
  return (
    <Stack gap={5} style={{ 'inline-size': 'min(100%, 24rem)' }}>
      <TextField label="Full name" autocomplete="name" required />
      <TextField
        label="Email"
        type="email"
        autocomplete="email"
        description="We send your receipt here."
        value={email()}
        onChange={setEmail}
        error={error()}
      />
      <TextArea label="Order notes" description="Anything the shop should know?" autoResize />
    </Stack>
  );
}
