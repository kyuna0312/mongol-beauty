# @mongol-beauty/ui

Component library for Mongol Beauty project, built with Chakra UI and Tailwind CSS.

## Installation

This package is part of the monorepo and is automatically linked via Yarn workspaces.

## Components

### Chakra UI Components (Recommended)

All Chakra UI-based components are exported from `@mongol-beauty/ui/chakra`:

```tsx
import { Button, Card, Input, Textarea, Select, Alert, Spinner } from '@mongol-beauty/ui';
```

#### Button

```tsx
import { Button } from '@mongol-beauty/ui';

<Button variant="primary" size="md">Click me</Button>
<Button variant="outline" colorScheme="red">Outline</Button>
<Button variant="ghost" fullWidth>Full Width</Button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'outline' | 'ghost'
- `size`: 'sm' | 'md' | 'lg'
- `fullWidth`: boolean
- `colorScheme`: 'red' | 'gray' | 'green' | 'blue' | 'yellow'
- All Chakra Button props

#### Card

```tsx
import { Card, CardHeader, CardBody, CardFooter } from '@mongol-beauty/ui';

<Card hover>
  <CardHeader>
    <Heading>Title</Heading>
  </CardHeader>
  <CardBody>
    Content here
  </CardBody>
  <CardFooter>
    Footer content
  </CardFooter>
</Card>
```

**Props:**
- `hover`: boolean - Enable hover effects
- `onClick`: () => void - Makes card clickable
- All Chakra Box props

#### Input

```tsx
import { Input } from '@mongol-beauty/ui';

<Input 
  label="Name" 
  placeholder="Enter name"
  error="This field is required"
  helperText="Enter your full name"
/>
```

**Props:**
- `label`: string
- `error`: string
- `helperText`: string
- `fullWidth`: boolean (default: true)
- All Chakra Input props

#### Textarea

```tsx
import { Textarea } from '@mongol-beauty/ui';

<Textarea 
  label="Description"
  placeholder="Enter description"
  rows={4}
/>
```

**Props:**
- `label`: string
- `error`: string
- `helperText`: string
- `fullWidth`: boolean (default: true)
- All Chakra Textarea props

#### Select

```tsx
import { Select } from '@mongol-beauty/ui';

<Select 
  label="Category"
  options={[
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' },
  ]}
/>
```

**Props:**
- `label`: string
- `error`: string
- `helperText`: string
- `options`: Array<{ value: string; label: string }>
- `fullWidth`: boolean (default: true)
- All Chakra Select props

#### Alert

```tsx
import { Alert } from '@mongol-beauty/ui';

<Alert status="success" title="Success!" description="Operation completed" />
<Alert status="error" title="Error!" description="Something went wrong" />
<Alert status="warning" title="Warning!" />
<Alert status="info" title="Info" />
```

**Props:**
- `status`: 'success' | 'error' | 'warning' | 'info'
- `title`: string
- `description`: ReactNode
- All Chakra Box props

#### Spinner

```tsx
import { Spinner, LoadingOverlay } from '@mongol-beauty/ui';

<Spinner size="lg" label="Loading..." />
<LoadingOverlay isLoading={loading} label="Loading data...">
  <YourContent />
</LoadingOverlay>
```

**Props:**
- `size`: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
- `color`: string (default: 'red.500')
- `label`: string
- All Chakra Spinner props

### Legacy Components (Tailwind-based)

Legacy components are still available but Chakra UI components are recommended:

```tsx
import { Button, Card } from '@mongol-beauty/ui';
```

## Usage Examples

### Form with Validation

```tsx
import { Input, Textarea, Select, Button } from '@mongol-beauty/ui';

function MyForm() {
  const [errors, setErrors] = useState({});
  
  return (
    <form>
      <Input 
        label="Name"
        error={errors.name}
        placeholder="Enter name"
      />
      <Textarea 
        label="Description"
        error={errors.description}
        rows={4}
      />
      <Select 
        label="Category"
        options={categories}
        error={errors.category}
      />
      <Button variant="primary" type="submit">
        Submit
      </Button>
    </form>
  );
}
```

### Card with Actions

```tsx
import { Card, CardHeader, CardBody, CardFooter, Button } from '@mongol-beauty/ui';

<Card hover>
  <CardHeader>
    <Heading size="md">Product Name</Heading>
  </CardHeader>
  <CardBody>
    <Text>Product description</Text>
  </CardBody>
  <CardFooter>
    <Button variant="primary">Add to Cart</Button>
  </CardFooter>
</Card>
```

### Loading States

```tsx
import { Spinner, LoadingOverlay, Alert } from '@mongol-beauty/ui';

// Simple spinner
<Spinner size="lg" label="Loading products..." />

// Loading overlay
<LoadingOverlay isLoading={loading} label="Loading...">
  <ProductList />
</LoadingOverlay>

// Success message
<Alert status="success" title="Success!" description="Product added to cart" />
```

## Chakra UI Primitives

Common Chakra UI primitives are also re-exported:

```tsx
import { Box, Heading, Text, VStack, HStack, Flex, Grid } from '@mongol-beauty/ui';

<VStack spacing={4}>
  <Heading size="xl">Title</Heading>
  <Text>Content</Text>
</VStack>
```

## Best Practices

1. **Use Chakra UI components** for new features
2. **Migrate gradually** from legacy Tailwind components
3. **Leverage Chakra props** instead of className when possible
4. **Use colorScheme="red"** to match primary brand color
5. **Combine with Tailwind** for custom styling when needed

## TypeScript Support

All components are fully typed with TypeScript. Props extend Chakra UI's base props for maximum flexibility.
