import { Box, Button, Heading, Text, Input, Textarea, Spinner } from '@chakra-ui/react';
import { useState } from 'react';

/**
 * Example component showcasing Chakra UI components
 * This demonstrates how to use Chakra UI in your project
 */
export function ChakraExample() {
  const [loading, setLoading] = useState(false);

  return (
    <Box p={6} maxW="4xl" mx="auto">
      <Box mb={6}>
        <Heading size="xl" mb={2} color="red.600">
          Chakra UI Integration
        </Heading>
        <Text color="gray.600">
          Example components showcasing Chakra UI in your Mongol Beauty project
        </Text>
      </Box>

      {/* Buttons */}
      <Box mb={6}>
        <Heading size="md" mb={4}>Buttons</Heading>
        <Box display="flex" gap={4} flexWrap="wrap">
          <Button colorScheme="red">Primary Button</Button>
          <Button colorScheme="red" variant="outline">Outline</Button>
          <Button colorScheme="red" variant="ghost">Ghost</Button>
          <Button colorScheme="red" size="sm">Small</Button>
          <Button colorScheme="red" size="lg">Large</Button>
          <Button 
            colorScheme="red" 
            loading={loading} 
            onClick={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 2000);
            }}
          >
            Loading
          </Button>
        </Box>
      </Box>

      {/* Form Elements */}
      <Box mb={6} p={4} borderWidth={1} borderRadius="lg" borderColor="gray.200">
        <Heading size="md" mb={4}>Form Elements</Heading>
        <Box display="flex" flexDirection="column" gap={4}>
          <Box>
            <Text mb={2} fontWeight="medium">Input Field</Text>
            <Input placeholder="Enter text..." />
          </Box>

          <Box>
            <Text mb={2} fontWeight="medium">Textarea</Text>
            <Textarea placeholder="Enter description..." />
          </Box>

          <Box>
            <Text mb={2} fontWeight="medium">Select</Text>
            <Box as="select" w="100%" p={2} borderWidth={1} borderRadius="md" borderColor="gray.300">
              <option value="">Select option</option>
              <option value="option1">Option 1</option>
              <option value="option2">Option 2</option>
              <option value="option3">Option 3</option>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Loading States */}
      <Box mb={6} p={4} borderWidth={1} borderRadius="lg" borderColor="gray.200">
        <Heading size="md" mb={4}>Loading States</Heading>
        <Box display="flex" flexDirection="column" gap={4}>
          <Box display="flex" gap={4} alignItems="center">
            <Spinner size="sm" color="red.500" />
            <Spinner size="md" color="red.500" />
            <Spinner size="lg" color="red.500" />
            <Spinner size="xl" color="red.500" />
          </Box>
          <Box w="100%" h={2} bg="gray.200" borderRadius="md" overflow="hidden">
            <Box h="100%" w="60%" bg="red.500" />
          </Box>
          <Box w="100%" h={2} bg="gray.200" borderRadius="md" overflow="hidden">
            <Box h="100%" w="80%" bg="green.500" />
          </Box>
        </Box>
      </Box>

      {/* Usage Instructions */}
      <Box p={4} bg="gray.50" borderRadius="lg" borderWidth={1} borderColor="gray.200">
        <Heading size="md" mb={4}>How to Use Chakra UI</Heading>
        <Box display="flex" flexDirection="column" gap={3}>
          <Text>
            <strong>1. Import components:</strong>
          </Text>
          <Box as="pre" bg="gray.800" color="white" p={4} borderRadius="md" overflowX="auto" fontSize="sm">
            {`import { Button, Box, Input } from '@chakra-ui/react';`}
          </Box>

          <Text>
            <strong>2. Use in your components:</strong>
          </Text>
          <Box as="pre" bg="gray.800" color="white" p={4} borderRadius="md" overflowX="auto" fontSize="sm">
            {`<Button colorScheme="red">Click me</Button>`}
          </Box>

          <Text fontSize="sm" color="gray.600">
            Chakra UI v3 is now integrated! Use <code>colorScheme="red"</code> to match your primary color.
          </Text>
        </Box>
      </Box>
    </Box>
  );
}
