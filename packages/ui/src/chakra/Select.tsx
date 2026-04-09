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
      <select
        ref={ref}
        style={{
          width: fullWidth ? '100%' : undefined,
          padding: '0.5rem',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: error ? '#dd6b20' : '#d1d5db',
          borderRadius: '0.375rem',
          outline: 'none',
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
      </select>
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
          <Text fontSize="xs" color="orange.600" mt={1}>
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
