const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Project Repeat development database...");

  // Password hash for all sample accounts
  const passwordHash = await bcrypt.hash("Password123!", 10);
  const adminPasswordHash = await bcrypt.hash("AdminPass123!", 10);

  // 1. Platform Admin
  const admin = await prisma.user.upsert({
    where: { email: "admin@projectrepeat.com" },
    update: {},
    create: {
      name: "Platform Administrator",
      email: "admin@projectrepeat.com",
      passwordHash: adminPasswordHash,
      role: "PLATFORM_ADMIN",
      status: "ACTIVE",
    },
  });
  console.log("✅ Platform Admin created:", admin.email);

  // 2. Sample Business 1: The Coffee House (Cafe - 5 Stamps)
  const coffeeOwner = await prisma.user.upsert({
    where: { email: "owner@thecoffeehouse.com" },
    update: {},
    create: {
      name: "Marco Rossi",
      email: "owner@thecoffeehouse.com",
      phone: "+91 98765 00001",
      passwordHash,
      role: "BUSINESS_USER",
    },
  });

  const coffeeBarista = await prisma.user.upsert({
    where: { email: "barista@thecoffeehouse.com" },
    update: {},
    create: {
      name: "Sam Barista",
      email: "barista@thecoffeehouse.com",
      passwordHash,
      role: "BUSINESS_USER",
    },
  });

  const coffeeHouse = await prisma.business.upsert({
    where: { slug: "the-coffee-house" },
    update: {},
    create: {
      name: "The Coffee House",
      slug: "the-coffee-house",
      category: "Cafe & Coffee Shop",
      description: "Artisan espresso bar, single-origin roasts, and fresh morning pastries.",
      address: "104 Indiranagar 100ft Road, Bengaluru",
      primaryColor: "#315EFB",
      secondaryColor: "#101828",
      status: "ACTIVE",
    },
  });

  await prisma.businessMembership.upsert({
    where: { userId_businessId: { userId: coffeeOwner.id, businessId: coffeeHouse.id } },
    update: {},
    create: { userId: coffeeOwner.id, businessId: coffeeHouse.id, role: "OWNER" },
  });

  await prisma.businessMembership.upsert({
    where: { userId_businessId: { userId: coffeeBarista.id, businessId: coffeeHouse.id } },
    update: {},
    create: { userId: coffeeBarista.id, businessId: coffeeHouse.id, role: "STAFF" },
  });

  const coffeeProgram = await prisma.loyaltyProgram.upsert({
    where: { id: "prog-coffee-house" },
    update: {},
    create: {
      id: "prog-coffee-house",
      businessId: coffeeHouse.id,
      name: "Artisan Regulars Club",
      cardTitle: "Coffee Regulars Stamp Card",
      totalStamps: 5,
      stampIcon: "cup",
      status: "PUBLISHED",
      terms: "Receive 1 stamp per beverage purchase. Valid at all branches.",
    },
  });

  await prisma.reward.upsert({
    where: { id: "rew-coffee-1" },
    update: {},
    create: {
      id: "rew-coffee-1",
      programId: coffeeProgram.id,
      stampsRequired: 3,
      title: "15% Off Any Bakery Item",
      description: "Enjoy a discount on our croissants and sourdoughs",
      rewardType: "DISCOUNT_PERCENT",
      discountValue: 15,
      validityDays: 30,
    },
  });

  await prisma.reward.upsert({
    where: { id: "rew-coffee-2" },
    update: {},
    create: {
      id: "rew-coffee-2",
      programId: coffeeProgram.id,
      stampsRequired: 5,
      title: "Complimentary Coffee of Your Choice",
      description: "Any regular size espresso, pour-over, or cold brew",
      rewardType: "FREE_ITEM",
      validityDays: 30,
    },
  });

  await prisma.subscription.upsert({
    where: { businessId: coffeeHouse.id },
    update: {},
    create: {
      businessId: coffeeHouse.id,
      planId: "GROWTH",
      status: "ACTIVE",
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      paymentProvider: "mock",
    },
  });

  // 3. Sample Business 2: Urban Cuts (Salon - 6 Stamps)
  const salonOwner = await prisma.user.upsert({
    where: { email: "owner@urbancuts.com" },
    update: {},
    create: {
      name: "David Miller",
      email: "owner@urbancuts.com",
      passwordHash,
      role: "BUSINESS_USER",
    },
  });

  const urbanCuts = await prisma.business.upsert({
    where: { slug: "urban-cuts" },
    update: {},
    create: {
      name: "Urban Cuts & Grooming",
      slug: "urban-cuts",
      category: "Salon & Barber",
      description: "Contemporary men & women styling, luxury grooming, and beard craft.",
      address: "42 Church Street, Bengaluru",
      primaryColor: "#059669",
      secondaryColor: "#064E3B",
      status: "ACTIVE",
    },
  });

  await prisma.businessMembership.upsert({
    where: { userId_businessId: { userId: salonOwner.id, businessId: urbanCuts.id } },
    update: {},
    create: { userId: salonOwner.id, businessId: urbanCuts.id, role: "OWNER" },
  });

  const salonProgram = await prisma.loyaltyProgram.upsert({
    where: { id: "prog-urban-cuts" },
    update: {},
    create: {
      id: "prog-urban-cuts",
      businessId: urbanCuts.id,
      name: "Grooming Club Card",
      cardTitle: "VIP Haircut & Spa Card",
      totalStamps: 6,
      stampIcon: "star",
      status: "PUBLISHED",
      terms: "1 stamp per appointment over ₹400.",
    },
  });

  await prisma.reward.upsert({
    where: { id: "rew-salon-1" },
    update: {},
    create: {
      id: "rew-salon-1",
      programId: salonProgram.id,
      stampsRequired: 6,
      title: "50% Off Deluxe Haircut & Wash",
      description: "Half off any haircut service on your 6th visit",
      rewardType: "DISCOUNT_PERCENT",
      discountValue: 50,
      validityDays: 60,
    },
  });

  await prisma.subscription.upsert({
    where: { businessId: urbanCuts.id },
    update: {},
    create: {
      businessId: urbanCuts.id,
      planId: "STARTER",
      status: "ACTIVE",
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      paymentProvider: "mock",
    },
  });

  // 4. Sample Customers
  const customer1 = await prisma.user.upsert({
    where: { email: "priya.sharma@example.com" },
    update: {},
    create: {
      name: "Priya Sharma",
      email: "priya.sharma@example.com",
      phone: "+91 99887 76655",
      passwordHash,
      role: "CUSTOMER",
    },
  });

  const customer2 = await prisma.user.upsert({
    where: { email: "rahul.verma@example.com" },
    update: {},
    create: {
      name: "Rahul Verma",
      email: "rahul.verma@example.com",
      phone: "+91 98112 23344",
      passwordHash,
      role: "CUSTOMER",
    },
  });

  // Enroll customer 1 into The Coffee House (3 stamps earned)
  const coffeeEnrollment = await prisma.loyaltyEnrollment.upsert({
    where: {
      customerId_programId: { customerId: customer1.id, programId: coffeeProgram.id },
    },
    update: {},
    create: {
      customerId: customer1.id,
      businessId: coffeeHouse.id,
      programId: coffeeProgram.id,
      currentStamps: 3,
    },
  });

  // Add sample transactions
  await prisma.loyaltyTransaction.createMany({
    data: [
      {
        enrollmentId: coffeeEnrollment.id,
        type: "STAMP_EARNED",
        stampsDelta: 1,
        balanceAfter: 1,
        referenceCode: "VISIT-001",
        staffUserId: coffeeBarista.id,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        enrollmentId: coffeeEnrollment.id,
        type: "STAMP_EARNED",
        stampsDelta: 1,
        balanceAfter: 2,
        referenceCode: "VISIT-002",
        staffUserId: coffeeBarista.id,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        enrollmentId: coffeeEnrollment.id,
        type: "STAMP_EARNED",
        stampsDelta: 1,
        balanceAfter: 3,
        referenceCode: "VISIT-003",
        staffUserId: coffeeBarista.id,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  // Enroll customer 2 into The Coffee House (5 stamps earned, completed & redeemed!)
  const rahulCoffeeEnrollment = await prisma.loyaltyEnrollment.upsert({
    where: {
      customerId_programId: { customerId: customer2.id, programId: coffeeProgram.id },
    },
    update: {},
    create: {
      customerId: customer2.id,
      businessId: coffeeHouse.id,
      programId: coffeeProgram.id,
      currentStamps: 5,
    },
  });

  // Redemption record for Rahul
  await prisma.rewardRedemption.create({
    data: {
      enrollmentId: rahulCoffeeEnrollment.id,
      rewardId: "rew-coffee-1",
      staffUserId: coffeeBarista.id,
      status: "REDEEMED",
      redeemedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  console.log("✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
