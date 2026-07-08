require("dotenv").config();

const mongoose = require("mongoose");

const connectDB = require(
  "../config/db"
);

const Category = require(
  "../models/category"
);

const Product = require(
  "../models/product"
);

// ==========================================
// NORMALIZE CATEGORY NAME
// ==========================================
const normalizeName = (name) => {
  return String(name || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
};

// ==========================================
// MAIN MIGRATION
// ==========================================
const migrateGlobalCategories =
  async () => {
    try {
      console.log(
        "\n=================================="
      );

      console.log(
        "GLOBAL CATEGORY MIGRATION START"
      );

      console.log(
        "==================================\n"
      );

      // ------------------------------------
      // CONNECT DATABASE
      // ------------------------------------
      await connectDB();

      console.log(
        "Database connected\n"
      );

      // ------------------------------------
      // LOAD ALL CATEGORIES
      //
      // lean() is important because old
      // MongoDB documents may still contain
      // the old brand field.
      // ------------------------------------
      const categories =
        await Category.find({})
          .lean();

      console.log(
        `Found ${categories.length} categories\n`
      );

      if (categories.length === 0) {
        console.log(
          "No categories found."
        );

        await mongoose.connection.close();

        process.exit(0);
      }

      // ------------------------------------
      // GROUP BY NORMALIZED NAME
      // ------------------------------------
      const groups = new Map();

      for (const category of categories) {
        const key = normalizeName(
          category.name
        );

        if (!key) {
          console.log(
            `Skipping category with empty name: ${category._id}`
          );

          continue;
        }

        if (!groups.has(key)) {
          groups.set(key, []);
        }

        groups
          .get(key)
          .push(category);
      }

      console.log(
        `Found ${groups.size} unique category names\n`
      );

      let duplicateGroups = 0;

      let productsRemapped = 0;

      let categoriesDeleted = 0;

      // ------------------------------------
      // PROCESS EACH GROUP
      // ------------------------------------
      for (
        const [key, group]
        of groups.entries()
      ) {
        // No duplicate
        if (group.length === 1) {
          continue;
        }

        duplicateGroups++;

        console.log(
          "\n----------------------------------"
        );

        console.log(
          `Duplicate category: "${group[0].name}"`
        );

        console.log(
          `Documents found: ${group.length}`
        );

        // ----------------------------------
        // CHOOSE CATEGORY TO KEEP
        //
        // Keep oldest category.
        // This is deterministic and safe.
        // ----------------------------------
        const sortedGroup = [
          ...group,
        ].sort((a, b) => {
          const aTime = new Date(
            a.createdAt || 0
          ).getTime();

          const bTime = new Date(
            b.createdAt || 0
          ).getTime();

          return aTime - bTime;
        });

        const keepCategory =
          sortedGroup[0];

        const duplicateCategories =
          sortedGroup.slice(1);

        console.log(
          `KEEP: ${keepCategory._id}`
        );

        // ----------------------------------
        // PROCESS DUPLICATES
        // ----------------------------------
        for (
          const duplicate
          of duplicateCategories
        ) {
          console.log(
            `MERGE: ${duplicate._id}`
          );

          // --------------------------------
          // COUNT PRODUCTS FIRST
          // --------------------------------
          const affectedProducts =
            await Product.countDocuments({
              category:
                duplicate._id,
            });

          console.log(
            `Products to remap: ${affectedProducts}`
          );

          // --------------------------------
          // REMAP PRODUCTS
          //
          // Old category ID
          //      ↓
          // Kept global category ID
          // --------------------------------
          if (affectedProducts > 0) {
            const updateResult =
              await Product.updateMany(
                {
                  category:
                    duplicate._id,
                },
                {
                  $set: {
                    category:
                      keepCategory._id,
                  },
                }
              );

            const modifiedCount =
              updateResult.modifiedCount ??
              updateResult.nModified ??
              0;

            productsRemapped +=
              modifiedCount;

            console.log(
              `Products remapped: ${modifiedCount}`
            );
          }

          // --------------------------------
          // SAFETY CHECK
          //
          // Ensure no products still use
          // duplicate category.
          // --------------------------------
          const remainingProducts =
            await Product.countDocuments({
              category:
                duplicate._id,
            });

          if (remainingProducts > 0) {
            throw new Error(
              `Safety check failed. ${remainingProducts} products still reference category ${duplicate._id}`
            );
          }

          // --------------------------------
          // DELETE DUPLICATE CATEGORY
          // --------------------------------
          await Category.deleteOne({
            _id: duplicate._id,
          });

          categoriesDeleted++;

          console.log(
            "Duplicate category deleted"
          );
        }
      }

      // ====================================
      // FINAL VERIFICATION
      // ====================================
      console.log(
        "\n=================================="
      );

      console.log(
        "FINAL VERIFICATION"
      );

      console.log(
        "==================================\n"
      );

      const finalCategories =
        await Category.find({})
          .sort({
            name: 1,
          })
          .lean();

      console.log(
        `Final category count: ${finalCategories.length}`
      );

      console.log(
        `Duplicate groups merged: ${duplicateGroups}`
      );

      console.log(
        `Products remapped: ${productsRemapped}`
      );

      console.log(
        `Categories deleted: ${categoriesDeleted}`
      );

      console.log(
        "\nFinal categories:"
      );

      for (
        const category
        of finalCategories
      ) {
        console.log(
          `- ${category.name} (${category._id})`
        );
      }

      console.log(
        "\n=================================="
      );

      console.log(
        "MIGRATION COMPLETED SUCCESSFULLY"
      );

      console.log(
        "==================================\n"
      );

      // ------------------------------------
      // CLOSE DATABASE
      // ------------------------------------
      await mongoose.connection.close();

      process.exit(0);
    } catch (error) {
      console.error(
        "\nCATEGORY MIGRATION FAILED:"
      );

      console.error(error);

      try {
        await mongoose.connection.close();
      } catch (closeError) {
        console.error(
          "Failed to close DB:",
          closeError.message
        );
      }

      process.exit(1);
    }
  };

// ==========================================
// RUN
// ==========================================
migrateGlobalCategories();