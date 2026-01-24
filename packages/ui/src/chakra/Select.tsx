import { Box, Text } from '@chakra-ui/react';
import { forwardRef } from 'react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  options?: Array<{ value: string; label: string }>;
}

/**
 * Optimized Select component built on Chakra UI
 * Includes label, error, helper text, and options support
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, fullWidth = true, options, children, className, ...props }, ref) => {
    const select = (
      <Box
        as="select"
        ref={ref}
        width={fullWidth ? '100%' : undefined}
        p={2}
        borderWidth="1px"
        borderColor={error ? 'red.500' : 'gray.300'}
        borderRadius="md"
        _focus={{
          outline: 'none',
          borderColor: 'red.500',
          boxShadow: '0 0 0 1px red.500',
        }}
        className={className}
        {...props}
      >
        {options
          ? options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))
          : children}
      </Box>
    );

    if (!label && !error && !helperText) {
      return select;
    }

    return (
      <Box width={fullWidth ? '100%' : undefined}>
        {label && (
          <Text as="label" display="block" mb={2} fontSize="sm" fontWeight="medium" color="gray.700">
            {label}
          </Text>
        )}
        {select}
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

Select.displayName = 'Select';
