import mongoose from "mongoose";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Please define the MONGODB_URI environment variable inside .env.local");
  process.exit(1);
}

// We can define a simplified schema just for this migration, or import the real one.
// Using a simplified one here to avoid needing to bundle/compile Next.js code.
const ProductSchema = new mongoose.Schema(
  {
    images: { type: [String], default: [] },
    // Other fields exist but we only care about images for this script
  },
  { strict: false } // strict: false ensures we don't accidentally drop other fields
);

const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);

const OLD_URL = "https://thedesignfactoryshop.com";
const NEW_URL = "https://media.thedesignfactoryshop.com";

async function run() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB.");

    console.log(`Finding products with images containing ${OLD_URL}...`);
    // Find all products where at least one image starts with the OLD_URL
    const products = await Product.find({
      images: { $regex: `^${OLD_URL}` },
    });

    console.log(`Found ${products.length} products to update.`);

    let updatedCount = 0;

    for (const product of products) {
      let modified = false;
      const newImages = product.images.map((img) => {
        if (img.startsWith(OLD_URL)) {
          modified = true;
          return img.replace(OLD_URL, NEW_URL);
        }
        return img;
      });

      if (modified) {
        product.images = newImages;
        await product.save();
        updatedCount++;
        console.log(`Updated product ID: ${product._id}`);
      }
    }

    console.log(`Successfully updated ${updatedCount} products.`);
  } catch (error) {
    console.error("Error during migration:", error);
  } finally {
    console.log("Closing MongoDB connection...");
    await mongoose.connection.close();
    process.exit(0);
  }
}

run();
