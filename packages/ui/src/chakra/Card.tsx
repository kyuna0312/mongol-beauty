import { Box, BoxProps } from '@chakra-ui/react';
import { ReactNode } from 'react';

export interface CardProps extends Omit<BoxProps, 'as'> {
  children: ReactNode;
  onClick?: () => void;
  hover?: boolean;
}

/**
 * Optimized Card component built on Chakra UI
 * Provides consistent card styling with hover effects
 */
export function Card({ children, onClick, hover = false, ...props }: CardProps) {
  return (
    <Box
      as={onClick ? 'button' : 'div'}
      bg="white"
      borderRadius="xl"
      boxShadow="sm"
      borderWidth="1px"
      borderColor="gray.200"
      p={4}
      onClick={onClick}
      cursor={onClick ? 'pointer' : 'default'}
      transition="all 0.2s"
      _hover={hover || onClick ? {
        boxShadow: 'lg',
        borderColor: 'teal.300',
        transform: 'translateY(-2px)',
      } : undefined}
      {...props}
    >
      {children}
    </Box>
  );
}

export interface CardHeaderProps extends BoxProps {
  children: ReactNode;
}

export function CardHeader({ children, ...props }: CardHeaderProps) {
  return (
    <Box mb={4} {...props}>
      {children}
    </Box>
  );
}

export interface CardBodyProps extends BoxProps {
  children: ReactNode;
}

export function CardBody({ children, ...props }: CardBodyProps) {
  return (
    <Box {...props}>
      {children}
    </Box>
  );
}

export interface CardFooterProps extends BoxProps {
  children: ReactNode;
}

export function CardFooter({ children, ...props }: CardFooterProps) {
  return (
    <Box mt={4} pt={4} borderTopWidth="1px" borderColor="gray.200" {...props}>
      {children}
    </Box>
  );
}
