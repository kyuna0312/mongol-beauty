import { OrderService } from '../order.service';
import { Order } from '../order.entity';
import { CreateOrderInput } from '../dto/create-order.input';

describe('OrderService', () => {
  describe('create', () => {
    it('returns existing order when idempotency key already exists', async () => {
      const existing = {
        id: 'order-existing',
        idempotencyKey: 'idem-1',
      } as Order;

      const orderRepository = {
        findOne: jest.fn().mockResolvedValue(existing),
        save: jest.fn(),
        create: jest.fn(),
      };

      const dataSource = {
        transaction: jest.fn(),
      };

      const service = new OrderService(orderRepository as any, dataSource as any);

      const input: CreateOrderInput = {
        items: [{ productId: 'prod-1', quantity: 1 }],
      };

      const result = await service.create(input, 'user-1', 'idem-1');

      expect(result).toBe(existing);
      expect(orderRepository.findOne).toHaveBeenCalledWith({
        where: { idempotencyKey: 'idem-1' },
        relations: ['items', 'items.product', 'user'],
      });
      expect(dataSource.transaction).not.toHaveBeenCalled();
    });
  });
});
