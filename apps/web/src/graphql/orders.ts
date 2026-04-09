import { gql } from '@apollo/client';

export const GET_ORDER_DETAIL = gql`
  query GetOrder($id: ID!) {
    order(id: $id) {
      id
      totalPrice
      status
      paymentReceiptUrl
      createdAt
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
    }
  }
`;

export const CREATE_ORDER_SIMPLE = gql`
  mutation CreateOrder($input: CreateOrderInput!) {
    createOrder(input: $input) {
      id
      totalPrice
      status
    }
  }
`;

export const UPLOAD_PAYMENT_RECEIPT_SIMPLE = gql`
  mutation UploadPaymentReceipt($orderId: ID!, $file: Upload!) {
    uploadPaymentReceipt(orderId: $orderId, file: $file) {
      id
      paymentReceiptUrl
    }
  }
`;
