import mongoose from "mongoose";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Please define the MONGODB_URI environment variable inside .env.local");
  process.exit(1);
}

// We'll define a flexible schema to catch any image fields
const SubcategorySchema = new mongoose.Schema(
  {
    image: { type: String },
    circleImage: { type: String },
  },
  { strict: false }
);

const CategorySchema = new mongoose.Schema(
  {
    image: { type: String },
    subcategories: { type: [SubcategorySchema], default: [] },
  },
  { strict: false }
);

const Category = mongoose.models.Category || mongoose.model("Category", CategorySchema);

const OLD_URL = "https://thedesignfactoryshop.com";
const NEW_URL = "https://media.thedesignfactoryshop.com";

async function run() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB.");

    console.log(`Fetching all categories to check for old URLs...`);
    const categories = await Category.find({});

    console.log(`Found ${categories.length} total categories.`);

    let updatedCount = 0;

    for (const category of categories) {
      let modified = false;

      // Check main category image
      if (category.image && category.image.startsWith(OLD_URL)) {
        category.image = category.image.replace(OLD_URL, NEW_URL);
        modified = true;
      }

      // Check subcategories
      if (category.subcategories && category.subcategories.length > 0) {
        for (const sub of category.subcategories) {
          if (sub.circleImage && sub.circleImage.startsWith(OLD_URL)) {
            sub.circleImage = sub.circleImage.replace(OLD_URL, NEW_URL);
            modified = true;
          }
          if (sub.image && sub.image.startsWith(OLD_URL)) {
            sub.image = sub.image.replace(OLD_URL, NEW_URL);
            modified = true;
          }
        }
      }

      if (modified) {
        // Mark subcategories modified since it's a nested array
        category.markModified("subcategories");
        await category.save();
        updatedCount++;
        console.log(`Updated category: ${category.title || category._id}`);
      }
    }

    console.log(`Successfully updated ${updatedCount} categories.`);
  } catch (error) {
    console.error("Error during migration:", error);
  } finally {
    console.log("Closing MongoDB connection...");
    await mongoose.connection.close();
    process.exit(0);
  }
}

run();
