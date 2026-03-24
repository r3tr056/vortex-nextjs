/**
 * Complete Usage Examples for Vortex UI Components
 *
 * This file demonstrates all components with real-world usage patterns.
 */

import {
  // Layout
  Container,
  Section,
  Grid,
  Flex,
  Stack,

  // Typography
  Eyebrow,
  Heading,
  BodyText,
  MonoText,
  StatNumber,

  // Buttons
  Button,
  ButtonArrow,

  // Cards
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  StatCard,

  // Badges
  Tag,
  Divider,
  StatusIndicator,

  // Forms
  Input,
  Textarea,
  Select,
  Label,
  FormField,
  FormRow,
  Checkbox,

  // Tokens
  colors,
} from '@/components/ui';

// ══════════════════════════════════════════════════════════
// EXAMPLE 1: Platform Card
// ══════════════════════════════════════════════════════════

export function PlatformCardExample() {
  return (
    <Card variant="default" hoverBorder accentColor={colors.green}>
      {/* Header Row */}
      <Flex justify="between" align="center" style={{ marginBottom: '16px' }}>
        <MonoText variant="sm" style={{ color: colors.green }}>VAS-01</MonoText>
        <Tag variant="green" size="sm">Military</Tag>
      </Flex>

      {/* Title Section */}
      <CardTitle>Atlas</CardTitle>
      <MonoText variant="sm" style={{ marginBottom: '20px', color: colors.muted }}>
        Heavy-Lift Logistics
      </MonoText>

      {/* Stats Grid */}
      <StatCard
        accentColor={colors.green}
        stats={[
          { key: 'Payload', value: '25 kg' },
          { key: 'Endurance', value: '30 min' },
        ]}
      />

      {/* Description */}
      <CardDescription style={{ marginBottom: '20px' }}>
        The workhorse. Where roads end and missions begin. Forward resupply,
        medevac, humanitarian last-mile — Atlas carries what matters, where
        vehicles cannot go.
      </CardDescription>

      {/* Footer */}
      <CardFooter>
        <MonoText variant="sm">TRL 6 · Available</MonoText>
        <ButtonArrow>View platform</ButtonArrow>
      </CardFooter>
    </Card>
  );
}

// ══════════════════════════════════════════════════════════
// EXAMPLE 2: Hero Section
// ══════════════════════════════════════════════════════════

export function HeroSectionExample() {
  return (
    <Section
      variant="spacious"
      background="bg2"
      bordered
      glow="green-left"
    >
      <Grid cols={2} gap="xl" responsive>
        {/* Left Column */}
        <Stack gap="lg">
          <Eyebrow variant="green">Vortex Autonomous Systems</Eyebrow>
          <Heading variant="hero">
            Six platforms.<br />
            One indigenous stack.<br />
            <span style={{ color: colors.green }}>
              Zero Chinese components.
            </span>
          </Heading>
        </Stack>

        {/* Right Column */}
        <Stack gap="lg">
          <BodyText variant="lg">
            From 25 kg logistics to swarm operations — Vortex Autonomous Systems
            engineers the autonomous infrastructure that India's next conflict,
            next harvest, and next disaster response depends on.
          </BodyText>
          <Flex gap="md" wrap>
            <Button variant="primary">
              Explore Platforms <span className="arr">→</span>
            </Button>
            <Button variant="outline">Request Briefing</Button>
          </Flex>
        </Stack>
      </Grid>
    </Section>
  );
}

// ══════════════════════════════════════════════════════════
// EXAMPLE 3: Metrics Section
// ══════════════════════════════════════════════════════════

export function MetricsSectionExample() {
  const metrics = [
    { value: '6', unit: '', label: 'Operational platforms', sub: 'TRL 6 each' },
    { value: '25', unit: ' kg', label: 'Maximum payload', sub: 'VAS-01 Atlas' },
    { value: '0', unit: '', label: 'Chinese-origin components', sub: 'Across all platforms' },
    { value: '70', unit: '%', label: 'Made-in-India content', sub: 'Across the full stack' },
    { value: '3,500', unit: ' m', label: 'Operational altitude', sub: 'Sentinel high-alt ISR' },
    { value: '10+', unit: '', label: 'Drones per swarm', sub: 'Single-operator Hornet' },
    { value: '30', unit: ' min', label: 'Endurance at max payload', sub: 'Atlas Logistics' },
    { value: '∞', unit: '', label: 'Endurance · Ranger tethered', sub: 'No battery constraint' },
  ];

  return (
    <Section background="bg3" bordered>
      <Container variant="default">
        <Eyebrow variant="green">By the Numbers</Eyebrow>

        <Grid cols={4} gap="1px" responsive>
          {metrics.map((metric, i) => (
            <Card key={i} variant="elevated" style={{ borderTop: 'none' }}>
              <StatNumber value={metric.value} unit={metric.unit} />
              <BodyText
                variant="sm"
                style={{
                  fontWeight: 500,
                  color: colors.textSecondary,
                  marginTop: '10px',
                  marginBottom: '4px',
                }}
              >
                {metric.label}
              </BodyText>
              <MonoText variant="sm">{metric.sub}</MonoText>
            </Card>
          ))}
        </Grid>
      </Container>
    </Section>
  );
}

