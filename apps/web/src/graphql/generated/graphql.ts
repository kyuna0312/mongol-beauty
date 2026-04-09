export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** DateTime custom scalar type */
  DateTime: { input: any; output: any; }
  /** The `Upload` scalar type represents a file upload. */
  Upload: { input: any; output: any; }
};

export type AdminLoginInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type AdminOrdersPage = {
  __typename?: 'AdminOrdersPage';
  items: Array<Order>;
  limit: Scalars['Int']['output'];
  offset: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type AdminUser = {
  __typename?: 'AdminUser';
  email: Scalars['String']['output'];
  id: Scalars['String']['output'];
  isAdmin: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
};

export type CartItem = {
  __typename?: 'CartItem';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  product: Product;
  quantity: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
  user: User;
};

export type CartItemInput = {
  productId: Scalars['ID']['input'];
  quantity: Scalars['Int']['input'];
};

export type Category = {
  __typename?: 'Category';
  description: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  imageUrl: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  products: Array<Product>;
  slug: Scalars['String']['output'];
};

export type CreateCategoryInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  imageUrl?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  slug: Scalars['String']['input'];
};

export type CreateOrderInput = {
  items: Array<CreateOrderItemInput>;
  name?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
};

export type CreateOrderItemInput = {
  productId: Scalars['String']['input'];
  quantity: Scalars['Int']['input'];
};

export type CreateProductInput = {
  categoryId: Scalars['ID']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  features?: Array<Scalars['String']['input']>;
  images?: Array<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  price: Scalars['Int']['input'];
  skinType?: Array<Scalars['String']['input']>;
  stock?: Scalars['Int']['input'];
};

export type Feature =
  | 'ACNE_FIGHTING'
  | 'ANTI_AGING'
  | 'BRIGHTENING'
  | 'HYDRATING'
  | 'ORGANIC'
  | 'SUNSCREEN';

export type ForgotPasswordInput = {
  email: Scalars['String']['input'];
};

export type LoginResponse = {
  __typename?: 'LoginResponse';
  access_token: Scalars['String']['output'];
  user: AdminUser;
};

export type MessageResponse = {
  __typename?: 'MessageResponse';
  message: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  adminLogin: LoginResponse;
  clearCart: Scalars['Boolean']['output'];
  confirmPayment: Order;
  createCategory: Category;
  createOrder: Order;
  createProduct: Product;
  deleteCategory: Scalars['Boolean']['output'];
  deletePage: Scalars['Boolean']['output'];
  deleteProduct: Scalars['Boolean']['output'];
  forgotPassword: MessageResponse;
  logout: MessageResponse;
  mergeCart: Array<CartItem>;
  register: User;
  removeCartItem: Array<CartItem>;
  resetPassword: MessageResponse;
  setCartItem: Array<CartItem>;
  updateCategory: Category;
  updateOrderStatus: Order;
  updateProduct: Product;
  updateUserSubscription: User;
  uploadPaymentReceipt: Order;
  upsertPage: Page;
  userLogin: UserLoginResponse;
};


export type MutationAdminLoginArgs = {
  input: AdminLoginInput;
};


export type MutationConfirmPaymentArgs = {
  orderId: Scalars['ID']['input'];
};


export type MutationCreateCategoryArgs = {
  input: CreateCategoryInput;
};


export type MutationCreateOrderArgs = {
  input: CreateOrderInput;
};


export type MutationCreateProductArgs = {
  input: CreateProductInput;
};


export type MutationDeleteCategoryArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeletePageArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteProductArgs = {
  id: Scalars['ID']['input'];
};


export type MutationForgotPasswordArgs = {
  input: ForgotPasswordInput;
};


export type MutationMergeCartArgs = {
  items: Array<CartItemInput>;
};


export type MutationRegisterArgs = {
  input: RegisterInput;
};


export type MutationRemoveCartItemArgs = {
  productId: Scalars['ID']['input'];
};


export type MutationResetPasswordArgs = {
  input: ResetPasswordInput;
};


