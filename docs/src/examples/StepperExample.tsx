import { createSignal } from 'solid-js';
import { Cluster, Price, QuantityStepper } from 'flootlets';

// Only 5 left in stock, so + stops at 5.
export default function StepperExample() {
  const [qty, setQty] = createSignal(1);
  return (
    <Cluster gap={6} align="end">
      <QuantityStepper
        label="Quantity"
        value={qty()}
        onChange={setQty}
        max={5}
        description="5 left"
      />
      <Price amount={{ amount: 1290 * qty(), currency: 'MYR' }} locale="en-MY" size="lg" />
    </Cluster>
  );
}
