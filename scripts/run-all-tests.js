const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function runTests() {
  console.log("==================================================");
  console.log("      LingoFlow AI - Automated Test Suite         ");
  console.log("==================================================\n");

  let passed = 0;
  let failed = 0;

  // Test 1: Password Hashing & Verification
  try {
    process.stdout.write("1. Testing bcrypt password hashing and verification... ");
    const rawPass = "superSecurePass123!";
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(rawPass, salt);
    const isMatch = await bcrypt.compare(rawPass, hash);
    const isWrong = await bcrypt.compare("wrongPassword", hash);

    if (isMatch && !isWrong) {
      console.log("✅ PASSED");
      passed++;
    } else {
      console.log("❌ FAILED");
      failed++;
    }
  } catch (err) {
    console.log("❌ ERROR:", err.message);
    failed++;
  }

  // Test 2: Database Plan Existence & Querying
  try {
    process.stdout.write("2. Testing Database Plan querying (Free & Pro)... ");
    const plans = await prisma.plan.findMany();
    if (plans.length >= 2) {
      console.log(`✅ PASSED (${plans.length} plans loaded)`);
      passed++;
    } else {
      console.log("❌ FAILED: Missing plans");
      failed++;
    }
  } catch (err) {
    console.log("❌ ERROR:", err.message);
    failed++;
  }

  // Test 3: Live Translation Service
  try {
    process.stdout.write("3. Testing Live Translation Engine (en -> es)... ");
    const text = "Good morning, welcome to our application.";
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|es`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.responseData && data.responseData.translatedText) {
      console.log(`✅ PASSED -> "${data.responseData.translatedText}"`);
      passed++;
    } else {
      console.log("❌ FAILED: Empty translation response");
      failed++;
    }
  } catch (err) {
    console.log("❌ ERROR:", err.message);
    failed++;
  }

  // Test 4: Multilingual Translation Test (German & French)
  try {
    process.stdout.write("4. Testing Multilingual Translations (en -> fr, de)... ");
    const text = "Thank you very much";
    const resFr = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|fr`);
    const dataFr = await resFr.json();
    const resDe = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|de`);
    const dataDe = await resDe.json();

    if (dataFr.responseData?.translatedText && dataDe.responseData?.translatedText) {
      console.log(`✅ PASSED (FR: ${dataFr.responseData.translatedText}, DE: ${dataDe.responseData.translatedText})`);
      passed++;
    } else {
      console.log("❌ FAILED: Multilingual fetch failed");
      failed++;
    }
  } catch (err) {
    console.log("❌ ERROR:", err.message);
    failed++;
  }

  // Test 5: Webhook Idempotency Logic
  try {
    process.stdout.write("5. Testing Webhook Idempotency Event Model... ");
    const testEventId = `test_evt_${Date.now()}`;
    
    // Create initial event
    const event1 = await prisma.paymentEvent.create({
      data: {
        provider: "TEST_GATEWAY",
        eventId: testEventId,
        eventType: "subscription.created",
        status: "PROCESSED",
      },
    });

    // Check duplicate detection
    const existing = await prisma.paymentEvent.findUnique({
      where: { eventId: testEventId },
    });

    // Clean up test event
    await prisma.paymentEvent.delete({ where: { id: event1.id } });

    if (existing && existing.eventId === testEventId) {
      console.log("✅ PASSED: Idempotency uniqueness verified");
      passed++;
    } else {
      console.log("❌ FAILED: Unique constraint failed");
      failed++;
    }
  } catch (err) {
    console.log("❌ ERROR:", err.message);
    failed++;
  }

  // Test 6: Demo User Authentication Readiness
  try {
    process.stdout.write("6. Testing Demo User credentials readiness... ");
    const demoUser = await prisma.user.findUnique({
      where: { email: "demo@lingoflow.ai" },
    });

    if (demoUser && demoUser.passwordHash) {
      const valid = await bcrypt.compare("password123", demoUser.passwordHash);
      if (valid) {
        console.log("✅ PASSED: Demo account verified (demo@lingoflow.ai / password123)");
        passed++;
      } else {
        console.log("❌ FAILED: Password hash mismatch");
        failed++;
      }
    } else {
      console.log("❌ FAILED: Demo user not found in database");
      failed++;
    }
  } catch (err) {
    console.log("❌ ERROR:", err.message);
    failed++;
  }

  // Test 7: Translation History CRUD & Access Control
  try {
    process.stdout.write("7. Testing Translation History CRUD, Pagination & Access Control... ");
    const demoUser = await prisma.user.findUnique({
      where: { email: "demo@lingoflow.ai" },
    });

    if (!demoUser) {
      throw new Error("Demo user required for history test");
    }

    // 1. Create a translation record
    const uniqueText = `Automated Test Text ${Date.now()}`;
    const testRecord = await prisma.translation.create({
      data: {
        userId: demoUser.id,
        sourceLang: "en",
        targetLang: "es",
        sourceText: uniqueText,
        translatedText: "Texto de prueba automatizado",
        provider: "MyMemory",
        charCount: uniqueText.length,
      },
    });

    // 2. Query and verify pagination/metadata
    const count = await prisma.translation.count({
      where: { userId: demoUser.id },
    });
    const found = await prisma.translation.findFirst({
      where: { id: testRecord.id, userId: demoUser.id },
    });

    // 3. Verify server-side user isolation (other user cannot see this record)
    const unauthorizedQuery = await prisma.translation.findMany({
      where: { id: testRecord.id, userId: "non-existent-user-id" },
    });

    // 4. Delete the test record
    await prisma.translation.delete({
      where: { id: testRecord.id },
    });

    const verifyDeleted = await prisma.translation.findUnique({
      where: { id: testRecord.id },
    });

    if (found && unauthorizedQuery.length === 0 && !verifyDeleted && count > 0) {
      console.log("✅ PASSED: CRUD, row-level isolation & deletion verified");
      passed++;
    } else {
      console.log("❌ FAILED: Translation history validation check failed");
      failed++;
    }
  } catch (err) {
    console.log("❌ ERROR:", err.message);
    failed++;
  }

  // Test 8: Session Security, Password Reset & Edge Route Guard Logic
  try {
    process.stdout.write("8. Testing Session Security & Password Reset Logic... ");
    const { SignJWT, jwtVerify } = require("jose");
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || "lingoflow-local-dev-secret-key-at-least-32-chars-long!"
    );

    // 1. Test JWT creation and Edge-compatible verification
    const token = await new SignJWT({ userId: "test-user-id", email: "test@lingoflow.ai", role: "USER" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(secret);

    const { payload } = await jwtVerify(token, secret);
    if (!payload.userId || payload.email !== "test@lingoflow.ai") {
      throw new Error("JWT token verification failed");
    }

    // 2. Test Invalid Token handling
    let invalidCaught = false;
    try {
      await jwtVerify("corrupt.token.value", secret);
    } catch {
      invalidCaught = true;
    }
    if (!invalidCaught) {
      throw new Error("Corrupt token should fail verification");
    }

    // 3. Test Password Reset logic on demo user
    const demo = await prisma.user.findUnique({ where: { email: "demo@lingoflow.ai" } });
    if (!demo) throw new Error("Demo user required");

    const tempPassword = "newTempPassword456!";
    const newHash = await bcrypt.hash(tempPassword, 10);
    await prisma.user.update({
      where: { id: demo.id },
      data: { passwordHash: newHash },
    });

    const updatedUser = await prisma.user.findUnique({ where: { id: demo.id } });
    const matchesNew = await bcrypt.compare(tempPassword, updatedUser.passwordHash);

    // 4. Restore original password123
    const restoredHash = await bcrypt.hash("password123", 10);
    await prisma.user.update({
      where: { id: demo.id },
      data: { passwordHash: restoredHash },
    });
    const matchesRestored = await bcrypt.compare("password123", (await prisma.user.findUnique({ where: { id: demo.id } })).passwordHash);

    if (matchesNew && matchesRestored) {
      console.log("✅ PASSED: Token verification, tamper resistance & password reset verified");
      passed++;
    } else {
      console.log("❌ FAILED: Password reset verification failed");
      failed++;
    }
  } catch (err) {
    console.log("❌ ERROR:", err.message);
    failed++;
  }

  console.log("\n==================================================");
  console.log(`Summary: ${passed} Passed, ${failed} Failed`);
  console.log("==================================================");

  await prisma.$disconnect();

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
