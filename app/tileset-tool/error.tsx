"use client";

import { useEffect } from "react";
import { Button, Container, Heading, Text } from "../components";

export default function TilesetToolError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Tileset Tool error:", error);
  }, [error]);

  return (
    <Container size="sm" className="py-16 text-center">
      <Heading as="h1" className="mb-4">
        Something went wrong
      </Heading>
      <Text className="mb-6 text-gray-600 dark:text-gray-400">
        An error occurred while loading the Tileset Tool. Your saved tiles
        should still be safe in your browser.
      </Text>
      <Button onClick={reset}>Try again</Button>
    </Container>
  );
}
