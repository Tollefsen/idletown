# Storage Version Control & Migrations

This document explains how to add new versions and migrations to the calendar diary storage system.

## Overview

The storage system uses a version control mechanism to manage schema changes and data migrations. When the data structure changes, you must:
1. Increment the version number
2. Add the new version to supported versions
3. Create migration functions to transform old data to the new format

## Adding a New Version

### Step 1: Update Version Constants

In `storage.ts`, update these constants:

```typescript
const CURRENT_VERSION = 2; // Increment from 1 to 2
const SUPPORTED_VERSIONS = [1, 2]; // Add new version to the array
```

### Step 2: Create Migration Functions

Define migration functions that transform data from the old format to the new format. Each migration is identified by the **target version** (the version the data will be after migration).

Example - migrating from v1 to v2:

```typescript
// In storage.ts, in the ensureInitialized() method:

const calendarMigrations = {
  2: (calendars: CalendarConfig[]): CalendarConfig[] => {
    return calendars.map((cal) => ({
      ...cal,
      newField: "default value", // Add new field
    }));
  },
};

const entryMigrations = {
  2: (entries: DiaryEntry[]): DiaryEntry[] => {
    return entries.map((entry) => ({
      ...entry,
      tags: [], // Add new field
    }));
  },
};

this.calendarVersionControl = new VersionControl({
  storageKey: this.CALENDARS_KEY,
  currentVersion: CURRENT_VERSION,
  supportedVersions: SUPPORTED_VERSIONS,
  migrations: calendarMigrations, // Pass migrations here
});

this.entryVersionControl = new VersionControl({
  storageKey: this.ENTRIES_KEY,
  currentVersion: CURRENT_VERSION,
  supportedVersions: SUPPORTED_VERSIONS,
  migrations: entryMigrations, // Pass migrations here
});
```

### Step 3: Update Type Definitions

Update `types.ts` to reflect the new data structure:

```typescript
export interface CalendarConfig {
  id: string;
  name: string;
  // ... existing fields
  newField: string; // Add new field to type
}

export interface DiaryEntry {
  calendarId: string;
  date: string;
  content: string;
  // ... existing fields
  tags: string[]; // Add new field to type
}
```

### Step 4: Test the Migration

1. Create test data in the old format (v1)
2. Refresh the page with the new code
3. Verify the data is automatically migrated to v2
4. Check the console for migration logs
5. Verify new functionality works with migrated data

## Migration Examples

### Example 1: Adding a Field with Default Value

```typescript
const migrations = {
  2: (data: CalendarConfig[]): CalendarConfig[] => {
    return data.map((cal) => ({
      ...cal,
      color: "#3b82f6", // Add color field with default
    }));
  },
};
```

### Example 2: Renaming a Field

```typescript
const migrations = {
  2: (data: DiaryEntry[]): DiaryEntry[] => {
    return data.map((entry) => {
      const { oldFieldName, ...rest } = entry as any;
      return {
        ...rest,
        newFieldName: oldFieldName, // Rename field
      };
    });
  },
};
```

### Example 3: Transforming Data Structure

```typescript
const migrations = {
  2: (data: DiaryEntry[]): DiaryEntry[] => {
    return data.map((entry) => ({
      ...entry,
      // Transform date format from "DD/MM/YYYY" to "YYYY-MM-DD"
      date: entry.date.split("/").reverse().join("-"),
    }));
  },
};
```

### Example 4: Removing a Field

```typescript
const migrations = {
  2: (data: CalendarConfig[]): CalendarConfig[] => {
    return data.map((cal) => {
      const { deprecatedField, ...rest } = cal as any;
      return rest; // Return without deprecated field
    });
  },
};
```

### Example 5: Multiple Sequential Migrations

When going from v1 → v3, users might have v1 or v2 data. The system automatically applies migrations sequentially:

```typescript
const migrations = {
  2: (data: CalendarConfig[]): CalendarConfig[] => {
    // v1 → v2: Add color field
    return data.map((cal) => ({
      ...cal,
      color: "#3b82f6",
    }));
  },
  3: (data: CalendarConfig[]): CalendarConfig[] => {
    // v2 → v3: Add icon field
    return data.map((cal) => ({
      ...cal,
      icon: "📅",
    }));
  },
};
```

If a user has v1 data, the system will:
1. Apply migration 2 (v1 → v2)
2. Apply migration 3 (v2 → v3)
3. Set version to 3

## Breaking Changes

If you make a breaking change where old data cannot be migrated:

1. Remove old versions from `SUPPORTED_VERSIONS`:

```typescript
const CURRENT_VERSION = 3;
const SUPPORTED_VERSIONS = [3]; // Only support v3, v1 and v2 are no longer supported
```

2. When users with v1 or v2 data load the app:
   - They'll see a console warning
   - Their old data will be cleared
   - They'll start fresh with v3

**Use this sparingly** - migrations are preferred to preserve user data.

## Best Practices

1. **Always increment versions** - Never modify existing migrations
2. **Test migrations thoroughly** - Verify data integrity after migration
3. **Keep migrations simple** - Break complex changes into multiple versions
4. **Document breaking changes** - Warn users if data will be lost
5. **Support at least 2-3 versions** - Give users time to migrate
6. **Log migrations** - The system automatically logs when migrations run
7. **Handle edge cases** - Check for null/undefined values in migrations
8. **Preserve data** - Migrations should never lose user data unless absolutely necessary

## Troubleshooting

### Migration not running?
- Check that `CURRENT_VERSION` is incremented
- Verify migration key matches the target version
- Clear localStorage manually and check logs

### Data corrupted after migration?
- Check migration function logic
- Verify type definitions match migrated data
- Test with sample data before deploying

### Version mismatch errors?
- Ensure `SUPPORTED_VERSIONS` includes all expected versions
- Check that localStorage version key is correct
