export interface HomeCategory {
  id: string;
  name: string;
  slug?: string;
  imageUrl?: string | null;
}

export interface HomeProduct {
  id: string;
  name: string;
  price: number;
  discountedPrice?: number | null;
  images?: string[];
  stock?: number;
  category: {
    id: string;
  };
}
