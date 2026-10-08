import { Link } from 'flootlets';

export default function LinkExamples() {
  return (
    <p>
      Read our <Link href="#returns">returns policy</Link>, or track your parcel on{' '}
      <Link href="https://www.pos.com.my" external>
        Pos Malaysia
      </Link>
      .
    </p>
  );
}
