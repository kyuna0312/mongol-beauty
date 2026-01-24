import { Input as ChakraInput, InputProps as ChakraInputProps, Box, Text } from '@chakra-ui/react';
import { forwardRef } from 'react';

export interface InputProps extends ChakraInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

/**
 * Optimized Input component built on Chakra UI
 * Includes label, error, and helper text support
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, fullWidth = true, ...props }, ref) => {
    const input = (
      <ChakraInput
        ref={ref}
        width={fullWidth ? '100%' : undefined}
        borderColor={error ? 'red.500' : 'gray.300'}
        _focus={{
          borderColor: 'red.500',
          boxShadow: '0 0 0 1px red.500',
        }}
        {...props}
      />
    );

    if (!label && !error && !helperText) {
      return input;
    }

    return (
      <Box width={fullWidth ? '100%' : undefined}>
        {label && (
          <Text as="label" display="block" mb={2} fontSize="sm" fontWeight="medium" color="gray.700">
            {label}
          </Text>
        )}
        {input}
        {error && (
          <Text fontSize="xs" color="red.500" mt={1}>
            {error}
          </Text>
        )}
        {helperText && !error && (
          <Text fontSize="xs" color="gray.500" mt={1}>
            {helperText}
          </Text>
        )}
      </Box>
    );
  }
);

Input.displayName = 'Input';
