const express = require("express");
const { verifyToken, verifyAdmin } = require("../middleware/verifyToken");
const {
  postCart,
  getAllCarts,
  putCart,
  getUserCart,
  deleteCart,
} = require("../controllers/cartController");

const router = express();

//CREATE CART
router.post("/", verifyToken, postCart);

//UPDATE CART
router.put("/:id", verifyToken, putCart);

//DELETE CART
router.delete("/:id", verifyToken, deleteCart);

//GET CART
router.get("/:userId", verifyToken, getUserCart);

//GET ALL CARTS
router.get("/", verifyAdmin, getAllCarts);

module.exports = router;
