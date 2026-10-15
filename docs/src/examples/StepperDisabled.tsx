import { QuantityStepper } from 'flootlets';

// Sold out: the whole stepper dims, number included, and nothing steps.
export default function StepperDisabled() {
  return <QuantityStepper label="Quantity" defaultValue={1} disabled description="Sold out" />;
}