export type MutationSetCartItemArgs = {
  productId: Scalars['ID']['input'];
  quantity: Scalars['Int']['input'];
};


export type MutationUpdateCategoryArgs = {
  input: UpdateCategoryInput;
};


export type MutationUpdateOrderStatusArgs = {
  orderId: Scalars['ID']['input'];
  status: Scalars['String']['input'];
};


export type MutationUpdateProductArgs = {
  input: UpdateProductInput;
};


export type MutationUpdateUserSubscriptionArgs = {
  userId: Scalars['String']['input'];
  userType: UserType;
};


export type MutationUploadPaymentReceiptArgs = {
  file: Scalars['Upload']['input'];
  orderId: Scalars['ID']['input'];
};


export type MutationUpsertPageArgs = {
  input: UpsertPageInput;
};


export type MutationUserLoginArgs = {
  input: UserLoginInput;
};

export type Order = {
  __typename?: 'Order';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  items: Array<OrderItem>;
  paymentReceiptUrl: Maybe<Scalars['String']['output']>;
  status: OrderStatus;
  totalPrice: Scalars['Float']['output'];
  updatedAt: Scalars['DateTime']['output'];
  user: Maybe<User>;
};

export type OrderItem = {
  __typename?: 'OrderItem';
  id: Scalars['ID']['output'];
  price: Scalars['Float']['output'];
  product: Product;
  quantity: Scalars['Float']['output'];
};

export type OrderStatus =
  | 'CANCELLED'
  | 'COMPLETED'
  | 'CONFIRMED'
  | 'SHIPPING'
  | 'WAITING_PAYMENT';

