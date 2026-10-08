import { createSignal } from 'solid-js';
import { Pagination, Stack } from 'flootlets';

export default function PaginationExample() {
  const [page, setPage] = createSignal(5);
  return (
    <Stack gap={4} align="center" style={{ 'inline-size': '100%' }}>
      {/* Links, as on a server-rendered product listing. */}
      <Pagination page={5} totalPages={12} href={(p) => `?page=${p}`} />
      {/* The gnerkulfloot API gives has_more instead of a total. */}
      <Pagination page={2} hasMore href={(p) => `?page=${p}`} />
      {/* Buttons, paging in place. */}
      <Pagination page={page()} totalPages={8} onPageChange={setPage} />
    </Stack>
  );
}
