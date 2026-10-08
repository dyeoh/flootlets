import { Skeleton, Spinner, Stack } from 'flootlets';

export default function LoadingStates() {
  return (
    <>
      <Spinner size="sm" />
      <Spinner />
      <Spinner size="lg" label="Loading products" />
      <Stack gap={2} class="w-56" aria-busy="true">
        <Skeleton height="8rem" />
        <Skeleton shape="text" width="70%" />
        <Skeleton shape="text" width="40%" />
      </Stack>
    </>
  );
}
