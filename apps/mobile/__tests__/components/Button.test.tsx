/**
 * Button Component Tests
 *
 * AI App Development powered by ServiceVision (https://www.servicevision.net)
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Button from '../../components/ui/Button';

describe('Button', () => {
  describe('Rendering', () => {
    it('renders with text', () => {
      const { getByText } = render(<Button>Click me</Button>);
      expect(getByText('Click me')).toBeTruthy();
    });

    it('renders primary variant by default', () => {
      const { getByText } = render(<Button>Primary</Button>);
      const button = getByText('Primary').parent?.parent;
      expect(button).toBeTruthy();
    });

    it('renders secondary variant', () => {
      const { getByText } = render(<Button variant="secondary">Secondary</Button>);
      expect(getByText('Secondary')).toBeTruthy();
    });

    it('renders tertiary variant', () => {
      const { getByText } = render(<Button variant="tertiary">Tertiary</Button>);
      expect(getByText('Tertiary')).toBeTruthy();
    });

    it('renders small size', () => {
      const { getByText } = render(<Button size="small">Small</Button>);
      expect(getByText('Small')).toBeTruthy();
    });
  });

  describe('Interaction', () => {
    it('calls onPress when pressed', () => {
      const onPress = jest.fn();
      const { getByText } = render(<Button onPress={onPress}>Press me</Button>);

      fireEvent.press(getByText('Press me'));
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('does not call onPress when disabled', () => {
      const onPress = jest.fn();
      const { getByText } = render(
        <Button onPress={onPress} disabled>
          Disabled
        </Button>
      );

      fireEvent.press(getByText('Disabled'));
      expect(onPress).not.toHaveBeenCalled();
    });

    it('does not call onPress when loading', () => {
      const onPress = jest.fn();
      const { getByRole } = render(
        <Button onPress={onPress} loading>
          Loading
        </Button>
      );

      const button = getByRole('button');
      fireEvent.press(button);
      expect(onPress).not.toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('shows activity indicator when loading', () => {
      const { getByRole, queryByText } = render(<Button loading>Loading</Button>);

      expect(getByRole('button')).toBeTruthy();
      // Text should not be visible when loading
      expect(queryByText('Loading')).toBeNull();
    });
  });

  describe('Accessibility', () => {
    it('has accessible role', () => {
      const { getByRole } = render(<Button>Accessible</Button>);
      expect(getByRole('button')).toBeTruthy();
    });

    it('indicates disabled state for accessibility', () => {
      const { getByRole } = render(<Button disabled>Disabled</Button>);
      const button = getByRole('button');
      expect(button.props.accessibilityState?.disabled).toBe(true);
    });

    it('limits font scaling with maxFontSizeMultiplier', () => {
      const { getByText } = render(<Button>Scaled</Button>);
      const text = getByText('Scaled');
      expect(text.props.maxFontSizeMultiplier).toBe(1.3);
    });
  });

  describe('Icon Support', () => {
    it('renders with icon', () => {
      const Icon = () => <></>;
      const { getByText } = render(<Button icon={<Icon />}>With Icon</Button>);
      expect(getByText('With Icon')).toBeTruthy();
    });
  });
});
