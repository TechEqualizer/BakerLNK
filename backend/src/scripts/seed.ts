import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  await prisma.galleryInquiry.deleteMany();
  await prisma.message.deleteMany();
  await prisma.order.deleteMany();
  await prisma.gallery.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.baker.deleteMany();
  await prisma.theme.deleteMany();
  await prisma.user.deleteMany();

  // Create a sample user and baker
  const passwordHash = await bcrypt.hash('password123', 12);
  
  const user = await prisma.user.create({
    data: {
      email: 'baker@example.com',
      passwordHash,
      name: 'Sarah Johnson',
      role: 'baker'
    }
  });

  const baker = await prisma.baker.create({
    data: {
      userId: user.id,
      businessName: 'Sweet Dreams Bakery',
      tagline: 'Creating magical moments, one cake at a time',
      leadTimeDays: 7
    }
  });

  // Create sample themes
  const themes = await Promise.all([
    prisma.theme.create({
      data: {
        themeName: 'Golden Elegance',
        cssVariables: `
          :root {
            --background: 43 100% 98%;
            --foreground: 43 5% 9%;
            --primary: 43 96% 56%;
            --primary-foreground: 43 5% 9%;
            --secondary: 43 30% 95%;
            --secondary-foreground: 43 5% 9%;
            --muted: 43 30% 95%;
            --muted-foreground: 43 5% 45%;
            --accent: 43 30% 90%;
            --accent-foreground: 43 5% 9%;
            --card: 43 50% 99%;
            --card-foreground: 43 5% 9%;
            --border: 43 30% 89%;
            --input: 43 30% 89%;
            --ring: 43 96% 56%;
            --chart-1: 43 96% 56%;
            --chart-2: 25 95% 53%;
          }
        `,
        isActive: true
      }
    }),
    prisma.theme.create({
      data: {
        themeName: 'Rose Garden',
        cssVariables: `
          :root {
            --background: 315 100% 98%;
            --foreground: 315 5% 9%;
            --primary: 315 96% 56%;
            --primary-foreground: 315 5% 9%;
            --secondary: 315 30% 95%;
            --secondary-foreground: 315 5% 9%;
            --muted: 315 30% 95%;
            --muted-foreground: 315 5% 45%;
            --accent: 315 30% 90%;
            --accent-foreground: 315 5% 9%;
            --card: 315 50% 99%;
            --card-foreground: 315 5% 9%;
            --border: 315 30% 89%;
            --input: 315 30% 89%;
            --ring: 315 96% 56%;
            --chart-1: 315 96% 56%;
            --chart-2: 25 95% 53%;
          }
        `,
        isActive: true
      }
    }),
    prisma.theme.create({
      data: {
        themeName: 'Chocolate Delight',
        cssVariables: `
          :root {
            --background: 25 100% 98%;
            --foreground: 25 5% 9%;
            --primary: 25 96% 56%;
            --primary-foreground: 25 5% 9%;
            --secondary: 25 30% 95%;
            --secondary-foreground: 25 5% 9%;
            --muted: 25 30% 95%;
            --muted-foreground: 25 5% 45%;
            --accent: 25 30% 90%;
            --accent-foreground: 25 5% 9%;
            --card: 25 50% 99%;
            --card-foreground: 25 5% 9%;
            --border: 25 30% 89%;
            --input: 25 30% 89%;
            --ring: 25 96% 56%;
            --chart-1: 25 96% 56%;
            --chart-2: 315 95% 53%;
          }
        `,
        isActive: true
      }
    })
  ]);

  // Update baker with the first theme
  await prisma.baker.update({
    where: { id: baker.id },
    data: { selectedThemeId: themes[0].id }
  });

  // Create sample customers
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        bakerId: baker.id,
        name: 'Emma Thompson',
        email: 'emma.thompson@email.com',
        phone: '+1-555-0123'
      }
    }),
    prisma.customer.create({
      data: {
        bakerId: baker.id,
        name: 'Michael Chen',
        email: 'michael.chen@email.com',
        phone: '+1-555-0124'
      }
    }),
    prisma.customer.create({
      data: {
        bakerId: baker.id,
        name: 'Sarah Williams',
        email: 'sarah.williams@email.com',
        phone: '+1-555-0125'
      }
    })
  ]);

  // Create sample orders
  const orders = await Promise.all([
    prisma.order.create({
      data: {
        bakerId: baker.id,
        customerId: customers[0].id,
        eventDate: new Date('2024-03-15'),
        eventType: 'birthday',
        servesCount: 25,
        budgetMin: 150.00,
        budgetMax: 300.00,
        cakeDescription: '3-tier vanilla birthday cake with rainbow decorations',
        status: 'confirmed',
        quotedPrice: 275.00,
        depositAmount: 100.00,
        depositPaid: true,
        priority: 'medium'
      }
    }),
    prisma.order.create({
      data: {
        bakerId: baker.id,
        customerId: customers[1].id,
        eventDate: new Date('2024-03-22'),
        eventType: 'wedding',
        servesCount: 80,
        budgetMin: 500.00,
        budgetMax: 1000.00,
        cakeDescription: '4-tier elegant wedding cake with white fondant and gold accents',
        status: 'in_progress',
        quotedPrice: 850.00,
        depositAmount: 425.00,
        depositPaid: true,
        priority: 'high'
      }
    }),
    prisma.order.create({
      data: {
        bakerId: baker.id,
        customerId: customers[2].id,
        eventDate: new Date('2024-04-05'),
        eventType: 'baby_shower',
        servesCount: 30,
        budgetMin: 200.00,
        budgetMax: 400.00,
        cakeDescription: 'Pink and blue baby shower cake with cute animal decorations',
        status: 'inquiry',
        priority: 'low'
      }
    })
  ]);

  // Create sample gallery items
  const galleryItems = await Promise.all([
    prisma.gallery.create({
      data: {
        bakerId: baker.id,
        title: 'Elegant Wedding Masterpiece',
        description: '4-tier white fondant cake with cascading sugar flowers',
        imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500',
        category: 'wedding',
        tags: ['wedding', 'elegant', 'white', 'flowers'],
        featured: true,
        priceRange: '$500-$1000',
        servesCount: 80,
        heartsCount: 15,
        inquiriesCount: 8
      }
    }),
    prisma.gallery.create({
      data: {
        bakerId: baker.id,
        title: 'Rainbow Birthday Delight',
        description: 'Colorful 3-tier birthday cake with rainbow layers',
        imageUrl: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=500',
        category: 'birthday',
        tags: ['birthday', 'colorful', 'rainbow', 'fun'],
        featured: false,
        priceRange: '$200-$400',
        servesCount: 30,
        heartsCount: 12,
        inquiriesCount: 5
      }
    }),
    prisma.gallery.create({
      data: {
        bakerId: baker.id,
        title: 'Chocolate Dreams',
        description: 'Rich chocolate cake with gold leaf decorations',
        imageUrl: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=500',
        category: 'specialty',
        tags: ['chocolate', 'luxury', 'gold', 'decadent'],
        featured: true,
        priceRange: '$300-$600',
        servesCount: 40,
        heartsCount: 20,
        inquiriesCount: 12
      }
    })
  ]);

  // Create sample messages
  await Promise.all([
    prisma.message.create({
      data: {
        bakerId: baker.id,
        customerId: customers[0].id,
        content: 'Hi! I love your rainbow birthday cake design. Can we schedule a consultation?',
        senderType: 'customer'
      }
    }),
    prisma.message.create({
      data: {
        bakerId: baker.id,
        customerId: customers[0].id,
        content: 'Of course! I would love to create something special for your celebration. When would be a good time to chat?',
        senderType: 'baker'
      }
    })
  ]);

  console.log('✅ Database seed completed successfully!');
  console.log('\n📊 Created:');
  console.log(`   • 1 user (baker@example.com / password123)`);
  console.log(`   • 1 baker (${baker.businessName})`);
  console.log(`   • ${themes.length} themes`);
  console.log(`   • ${customers.length} customers`);
  console.log(`   • ${orders.length} orders`);
  console.log(`   • ${galleryItems.length} gallery items`);
  console.log(`   • 2 messages`);
  console.log('\n🚀 Ready for development!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });