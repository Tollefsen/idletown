"use client";

import { useEffect } from "react";
import { BackLink, Button, Container, Heading, Text } from "@/app/components";

export default function YearOfVibeError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Year of Vibe error:", error);
  }, [error]);

  return (
    <Container size="md" className="py-16 text-center">
      <BackLink href="/" className="mb-8 justify-center" />

      <Heading as="h1" size="h2" className="mb-4">
        Something went wrong
      </Heading>

      <Text color="muted" className="mb-8">
        Failed to load the Year of Vibe dashboard. Please try again.
      </Text>

      <Button onClick={reset} variant="primary">
        Try again
      </Button>
    </Container>
  );
}
