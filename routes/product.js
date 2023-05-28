const express = require("express");
const Product = require("../models/Product");
const { verifyAdmin } = require("../middleware/verifyToken");
const {
  postProduct,
  getProducts,
  getProduct,
  getProductsByCategory,
  deleteProduct,
} = require("../controllers/productController");

const router = express();

//CREATE

router.post("/", verifyAdmin, postProduct);

//GET ONE PRODUCT
router.get("/:id", getProduct);

//GET ALL PRODUCTS
router.get("/", getProducts);

//GET PRODUCT BY CATEGORY
router.get("/category/:category", getProductsByCategory);

//DELETE
router.delete("/:productId", verifyAdmin, deleteProduct);

module.exports = router;
