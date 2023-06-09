const Product = require("../models/Product");
const Cart = require("../models/Cart");

//CREATE PRODUCT

exports.postProduct = async (req, res, next) => {
  try {
    const { photos, ...productData } = req.body;

    // console.log(photos);

    const newProduct = new Product({
      ...productData,
      img1: photos[0] || "",
      img2: photos[1] || "",
      img3: photos[2] || "",
      img4: photos[3] || "",
    });
    // console.log(newProduct);
    const savedProduct = await newProduct.save();
    res.status(200).json(savedProduct);
  } catch (err) {
    next(err);
  }
};

//DELETE PRODUCT

exports.deleteProduct = async (req, res, next) => {
  const productId = req.params.productId;

  try {
    // Delete the product from the Product collection
    await Product.findByIdAndDelete(productId);

    // Delete the product from all carts that contain it
    await Cart.updateMany(
      { "products.productId": productId },
      { $pull: { products: { productId } } }
    );

    res.status(200).json("Product has been deleted");
  } catch (err) {
    next(err);
  }
};

//GET ONE PRODUCT
exports.getProduct = async (req, res, next) => {
  const productId = req.params.id;
  try {
    const product = await Product.findById(productId);
    res.status(200).json(product);
  } catch (err) {
    next(err);
  }
};

//GET ALL PRODUCTS

exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (err) {
    next(err);
  }
};

//GET PRODUCTS BY CATEGORY
exports.getProductsByCategory = async (req, res, next) => {
  const category = req.params.category;
  try {
    const productsByCategory = await Product.find({ category: category });
    res.status(200).json(productsByCategory);
  } catch (err) {
    next(err);
  }
};