// ══════════════════════════════════════════════════════════
// EXAMPLE 4: Contact Form
// ══════════════════════════════════════════════════════════

export function ContactFormExample() {
  return (
    <Section background="bg2" bordered>
      <Container variant="narrow">
        <Stack gap="xl">
          <div>
            <Eyebrow variant="green">Get in Touch</Eyebrow>
            <Heading variant="h2">
              Procurement · Partnerships · Briefings
            </Heading>
          </div>

          <form>
            <FormRow>
              <FormField>
                <Label>First Name</Label>
                <Input type="text" placeholder="Arjun" required />
              </FormField>

              <FormField>
                <Label>Last Name</Label>
                <Input type="text" placeholder="Sharma" required />
              </FormField>
            </FormRow>

            <FormField>
              <Label>Email Address</Label>
              <Input
                type="email"
                placeholder="you@organisation.gov.in"
                required
              />
            </FormField>

            <FormField>
              <Label>Organisation</Label>
              <Input
                type="text"
                placeholder="Ministry / Company / Unit"
                required
              />
            </FormField>

            <FormRow>
              <FormField>
                <Label>Inquiry Type</Label>
                <Select required>
                  <option value="">Select type</option>
                  <option>Defense Procurement</option>
                  <option>Government / Enterprise</option>
                  <option>Agriculture / Civil</option>
                  <option>Investment / Partnership</option>
                  <option>Media / Press</option>
                  <option>Other</option>
                </Select>
              </FormField>

              <FormField>
                <Label>Platform Interest</Label>
                <Select>
                  <option value="">All platforms</option>
                  <option>VAS-01 · Atlas Logistics</option>
                  <option>VAS-02 · Atlas Ag</option>
                  <option>VAS-03 · Ranger</option>
                  <option>VAS-04 · Sentinel</option>
                </Select>
              </FormField>
            </FormRow>

            <FormField>
              <Label>Message</Label>
              <Textarea
                rows={5}
                placeholder="Describe your requirement, timeline, and quantity if applicable..."
              />
            </FormField>

            <Checkbox
              id="nda"
              label="This inquiry involves classified information. I understand an NDA will be required before technical details are shared for restricted platforms."
            />

            <Button variant="primary" type="submit" style={{ marginTop: '20px' }}>
              Submit Inquiry <span className="arr">→</span>
            </Button>

            <BodyText variant="xs" style={{ marginTop: '12px' }}>
              Response SLA: 48 hours · Defense inquiries: 24 hours
            </BodyText>
          </form>
        </Stack>
      </Container>
    </Section>
  );
}

// ══════════════════════════════════════════════════════════
// EXAMPLE 5: Capabilities Grid
// ══════════════════════════════════════════════════════════

export function CapabilitiesExample() {
  const capabilities = [
    {
      num: '01',
      title: 'VortexDelta Firmware',
      body: 'Custom ArduCopter derivative built for Indian operational conditions. GPS-denied navigation via inertial and optical flow.',
    },
    {
      num: '02',
      title: 'Vortex Cloud GCS',
      body: 'Browser-native ground control. Real-time telemetry across all active platforms simultaneously.',
    },
    {
      num: '03',
      title: 'AI Vision & Edge Inference',
      body: 'Onboard neural inference on every platform. Target classification, anomaly detection, terrain mapping.',
    },
    {
      num: '04',
      title: 'Indigenous Supply Chain',
      body: 'Every component is sourced and validated against a zero-Chinese hardware policy.',
    },
    {
      num: '05',
      title: 'Multi-Domain Operations',
      body: 'Same avionics stack, same GCS interface, same maintenance protocol — across all missions.',
    },
  ];

  return (
    <Section background="bg" bordered glow="green-right">
      <Container variant="default">
        {/* Header */}
        <Flex justify="between" align="end" wrap style={{ marginBottom: '40px' }}>
          <div>
            <Eyebrow variant="green">The Technology</Eyebrow>
            <Heading variant="h2">
              One stack to rule<br />
              <span style={{ color: colors.green }}>every mission.</span>
            </Heading>
          </div>
          <ButtonArrow>Full capabilities overview</ButtonArrow>
        </Flex>

        {/* Capabilities Grid */}
        <Grid cols={5} gap="1px" responsive>
          {capabilities.map((cap, i) => (
            <Card
              key={cap.num}
              variant="default"
              style={{
                borderTop: i === 0 ? `2px solid ${colors.green}` : `2px solid ${colors.line}`,
              }}
            >
              <MonoText
                variant="sm"
                style={{
                  color: colors.green,
                  opacity: 0.45,
                  marginBottom: '16px',
                }}
              >
                {cap.num}
              </MonoText>

              <Heading variant="h5" style={{ marginBottom: '14px' }}>
                {cap.title}
              </Heading>

              <BodyText variant="xs">{cap.body}</BodyText>
            </Card>
          ))}
        </Grid>
      </Container>
    </Section>
  );
}

