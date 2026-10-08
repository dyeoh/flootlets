import { Price } from 'flootlets';

export default function PriceExamples() {
  return (
    <>
      <Price amount={{ amount: 2920, currency: 'MYR' }} locale="en-MY" />
      <Price
        amount={{ amount: 2500, currency: 'MYR' }}
        compareAt={{ amount: 3500, currency: 'MYR' }}
        locale="en-MY"
        size="lg"
      />
      <Price amount={{ amount: 500, currency: 'JPY' }} locale="ja-JP" />
      <Price amount={{ amount: 1250, currency: 'BHD' }} locale="en" />
      <Price amount={{ amount: 123456, currency: 'EUR' }} locale="de-DE" size="sm" />
    </>
  );
}
