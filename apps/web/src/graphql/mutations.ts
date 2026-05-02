import { gql } from '@apollo/client';

// Admin Mutations
export const CONFIRM_PAYMENT = gql`
  mutation ConfirmPayment($orderId: ID!) {
    confirmPayment(orderId: $orderId) {
      id
      status
      paymentReceiptUrl
    }
  }
`;

export const UPDATE_ORDER_STATUS = gql`
  mutation UpdateOrderStatus($orderId: ID!, $status: OrderStatus!) {
    updateOrderStatus(orderId: $orderId, status: $status) {
      id
      status
      updatedAt
    }
  }
`;

// Admin Product Mutations
export const CREATE_PRODUCT = gql`
  mutation CreateProduct($input: CreateProductInput!) {
    createProduct(input: $input) {
      id
      name
      price
      stock
      description
      images
      skinType
      features
      isVisible
      category {
        id
        name
      }
    }
  }
`;

export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($input: UpdateProductInput!) {
    updateProduct(input: $input) {
      id
      name
      price
      stock
      description
      images
      skinType
      features
      isVisible
      category {
        id
        name
      }
    }
  }
`;

export const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: ID!) {
    deleteProduct(id: $id)
  }
`;

// Admin Category Mutations
export const CREATE_CATEGORY = gql`
  mutation CreateCategory($input: CreateCategoryInput!) {
    createCategory(input: $input) {
      id
      name
      slug
      description
      imageUrl
    }
  }
`;

export const UPDATE_CATEGORY = gql`
  mutation UpdateCategory($input: UpdateCategoryInput!) {
    updateCategory(input: $input) {
      id
      name
      slug
      description
      imageUrl
    }
  }
`;

export const DELETE_CATEGORY = gql`
  mutation DeleteCategory($id: ID!) {
    deleteCategory(id: $id)
  }
`;

// Admin Auth Mutations
export const ADMIN_LOGIN = gql`
  mutation AdminLogin($input: AdminLoginInput!) {
    adminLogin(input: $input) {
      access_token
      user {
        id
        email
        name
        isAdmin
      }
    }
  }
`;

// User Auth Mutations
export const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      id
      email
      name
      phone
      userType
    }
  }
`;

export const USER_LOGIN = gql`
  mutation UserLogin($input: UserLoginInput!) {
    userLogin(input: $input) {
      access_token
      user {
        id
        email
        name
        phone
        userType
        isAdmin
      }
    }
  }
`;

export const FORGOT_PASSWORD = gql`
  mutation ForgotPassword($input: ForgotPasswordInput!) {
    forgotPassword(input: $input) {
      message
    }
  }
`;

export const RESET_PASSWORD = gql`
  mutation ResetPassword($input: ResetPasswordInput!) {
    resetPassword(input: $input) {
      message
    }
  }
`;

export const LOGOUT = gql`
  mutation Logout {
    logout {
      message
    }
  }
`;

export const UPDATE_USER_SUBSCRIPTION = gql`
  mutation UpdateUserSubscription($userId: String!, $userType: UserType!) {
    updateUserSubscription(userId: $userId, userType: $userType) {
      id
      email
      name
      userType
    }
  }
`;

export const UPSERT_PAGE = gql`
  mutation UpsertPage($input: UpsertPageInput!) {
    upsertPage(input: $input) {
      id
      slug
      title
      content
      metaTitle
      metaDescription
      isPublished
      updatedAt
    }
  }
`;

export const UPDATE_SITE_SETTINGS = gql`
  mutation UpdateSiteSettings($input: UpdateSiteSettingsInput!) {
    updateSiteSettings(input: $input) {
      id
      bankName
      bankAccount
      bankOwner
      phone
      email
      address
      logoUrl
      primaryColor
      updatedAt
    }
  }
`;
