export interface ProductCardRaw {
  id: string;
  name: string;
  price: number;
  discountedPrice?: number | null;
  stock?: number;
  images?: string[] | null;
  category: {
    id: string;
  };
}

export interface ProductCardView {
  id: string;
  name: string;
  price: number;
  discountedPrice?: number | null;
  image: string;
  categoryId: string;
  stock: number;
}

export interface ProductDetailView {
  id: string;
  name: string;
  price: number;
  discountedPrice?: number | null;
  stock: number;
  description?: string | null;
  descriptionHtml?: string | null;
  images: string[];
  skinType: string[];
  features: string[];
  isKoreanProduct?: boolean;
  category: {
    id: string;
    name: string;
  };
}

export interface ProductCardRelated {
  id: string;
  name: string;
  price: number;
  discountedPrice?: number | null;
  stock?: number;
  images?: string[];
  category: {
    id: string;
  };
}
