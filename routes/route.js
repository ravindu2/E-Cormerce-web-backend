const express = require("express");
const router = express();


const userController = require("../controller/userController");
const productController = require("../controller/productController");
const cartController = require("../controller/cartController");
const orderController = require("../controller/orderController");


const mail = require("../helper/mail");
const upload = require("../helper/storage");
const checkAuth = require("../middleware/checkAuth");

// Home route
router.get("/", (req, res) => {
	res.send("Server is up and running...");
});


// User routes
router.post("/api/v1/user/register", userController.register);
router.post("/api/v1/user/login", userController.login);
router.post("/api/v1/user/update", checkAuth, userController.update);
router.post(
	"/api/v1/user/update/address",
	checkAuth,
	userController.updateAddress
);
router.post("/api/v1/user/delete", checkAuth, userController.delete);
router.get("/api/v1/user", checkAuth, userController.get);
router.get("/api/v1/user/list", checkAuth, userController.getAll);

// Product routes
router.post(
	"/api/v1/product/add",
	checkAuth,
	upload.single("image"),
	productController.add
);
router.post(
	"/api/v1/product/update",
	checkAuth,
	upload.single("image"),
	productController.update
);
router.post("/api/v1/product/delete", checkAuth, productController.delete);
router.get("/api/v1/product", productController.get);



// Mail routes
router.post("/api/v1/mail/send", mail.send);

// Cart routes
router.post("/api/v1/cart/add", checkAuth, cartController.add);
router.post("/api/v1/cart/update", checkAuth, cartController.update);
router.post("/api/v1/cart/delete", checkAuth, cartController.delete);
router.get("/api/v1/cart", checkAuth, cartController.get);
router.get("/api/v1/cart/list", checkAuth, cartController.getAll);

// Order routes
router.post("/api/v1/order/create", checkAuth, orderController.create);
router.post("/api/v1/order/cancel", checkAuth, orderController.cancel);
router.get("/api/v1/order", checkAuth, orderController.get);



// Check authentication
router.post("/api/v1/auth", checkAuth, (req, res) => {
	res.send({
		message: "Authentication successful!",
	});
});

module.exports = router;
