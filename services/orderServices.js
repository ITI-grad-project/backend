const stripe = require("stripe")(process.env.STRIPE_SECRET);

const asyncHandler = require("express-async-handler");

const Cart = require("../models/cartModel");
const Product = require("../models/productModels");
const Order = require("../models/orderModel");
const ApiError = require("../utils/ApiError");

exports.createOrder = asyncHandler(async (req, res, next) => {
  const taxPrice = 0;
  const shippingPrice = 50;
  const cart = await Cart.findById(req.params.cartId);
  if (!cart) {
    return next(new ApiError(`no cart for this user`, 404));
  }
  const totalprice = taxPrice + shippingPrice + cart.totalPrice;

  //create order
  const order = await Order.create({
    cartItems: cart.cartItems,
    totalOrderPrice: totalprice,
    user: req.user._id,
    shippingAddress: req.body.shippingAddress,
  });

  if (order) {
    await Cart.findByIdAndDelete(req.params.cartId);
  }
  return res.status(200).json({
    message: "success",
    data: order,
  });
});

exports.getLoggedUserOrder = (req, res, next) => {
  req.objFilter = { user: req.user._id };
  next();
};

exports.getOrder = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  let queryFilter = {};
  if (req.objFilter) queryFilter = req.objFilter;
  const order = await Order.findById({ _id: id, queryFilter });
  if (!order) {
    return next(new ApiError(`No order for this id ${id} `, 404));
  }
  res.status(200).json({ data: order });
});

exports.getAllOrders = asyncHandler(async (req, res, next) => {
  let objectFilter = {};
  let orders;
  if (req.objFilter) objectFilter = req.objFilter;
  if (req.user.role === "admin") {
    let obj = {};
    if (req.query.user) {
      obj.user = req.query.user;
    }
    orders = await Order.find(obj);
  } else {
    orders = await Order.find(objectFilter);
  }
  res.status(200).json({
    result: orders.length,
    data: orders,
  });
});

exports.updateOrderPaid = asyncHandler(async (req, res, next) => {
  const updateOrder = await Order.findById(req.params.orderId);
  if (!updateOrder) {
    return next(
      new ApiError(`no order for this id ${req.params.orderId}`, 404)
    );
  }

  updateOrder.isPaid = true;
  updateOrder.paidAt = Date.now();

  await updateOrder.save();
  return res.status(200).json({
    message: "success",
    data: updateOrder,
  });
});

exports.updateOrderDelivered = asyncHandler(async (req, res, next) => {
  const updateOrder = await Order.findById(req.params.orderId);
  if (!updateOrder) {
    return next(
      new ApiError(`no order for this id ${req.params.orderId}`, 404)
    );
  }

  updateOrder.isDelivered = true;
  updateOrder.DeliveredAt = Date.now();

  await updateOrder.save();
  return res.status(200).json({
    message: "success",
    data: updateOrder,
  });
});

exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
  const updateOrder = await Order.findById(req.params.orderId);
  if (!updateOrder) {
    return next(
      new ApiError(`no order for this id ${req.params.orderId}`, 404)
    );
  }
  if (updateOrder.cancelOrder) {
    return next(new ApiError(`sorry user cancel this order`, 400));
  }
  updateOrder.orderStatus = req.body.orderStatus;

  await updateOrder.save();
  return res.status(200).json({
    message: "update status successfully",
    data: updateOrder,
  });
});

exports.checkOutSession = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findById(req.params.cartId);
  if (!cart) {
    return next(new ApiError(`no cart for this user`, 404));
  }

  const totalOrderPrice = cart.totalPrice + 50;
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "egp",
          unit_amount: totalOrderPrice * 100,
          product_data: {
            name: req.user.userName,
            description: "welcome in MYReFurB",
          },
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${req.protocol}://${req.get("host")}/profile`,
    cancel_url: `http://localhost:5173/`,
    client_reference_id: req.params.cartId,
    customer_email: req.user.email,
    metadata: req.body.shippingAddress,
  });
  return res.status(200).json({ status: "success", session });
});

const createCardOrder = async (session) => {
  const cart = await Cart.findById(session.client_reference_id);

  const order = await Order.create({
    user: cart.user,
    totalOrderPrice: session.amount_total / 100,
    cartItems: cart.cartItems,
    shippingAddress: session.metadata,
    isPaid: true,
    paidAt: Date.now(),
    paymentMethod: "card",
  });

  if (order) {
    await Cart.findByIdAndDelete(session.client_reference_id);
  }
};

exports.webHookHandler = asyncHandler(async (req, res, next) => {
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.WEBHOOK_STRIPE
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if (event.type === "checkout.session.completed") {
    createCardOrder(event.data.object);
  }
  return res.status(200).json({ received: "success" });
});

exports.cancelOrder = asyncHandler(async (req, res, next) => {
  const cancelOrder = await Order.findById(req.params.orderId);
  if (!cancelOrder) {
    return next(
      new ApiError(`no order for this id ${req.params.orderId}`, 404)
    );
  }

  if (cancelOrder.orderStatus !== "pending") {
    return next(
      new ApiError(
        `sorry you can't cancel this order because it already accepted by admin`,
        400
      )
    );
  }
  cancelOrder.cancelOrder = true;

  await cancelOrder.save();
  return res.status(200).json({
    message: "order cancelled successfully",
    data: cancelOrder,
  });
});
