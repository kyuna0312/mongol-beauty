import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserType } from '../user/user.entity';
import { Order } from '../order/order.entity';
import { OrderItem } from '../order/order-item.entity';
import { Product } from '../product/product.entity';
import { Category } from '../category/category.entity';
import * as dotenv from 'dotenv';
import { join } from 'path';

// Load environment variables
dotenv.config({ path: join(__dirname, '../../.env') });
dotenv.config({ path: join(__dirname, '../../../.env') });

async function createAdmin() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'mongol_beauty',
    // Include all entities in the relationship chain:
    // User -> Order -> OrderItem -> Product -> Category
    entities: [User, Order, OrderItem, Product, Category],
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Connected to database');

    const userRepository = dataSource.getRepository(User);

    // Default admin credentials
    const email = process.env.ADMIN_EMAIL || 'admin@incellderm.mn';
    const password = process.env.ADMIN_PASSWORD || 'admin123';
    const name = process.env.ADMIN_NAME || 'Админ';

    // Check if admin already exists
    const existingAdmin = await userRepository.findOne({
      where: { email },
    });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists with email:', email);
      console.log('   Updating password and user type...');
      const hashedPassword = await bcrypt.hash(password, 10);
      existingAdmin.password = hashedPassword;
      existingAdmin.isAdmin = true;
      existingAdmin.userType = UserType.ADMIN;
      await userRepository.save(existingAdmin);
      console.log('✅ Admin password and user type updated');
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const admin = userRepository.create({
        email,
        password: hashedPassword,
        name,
        isAdmin: true,
        userType: UserType.ADMIN,
      });

      await userRepository.save(admin);
      console.log('✅ Admin user created successfully!');
    }

    console.log('\n📋 Admin Credentials:');
    console.log('   Email:', email);
    console.log('   Password:', password);
    console.log('   Name:', name);
    console.log('\n💡 You can change these in your .env file:');
    console.log('   ADMIN_EMAIL=your-email@example.com');
    console.log('   ADMIN_PASSWORD=your-secure-password');
    console.log('   ADMIN_NAME=Your Name');

    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();