export type Page = {
  __typename?: 'Page';
  content: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  isPublished: Scalars['Boolean']['output'];
  metaDescription: Maybe<Scalars['String']['output']>;
  metaTitle: Maybe<Scalars['String']['output']>;
  slug: Scalars['String']['output'];
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type Product = {
  __typename?: 'Product';
  category: Category;
  createdAt: Scalars['DateTime']['output'];
  description: Maybe<Scalars['String']['output']>;
  discountedPrice: Maybe<Scalars['Float']['output']>;
  features: Array<Feature>;
  id: Scalars['ID']['output'];
  images: Array<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  price: Scalars['Float']['output'];
  skinType: Array<SkinType>;
  stock: Scalars['Float']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type Query = {
  __typename?: 'Query';
  adminMe: Maybe<User>;
  adminOrders: AdminOrdersPage;
  adminPages: Array<Page>;
  categories: Array<Category>;
  category: Maybe<Category>;
  me: Maybe<User>;
  myCart: Array<CartItem>;
  order: Maybe<Order>;
  orders: Array<Order>;
  page: Maybe<Page>;
  pagePreview: Maybe<Page>;
  product: Maybe<Product>;
  products: Array<Product>;
  productsByIds: Array<Product>;
  users: Array<User>;
};


export type QueryAdminOrdersArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<OrderStatus>;
};


export type QueryCategoryArgs = {
  id: Scalars['ID']['input'];
};


export type QueryOrderArgs = {
  id: Scalars['ID']['input'];
};


export type QueryPageArgs = {
  slug: Scalars['String']['input'];
};


export type QueryPagePreviewArgs = {
  slug: Scalars['String']['input'];
};


export type QueryProductArgs = {
  categoryId?: InputMaybe<Scalars['ID']['input']>;
  id: Scalars['ID']['input'];
};


export type QueryProductsArgs = {
  categoryId?: InputMaybe<Scalars['ID']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryProductsByIdsArgs = {
  ids: Array<Scalars['ID']['input']>;
};

export type RegisterInput = {
  email: Scalars['String']['input'];
  name: Scalars['String']['input'];
  password: Scalars['String']['input'];
  phone?: InputMaybe<Scalars['String']['input']>;
};

export type ResetPasswordInput = {
  email: Scalars['String']['input'];
  newPassword: Scalars['String']['input'];
  token: Scalars['String']['input'];
};

export type SkinType =
  | 'COMBINATION'
  | 'DRY'
  | 'NORMAL'
  | 'OILY'
  | 'SENSITIVE';

export type UpdateCategoryInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  imageUrl?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateProductInput = {
  categoryId?: InputMaybe<Scalars['ID']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  features?: InputMaybe<Array<Scalars['String']['input']>>;
  id: Scalars['ID']['input'];
  images?: InputMaybe<Array<Scalars['String']['input']>>;
  name?: InputMaybe<Scalars['String']['input']>;
  price?: InputMaybe<Scalars['Int']['input']>;
  skinType?: InputMaybe<Array<Scalars['String']['input']>>;
  stock?: InputMaybe<Scalars['Int']['input']>;
};

export type UpsertPageInput = {
  content: Scalars['String']['input'];
  isPublished?: InputMaybe<Scalars['Boolean']['input']>;
  metaDescription?: InputMaybe<Scalars['String']['input']>;
  metaTitle?: InputMaybe<Scalars['String']['input']>;
  slug: Scalars['String']['input'];
  title: Scalars['String']['input'];
};

export type User = {
  __typename?: 'User';
  createdAt: Scalars['DateTime']['output'];
  email: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isAdmin: Scalars['Boolean']['output'];
  name: Maybe<Scalars['String']['output']>;
  orders: Array<Order>;
  phone: Maybe<Scalars['String']['output']>;
  userType: UserType;
};

export type UserLoginInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type UserLoginResponse = {
  __typename?: 'UserLoginResponse';
  access_token: Scalars['String']['output'];
  user: UserResponse;
};

export type UserResponse = {
  __typename?: 'UserResponse';
  email: Scalars['String']['output'];
  id: Scalars['String']['output'];
  isAdmin: Scalars['Boolean']['output'];
  name: Maybe<Scalars['String']['output']>;
  phone: Maybe<Scalars['String']['output']>;
  userType: UserType;
};

export type UserType =
  | 'ADMIN'
  | 'SUBSCRIBED_USER'
  | 'USER';

export type GetMyCartQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMyCartQuery = { __typename?: 'Query', myCart: Array<{ __typename?: 'CartItem', quantity: number, product: { __typename?: 'Product', id: string, name: string, price: number, images: Array<string>, stock: number } }> };

export type SetCartItemMutationVariables = Exact<{
  productId: Scalars['ID']['input'];
  quantity: Scalars['Int']['input'];
}>;


export type SetCartItemMutation = { __typename?: 'Mutation', setCartItem: Array<{ __typename?: 'CartItem', id: string, quantity: number, product: { __typename?: 'Product', id: string } }> };

export type RemoveCartItemMutationVariables = Exact<{
  productId: Scalars['ID']['input'];
}>;


export type RemoveCartItemMutation = { __typename?: 'Mutation', removeCartItem: Array<{ __typename?: 'CartItem', id: string, quantity: number, product: { __typename?: 'Product', id: string } }> };

export type ClearCartMutationVariables = Exact<{ [key: string]: never; }>;


export type ClearCartMutation = { __typename?: 'Mutation', clearCart: boolean };

export type MergeCartMutationVariables = Exact<{
  items: Array<CartItemInput> | CartItemInput;
}>;


export type MergeCartMutation = { __typename?: 'Mutation', mergeCart: Array<{ __typename?: 'CartItem', id: string, quantity: number, product: { __typename?: 'Product', id: string } }> };

export type GetProductsForCartQueryVariables = Exact<{
  ids: Array<Scalars['ID']['input']> | Scalars['ID']['input'];
}>;


export type GetProductsForCartQuery = { __typename?: 'Query', productsByIds: Array<{ __typename?: 'Product', id: string, name: string, price: number, images: Array<string>, stock: number }> };

export type GetProductsQueryVariables = Exact<{
  categoryId?: InputMaybe<Scalars['ID']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetProductsQuery = { __typename?: 'Query', products: Array<{ __typename?: 'Product', id: string, name: string, price: number, discountedPrice: number | null, stock: number, images: Array<string>, category: { __typename?: 'Category', id: string } }> };

export type GetCategoryQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetCategoryQuery = { __typename?: 'Query', category: { __typename?: 'Category', id: string, name: string } | null };

export type GetProductQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetProductQuery = { __typename?: 'Query', product: { __typename?: 'Product', id: string, name: string, price: number, discountedPrice: number | null, stock: number, description: string | null, images: Array<string>, skinType: Array<SkinType>, features: Array<Feature>, category: { __typename?: 'Category', id: string, name: string } } | null };

export type GetRelatedProductsQueryVariables = Exact<{
  categoryId: Scalars['ID']['input'];
}>;


export type GetRelatedProductsQuery = { __typename?: 'Query', products: Array<{ __typename?: 'Product', id: string, name: string, price: number, discountedPrice: number | null, stock: number, images: Array<string>, category: { __typename?: 'Category', id: string } }> };

export type ProductFragmentFragment = { __typename?: 'Product', id: string, name: string, price: number, discountedPrice: number | null, stock: number, images: Array<string>, description: string | null, skinType: Array<SkinType>, features: Array<Feature>, category: { __typename?: 'Category', id: string, name: string, slug: string } };

export type ProductCardFragmentFragment = { __typename?: 'Product', id: string, name: string, price: number, discountedPrice: number | null, stock: number, images: Array<string>, category: { __typename?: 'Category', id: string } };

export type OrderItemFragmentFragment = { __typename?: 'OrderItem', id: string, quantity: number, price: number, product: { __typename?: 'Product', id: string, name: string, images: Array<string>, price: number } };

export type OrderFragmentFragment = { __typename?: 'Order', id: string, totalPrice: number, status: OrderStatus, paymentReceiptUrl: string | null, createdAt: any, updatedAt: any, items: Array<{ __typename?: 'OrderItem', id: string, quantity: number, price: number, product: { __typename?: 'Product', id: string, name: string, images: Array<string>, price: number } }> };

export type GetCategoriesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCategoriesQuery = { __typename?: 'Query', categories: Array<{ __typename?: 'Category', id: string, name: string, slug: string, imageUrl: string | null }> };

export type GetFeaturedProductsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetFeaturedProductsQuery = { __typename?: 'Query', products: Array<{ __typename?: 'Product', id: string, name: string, price: number, discountedPrice: number | null, stock: number, images: Array<string>, category: { __typename?: 'Category', id: string } }> };

export type ConfirmPaymentMutationVariables = Exact<{
  orderId: Scalars['ID']['input'];
}>;


export type ConfirmPaymentMutation = { __typename?: 'Mutation', confirmPayment: { __typename?: 'Order', id: string, status: OrderStatus, paymentReceiptUrl: string | null } };

export type UpdateOrderStatusMutationVariables = Exact<{
  orderId: Scalars['ID']['input'];
  status: Scalars['String']['input'];
}>;


export type UpdateOrderStatusMutation = { __typename?: 'Mutation', updateOrderStatus: { __typename?: 'Order', id: string, status: OrderStatus, updatedAt: any } };

export type CreateProductMutationVariables = Exact<{
  input: CreateProductInput;
}>;


export type CreateProductMutation = { __typename?: 'Mutation', createProduct: { __typename?: 'Product', id: string, name: string, price: number, stock: number, description: string | null, images: Array<string>, skinType: Array<SkinType>, features: Array<Feature>, category: { __typename?: 'Category', id: string, name: string } } };

export type UpdateProductMutationVariables = Exact<{
  input: UpdateProductInput;
}>;


export type UpdateProductMutation = { __typename?: 'Mutation', updateProduct: { __typename?: 'Product', id: string, name: string, price: number, stock: number, description: string | null, images: Array<string>, skinType: Array<SkinType>, features: Array<Feature>, category: { __typename?: 'Category', id: string, name: string } } };

export type DeleteProductMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteProductMutation = { __typename?: 'Mutation', deleteProduct: boolean };

export type CreateCategoryMutationVariables = Exact<{
  input: CreateCategoryInput;
}>;


export type CreateCategoryMutation = { __typename?: 'Mutation', createCategory: { __typename?: 'Category', id: string, name: string, slug: string, description: string | null, imageUrl: string | null } };

export type UpdateCategoryMutationVariables = Exact<{
  input: UpdateCategoryInput;
}>;


export type UpdateCategoryMutation = { __typename?: 'Mutation', updateCategory: { __typename?: 'Category', id: string, name: string, slug: string, description: string | null, imageUrl: string | null } };

export type DeleteCategoryMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteCategoryMutation = { __typename?: 'Mutation', deleteCategory: boolean };

export type AdminLoginMutationVariables = Exact<{
  input: AdminLoginInput;
}>;


export type AdminLoginMutation = { __typename?: 'Mutation', adminLogin: { __typename?: 'LoginResponse', access_token: string, user: { __typename?: 'AdminUser', id: string, email: string, name: string, isAdmin: boolean } } };

export type RegisterMutationVariables = Exact<{
  input: RegisterInput;
}>;


export type RegisterMutation = { __typename?: 'Mutation', register: { __typename?: 'User', id: string, email: string | null, name: string | null, phone: string | null, userType: UserType } };

export type UserLoginMutationVariables = Exact<{
  input: UserLoginInput;
}>;


export type UserLoginMutation = { __typename?: 'Mutation', userLogin: { __typename?: 'UserLoginResponse', access_token: string, user: { __typename?: 'UserResponse', id: string, email: string, name: string | null, phone: string | null, userType: UserType, isAdmin: boolean } } };

export type ForgotPasswordMutationVariables = Exact<{
  input: ForgotPasswordInput;
}>;


export type ForgotPasswordMutation = { __typename?: 'Mutation', forgotPassword: { __typename?: 'MessageResponse', message: string } };

export type ResetPasswordMutationVariables = Exact<{
  input: ResetPasswordInput;
}>;


export type ResetPasswordMutation = { __typename?: 'Mutation', resetPassword: { __typename?: 'MessageResponse', message: string } };

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = { __typename?: 'Mutation', logout: { __typename?: 'MessageResponse', message: string } };

export type UpdateUserSubscriptionMutationVariables = Exact<{
  userId: Scalars['String']['input'];
  userType: UserType;
}>;


export type UpdateUserSubscriptionMutation = { __typename?: 'Mutation', updateUserSubscription: { __typename?: 'User', id: string, email: string | null, name: string | null, userType: UserType } };

export type UpsertPageMutationVariables = Exact<{
  input: UpsertPageInput;
}>;


export type UpsertPageMutation = { __typename?: 'Mutation', upsertPage: { __typename?: 'Page', id: string, slug: string, title: string, content: string, metaTitle: string | null, metaDescription: string | null, isPublished: boolean, updatedAt: any } };

export type GetOrderQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetOrderQuery = { __typename?: 'Query', order: { __typename?: 'Order', id: string, totalPrice: number, status: OrderStatus, paymentReceiptUrl: string | null, createdAt: any, items: Array<{ __typename?: 'OrderItem', id: string, quantity: number, price: number, product: { __typename?: 'Product', id: string, name: string, images: Array<string> } }> } | null };

export type CreateOrderMutationVariables = Exact<{
  input: CreateOrderInput;
}>;


export type CreateOrderMutation = { __typename?: 'Mutation', createOrder: { __typename?: 'Order', id: string, totalPrice: number, status: OrderStatus } };

export type UploadPaymentReceiptMutationVariables = Exact<{
  file: Scalars['Upload']['input'];
  orderId: Scalars['ID']['input'];
}>;


export type UploadPaymentReceiptMutation = { __typename?: 'Mutation', uploadPaymentReceipt: { __typename?: 'Order', id: string, paymentReceiptUrl: string | null } };

export type GetOrdersQueryVariables = Exact<{ [key: string]: never; }>;


export type GetOrdersQuery = { __typename?: 'Query', orders: Array<{ __typename?: 'Order', id: string, totalPrice: number, status: OrderStatus, createdAt: any, items: Array<{ __typename?: 'OrderItem', id: string, quantity: number, product: { __typename?: 'Product', id: string, name: string } }> }> };

export type GetAdminCategoryQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetAdminCategoryQuery = { __typename?: 'Query', category: { __typename?: 'Category', id: string, name: string, slug: string, description: string | null, imageUrl: string | null } | null };

export type GetAdminCategoriesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAdminCategoriesQuery = { __typename?: 'Query', categories: Array<{ __typename?: 'Category', id: string, name: string, slug: string, description: string | null, imageUrl: string | null, products: Array<{ __typename?: 'Product', id: string }> }> };

export type GetMeQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMeQuery = { __typename?: 'Query', me: { __typename?: 'User', id: string, email: string | null, name: string | null, phone: string | null, userType: UserType, isAdmin: boolean, orders: Array<{ __typename?: 'Order', id: string, totalPrice: number, status: OrderStatus, createdAt: any }> } | null };

export type GetAdminOrdersQueryVariables = Exact<{
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<OrderStatus>;
}>;


export type GetAdminOrdersQuery = { __typename?: 'Query', adminOrders: { __typename?: 'AdminOrdersPage', total: number, limit: number, offset: number, items: Array<{ __typename?: 'Order', id: string, totalPrice: number, status: OrderStatus, paymentReceiptUrl: string | null, createdAt: any, updatedAt: any, items: Array<{ __typename?: 'OrderItem', id: string, quantity: number, price: number, product: { __typename?: 'Product', id: string, name: string, images: Array<string> } }>, user: { __typename?: 'User', id: string, name: string | null, phone: string | null } | null }> } };

export type GetAdminMeQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAdminMeQuery = { __typename?: 'Query', adminMe: { __typename?: 'User', id: string, email: string | null, name: string | null, isAdmin: boolean } | null };

export type GetUsersQueryVariables = Exact<{ [key: string]: never; }>;


export type GetUsersQuery = { __typename?: 'Query', users: Array<{ __typename?: 'User', id: string, email: string | null, name: string | null, phone: string | null, userType: UserType, createdAt: any, orders: Array<{ __typename?: 'Order', id: string }> }> };

export type GetAdminStatsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAdminStatsQuery = { __typename?: 'Query', orders: Array<{ __typename?: 'Order', id: string, totalPrice: number, status: OrderStatus, createdAt: any }>, products: Array<{ __typename?: 'Product', id: string, stock: number }>, categories: Array<{ __typename?: 'Category', id: string }> };

export type GetAdminProductsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAdminProductsQuery = { __typename?: 'Query', products: Array<{ __typename?: 'Product', id: string, name: string, price: number, discountedPrice: number | null, stock: number, images: Array<string>, description: string | null, skinType: Array<SkinType>, features: Array<Feature>, category: { __typename?: 'Category', id: string, name: string, slug: string } }> };

export type GetAdminPagesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAdminPagesQuery = { __typename?: 'Query', adminPages: Array<{ __typename?: 'Page', id: string, slug: string, title: string, content: string, metaTitle: string | null, metaDescription: string | null, isPublished: boolean, updatedAt: any }> };

export type PagePreviewQueryVariables = Exact<{
  slug: Scalars['String']['input'];
}>;


export type PagePreviewQuery = { __typename?: 'Query', pagePreview: { __typename?: 'Page', id: string, slug: string, title: string, content: string, metaTitle: string | null, metaDescription: string | null, isPublished: boolean, updatedAt: any } | null };

export type GetPageBySlugQueryVariables = Exact<{
  slug: Scalars['String']['input'];
}>;


export type GetPageBySlugQuery = { __typename?: 'Query', page: { __typename?: 'Page', id: string, slug: string, title: string, content: string, metaTitle: string | null, metaDescription: string | null, updatedAt: any } | null };

export type GetAboutPageQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAboutPageQuery = { __typename?: 'Query', page: { __typename?: 'Page', id: string, slug: string, title: string, content: string, metaTitle: string | null, metaDescription: string | null, updatedAt: any } | null };
