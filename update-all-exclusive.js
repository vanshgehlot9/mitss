const { MongoClient } = require('mongodb');

const uri = "mongodb://shivkaradigitaldb2:AGlNFLKc_c2SwY5IsubIWfTi2FZuzxWTRJumSZuNHQythjpW@492ff772-c172-447d-b025-952b72299eae.asia-south1.firestore.goog:443/default";

async function updateAllProductsToExclusive() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    
    const db = client.db("mitss");
    const products = db.collection("products");
    
    // Update all products to be exclusive
    const result = await products.updateMany(
      {},
      { 
        $set: { 
          isExclusive: true,
          exclusivePrice: "Contact for Custom Price"
        } 
      }
    );
    
    console.log(`Updated ${result.modifiedCount} products to exclusive`);
    
    // Verify the update
    const allProducts = await products.find({}).toArray();
    console.log("\nAll products are now:");
    allProducts.forEach(p => {
      console.log(`- ${p.name}: isExclusive=${p.isExclusive}, price=${p.exclusivePrice || p.price}`);
    });
    
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

updateAllProductsToExclusive();
