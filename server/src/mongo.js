const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/LoginFormPractice")
  .then(() => {
    console.log('mongoose connected');
  })
  .catch((e) => {
    console.log('Mongoose connection error:',e);
  });

// Define schema for Users
const logInSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});

// Define schema for shopify products
const productSchema = new mongoose.Schema({
  productTitle: {
      type: String
  },
  variantId: {
      type: Number
  },
  variantSku: {
      type: String
  },
  variantPrice: {
      type: String
  },
  productHandle: {
      type: String
  },
  productImageUrl: {
      type: String
  },
  productTag: {
      type: String
  }
});

// Define schema for csv products
const csvSchema = new mongoose.Schema({
  make: {
      type: String
  },
  model: {
      type: String
  },
  year: {
      type: Array
  },
  engineType: {
      type: String
  },
  sku: {
      type: String
  },
  bhp: {
      type: String
  },
  caliper: {
      type: String
  },
  discDiameter: {
      type: String
  },
  included: {
        type: Array
  },
  carEnd: {
    type : String
  }
});

const LogInCollection = mongoose.model("LogInCollection", logInSchema);
const Product = mongoose.model("Product", productSchema);
const CsvProduct = mongoose.model("CsvProduct", csvSchema);
module.exports = { LogInCollection, Product,CsvProduct };



