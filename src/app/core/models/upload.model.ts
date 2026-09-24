export type StorageDriver = 'LOCAL' | 'S3';

export interface UploadRecord {
  id: string;
  uploadedById: string;
  originalName: string;
  storedKey: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  driver: StorageDriver;
  entityType?: string | null;
  entityId?: string | null;
  createdAt: string;
  uploadedBy?: { firstName: string; lastName: string; email: string };
}

/** Matches the entityType strings used across the app so uploads can be filtered per-owner. */
export type UploadEntityType = 'PROJECT' | 'TASK' | 'REQUEST' | 'USER' | (string & {});
