const User = require("../model/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
	const { firstName, email, password } = req.body;
  
	if (!firstName || !email || !password) {
	  return res.status(400).json({
		message: "First name, email, and password are required",
	  });
	}
  
	try {
	  const existingUser = await User.findOne({ email });
	  if (existingUser) {
		return res.status(400).json({
		  message: "User already exists",
		});
	  }
  
	  const newUser = new User({
		firstName,
		email,
		password,
	  });
  
	  const salt = await bcrypt.genSalt(10);
	  newUser.password = await bcrypt.hash(password, salt);
  
	  const savedUser = await newUser.save();
  
	  res.status(201).json({
		message: "User created successfully",
		data: savedUser,
	  });
	} catch (err) {
	  if (err.code === 11000) {
		return res.status(400).json({
		  message: "Email already exists",
		});
	  }
	  res.status(500).json({
		message: "User creation failed",
		error: err.message,
	  });
	}
  };

  exports.login = async (req, res) => {
	const { email, password } = req.body;
  
	// Validate required fields
	if (!email || !password) {
	  return res.status(400).json({
		message: "All fields are required",
	  });
	}
  
	try {
	  // Find the user by email
	  const user = await User.findOne({ email });
	  if (!user) {
		return res.status(400).json({
		  message: "User not found",
		});
	  }
  
	  // Compare provided password with stored hashed password
	  const isMatch = await bcrypt.compare(password, user.password);
	  if (!isMatch) {
		return res.status(400).json({
		  message: "Invalid credentials",
		});
	  }
  
	  // Create JWT payload
	  const payload = {
		id: user._id,
		firstName: user.firstName,
		email: user.email,
	  };
  
	  // Sign JWT and respond
	  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
	  res.status(200).json({
		message: "Login successful",
		token,
		data: user,
	  });
	} catch (err) {
	  res.status(500).json({
		message: "Server error",
		error: err.message,
	  });
	}
  };

exports.update = (req, res) => {
	const { firstName, lastName, email, phone } = req.body;
	if (!firstName || !lastName || !email || !phone) {
		return res.status(400).json({
			message: "All fields are required",
		});
	}
	User.findOne({ email }).then((user) => {
		if (!user) {
			return res.status(400).json({
				message: "User not found",
			});
		}
		user.firstName = firstName;
		user.email = email;
		user
			.save()
			.then((user) => {
				res.status(200).json({
					message: "User updated successfully",
					data: user,
				});
			})
			.catch(() => {
				res.status(400).json({
					message: "User update failed",
				});
			});
	});
};

exports.updateAddress = (req, res) => {
	const { house, street, city, state, pincode, email } = req.body;
	if (!house || !street || !city || !state || !pincode) {
		return res.status(400).json({
			message: "All fields are required",
		});
	}
	User.findOne({ email }).then((user) => {
		if (!user) {
			return res.status(400).json({
				message: "User not found",
			});
		}
		user.address = { house, street, city, state, pincode };
		user
			.save()
			.then((user) => {
				res.status(200).json({
					message: "User address updated successfully",
					data: user,
				});
			})
			.catch(() => {
				res.status(400).json({
					message: "User address update failed",
				});
			});
	});
};

exports.delete = (req, res) => {
	if (!req.query._id) {
		return res.status(400).json({
			message: "User id is required",
		});
	}

	User.findByIdAndDelete(req.query._id).then((user) => {
		if (!user) {
			return res.status(400).json({
				message: "User not found",
			});
		}
		res.status(200).json({
			message: "User deleted successfully",
		});
	});
};

exports.get = (req, res) => {
	if (!req.body.email) {
		return res.status(400).json({
			message: "User email is required",
		});
	}
	User.findOne({ email: req.body.email }).then((user) => {
		if (!user) {
			return res.status(400).json({
				message: "User not found",
			});
		}
		res.status(200).json({
			message: "User found",
			data: user,
		});
	});
};

exports.getAll = (req, res) => {
	User.find().then((users) => {
		if (!users.length) {
			return res.status(400).json({
				message: "User not found",
			});
		}
		res.status(200).json({
			message: "Users fetched successfully",
			data: users,
		});
	});
};
