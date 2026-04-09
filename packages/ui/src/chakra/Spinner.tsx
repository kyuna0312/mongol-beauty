import { Spinner as ChakraSpinner, SpinnerProps as ChakraSpinnerProps, Box, Text } from '@chakra-ui/react';
import { ReactNode } from 'react';

export interface SpinnerProps extends ChakraSpinnerProps {
  label?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
}

/**
 * Optimized Spinner component built on Chakra UI
 * Includes optional label support
 */
export function Spinner({ label, size = 'md', color = 'teal.500', ...props }: SpinnerProps) {
  const spinner = <ChakraSpinner size={size} color={color} {...props} />;

  if (!label) {
    return spinner;
  }

  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
      {spinner}
      {label && (
        <Text fontSize="sm" color="gray.600">
          {label}
        </Text>
      )}
    </Box>
  );
}

export interface LoadingOverlayProps {
  isLoading: boolean;
  children: ReactNode;
  label?: string;
}

/**
 * Loading overlay component that shows spinner while loading
 */
export function LoadingOverlay({ isLoading, children, label }: LoadingOverlayProps) {
  if (!isLoading) {
    return <>{children}</>;
  }

  return (
    <Box position="relative">
      <Box opacity={0.3} pointerEvents="none">
        {children}
      </Box>
      <Box
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        zIndex={10}
      >
        <Spinner size="lg" label={label} />
      </Box>
    </Box>
  );
}
