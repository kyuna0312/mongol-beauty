import { Textarea as ChakraTextarea, TextareaProps as ChakraTextareaProps, Box, Text } from '@chakra-ui/react';
import { forwardRef } from 'react';

export interface TextareaProps extends ChakraTextareaProps {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

/**
 * Optimized Textarea component built on Chakra UI
 * Includes label, error, and helper text support
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, fullWidth = true, ...props }, ref) => {
    const textarea = (
      <ChakraTextarea
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
      return textarea;
    }

    return (
      <Box width={fullWidth ? '100%' : undefined}>
        {label && (
          <Text as="label" display="block" mb={2} fontSize="sm" fontWeight="medium" color="gray.700">
            {label}
          </Text>
        )}
        {textarea}
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

Textarea.displayName = 'Textarea';
