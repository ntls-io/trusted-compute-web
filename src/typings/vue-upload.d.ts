declare module "@websanova/vue-upload" {
  import type { App } from "@vue/runtime-core";

  type UploadPlugins = Record<string, unknown>;
  type UploadDrivers = Record<string, unknown>;
  type UploadOptions = {
    url?: string;
    preFetchUrl?: boolean;
    name?: string;
    accept?: string;
    body?: Record<string, unknown>;
    dropzoneId?: string;
    onSelect?: (
      files,
      error: { code: string; msg: string } | undefined
    ) => unknown;
    onStart?: () => unknown;
    onQueue?: (file: UploadFile) => unknown;
    onProgress?: (file: UploadFile, e: ProgressEvent) => unknown;
    onPrefetchUrl?: (res: unknown) => unknown;
    onUpload?: (file: UploadFile, e: ProgressEvent) => unknown;
    onError?: (file: UploadFile, res: unknown) => unknown;
    onSuccess?: (file: UploadFile, res: unknown) => unknown;
    onComplete?: (file: UploadFile, res: unknown) => unknown;
    onEnd?: () => unknown;
    startOnSelect?: boolean;
    extensions?: string[];
    multiple?: boolean;
    maxFilesSelect?: number;
    maxFilesInProgress?: number;
    maxSizePerFile?: number;
    maxFilesSelectMsg?: string;
    maxFileSizeMsg?: string;
    invalidExtensionMsg?: string;
    parseErrors?: (res: unknown) => unknown;
    http?: (data: unknown) => unknown;

    plugins?: UploadPlugins;
    drivers?: UploadDrivers;
  };

  function createUpload(options?: UploadOptions): Upload;
  function useUpload(key?: string = "upload"): Upload;

  declare class Upload {
    constructor(Vue: Vue, options?: UploadOptions);
    plugins: UploadPlugins;
    drivers: UploadDrivers;
    options: UploadOptions;
    $vm: Vue;
    on(name: string, options: UploadOptions): void;
    off(name: string): void;
    reset(name: string): void;
    select(name: string): void;
    start(name: string): void;
    files(name: string): UploadFile[];
    file(name: string): UploadFile;
    exists(name: string): boolean;
    meta(name: string): { state: string; percentComplete: number };
    percent(name: string): number;
    state(name: string): string;
    dropzone(name: string): { active: boolean };
    option(name: string, key: name, val: unknown): void;
    errors(name: string): UploadFile[];

    // Vue 3 plugin:
    install(app: App, key: string): void;
  }

  interface UploadFile {
    $id: string;
    $file: File;
    $request: unknown;
    $raw: string | null;
    $instance: Upload;
    name: string;
    size: number;
    type: string;
    extension: string;
    state: string;
    active: string;
    sending: boolean;
    errors: [{ code: string; msg: string }];
    error: { code: string; msg: string };
    percentComplete: number;
    preview(cb: (file: File) => unknown): void;
    clear(): void;
  }
}

declare module "@websanova/vue-upload/src/drivers/http/axios";
