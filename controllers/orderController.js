const Order = require("../models/Order");
const Cart = require("../models/Cart");
const { createError } = require("../helpers/error");
const nodemailer = require("nodemailer");
const { formatNumber } = require("../utils/convertion");

// CONFIGURE NODEMAILER
const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: "johan.beatty10@ethereal.email",
    pass: "4fSNT4126cfz3QqZDr",
  },
});

// CREATE ORDER
exports.postOrder = async (req, res, next) => {
  const { userId, cartId, fullName, email, phoneNumber, address, totalAmount } =
    req.body;
  try {
    // Retrieve the cart and populate the necessary fields
    const cart = await Cart.findById(cartId).populate({
      path: "products.productId",
      select: "category img1 name price",
    });

    // Calculate the total price based on the cart's products
    let totalPrice = 0;
    const productsTable = cart.products.map((product) => {
      const { productId, quantity } = product;
      const { name, img1, price } = productId;
      const totalProductPrice = quantity * price;
      totalPrice += totalProductPrice;

      // Mail Content
      return `
          <tr>
            <td>${name}</td>
            <td><img src="${img1}" alt="${name}" height="50"></td>
            <td>${formatNumber(+price)} VND</td>
            <td>${quantity}</td>
            <td>${formatNumber(+totalProductPrice)} VND</td>
          </tr>
        `;
    });

    // console.log(totalAmount);
    // console.log(totalPrice);

    // Compare totalPrice from frontend to backend
    if (totalAmount !== totalPrice) {
      return next(createError(500, "Something went wrong"));
    }

    // Create the order
    const newOrder = new Order({
      userId,
      cartId,
      totalPrice,
      fullName,
      email,
      phoneNumber,
      address,
    });

    // Save the order
    const savedOrder = await newOrder.save();

    // Create a transporter for sending emails

    // Configure email content
    const mailOptions = {
      from: "ktackboss@gmail.com",
      to: email,
      subject: "Order Confirmation",
      html: `
        <h1>Xin chào ${fullName}</h1>
        <p>Phone: ${phoneNumber}</p>
        <p>Address: ${address}</p>
        <table style="text-align: center; width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="border: 1px solid black; padding: 10px;">Tên Sản phẩm</th>
              <th style="border: 1px solid black; padding: 10px;">Hình Ảnh</th>
              <th style="border: 1px solid black; padding: 10px;">Giá</th>
              <th style="border: 1px solid black; padding: 10px;">Số lượng</th>
              <th style="border: 1px solid black; padding: 10px;">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            ${productsTable.join("")}
          </tbody>
        </table>
        <p style="text-align: center; margin-top: 20px;">Total Price: ${formatNumber(
          +totalPrice
        )} VND</p>
        <p style="text-align: center;">Cảm ơn bạn!</p>
      `,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

    res.status(201).json(savedOrder);
  } catch (err) {
    next(err);
  }
};

// GET USER ORDER
exports.getUserOrder = async (req, res, next) => {
  const userId = req.params.userId;

  try {
    const order = await Order.find({ userId: userId })
      .populate({ path: "userId", select: "fullname email phone" }) // Populate selected fields of the 'userId' field
      .populate({
        path: "cartId",

        populate: {
          path: "products",
          select: "quantity",
          populate: {
            path: "productId",
            model: "Product",
            select: "name img1 price",
          },
        },
        select: "totalQuantity",
      });

    res.status(200).json(order);
  } catch (err) {
    next(err);
  }
};

// GET ALL ORDERS
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (err) {
    next(err);
  }
};

// UPDATE ORDER
exports.putOrder = async (req, res, next) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updatedOrder);
  } catch (err) {
    next(err);
  }
};

// DELETE ORDER
exports.deleteOrder = async (req, res, next) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.status(200).json("Order has been deleted");
  } catch (err) {
    next(err);
  }
};
