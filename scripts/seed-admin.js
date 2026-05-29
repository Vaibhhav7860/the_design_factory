/**
 * One-time admin user seeder.
 *
 * Usage:
 *   node scripts/seed-admin.js you@thedesignfactory.in 'StrongPassword!23' 'Your Name'
 *
 * Idempotent: if the user exists, the password is updated.
 */
import dotenv from "dotenv";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

// Load env files BEFORE any module that reads process.env.
// Precedence matches Next.js: .env.local > .env.development > .env
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

for (const file of [".env.local", ".env.development", ".env"]) {
  const full = path.join(projectRoot, file);
  if (fs.existsSync(full)) {
    dotenv.config({ path: full, override: false });
  }
}

if (!process.env.MONGODB_URI) {
  console.error(
    "MONGODB_URI is not set. Confirm:\n" +
      "  • The file is named exactly '.env.local' (no '.txt' extension)\n" +
      "  • It sits in the project root: " +
      projectRoot +
      "\n  • The line is: MONGODB_URI=mongodb+srv://...   (no quotes, no spaces)"
  );
  process.exit(1);
}

// Dynamic imports AFTER env vars are loaded so the modules can read them.
const bcrypt = (await import("bcryptjs")).default;
const { connectToDatabase, mongoose } = await import("../src/lib/db/mongoose.js");
const { User } = await import("../src/lib/db/models/User.js");

async function main() {
  const [, , emailArg, passwordArg, nameArg] = process.argv;
  const email = (emailArg || "").trim().toLowerCase();
  const password = passwordArg || "";
  const name = nameArg || "Admin";

  if (!email || !password) {
    console.error("Usage: node scripts/seed-admin.js <email> <password> [name]");
    process.exit(1);
  }
  if (password.length < 12) {
    console.error("Password must be at least 12 characters.");
    process.exit(1);
  }

  await connectToDatabase();

  const passwordHash = await bcrypt.hash(password, 12);
  const update = {
    name,
    role: "admin",
    isActive: true,
    passwordHash,
  };

  const user = await User.findOneAndUpdate(
    { email },
    { $set: update },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  console.log(`✓ Admin user ready: ${user.email} (id ${user._id})`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
