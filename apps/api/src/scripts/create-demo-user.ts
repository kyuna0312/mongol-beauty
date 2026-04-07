import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserType } from '../user/user.entity';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({ path: join(__dirname, '../../.env') });
dotenv.config({ path: join(__dirname, '../../../.env') });

/**
 * Creates or updates a normal storefront user (not admin) for local/demo use.
 * Defaults: demo@mongol-beauty.local / demo1234
 * (Password must be ≥8 chars — matches UserLoginInput validation.)
 */
async function createDemoUser() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'mongol_beauty',
    entities: [join(__dirname, '../**/*.entity.{ts,js}')],
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Connected to database');

    const userRepository = dataSource.getRepository(User);

    const email = process.env.DEMO_USER_EMAIL || 'demo@mongol-beauty.local';
    const password = process.env.DEMO_USER_PASSWORD || 'demo1234';
    const name = process.env.DEMO_USER_NAME || 'Демо хэрэглэгч';

    const existing = await userRepository.findOne({ where: { email } });

    if (existing) {
      console.log('⚠️  Demo user already exists:', email);
      console.log('   Updating password and ensuring role is USER (not admin)...');
      const hashedPassword = await bcrypt.hash(password, 10);
      existing.password = hashedPassword;
      existing.isAdmin = false;
      existing.userType = UserType.USER;
      if (name) existing.name = name;
      await userRepository.save(existing);
      console.log('✅ Demo user updated');
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = userRepository.create({
        email,
        password: hashedPassword,
        name,
        isAdmin: false,
        userType: UserType.USER,
      });
      await userRepository.save(user);
      console.log('✅ Demo user created');
    }

    console.log('\n📋 Storefront (хэрэглэгч) demo credentials:');
    console.log('   Email:   ', email);
    console.log('   Password:', password);
    console.log('   Name:    ', name);
    console.log('\n   Log in at: /login (storefront)');
    console.log('\n💡 Override via .env:');
    console.log('   DEMO_USER_EMAIL=...');
    console.log('   DEMO_USER_PASSWORD=...');
    console.log('   DEMO_USER_NAME=...');

    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Error creating demo user:', error);
    process.exit(1);
  }
}

void createDemoUser();
