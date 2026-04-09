import { Button as ChakraButton, ButtonProps as ChakraButtonProps } from '@chakra-ui/react';
import { forwardRef } from 'react';

export interface ButtonProps extends Omit<ChakraButtonProps, 'colorScheme'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  colorScheme?: 'teal' | 'gray' | 'green' | 'blue' | 'yellow';
}

/**
 * Optimized Button component built on Chakra UI
 * Supports all Chakra Button props plus custom variants
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', fullWidth, colorScheme, children, ...props }, ref) => {
    // Map custom variants to Chakra props
    const chakraVariant = variant === 'primary' ? 'solid' : variant === 'secondary' ? 'solid' : variant;
    const chakraColorScheme = colorScheme || (variant === 'primary' ? 'teal' : 'gray');
    const width = fullWidth ? '100%' : undefined;

    return (
      <ChakraButton
        ref={ref}
        variant={chakraVariant}
        size={size}
        colorScheme={chakraColorScheme}
        width={width}
        {...props}
      >
        {children}
      </ChakraButton>
    );
  }
);

Button.displayName = 'Button';
