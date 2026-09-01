export class PhotoPreview {
  private objectUrl?: string;

  create(fileOrBlob: File | Blob): string | null {
    if (!fileOrBlob || fileOrBlob.size === 0) return null;
    this.clear();
    this.objectUrl = URL.createObjectURL(fileOrBlob);
    return this.objectUrl;
  }

  clear(): void {
    if (!this.objectUrl) return;
    URL.revokeObjectURL(this.objectUrl);
    this.objectUrl = undefined;
  }
}

export class PhotoUrlRegistry {
  private objectUrls: string[] = [];

  create(fileOrBlob: File | Blob): string | null {
    if (!fileOrBlob || fileOrBlob.size === 0) return null;
    const objectUrl = URL.createObjectURL(fileOrBlob);
    this.objectUrls.push(objectUrl);
    return objectUrl;
  }

  clear(): void {
    this.objectUrls.forEach((objectUrl) => URL.revokeObjectURL(objectUrl));
    this.objectUrls = [];
  }
}
