import { gql } from '@apollo/client';

// Order Mutations
export const CREATE_ORDER = gql`
  mutation CreateOrder($input: CreateOrderInput!) {
    createOrder(input: $input) {
      id
      totalPrice
      status
      createdAt
      items {
        id
        quantity
        price
        product {
          id
          name
        }
      }
    }
  }
`;

// Payment Mutations
export const UPLOAD_PAYMENT_RECEIPT = gql`
  mutation UploadPaymentReceipt($orderId: ID!, $file: Upload!) {
    uploadPaymentReceipt(orderId: $orderId, file: $file) {
      id
      paymentReceiptUrl
      status
    }
  }
`;

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
  mutation AdminLogin($email: String!, $password: String!) {
    adminLogin(email: $email, password: $password) {
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

export const CREATE_ADMIN = gql`
  mutation CreateAdmin($email: String!, $password: String!, $name: String!) {
    createAdmin(email: $email, password: $password, name: $name) {
      id
      email
      name
      isAdmin
    }
  }
`;

// User Auth Mutations
export const REGISTER = gql`
  mutation Register($email: String!, $password: String!, $name: String!, $phone: String) {
    register(email: $email, password: $password, name: $name, phone: $phone) {
      id
      email
      name
      phone
      userType
    }
  }
`;

export const USER_LOGIN = gql`
  mutation UserLogin($email: String!, $password: String!) {
    userLogin(email: $email, password: $password) {
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
  mutation ForgotPassword($email: String!) {
    forgotPassword(email: $email) {
      message
    }
  }
`;

export const RESET_PASSWORD = gql`
  mutation ResetPassword($token: String!, $email: String!, $newPassword: String!) {
    resetPassword(token: $token, email: $email, newPassword: $newPassword) {
      message
    }
  }
`;

export const UPDATE_USER_SUBSCRIPTION = gql`
  mutation UpdateUserSubscription($userId: ID!, $userType: UserType!) {
    updateUserSubscription(userId: $userId, userType: $userType) {
      id
      email
      name
      userType
    }
  }
`;
