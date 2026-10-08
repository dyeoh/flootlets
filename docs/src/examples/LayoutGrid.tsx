import { For, Show } from 'solid-js';
import { Badge, Cluster, Grid, Price, Stack } from 'flootlets';

const items = ['Kuih Lapis', 'Tudung Bawal', 'Baju Kurung', 'Kerepek Pisang'];

export default function LayoutGrid() {
  return (
    <Grid minItemWidth="9rem" gap={3} class="w-full">
      <For each={items}>
        {(name, i) => (
          <Stack gap={1} class="rounded-lg border p-4">
            <strong>{name}</strong>
            <Cluster gap={2}>
              <Price
                amount={{ amount: 1000 + i() * 750, currency: 'MYR' }}
                locale="en-MY"
                size="sm"
              />
              <Show when={i() === 0}>
                <Badge>New</Badge>
              </Show>
            </Cluster>
          </Stack>
        )}
      </For>
    </Grid>
  );
}
