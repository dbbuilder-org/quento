/**
 * Input Component Tests
 *
 * AI App Development powered by ServiceVision (https://www.servicevision.net)
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Input from '../../components/ui/Input';

describe('Input', () => {
  describe('Rendering', () => {
    it('renders basic input', () => {
      const { getByPlaceholderText } = render(
        <Input placeholder="Enter text" />
      );
      expect(getByPlaceholderText('Enter text')).toBeTruthy();
    });

    it('renders with label', () => {
      const { getByText } = render(<Input label="Email" placeholder="Enter email" />);
      expect(getByText('Email')).toBeTruthy();
    });

    it('renders with helper text', () => {
      const { getByText } = render(
        <Input helperText="This is helper text" placeholder="Input" />
      );
      expect(getByText('This is helper text')).toBeTruthy();
    });

    it('renders with error message', () => {
      const { getByText } = render(
        <Input error="This field is required" placeholder="Input" />
      );
      expect(getByText('This field is required')).toBeTruthy();
    });

    it('error takes precedence over helper text', () => {
      const { getByText, queryByText } = render(
        <Input
          helperText="Helper text"
          error="Error message"
          placeholder="Input"
        />
      );
      expect(getByText('Error message')).toBeTruthy();
      expect(queryByText('Helper text')).toBeNull();
    });
  });

  describe('Interaction', () => {
    it('calls onChangeText when text changes', () => {
      const onChangeText = jest.fn();
      const { getByPlaceholderText } = render(
        <Input placeholder="Enter text" onChangeText={onChangeText} />
      );

      fireEvent.changeText(getByPlaceholderText('Enter text'), 'Hello');
      expect(onChangeText).toHaveBeenCalledWith('Hello');
    });

    it('calls onFocus when focused', () => {
      const onFocus = jest.fn();
      const { getByPlaceholderText } = render(
        <Input placeholder="Enter text" onFocus={onFocus} />
      );

      fireEvent(getByPlaceholderText('Enter text'), 'focus');
      expect(onFocus).toHaveBeenCalled();
    });

    it('calls onBlur when blurred', () => {
      const onBlur = jest.fn();
      const { getByPlaceholderText } = render(
        <Input placeholder="Enter text" onBlur={onBlur} />
      );

      fireEvent(getByPlaceholderText('Enter text'), 'blur');
      expect(onBlur).toHaveBeenCalled();
    });
  });

  describe('Value Handling', () => {
    it('displays controlled value', () => {
      const { getByDisplayValue } = render(
        <Input value="Controlled value" placeholder="Input" />
      );
      expect(getByDisplayValue('Controlled value')).toBeTruthy();
    });

    it('accepts defaultValue', () => {
      const { getByDisplayValue } = render(
        <Input defaultValue="Default" placeholder="Input" />
      );
      expect(getByDisplayValue('Default')).toBeTruthy();
    });
  });

  describe('Prefix and Suffix', () => {
    it('renders with prefix', () => {
      const Prefix = () => <></>;
      const { getByPlaceholderText } = render(
        <Input prefix={<Prefix />} placeholder="With prefix" />
      );
      expect(getByPlaceholderText('With prefix')).toBeTruthy();
    });

    it('renders with suffix', () => {
      const Suffix = () => <></>;
      const { getByPlaceholderText } = render(
        <Input suffix={<Suffix />} placeholder="With suffix" />
      );
      expect(getByPlaceholderText('With suffix')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('limits font scaling with maxFontSizeMultiplier', () => {
      const { getByPlaceholderText } = render(
        <Input placeholder="Scaled input" />
      );
      const input = getByPlaceholderText('Scaled input');
      expect(input.props.maxFontSizeMultiplier).toBe(1.3);
    });

    it('allows font scaling', () => {
      const { getByPlaceholderText } = render(
        <Input placeholder="Scalable" />
      );
      const input = getByPlaceholderText('Scalable');
      expect(input.props.allowFontScaling).toBe(true);
    });

    it('label has font scaling limit', () => {
      const { getByText } = render(<Input label="Label" placeholder="Input" />);
      const label = getByText('Label');
      expect(label.props.maxFontSizeMultiplier).toBe(1.3);
    });
  });

  describe('Input Types', () => {
    it('accepts secureTextEntry prop', () => {
      const { getByPlaceholderText } = render(
        <Input secureTextEntry placeholder="Password" />
      );
      const input = getByPlaceholderText('Password');
      expect(input.props.secureTextEntry).toBe(true);
    });

    it('accepts keyboardType prop', () => {
      const { getByPlaceholderText } = render(
        <Input keyboardType="email-address" placeholder="Email" />
      );
      const input = getByPlaceholderText('Email');
      expect(input.props.keyboardType).toBe('email-address');
    });

    it('accepts autoCapitalize prop', () => {
      const { getByPlaceholderText } = render(
        <Input autoCapitalize="none" placeholder="Username" />
      );
      const input = getByPlaceholderText('Username');
      expect(input.props.autoCapitalize).toBe('none');
    });
  });
});
