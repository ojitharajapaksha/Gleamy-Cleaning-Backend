import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create services
  const services = [
    {
      name: 'Home Deep Cleaning',
      description: 'Comprehensive deep cleaning service for your entire home including kitchen, bathrooms, bedrooms, and living areas.',
      basePrice: 8000,
      priceUnit: 'per service',
      duration: 180,
      category: 'RESIDENTIAL',
      isActive: true,
    },
    {
      name: 'Office Cleaning',
      description: 'Professional office cleaning service including workstations, meeting rooms, pantry, and common areas.',
      basePrice: 12000,
      priceUnit: 'per service',
      duration: 120,
      category: 'COMMERCIAL',
      isActive: true,
    },
    {
      name: 'Kitchen Deep Cleaning',
      description: 'Specialized kitchen cleaning including appliances, cabinets, countertops, and floor scrubbing.',
      basePrice: 5000,
      priceUnit: 'per service',
      duration: 120,
      category: 'RESIDENTIAL',
      isActive: true,
    },
    {
      name: 'Bathroom Sanitization',
      description: 'Complete bathroom cleaning and sanitization including tiles, fixtures, mirrors, and floor.',
      basePrice: 3500,
      priceUnit: 'per bathroom',
      duration: 60,
      category: 'RESIDENTIAL',
      isActive: true,
    },
    {
      name: 'Window & Glass Cleaning',
      description: 'Professional window and glass surface cleaning for homes and offices.',
      basePrice: 4000,
      priceUnit: 'per service',
      duration: 90,
      category: 'RESIDENTIAL',
      isActive: true,
    },
    {
      name: 'Carpet & Upholstery Cleaning',
      description: 'Deep cleaning service for carpets, sofas, and upholstered furniture using professional equipment.',
      basePrice: 6500,
      priceUnit: 'per service',
      duration: 150,
      category: 'RESIDENTIAL',
      isActive: true,
    },
    {
      name: 'Move-In/Move-Out Cleaning',
      description: 'Thorough cleaning service for properties before moving in or after moving out.',
      basePrice: 10000,
      priceUnit: 'per property',
      duration: 240,
      category: 'RESIDENTIAL',
      isActive: true,
    },
    {
      name: 'Post-Construction Cleaning',
      description: 'Specialized cleaning service to remove construction dust, debris, and prepare space for use.',
      basePrice: 15000,
      priceUnit: 'per property',
      duration: 300,
      category: 'COMMERCIAL',
      isActive: true,
    },
    {
      name: 'Car Interior Cleaning',
      description: 'Complete interior car cleaning including vacuuming, dashboard wiping, and seat cleaning.',
      basePrice: 2500,
      priceUnit: 'per vehicle',
      duration: 60,
      category: 'SPECIALIZED',
      isActive: true,
    },
    {
      name: 'Laundry Service',
      description: 'Professional washing, drying, and folding service for your clothes and linens.',
      basePrice: 1500,
      priceUnit: 'per kg',
      duration: 90,
      category: 'SPECIALIZED',
      isActive: true,
    },
  ];

  for (const service of services) {
    // Check if service already exists
    const existing = await prisma.service.findFirst({
      where: { name: service.name },
    });

    if (existing) {
      const updated = await prisma.service.update({
        where: { id: existing.id },
        data: service,
      });
      console.log(`✅ Updated service: ${updated.name}`);
    } else {
      const created = await prisma.service.create({
        data: service,
      });
      console.log(`✅ Created service: ${created.name}`);
    }
  }

  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
