import { gql } from '@apollo/client';
import { PRODUCT_FRAGMENT, PRODUCT_CARD_FRAGMENT, ORDER_FRAGMENT } from './fragments';

// Product Queries
export const GET_PRODUCTS = gql`
  query GetProducts($categoryId: ID, $limit: Int, $offset: Int) {
    products(categoryId: $categoryId, limit: $limit, offset: $offset) {
      ...ProductFragment
    }
  }
  ${PRODUCT_FRAGMENT}
`;

export const GET_PRODUCT = gql`
  query GetProduct($id: ID!) {
    product(id: $id) {
      ...ProductFragment
    }
  }
  ${PRODUCT_FRAGMENT}
`;

export const GET_PRODUCTS_CARD = gql`
  query GetProductsCard($categoryId: ID, $limit: Int, $offset: Int) {
    products(categoryId: $categoryId, limit: $limit, offset: $offset) {
      ...ProductCardFragment
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`;

// Category Queries
export const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      id
      name
      slug
      description
      imageUrl
      products {
        id
        name
        price
        images
      }
    }
  }
`;

export const GET_CATEGORY = gql`
  query GetCategory($id: ID!) {
    category(id: $id) {
      id
      name
      slug
      description
      imageUrl
      products {
        id
        name
        price
        images
      }
    }
  }
`;

// Order Queries
export const GET_ORDER = gql`
  query GetOrder($id: ID!) {
    order(id: $id) {
      ...OrderFragment
      user {
        id
        name
        phone
      }
    }
  }
  ${ORDER_FRAGMENT}
`;

export const GET_ORDERS = gql`
  query GetOrders {
    orders {
      id
      totalPrice
      status
      createdAt
      items {
        id
        quantity
        product {
          id
          name
        }
      }
    }
  }
`;

// User Query
export const GET_ME = gql`
  query GetMe {
    me {
      id
      email
      name
      phone
      userType
      isAdmin
      orders {
        id
        totalPrice
        status
        createdAt
      }
    }
  }
`;

// Admin Queries
export const GET_ADMIN_ORDERS = gql`
  query GetAdminOrders {
    adminOrders {
      id
      totalPrice
      status
      paymentReceiptUrl
      createdAt
      updatedAt
      items {
        id
        quantity
        price
        product {
          id
          name
          images
        }
      }
      user {
        id
        name
        phone
      }
    }
  }
`;

export const GET_ADMIN_ME = gql`
  query GetAdminMe {
    adminMe {
      id
      email
      name
      isAdmin
    }
  }
`;

export const GET_USERS = gql`
  query GetUsers {
    users {
      id
      email
      name
      phone
      userType
      createdAt
      orders {
        id
      }
    }
  }
`;

export const GET_ADMIN_STATS = gql`
  query GetAdminStats {
    orders {
      id
      totalPrice
      status
      createdAt
    }
    products {
      id
      stock
    }
    categories {
      id
    }
  }
`;

export const GET_ADMIN_PRODUCTS = gql`
  query GetAdminProducts {
    products {
      ...ProductFragment
    }
  }
  ${PRODUCT_FRAGMENT}
`;

export const GET_ADMIN_PAGES = gql`
  query GetAdminPages {
    adminPages {
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

export const GET_PAGE_PREVIEW = gql`
  query PagePreview($slug: String!) {
    pagePreview(slug: $slug) {
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

export const GET_PAGE_BY_SLUG = gql`
  query GetPageBySlug($slug: String!) {
    page(slug: $slug) {
      id
      slug
      title
      content
      metaTitle
      metaDescription
      updatedAt
    }
  }
`;

export const GET_PAGE_ABOUT = gql`
  query GetAboutPage {
    page(slug: "about") {
      id
      slug
      title
      content
      metaTitle
      metaDescription
      updatedAt
    }
  }
`;
