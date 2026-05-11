# @mongol-beauty/ui

Shared component library for the Mongol Beauty monorepo. Installed automatically via Yarn workspaces — no manual setup needed.

## Components

### Chakra UI components (recommended)

Import from the root package:

```tsx
import { Button, Card, Input, Textarea, Select, Alert, Spinner } from '@mongol-beauty/ui';
```

#### Button

```tsx
<Button variant="primary" size="md">Click me</Button>
<Button variant="outline" colorScheme="red">Outline</Button>
<Button variant="ghost" fullWidth>Full Width</Button>
```

Props: `variant` ('primary' | 'secondary' | 'outline' | 'ghost'), `size` ('sm' | 'md' | 'lg'), `fullWidth`, `colorScheme`, all Chakra Button props.

#### Card

```tsx
<Card hover>
  <CardHeader><Heading>Title</Heading></CardHeader>
  <CardBody>Content</CardBody>
  <CardFooter>Footer</CardFooter>
</Card>
```

Props: `hover` (enables hover effects), `onClick` (makes card clickable), all Chakra Box props.

#### Input / Textarea / Select

```tsx
<Input label="Name" placeholder="Enter name" error="Required" helperText="Full name" />
<Textarea label="Description" rows={4} />
<Select label="Category" options={[{ value: '1', label: 'Option 1' }]} />
```

Common props: `label`, `error`, `helperText`, `fullWidth` (default: true), all corresponding Chakra props.

#### Alert

```tsx
<Alert status="success" title="Done!" description="Operation completed" />
<Alert status="error" title="Error" description="Something went wrong" />
```

Props: `status` ('success' | 'error' | 'warning' | 'info'), `title`, `description`.

#### Spinner / LoadingOverlay

```tsx
<Spinner size="lg" label="Loading..." />
<LoadingOverlay isLoading={loading} label="Loading...">
  <YourContent />
</LoadingOverlay>
```

### Legacy components (Tailwind-based)

`Button` and `Card` from the legacy layer are still available. For new features, prefer the Chakra components above.

### Chakra UI primitives

Common primitives are re-exported for convenience:

```tsx
import { Box, Heading, Text, VStack, HStack, Flex, Grid } from '@mongol-beauty/ui';
```

## Best Practices

- Use Chakra UI components for new features
- Use `colorScheme="red"` to match the primary brand color
- Extend with Tailwind `className` for custom one-off styling
- All components are fully typed — props extend Chakra UI base props
