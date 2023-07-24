/* imagesTable */
export interface ImagesTable {
  imageId: string;
  mode: number;
  imageUrl: string;
  referenceType: number;
  memberStatus: number;
  userId: string;
  prompt: string;
  good: number;
  shareStatus: number;
  createdAt: number;
  updatedAt: number;
  deletedAt: number;
}

/* 更新処理用 */
export interface UpdateImagesTable {
  mode?: number;
  imageUrl?: string;
  referenceType?: number;
  memberStatus?: number;
  good?: number;
  shareStatus?: number;
  updatedAt?: number;
  deletedAt?: number;
}

export interface ImageReferenceTypeProps {
  userId?: string;
  imageId?: string;
  referenceType: number;
  mode: number;
  updatedAt: number;
}
