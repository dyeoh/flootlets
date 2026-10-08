// Interactive parts, hydrated as an island: Select and Carousel from the registry.
import { For } from 'solid-js';
import { Carousel } from '@/components/ui/carousel';
import { Select } from '@/components/ui/select';

const sizes = ['S', 'M', 'L'].map((s) => ({ value: s, label: s }));

export default function Shop() {
  return (
    <>
      <Select label="Size" options={sizes} defaultValue="M" />
      <Carousel label="Recommended" itemCount={3}>
        <Carousel.Previous />
        <Carousel.Content>
          <For each={['One', 'Two', 'Three']}>
            {(name, i) => <Carousel.Item index={i()}>{name}</Carousel.Item>}
          </For>
        </Carousel.Content>
        <Carousel.Next />
        <Carousel.Dots />
      </Carousel>
    </>
  );
}
