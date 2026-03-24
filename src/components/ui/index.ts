/**
 * Vortex UI Component Library
 *
 * A comprehensive React/TypeScript UI component library based on the Vortex Autonomous Systems design system.
 * Features military-industrial aesthetic with sharp edges, technical precision, and dark theme.
 *
 * @example
 * ```tsx
 * import { Button, Card, Heading, Tag } from '@/components/ui';
 *
 * export function Example() {
 *   return (
 *     <Card variant="elevated" glow="green">
 *       <Heading variant="h2">Platform Overview</Heading>
 *       <Tag variant="green">Military</Tag>
 *       <Button variant="primary">View Details</Button>
 *     </Card>
 *   );
 * }
 * ```
 */

// ══════════════════════════════════════════════════════════
// DESIGN TOKENS
// ══════════════════════════════════════════════════════════

export * from './tokens';

// ══════════════════════════════════════════════════════════
// TYPOGRAPHY COMPONENTS
// ══════════════════════════════════════════════════════════

export {
  Eyebrow,
  Heading,
  BodyText,
  MonoText,
  StatNumber,
  type EyebrowProps,
  type HeadingProps,
  type BodyTextProps,
  type MonoTextProps,
  type StatNumberProps,
} from './typography';

// ══════════════════════════════════════════════════════════
// BUTTON COMPONENTS
// ══════════════════════════════════════════════════════════

export {
  Button,
  ButtonArrow,
  type ButtonProps,
  type ButtonArrowProps,
} from './button';

// ══════════════════════════════════════════════════════════
// BADGE COMPONENTS
// ══════════════════════════════════════════════════════════

export {
  Tag,
  Divider,
  StatusDot,
  StatusIndicator,
  type TagProps,
  type DividerProps,
  type StatusDotProps,
  type StatusIndicatorProps,
} from './badge';

// ══════════════════════════════════════════════════════════
// CARD COMPONENTS
// ══════════════════════════════════════════════════════════

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  StatCard,
  type CardProps,
  type CardHeaderProps,
  type CardTitleProps,
  type CardDescriptionProps,
  type CardContentProps,
  type CardFooterProps,
  type StatCardProps,
} from './card';

// ══════════════════════════════════════════════════════════
// FORM COMPONENTS
// ══════════════════════════════════════════════════════════

export {
  Input,
  Textarea,
  Select,
  Label,
  FormField,
  FormRow,
  Checkbox,
  type InputProps,
  type TextareaProps,
  type SelectProps,
  type LabelProps,
  type FormFieldProps,
  type FormRowProps,
  type CheckboxProps,
} from './form';

// ══════════════════════════════════════════════════════════
// LAYOUT COMPONENTS
// ══════════════════════════════════════════════════════════

export {
  Container,
  Section,
  Grid,
  Flex,
  Stack,
  type ContainerProps,
  type SectionProps,
  type GridProps,
  type FlexProps,
  type StackProps,
} from './layout';
