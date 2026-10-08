import { Checkbox, RadioGroup, Stack } from 'flootlets';

export default function ChoiceExamples() {
  return (
    <Stack gap={6}>
      <RadioGroup
        label="How would you like it?"
        defaultValue="delivery"
        options={[
          { value: 'delivery', label: 'Delivery', description: 'Pos Laju, 2–4 working days' },
          { value: 'pickup', label: 'Pick up from the shop', description: 'Ready tomorrow' },
        ]}
      />
      <Checkbox
        label="Send me news and offers"
        description="About once a month. Unsubscribe any time."
      />
      <Checkbox label="I accept the terms" required error="Please accept the terms to continue" />
    </Stack>
  );
}
