import { gql } from '@apollo/client';
import { PRODUCT_FRAGMENT } from './fragments';

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

export const GET_ADMIN_CATEGORY = gql`
  query GetAdminCategory($id: ID!) {
    category(id: $id) {
      id
      name
      slug
      description
      imageUrl
      parent {
        id
        name
      }
    }
  }
`;

export const GET_ADMIN_CATEGORIES = gql`
  query GetAdminCategories {
    categories {
      id
      name
      slug
      description
      imageUrl
      parent {
        id
        name
      }
      children {
        id
        name
      }
      products {
        id
      }
    }
  }
`;

export const GET_CATEGORIES_TREE = gql`
  query GetCategoriesTree {
    categoriesTree {
      id
      name
      slug
      children {
        id
        name
        slug
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
  query GetAdminOrders($limit: Int, $offset: Int, $status: OrderStatus) {
    adminOrders(limit: $limit, offset: $offset, status: $status) {
      total
      limit
      offset
      items {
        id
        totalPrice
        deliveryFee
        paymentMethod
        status
        paymentReceiptUrl
        deliveryAddress
        deliveryNote
        notes
        supplierName
        koreaTrackingId
        estimatedDays
        createdAt
        updatedAt
        items {
          id
          quantity
          price
          product {
            id
            name
          }
        }
        user {
          id
          name
          phone
        }
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
    adminStats {
      totalOrders
      completedRevenue
      pendingOrders
      totalProducts
      lowStockProducts
      recentOrders {
        id
        totalPrice
        status
        createdAt
      }
    }
  }
`;

export const GET_ADMIN_PRODUCTS = gql`
  query GetAdminProducts {
    adminProducts {
      ...ProductFragment
      isVisible
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

export const VALIDATE_VOUCHER = gql`
  query ValidateVoucher($code: String!) {
    validateVoucher(code: $code) {
      discountPercent
    }
  }
`;

export const GET_SITE_SETTINGS = gql`
  query GetSiteSettings {
    siteSettings {
      id
      bankName
      bankAccount
      bankOwner
      phone
      email
      address
      deliveryFee
      freeDeliveryThreshold
      logoUrl
      primaryColor
      updatedAt
    }
  }
`;
