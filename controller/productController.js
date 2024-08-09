const Product = require("../model/product");

exports.add = async (req, res) => {
	try {
	  const { name, price, description, image, category } = req.body;
  
	  // Check for required fields
	  if (!name || !price || !description || !category) {
		return res.status(400).send({
		  message: "Name, price, description, and category are required",
		});
	  }
  
	  // Create a new product instance
	  const product = new Product({
		name,
		price,
		description,
		image,
		category,
		// tags, mimeType, and timestamps are automatically handled
	  });
  
	  // Save the product to the database
	  const savedProduct = await product.save();
  
	  res.status(201).json({
		message: "Product added successfully",
		data: savedProduct,
	  });
	} catch (err) {
	  res.status(500).send({
		status: "error",
		message: err.message,
	  });
	}
  };
  

exports.update = (req, res) => {
	if (
		!req.body.name ||
		!req.body.price ||
		!req.body.description ||
		!req.body.image ||
		!req.body.category ||
		!req.query._id
	) {
		return res.status(400).send({
			message: "All fields are required",
		});
	}

	Product.findByIdAndUpdate(
		req.query._id,
		{
			name: req.body.name,
			price: req.body.price,
			description: req.body.description,
			image: req.body.image,
			category: req.body.category,
		},
		(err, product) => {
			if (err) {
				res.send({
					status: "error",
					message: err.message,
				});
			}
			res.json({
				message: "Product updated successfully",
				data: product,
			});
		}
	);
};

exports.delete = (req, res) => {
	if (!req.query._id) {
		return res.status(400).send({
			message: "Product id is required",
		});
	}

	Product.findByIdAndUpdate(
		req.query._id,
		{
			deletedAt: new Date(),
		},
		(err, product) => {
			if (err) {
				res.send({
					status: "error",
					message: err.message,
				});
			}
			res.json({
				message: "Product deleted successfully",
			});
		}
	);
};

exports.get = (req, res) => {
	Product.find({ deletedAt: null }, (err, products) => {
		if (err) {
			res.send({
				status: "error",
				message: err.message,
			});
		}
		res.json({
			message: "Products fetched successfully",
			data: products,
		});
	});
};
