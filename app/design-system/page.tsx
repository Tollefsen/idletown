"use client";

import { useState } from "react";
import {
  Alert,
  Avatar,
  BackLink,
  Badge,
  Breadcrumb,
  Button,
  Card,
  Container,
  Divider,
  Grid,
  Heading,
  Modal,
  Progress,
  Skeleton,
  Spinner,
  Stack,
  Tabs,
  Text,
  Tooltip,
} from "../components";

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-8">
      <Heading as="h2" size="h3" className="mb-4">
        {title}
      </Heading>
      <Card variant="outlined" padding="lg">
        {children}
      </Card>
    </section>
  );
}

export default function DesignSystemPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("tab1");

  const tableOfContents = [
    { id: "toc-typography", label: "Typography", href: "#typography" },
    { id: "toc-buttons", label: "Buttons", href: "#buttons" },
    { id: "toc-cards", label: "Cards", href: "#cards" },
    { id: "toc-alerts", label: "Alerts", href: "#alerts" },
    { id: "toc-badges", label: "Badges", href: "#badges" },
    { id: "toc-layout", label: "Layout", href: "#layout" },
    { id: "toc-feedback", label: "Feedback", href: "#feedback" },
    { id: "toc-navigation", label: "Navigation", href: "#navigation" },
    { id: "toc-data", label: "Data Display", href: "#data" },
    { id: "toc-modal", label: "Modal", href: "#modal" },
  ];

  return (
    <Container size="xl" className="py-8">
      <BackLink />

      <Stack gap="lg">
        <div>
          <Heading as="h1">Design System</Heading>
          <Text color="muted" className="mt-2">
            A collection of reusable components for building consistent UIs.
          </Text>
        </div>

        {/* Table of Contents */}
        <Card variant="default" padding="md">
          <Heading as="h3" size="h5" className="mb-3">
            Components
          </Heading>
          <Stack direction="horizontal" gap="sm" wrap>
            {tableOfContents.map((item) => (
              <a
                key={item.id}
                href={item.href}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                {item.label}
              </a>
            ))}
          </Stack>
        </Card>

        <Divider />

        {/* Typography */}
        <Section id="typography" title="Typography">
          <Stack gap="md">
            <div>
              <Heading as="h4" size="h5" className="mb-2">
                Headings
              </Heading>
              <Stack gap="xs">
                <Heading as="h1">Heading 1</Heading>
                <Heading as="h2">Heading 2</Heading>
                <Heading as="h3">Heading 3</Heading>
                <Heading as="h4">Heading 4</Heading>
                <Heading as="h5">Heading 5</Heading>
                <Heading as="h6">Heading 6</Heading>
              </Stack>
            </div>
            <Divider />
            <div>
              <Heading as="h4" size="h5" className="mb-2">
                Text Sizes
              </Heading>
              <Stack gap="xs">
                <Text size="xl">Extra Large Text</Text>
                <Text size="lg">Large Text</Text>
                <Text size="base">Base Text</Text>
                <Text size="sm">Small Text</Text>
                <Text size="xs">Extra Small Text</Text>
              </Stack>
            </div>
            <Divider />
            <div>
              <Heading as="h4" size="h5" className="mb-2">
                Text Colors
              </Heading>
              <Stack gap="xs">
                <Text color="default">Default Color</Text>
                <Text color="muted">Muted Color</Text>
                <Text color="primary">Primary Color</Text>
                <Text color="success">Success Color</Text>
                <Text color="warning">Warning Color</Text>
                <Text color="danger">Danger Color</Text>
              </Stack>
            </div>
          </Stack>
        </Section>

        {/* Buttons */}
        <Section id="buttons" title="Buttons">
          <Stack gap="md">
            <div>
              <Heading as="h4" size="h5" className="mb-2">
                Variants
              </Heading>
              <Stack direction="horizontal" gap="sm" wrap>
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="success">Success</Button>
                <Button variant="danger">Danger</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
              </Stack>
            </div>
            <Divider />
            <div>
              <Heading as="h4" size="h5" className="mb-2">
                Sizes
              </Heading>
              <Stack direction="horizontal" gap="sm" align="center" wrap>
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
              </Stack>
            </div>
            <Divider />
            <div>
              <Heading as="h4" size="h5" className="mb-2">
                States
              </Heading>
              <Stack direction="horizontal" gap="sm" wrap>
                <Button disabled>Disabled</Button>
                <Button fullWidth>Full Width</Button>
              </Stack>
            </div>
          </Stack>
        </Section>

        {/* Cards */}
        <Section id="cards" title="Cards">
          <Grid cols={1} colsMd={3} gap="md">
            <Card variant="default" padding="md">
              <Heading as="h4" size="h5">
                Default Card
              </Heading>
              <Text size="sm" color="muted">
                With border styling
              </Text>
            </Card>
            <Card variant="elevated" padding="md">
              <Heading as="h4" size="h5">
                Elevated Card
              </Heading>
              <Text size="sm" color="muted">
                With shadow styling
              </Text>
            </Card>
            <Card variant="outlined" padding="md">
              <Heading as="h4" size="h5">
                Outlined Card
              </Heading>
              <Text size="sm" color="muted">
                With outline styling
              </Text>
            </Card>
          </Grid>
        </Section>

        {/* Alerts */}
        <Section id="alerts" title="Alerts">
          <Stack gap="sm">
            <Alert variant="info" title="Information">
              This is an informational message.
            </Alert>
            <Alert variant="success" title="Success">
              Operation completed successfully.
            </Alert>
            <Alert variant="warning" title="Warning">
              Please proceed with caution.
            </Alert>
            <Alert variant="error" title="Error">
              Something went wrong.
            </Alert>
            <Alert variant="info" title="Dismissible" onClose={() => {}}>
              This alert can be closed.
            </Alert>
          </Stack>
        </Section>

        {/* Badges */}
        <Section id="badges" title="Badges">
          <Stack gap="md">
            <div>
              <Heading as="h4" size="h5" className="mb-2">
                Variants
              </Heading>
              <Stack direction="horizontal" gap="sm" wrap>
                <Badge variant="default">Default</Badge>
                <Badge variant="primary">Primary</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="danger">Danger</Badge>
              </Stack>
            </div>
            <Divider />
            <div>
              <Heading as="h4" size="h5" className="mb-2">
                Sizes
              </Heading>
              <Stack direction="horizontal" gap="sm" align="center" wrap>
                <Badge size="sm">Small</Badge>
                <Badge size="md">Medium</Badge>
                <Badge size="lg">Large</Badge>
              </Stack>
            </div>
          </Stack>
        </Section>

        {/* Layout */}
        <Section id="layout" title="Layout Components">
          <Stack gap="lg">
            <div>
              <Heading as="h4" size="h5" className="mb-2">
                Stack (Horizontal)
              </Heading>
              <Stack direction="horizontal" gap="sm">
                <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded">
                  1
                </div>
                <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded">
                  2
                </div>
                <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded">
                  3
                </div>
              </Stack>
            </div>
            <Divider />
            <div>
              <Heading as="h4" size="h5" className="mb-2">
                Stack (Vertical)
              </Heading>
              <Stack direction="vertical" gap="sm">
                <div className="bg-green-100 dark:bg-green-900 p-4 rounded">
                  1
                </div>
                <div className="bg-green-100 dark:bg-green-900 p-4 rounded">
                  2
                </div>
                <div className="bg-green-100 dark:bg-green-900 p-4 rounded">
                  3
                </div>
              </Stack>
            </div>
            <Divider />
            <div>
              <Heading as="h4" size="h5" className="mb-2">
                Grid (Responsive)
              </Heading>
              <Grid cols={2} colsMd={4} gap="sm">
                <div className="bg-purple-100 dark:bg-purple-900 p-4 rounded text-center">
                  1
                </div>
                <div className="bg-purple-100 dark:bg-purple-900 p-4 rounded text-center">
                  2
                </div>
                <div className="bg-purple-100 dark:bg-purple-900 p-4 rounded text-center">
                  3
                </div>
                <div className="bg-purple-100 dark:bg-purple-900 p-4 rounded text-center">
                  4
                </div>
              </Grid>
            </div>
            <Divider />
            <div>
              <Heading as="h4" size="h5" className="mb-2">
                Divider
              </Heading>
              <Stack gap="sm">
                <Text>Content above</Text>
                <Divider />
                <Text>Content below</Text>
              </Stack>
            </div>
          </Stack>
        </Section>

        {/* Feedback */}
        <Section id="feedback" title="Feedback Components">
          <Stack gap="lg">
            <div>
              <Heading as="h4" size="h5" className="mb-2">
                Spinner
              </Heading>
              <Stack direction="horizontal" gap="md" align="center">
                <Spinner size="sm" />
                <Spinner size="md" />
                <Spinner size="lg" />
                <Spinner size="xl" />
              </Stack>
            </div>
            <Divider />
            <div>
              <Heading as="h4" size="h5" className="mb-2">
                Progress
              </Heading>
              <Stack gap="sm">
                <Progress value={25} size="sm" />
                <Progress value={50} size="md" color="success" />
                <Progress value={75} size="lg" color="warning" />
                <Progress value={100} size="md" color="danger" showLabel />
              </Stack>
            </div>
            <Divider />
            <div>
              <Heading as="h4" size="h5" className="mb-2">
                Skeleton
              </Heading>
              <Stack gap="sm">
                <Stack direction="horizontal" gap="sm" align="center">
                  <Skeleton variant="circular" width={48} height={48} />
                  <Stack gap="xs" className="flex-1">
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="text" width="40%" />
                  </Stack>
                </Stack>
                <Skeleton variant="rectangular" height={100} />
              </Stack>
            </div>
          </Stack>
        </Section>

        {/* Navigation */}
        <Section id="navigation" title="Navigation Components">
          <Stack gap="lg">
            <div>
              <Heading as="h4" size="h5" className="mb-2">
                Breadcrumb
              </Heading>
              <Breadcrumb
                items={[
                  { id: "home", label: "Home", href: "/" },
                  { id: "docs", label: "Documentation", href: "#" },
                  { id: "design-system", label: "Design System" },
                ]}
              />
            </div>
            <Divider />
            <div>
              <Heading as="h4" size="h5" className="mb-2">
                Tabs
              </Heading>
              <Tabs
                tabs={[
                  {
                    id: "tab1",
                    label: "Tab 1",
                    content: <Text>Content for Tab 1</Text>,
                  },
                  {
                    id: "tab2",
                    label: "Tab 2",
                    content: <Text>Content for Tab 2</Text>,
                  },
                  {
                    id: "tab3",
                    label: "Tab 3",
                    content: <Text>Content for Tab 3</Text>,
                  },
                ]}
                activeTab={activeTab}
                onChange={setActiveTab}
              />
            </div>
            <Divider />
            <div>
              <Heading as="h4" size="h5" className="mb-2">
                BackLink
              </Heading>
              <BackLink href="/">Back to Home</BackLink>
            </div>
          </Stack>
        </Section>

        {/* Data Display */}
        <Section id="data" title="Data Display">
          <Stack gap="lg">
            <div>
              <Heading as="h4" size="h5" className="mb-2">
                Avatar
              </Heading>
              <Stack direction="horizontal" gap="sm" align="center">
                <Avatar size="xs" name="John Doe" />
                <Avatar size="sm" name="Jane Smith" />
                <Avatar size="md" name="Bob Wilson" />
                <Avatar size="lg" name="Alice Brown" />
                <Avatar size="xl" name="Charlie Davis" />
              </Stack>
            </div>
            <Divider />
            <div>
              <Heading as="h4" size="h5" className="mb-2">
                Tooltip
              </Heading>
              <Stack direction="horizontal" gap="md">
                <Tooltip content="Tooltip on top" position="top">
                  <Button variant="secondary">Hover (Top)</Button>
                </Tooltip>
                <Tooltip content="Tooltip on bottom" position="bottom">
                  <Button variant="secondary">Hover (Bottom)</Button>
                </Tooltip>
                <Tooltip content="Tooltip on left" position="left">
                  <Button variant="secondary">Hover (Left)</Button>
                </Tooltip>
                <Tooltip content="Tooltip on right" position="right">
                  <Button variant="secondary">Hover (Right)</Button>
                </Tooltip>
              </Stack>
            </div>
          </Stack>
        </Section>

        {/* Modal */}
        <Section id="modal" title="Modal">
          <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Example Modal"
          >
            <Stack gap="md">
              <Text>
                This is an example modal dialog. You can close it by clicking
                the X button, pressing Escape, or clicking outside.
              </Text>
              <Stack direction="horizontal" gap="sm" justify="end">
                <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={() => setIsModalOpen(false)}>
                  Confirm
                </Button>
              </Stack>
            </Stack>
          </Modal>
        </Section>
      </Stack>
    </Container>
  );
}
