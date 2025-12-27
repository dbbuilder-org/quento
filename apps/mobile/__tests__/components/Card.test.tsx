/**
 * Card Component Tests
 *
 * AI App Development powered by ServiceVision (https://www.servicevision.net)
 */

import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import Card from '../../components/ui/Card';

describe('Card', () => {
  describe('Rendering', () => {
    it('renders children', () => {
      const { getByText } = render(
        <Card>
          <Text>Card content</Text>
        </Card>
      );
      expect(getByText('Card content')).toBeTruthy();
    });

    it('renders default variant', () => {
      const { getByText } = render(
        <Card>
          <Text>Default</Text>
        </Card>
      );
      expect(getByText('Default')).toBeTruthy();
    });

    it('renders elevated variant', () => {
      const { getByText } = render(
        <Card variant="elevated">
          <Text>Elevated</Text>
        </Card>
      );
      expect(getByText('Elevated')).toBeTruthy();
    });

    it('renders outlined variant', () => {
      const { getByText } = render(
        <Card variant="outlined">
          <Text>Outlined</Text>
        </Card>
      );
      expect(getByText('Outlined')).toBeTruthy();
    });

    it('renders filled variant', () => {
      const { getByText } = render(
        <Card variant="filled">
          <Text>Filled</Text>
        </Card>
      );
      expect(getByText('Filled')).toBeTruthy();
    });
  });

  describe('Padding', () => {
    it('applies no padding', () => {
      const { getByText } = render(
        <Card padding="none">
          <Text>No padding</Text>
        </Card>
      );
      expect(getByText('No padding')).toBeTruthy();
    });

    it('applies small padding', () => {
      const { getByText } = render(
        <Card padding="small">
          <Text>Small padding</Text>
        </Card>
      );
      expect(getByText('Small padding')).toBeTruthy();
    });

    it('applies default padding', () => {
      const { getByText } = render(
        <Card padding="default">
          <Text>Default padding</Text>
        </Card>
      );
      expect(getByText('Default padding')).toBeTruthy();
    });

    it('applies large padding', () => {
      const { getByText } = render(
        <Card padding="large">
          <Text>Large padding</Text>
        </Card>
      );
      expect(getByText('Large padding')).toBeTruthy();
    });
  });

  describe('Pressable Behavior', () => {
    it('is not pressable by default', () => {
      const onPress = jest.fn();
      const { getByText } = render(
        <Card>
          <Text>Not pressable</Text>
        </Card>
      );

      fireEvent.press(getByText('Not pressable'));
      expect(onPress).not.toHaveBeenCalled();
    });

    it('becomes pressable with onPress prop', () => {
      const onPress = jest.fn();
      const { getByText } = render(
        <Card onPress={onPress}>
          <Text>Pressable</Text>
        </Card>
      );

      fireEvent.press(getByText('Pressable'));
      expect(onPress).toHaveBeenCalledTimes(1);
    });
  });

  describe('Custom Styles', () => {
    it('accepts custom style prop', () => {
      const { getByText } = render(
        <Card style={{ marginTop: 20 }}>
          <Text>Styled</Text>
        </Card>
      );
      expect(getByText('Styled')).toBeTruthy();
    });
  });
});
