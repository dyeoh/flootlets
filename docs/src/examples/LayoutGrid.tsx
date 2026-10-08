import { For, Show } from 'solid-js';
import { Badge, Cluster, Grid, Price, Stack } from 'flootlets';

const items = ['Kuih Lapis', 'Tudung Bawal', 'Baju Kurung', 'Kerepek Pisang'];

export default function LayoutGrid() {
  return (
    <Grid minItemWidth="9rem" gap={3} style={{ 'inline-size': '100%' }}>
      <For each={items}>
        {(name, i) => (
          <Stack
            gap={1}
            style={{
              padding: '1rem',
              border: '1px solid var(--fl-color-border)',
              'border-radius': '10px',
            }}
          >
            <strong>{name}</strong>
            <Cluster gap={2}>
              <Price
                amount={{ amount: 1000 + i() * 750, currency: 'MYR' }}
                locale="en-MY"
                size="sm"
              />
              <Show when={i() === 0}>
                <Badge tone="accent">New</Badge>
              </Show>
            </Cluster>
          </Stack>
        )}
      </For>
    </Grid>
  );
}
