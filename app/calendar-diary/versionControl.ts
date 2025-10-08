type Migration<T> = (data: T) => T;

interface VersionControlConfig<T> {
  storageKey: string;
  currentVersion: number;
  supportedVersions: number[];
  migrations: Record<number, Migration<T>>;
}

export class VersionControl<T> {
  private storageKey: string;
  private versionKey: string;
  private currentVersion: number;
  private supportedVersions: number[];
  private migrations: Record<number, Migration<T>>;

  constructor(config: VersionControlConfig<T>) {
    this.storageKey = config.storageKey;
    this.versionKey = `${config.storageKey}-version`;
    this.currentVersion = config.currentVersion;
    this.supportedVersions = config.supportedVersions;
    this.migrations = config.migrations;
  }

  initialize(onClear?: () => void): void {
    const storedVersion = this.getStoredVersion();

    if (storedVersion === null) {
      this.setVersion(this.currentVersion);
      return;
    }

    if (!this.supportedVersions.includes(storedVersion)) {
      console.warn(
        `Unsupported data version ${storedVersion} for ${this.storageKey}. Clearing old data.`,
      );
      onClear?.();
      this.setVersion(this.currentVersion);
      return;
    }

    if (storedVersion < this.currentVersion) {
      const data = this.getData();
      const migrated = this.migrateData(data, storedVersion);
      this.setData(migrated);
      this.setVersion(this.currentVersion);
    }
  }

  private getStoredVersion(): number | null {
    const version = localStorage.getItem(this.versionKey);
    return version ? Number.parseInt(version, 10) : null;
  }

  private setVersion(version: number): void {
    localStorage.setItem(this.versionKey, version.toString());
  }

  private getData(): T {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : ([] as T);
    } catch {
      return [] as T;
    }
  }

  private setData(data: T): void {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  private migrateData(data: T, fromVersion: number): T {
    let result = data;

    for (let version = fromVersion; version < this.currentVersion; version++) {
      const nextVersion = version + 1;

      if (this.migrations[nextVersion]) {
        result = this.migrations[nextVersion](result);
      }
    }

    return result;
  }
}
