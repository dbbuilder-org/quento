/**
 * Text Component Tests
 *
 * AI App Development powered by ServiceVision (https://www.servicevision.net)
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import Text from '../../components/ui/Text';

describe('Text', () => {
  describe('Rendering', () => {
    it('renders text content', () => {
      const { getByText } = render(<Text>Hello World</Text>);
      expect(getByText('Hello World')).toBeTruthy();
    });

    it('renders with default variant (body)', () => {
      const { getByText } = render(<Text>Default text</Text>);
      const text = getByText('Default text');
      expect(text.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ fontSize: 15, lineHeight: 22 }),
        ])
      );
    });
  });

  describe('Typography Variants', () => {
    it('applies displayLarge variant', () => {
      const { getByText } = render(<Text variant="displayLarge">Display</Text>);
      const text = getByText('Display');
      expect(text.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ fontSize: 48, lineHeight: 56 }),
        ])
      );
    });

    it('applies headlineLarge variant', () => {
      const { getByText } = render(
        <Text variant="headlineLarge">Headline</Text>
      );
      const text = getByText('Headline');
      expect(text.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ fontSize: 32, lineHeight: 40 }),
        ])
      );
    });

    it('applies titleMedium variant', () => {
      const { getByText } = render(<Text variant="titleMedium">Title</Text>);
      const text = getByText('Title');
      expect(text.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ fontSize: 18, lineHeight: 24 }),
        ])
      );
    });

    it('applies bodyLarge variant', () => {
      const { getByText } = render(<Text variant="bodyLarge">Body</Text>);
      const text = getByText('Body');
      expect(text.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ fontSize: 17, lineHeight: 24 }),
        ])
      );
    });

    it('applies caption variant', () => {
      const { getByText } = render(<Text variant="caption">Caption</Text>);
      const text = getByText('Caption');
      expect(text.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ fontSize: 11, lineHeight: 14 }),
        ])
      );
    });
  });

  describe('Colors', () => {
    it('applies default carbon color', () => {
      const { getByText } = render(<Text>Default color</Text>);
      const text = getByText('Default color');
      expect(text.props.style).toEqual(
        expect.arrayContaining([expect.objectContaining({ color: '#1A1A1A' })])
      );
    });

    it('applies theme color by name', () => {
      const { getByText } = render(<Text color="forest">Forest color</Text>);
      const text = getByText('Forest color');
      expect(text.props.style).toEqual(
        expect.arrayContaining([expect.objectContaining({ color: '#2D5A3D' })])
      );
    });

    it('applies custom color string', () => {
      const { getByText } = render(<Text color="#FF0000">Custom color</Text>);
      const text = getByText('Custom color');
      expect(text.props.style).toEqual(
        expect.arrayContaining([expect.objectContaining({ color: '#FF0000' })])
      );
    });
  });

  describe('Font Scaling', () => {
    it('allows font scaling by default', () => {
      const { getByText } = render(<Text>Scalable</Text>);
      const text = getByText('Scalable');
      expect(text.props.allowFontScaling).toBe(true);
    });

    it('has default maxFontSizeMultiplier of 1.3', () => {
      const { getByText } = render(<Text>Limited scaling</Text>);
      const text = getByText('Limited scaling');
      expect(text.props.maxFontSizeMultiplier).toBe(1.3);
    });

    it('accepts custom maxFontSizeMultiplier', () => {
      const { getByText } = render(
        <Text maxFontSizeMultiplier={2}>Custom scaling</Text>
      );
      const text = getByText('Custom scaling');
      expect(text.props.maxFontSizeMultiplier).toBe(2);
    });
  });

  describe('Center Alignment', () => {
    it('does not center text by default', () => {
      const { getByText } = render(<Text>Not centered</Text>);
      const text = getByText('Not centered');
      // Should not have textAlign: center in default styles
      const hasCenter = text.props.style.some(
        (style: { textAlign?: string }) => style?.textAlign === 'center'
      );
      expect(hasCenter).toBe(false);
    });

    it('centers text when center prop is true', () => {
      const { getByText } = render(<Text center>Centered</Text>);
      const text = getByText('Centered');
      const hasCenter = text.props.style.some(
        (style: { textAlign?: string }) => style?.textAlign === 'center'
      );
      expect(hasCenter).toBe(true);
    });
  });

  describe('Custom Styles', () => {
    it('accepts custom style prop', () => {
      const { getByText } = render(
        <Text style={{ marginTop: 10 }}>Custom style</Text>
      );
      const text = getByText('Custom style');
      const hasMargin = text.props.style.some(
        (style: { marginTop?: number }) => style?.marginTop === 10
      );
      expect(hasMargin).toBe(true);
    });
  });
});
