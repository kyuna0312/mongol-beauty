import { Box, BoxProps } from '@chakra-ui/react';
import { ReactNode } from 'react';

export type AlertStatus = 'success' | 'error' | 'warning' | 'info';

export interface AlertProps extends BoxProps {
  status: AlertStatus;
  title?: string;
  description?: ReactNode;
  children?: ReactNode;
}

const statusColors = {
  success: {
    bg: 'green.50',
    border: 'green.200',
    title: 'green.800',
    text: 'green.700',
    icon: '✓',
  },
  error: {
    bg: 'orange.50',
    border: 'orange.200',
    title: 'orange.800',
    text: 'orange.700',
    icon: '✕',
  },
  warning: {
    bg: 'yellow.50',
    border: 'yellow.200',
    title: 'yellow.800',
    text: 'yellow.700',
    icon: '⚠',
  },
  info: {
    bg: 'teal.50',
    border: 'teal.200',
    title: 'teal.800',
    text: 'teal.700',
    icon: 'ℹ',
  },
};

/**
 * Optimized Alert component built on Chakra UI
 * Provides consistent alert styling with status variants
 */
export function Alert({ status, title, description, children, ...props }: AlertProps) {
  const colors = statusColors[status];

  return (
    <Box
      p={4}
      bg={colors.bg}
      borderColor={colors.border}
      borderWidth="1px"
      borderRadius="lg"
      {...props}
    >
      {children || (
        <>
          {title && (
            <Box fontWeight="bold" color={colors.title} mb={description ? 1 : 0}>
              {colors.icon} {title}
            </Box>
          )}
          {description && (
            <Box fontSize="sm" color={colors.text}>
              {description}
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
