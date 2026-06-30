export type ProductCategory = {
  id: string;
  name: string;
};

export type UnitOfMeasure = {
  id: string;
  name: string;
};

export type Product = {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  description: string;
  categoryId: string;
  categoryName: string;
  unitOfMeasureId: string;
  unitOfMeasureName: string;
  imageUrl: string;
  isActive: boolean;
  defaultMinPickingThreshold: number;
  defaultTargetPickingQuantity: number;
};

export type ProductPayload = {
  sku: string;
  barcode: string;
  name: string;
  description: string;
  categoryId: string;
  unitOfMeasureId: string;
  imageUrl: string;
  isActive: boolean;
  defaultMinPickingThreshold: number;
  defaultTargetPickingQuantity: number;
};

export type ProductCategoryPayload = {
  name: string;
};

export type UnitOfMeasurePayload = {
  name: string;
};

export type ProductFormState = {
  error: string | null;
  successMessage: string | null;
};

export type CatalogSetupFormState = {
  error: string | null;
  successMessage: string | null;
};
