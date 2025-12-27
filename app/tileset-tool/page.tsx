"use client";

import { useState } from "react";
import { BackLink, Container, Heading, Tabs } from "../components";
import { TileEditor } from "./components/TileEditor";
import { TilesetManager } from "./components/TilesetManager";

export default function TilesetToolPage() {
  const [activeTab, setActiveTab] = useState("editor");

  const tabs = [
    {
      id: "editor",
      label: "Tile Editor",
      content: <TileEditor />,
    },
    {
      id: "tileset",
      label: "Tileset Manager",
      content: <TilesetManager />,
    },
    {
      id: "level",
      label: "Level Editor",
      content: (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p className="text-lg font-medium mb-2">Coming Soon</p>
          <p className="text-sm">
            Test your tilesets in a sandbox environment with manual placement
            and WFC generation.
          </p>
        </div>
      ),
    },
  ];

  return (
    <Container size="xl" className="py-8">
      <BackLink href="/" className="mb-6" />
      <Heading as="h1" className="mb-6">
        Tileset Tool
      </Heading>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Create pixel art tiles, combine them into tilesets, and test them in a
        level editor.
      </p>
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
    </Container>
  );
}
