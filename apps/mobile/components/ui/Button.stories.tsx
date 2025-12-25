/**
 * Button Component Stories
 *
 * AI App Development powered by ServiceVision (https://www.servicevision.net)
 */

import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import Button from './Button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary'],
      description: 'Visual style variant',
    },
    size: {
      control: 'select',
      options: ['default', 'small'],
      description: 'Button size',
    },
    loading: {
      control: 'boolean',
      description: 'Show loading spinner',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable button',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Stretch to full width',
    },
  },
  decorators: [
    (Story) => (
      <View style={{ padding: 16 }}>
        <Story />
      </View>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Button>;

/** Primary button - main call to action */
export const Primary: Story = {
  args: {
    children: 'Begin Your Journey',
    variant: 'primary',
    size: 'default',
  },
};

/** Secondary button - alternative action */
export const Secondary: Story = {
  args: {
    children: 'Learn More',
    variant: 'secondary',
    size: 'default',
  },
};

/** Tertiary button - subtle action */
export const Tertiary: Story = {
  args: {
    children: 'Skip for now',
    variant: 'tertiary',
    size: 'default',
  },
};

/** Small button */
export const Small: Story = {
  args: {
    children: 'View Details',
    variant: 'primary',
    size: 'small',
  },
};

/** Loading state */
export const Loading: Story = {
  args: {
    children: 'Saving...',
    variant: 'primary',
    loading: true,
  },
};

/** Disabled state */
export const Disabled: Story = {
  args: {
    children: 'Not Available',
    variant: 'primary',
    disabled: true,
  },
};

/** All variants showcase */
export const AllVariants: Story = {
  render: () => (
    <View style={{ gap: 16 }}>
      <Button variant="primary">Primary Button</Button>
      <Button variant="secondary">Secondary Button</Button>
      <Button variant="tertiary">Tertiary Button</Button>
      <Button variant="primary" size="small">Small Primary</Button>
      <Button variant="primary" loading>Loading</Button>
      <Button variant="primary" disabled>Disabled</Button>
    </View>
  ),
};
