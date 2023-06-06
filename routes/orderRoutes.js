const express = require("express");

const routes = express.Router();
const {
  createOrder,
  getOrder,
  getLoggedUserOrder,
  getAllOrders,
  updateOrderDelivered,
  updateOrderPaid,
  checkOutSession,
  updateOrderStatus,
  cancelOrder,
} = require("../services/orderServices");

const { validateStatus } = require("../utils/validators/orderValidtor");

const { protect, isAllowedTo } = require("../services/authService");

routes.use(protect);

routes
  .route("/")
  .get(getLoggedUserOrder, isAllowedTo("user", "admin"), getAllOrders);

routes.route("/:id").get(isAllowedTo("user"), getOrder);

routes.route("/:cartId").post(isAllowedTo("user"), createOrder);

routes.route("/:orderId/pay").put(isAllowedTo("admin"), updateOrderPaid);

routes.route("/:orderId/cancel").put(isAllowedTo("user"), cancelOrder);

routes
  .route("/:orderId/deliver")
  .put(isAllowedTo("admin"), updateOrderDelivered);

routes
  .route("/:orderId/status")
  .put(validateStatus, isAllowedTo("admin"), updateOrderStatus);

routes
  .route("/checkout-session/:cartId")
  .get(isAllowedTo("user"), checkOutSession);

module.exports = routes;
