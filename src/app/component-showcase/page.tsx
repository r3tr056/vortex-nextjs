/**
 * Vortex UI Component Visual Showcase
 *
 * Complete visual reference of all components.
 * Import this page to see all components rendered.
 */

'use client';

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

export default function ComponentShowcase() {
  return (
    <div style={{ background: colors.bg, minHeight: '100vh', paddingTop: '40px' }}>
      <Container variant="default">
        <Stack gap="xl">
          {/* Header */}
          <Section background="bg2" bordered>
            <Stack gap="lg">
              <Eyebrow variant="green">Component Library</Eyebrow>
              <Heading variant="hero">
                Vortex UI<br />
                <span style={{ color: colors.green }}>Component Showcase</span>
              </Heading>
              <BodyText variant="lg">
                Complete visual reference of all components in the Vortex design system.
              </BodyText>
            </Stack>
          </Section>

          {/* Typography Section */}
          <Section background="bg2" bordered>
            <Stack gap="xl">
              <div>
                <Eyebrow variant="green">Typography</Eyebrow>
                <Heading variant="h2">Text Components</Heading>
              </div>

              <Stack gap="lg">
                <Card variant="elevated">
                  <CardTitle>Eyebrows</CardTitle>
                  <Stack gap="md">
                    <Eyebrow variant="green">Green Eyebrow</Eyebrow>
                    <Eyebrow variant="blue">Blue Eyebrow</Eyebrow>
                  </Stack>
                </Card>

                <Card variant="elevated">
                  <CardTitle>Headings</CardTitle>
                  <Stack gap="md">
                    <Heading variant="hero">Hero Heading</Heading>
                    <Heading variant="h1">H1 Heading</Heading>
                    <Heading variant="h2">H2 Heading</Heading>
                    <Heading variant="h3">H3 Heading</Heading>
                    <Heading variant="h4">H4 Heading</Heading>
                    <Heading variant="h5">H5 Heading</Heading>
                  </Stack>
                </Card>

                <Card variant="elevated">
                  <CardTitle>Body Text</CardTitle>
                  <Stack gap="md">
                    <BodyText variant="lg">
                      Large body text - Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    </BodyText>
                    <BodyText variant="md">
                      Medium body text - Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    </BodyText>
                    <BodyText variant="sm">
                      Small body text - Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    </BodyText>
                    <BodyText variant="xs">
                      Extra small body text - Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    </BodyText>
                  </Stack>
                </Card>

                <Card variant="elevated">
                  <CardTitle>Monospace & Stats</CardTitle>
                  <Stack gap="md">
                    <MonoText variant="default">Default Monospace Label</MonoText>
                    <MonoText variant="sm">Small Monospace Label</MonoText>
                    <Divider />
                    <StatNumber value="25" unit=" kg" />
                    <StatNumber value="3,500" unit=" m" />
                    <StatNumber value="∞" />
                  </Stack>
                </Card>
              </Stack>
            </Stack>
          </Section>

          {/* Buttons Section */}
          <Section background="bg2" bordered>
            <Stack gap="xl">
              <div>
                <Eyebrow variant="green">Buttons</Eyebrow>
                <Heading variant="h2">Button Components</Heading>
              </div>

              <Grid cols={2} gap="md" responsive>
                <Card variant="elevated">
                  <CardTitle>Primary Buttons</CardTitle>
                  <Stack gap="md">
                    <Button variant="primary">Primary Button</Button>
                    <Button variant="primary">
                      With Arrow <span className="arr">→</span>
                    </Button>
                  </Stack>
                </Card>

                <Card variant="elevated">
                  <CardTitle>Outline Buttons</CardTitle>
                  <Stack gap="md">
                    <Button variant="outline">Outline Button</Button>
                    <Button variant="outline">
                      With Arrow <span className="arr">→</span>
                    </Button>
                  </Stack>
                </Card>

                <Card variant="elevated">
                  <CardTitle>Arrow Buttons</CardTitle>
                  <Stack gap="md">
                    <ButtonArrow>Arrow Button</ButtonArrow>
                    <Button variant="arrow">Manual Arrow →</Button>
                  </Stack>
                </Card>

                <Card variant="elevated">
                  <CardTitle>Nav Buttons</CardTitle>
                  <Stack gap="md">
                    <Button variant="nav">
                      <span>Nav Button</span>
                    </Button>
                  </Stack>
                </Card>
              </Grid>
            </Stack>
          </Section>

          {/* Badges Section */}
          <Section background="bg2" bordered>
            <Stack gap="xl">
              <div>
                <Eyebrow variant="green">Badges</Eyebrow>
                <Heading variant="h2">Tags & Indicators</Heading>
              </div>

              <Grid cols={2} gap="md" responsive>
                <Card variant="elevated">
                  <CardTitle>Tag Variants</CardTitle>
                  <Flex gap="md" wrap>
                    <Tag variant="default">Default</Tag>
                    <Tag variant="green">Green</Tag>
                    <Tag variant="blue">Blue</Tag>
                    <Tag variant="agri">Agriculture</Tag>
                    <Tag variant="restricted">Restricted</Tag>
                    <Tag variant="classified">Classified</Tag>
                  </Flex>
                </Card>

                <Card variant="elevated">
                  <CardTitle>Small Tags</CardTitle>
                  <Flex gap="md" wrap>
                    <Tag variant="default" size="sm">Default</Tag>
                    <Tag variant="green" size="sm">Green</Tag>
                    <Tag variant="blue" size="sm">Blue</Tag>
                    <Tag variant="agri" size="sm">Agri</Tag>
                  </Flex>
                </Card>

                <Card variant="elevated">
                  <CardTitle>Status Indicators</CardTitle>
                  <Stack gap="md">
                    <StatusIndicator variant="green" pulse>Systems Online</StatusIndicator>
                    <StatusIndicator variant="blue">Processing</StatusIndicator>
                    <StatusIndicator variant="red" pulse>Alert</StatusIndicator>
                    <StatusIndicator variant="muted">Offline</StatusIndicator>
                  </Stack>
                </Card>

                <Card variant="elevated">
                  <CardTitle>Dividers</CardTitle>
                  <Stack gap="md">
                    <div>
                      <BodyText variant="sm">Horizontal Divider</BodyText>
                      <Divider />
                    </div>
                    <Flex gap="md" style={{ height: '60px' }}>
                      <BodyText variant="sm">Vertical</BodyText>
                      <Divider orientation="vertical" />
                      <BodyText variant="sm">Divider</BodyText>
                    </Flex>
                  </Stack>
                </Card>
              </Grid>
            </Stack>
          </Section>

          {/* Cards Section */}
          <Section background="bg2" bordered>
            <Stack gap="xl">
              <div>
                <Eyebrow variant="green">Cards</Eyebrow>
                <Heading variant="h2">Card Components</Heading>
              </div>

              <Grid cols={3} gap="md" responsive>
                <Card variant="default">
                  <CardTitle>Default Card</CardTitle>
                  <CardDescription>
                    Standard card with default background (bg2).
                  </CardDescription>
                </Card>

                <Card variant="elevated">
                  <CardTitle>Elevated Card</CardTitle>
                  <CardDescription>
                    Elevated card with lighter background (bg3).
                  </CardDescription>
                </Card>

                <Card variant="bordered">
                  <CardTitle>Bordered Card</CardTitle>
                  <CardDescription>
                    Card with visible border around it.
                  </CardDescription>
                </Card>
              </Grid>

              <Card variant="elevated" glow="green" hoverBorder accentColor={colors.green}>
                <CardHeader>
                  <Flex justify="between" align="center">
                    <MonoText variant="sm" style={{ color: colors.green }}>VAS-01</MonoText>
                    <Tag variant="green" size="sm">Military</Tag>
                  </Flex>
                </CardHeader>

                <CardContent>
                  <CardTitle>Complete Card Example</CardTitle>
                  <MonoText variant="sm" style={{ marginBottom: '20px' }}>
                    With all sections
                  </MonoText>

                  <StatCard
                    accentColor={colors.green}
                    stats={[
                      { key: 'Payload', value: '25 kg' },
                      { key: 'Endurance', value: '30 min' },
                    ]}
                  />

                  <CardDescription>
                    This card demonstrates all card subcomponents working together:
                    header, title, content, stat grid, description, and footer.
                  </CardDescription>
                </CardContent>

                <CardFooter>
                  <MonoText variant="sm">TRL 6 · Available</MonoText>
                  <ButtonArrow>View Details</ButtonArrow>
                </CardFooter>
              </Card>
            </Stack>
          </Section>

          {/* Forms Section */}
          <Section background="bg2" bordered>
            <Stack gap="xl">
              <div>
                <Eyebrow variant="green">Forms</Eyebrow>
                <Heading variant="h2">Form Components</Heading>
              </div>

              <Card variant="elevated">
                <form onSubmit={(e) => e.preventDefault()}>
                  <Stack gap="xl">
                    <FormRow>
                      <FormField>
                        <Label>First Name</Label>
                        <Input type="text" placeholder="Arjun" />
                      </FormField>

                      <FormField>
                        <Label>Last Name</Label>
                        <Input type="text" placeholder="Sharma" />
                      </FormField>
                    </FormRow>

                    <FormField>
                      <Label>Email Address</Label>
                      <Input type="email" placeholder="you@example.com" />
                    </FormField>

                    <FormField>
                      <Label>Organization</Label>
                      <Input type="text" placeholder="Company / Ministry" />
                    </FormField>

                    <FormRow>
                      <FormField>
                        <Label>Inquiry Type</Label>
                        <Select>
                          <option value="">Select type</option>
                          <option>Defense Procurement</option>
                          <option>Government / Enterprise</option>
                          <option>Agriculture / Civil</option>
                          <option>Other</option>
                        </Select>
                      </FormField>

                      <FormField>
                        <Label>Priority</Label>
                        <Select>
                          <option>Standard</option>
                          <option>High</option>
                          <option>Urgent</option>
                        </Select>
                      </FormField>
                    </FormRow>

                    <FormField>
                      <Label>Message</Label>
                      <Textarea
                        rows={4}
                        placeholder="Describe your requirement..."
                      />
                    </FormField>

                    <Checkbox
                      id="terms"
                      label="I agree to the terms and conditions"
                    />

                    <Flex gap="md" wrap>
                      <Button variant="primary" type="submit">
                        Submit Form <span className="arr">→</span>
                      </Button>
                      <Button variant="outline" type="button">
                        Cancel
                      </Button>
                    </Flex>
                  </Stack>
                </form>
              </Card>
            </Stack>
          </Section>

          {/* Layout Section */}
          <Section background="bg2" bordered>
            <Stack gap="xl">
              <div>
                <Eyebrow variant="green">Layout</Eyebrow>
                <Heading variant="h2">Layout Components</Heading>
              </div>

              <Stack gap="lg">
                <Card variant="elevated">
                  <CardTitle>Grid System</CardTitle>
                  <Grid cols={4} gap="md" responsive>
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        style={{
                          background: colors.bg3,
                          padding: '20px',
                          textAlign: 'center',
                        }}
                      >
                        <BodyText variant="sm">Grid {i}</BodyText>
                      </div>
                    ))}
                  </Grid>
                </Card>

                <Card variant="elevated">
                  <CardTitle>Flex Layout</CardTitle>
                  <Flex gap="md" wrap justify="between" align="center">
                    <BodyText variant="sm">Flex Item 1</BodyText>
                    <BodyText variant="sm">Flex Item 2</BodyText>
                    <BodyText variant="sm">Flex Item 3</BodyText>
                  </Flex>
                </Card>

                <Card variant="elevated">
                  <CardTitle>Stack Layout</CardTitle>
                  <Stack gap="md">
                    <BodyText variant="sm">Stack Item 1</BodyText>
                    <BodyText variant="sm">Stack Item 2</BodyText>
                    <BodyText variant="sm">Stack Item 3</BodyText>
                  </Stack>
                </Card>

                <Card variant="elevated">
                  <CardTitle>Container Variants</CardTitle>
                  <Stack gap="md">
                    <BodyText variant="sm">• Default: 1280px max-width</BodyText>
                    <BodyText variant="sm">• Narrow: 860px max-width</BodyText>
                    <BodyText variant="sm">• Wide: 1536px max-width</BodyText>
                    <BodyText variant="sm">• Full: 100% width</BodyText>
                  </Stack>
                </Card>
              </Stack>
            </Stack>
          </Section>

          {/* Color Palette Section */}
          <Section background="bg2" bordered>
            <Stack gap="xl">
              <div>
                <Eyebrow variant="green">Design Tokens</Eyebrow>
                <Heading variant="h2">Color Palette</Heading>
              </div>

              <Grid cols={3} gap="md" responsive>
                {Object.entries({
                  'Primary Green': colors.green,
                  'Secondary Blue': colors.blue,
                  'Alert Red': colors.red,
                  'Agriculture': colors.agri,
                  'Background': colors.bg,
                  'Background 2': colors.bg2,
                  'Background 3': colors.bg3,
                  'Text Primary': colors.text,
                  'Text Secondary': colors.textSecondary,
                  'Text Subdued': colors.sub,
                  'Text Muted': colors.muted,
                  'Border': colors.border,
                }).map(([name, color]) => (
                  <Card key={name} variant="elevated">
                    <Flex gap="md" align="center">
                      <div
                        style={{
                          width: '48px',
                          height: '48px',
                          background: color,
                          border: `1px solid ${colors.border}`,
                        }}
                      />
                      <Stack gap="sm">
                        <BodyText variant="sm" style={{ fontWeight: 600 }}>
                          {name}
                        </BodyText>
                        <MonoText variant="sm">{color}</MonoText>
                      </Stack>
                    </Flex>
                  </Card>
                ))}
              </Grid>
            </Stack>
          </Section>

          {/* Footer */}
          <Section background="bg2" bordered>
            <Stack gap="lg" style={{ textAlign: 'center' }}>
              <Divider />
              <MonoText variant="sm">
                Vortex UI Component Library · Production Ready · TypeScript
              </MonoText>
              <BodyText variant="sm" style={{ color: colors.muted }}>
                Built with precision. Engineered for India. 🇮🇳
              </BodyText>
            </Stack>
          </Section>
        </Stack>
      </Container>
    </div>
  );
}
