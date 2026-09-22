const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding initial plans...");

  // Seed Free Plan
  const freePlan = await prisma.plan.upsert({
    where: { slug: "free" },
    update: {},
    create: {
      name: "Free Starter",
      slug: "free",
      price: 0,
      currency: "USD",
      monthlyCharLimit: 5000,
      allowBusinessAssistant: false,
      isActive: true,
    },
  });

  // Seed Pro Plan
  const proPlan = await prisma.plan.upsert({
    where: { slug: "pro" },
    update: {},
    create: {
      name: "Pro Creator",
      slug: "pro",
      price: 900, // $9.00
      currency: "USD",
      monthlyCharLimit: 100000,
      allowBusinessAssistant: true,
      isActive: true,
    },
  });

  console.log("Seeded Plans:", { freePlan: freePlan.name, proPlan: proPlan.name });

  // Seed a demo user for quick college demonstration: demo@lingoflow.ai / password123
  const demoEmail = "demo@lingoflow.ai";
  const existingUser = await prisma.user.findUnique({ where: { email: demoEmail } });

  if (!existingUser) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash("password123", salt);

    const user = await prisma.user.create({
      data: {
        email: demoEmail,
        name: "Demo Student",
        passwordHash,
        role: "USER",
        subscriptions: {
          create: {
            planId: freePlan.id,
            provider: "MANUAL",
            status: "ACTIVE",
          },
        },
      },
    });

    console.log("Created demo user:", user.email, "(Password: password123)");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