// ══════════════════════════════════════════════════════════
// EXAMPLE 6: Status Dashboard
// ══════════════════════════════════════════════════════════

export function StatusDashboardExample() {
  return (
    <Section background="bg3" bordered>
      <Container variant="default">
        <Grid cols={3} gap="md" responsive>
          {/* System Status Card */}
          <Card variant="elevated">
            <CardHeader>
              <StatusIndicator variant="green" pulse>
                All Systems Operational
              </StatusIndicator>
            </CardHeader>
            <CardContent>
              <Stack gap="md">
                <Flex justify="between" align="center">
                  <BodyText variant="sm">VAS-01 Atlas</BodyText>
                  <Tag variant="green" size="sm">Active</Tag>
                </Flex>
                <Flex justify="between" align="center">
                  <BodyText variant="sm">VAS-03 Ranger</BodyText>
                  <Tag variant="green" size="sm">Active</Tag>
                </Flex>
                <Flex justify="between" align="center">
                  <BodyText variant="sm">VAS-04 Sentinel</BodyText>
                  <Tag variant="blue" size="sm">Standby</Tag>
                </Flex>
              </Stack>
            </CardContent>
          </Card>

          {/* Mission Stats Card */}
          <Card variant="elevated">
            <CardHeader>
              <MonoText variant="sm" style={{ color: colors.green }}>
                Mission Statistics
              </MonoText>
            </CardHeader>
            <CardContent>
              <Stack gap="md">
                <div>
                  <StatNumber value="247" />
                  <BodyText variant="sm">Total missions completed</BodyText>
                </div>
                <Divider />
                <div>
                  <StatNumber value="98.4" unit="%" />
                  <BodyText variant="sm">Mission success rate</BodyText>
                </div>
              </Stack>
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card variant="elevated">
            <CardHeader>
              <MonoText variant="sm" style={{ color: colors.green }}>
                Quick Actions
              </MonoText>
            </CardHeader>
            <CardContent>
              <Stack gap="md">
                <Button variant="outline" style={{ width: '100%' }}>
                  Launch Mission
                </Button>
                <Button variant="outline" style={{ width: '100%' }}>
                  View Telemetry
                </Button>
                <Button variant="outline" style={{ width: '100%' }}>
                  System Diagnostics
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Container>
    </Section>
  );
}

// ══════════════════════════════════════════════════════════
// EXAMPLE 7: Tag Showcase
// ══════════════════════════════════════════════════════════

export function TagShowcaseExample() {
  return (
    <Section background="bg2" bordered>
      <Container variant="narrow">
        <Stack gap="xl">
          <div>
            <Eyebrow>Component Variants</Eyebrow>
            <Heading variant="h3">Tag & Badge System</Heading>
          </div>

          <Stack gap="lg">
            <div>
              <BodyText variant="sm" style={{ marginBottom: '12px' }}>
                Platform Categories
              </BodyText>
              <Flex gap="md" wrap>
                <Tag variant="green">Military</Tag>
                <Tag variant="blue">Dual-Use</Tag>
                <Tag variant="agri">Agriculture</Tag>
                <Tag variant="restricted">Restricted</Tag>
                <Tag variant="classified">Classified</Tag>
              </Flex>
            </div>

            <Divider />

            <div>
              <BodyText variant="sm" style={{ marginBottom: '12px' }}>
                Status Indicators
              </BodyText>
              <Stack gap="md">
                <StatusIndicator variant="green" pulse>
                  Systems Online
                </StatusIndicator>
                <StatusIndicator variant="blue">
                  Processing Data
                </StatusIndicator>
                <StatusIndicator variant="red" pulse>
                  Alert Condition
                </StatusIndicator>
                <StatusIndicator variant="muted">
                  Offline
                </StatusIndicator>
              </Stack>
            </div>

            <Divider />

            <div>
              <BodyText variant="sm" style={{ marginBottom: '12px' }}>
                Small Tags
              </BodyText>
              <Flex gap="md" wrap>
                <Tag variant="green" size="sm">TRL 6</Tag>
                <Tag variant="blue" size="sm">Available</Tag>
                <Tag variant="default" size="sm">Coming Soon</Tag>
              </Flex>
            </div>
          </Stack>
        </Stack>
      </Container>
    </Section>
  );
}
