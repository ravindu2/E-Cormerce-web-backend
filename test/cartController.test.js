// test/cartController.test.js

const chai = require("chai");
const sinon = require("sinon");
const sinonMongoose = require("sinon-mongoose");
const Cart = require("../model/cart");
const cartController = require("../controllers/cartController");

const { expect } = chai;

describe("Cart Controller", () => {
  afterEach(() => {
    sinon.restore();
  });

  describe("add", () => {
    it("should add a product to the cart successfully", (done) => {
      const req = {
        body: {
          id: "123",
          name: "Test Product",
          price: 100,
          image: "image.jpg",
          category: "Test",
          quantity: 1,
          userId: "user123",
        },
      };

      const res = {
        status: sinon.stub().returnsThis(),
        send: sinon.stub(),
      };

      sinon
        .mock(Cart)
        .expects("findOne")
        .withArgs({ id: req.body.id })
        .yields(null, null);

      sinon
        .mock(Cart.prototype)
        .expects("save")
        .yields(null, req.body);

      cartController.add(req, res);

      setTimeout(() => {
        expect(res.status.calledWith(200)).to.be.true;
        expect(res.send.calledWith({
          message: "Product added to cart successfully",
          data: req.body,
        })).to.be.true;
        done();
      }, 10);
    });

    it("should return error if the product already exists in cart", (done) => {
      const req = {
        body: {
          id: "123",
          name: "Test Product",
          price: 100,
          image: "image.jpg",
          category: "Test",
          quantity: 1,
          userId: "user123",
        },
      };

      const res = {
        status: sinon.stub().returnsThis(),
        send: sinon.stub(),
      };

      sinon
        .mock(Cart)
        .expects("findOne")
        .withArgs({ id: req.body.id })
        .yields(null, req.body);

      cartController.add(req, res);

      setTimeout(() => {
        expect(res.status.calledWith(400)).to.be.true;
        expect(res.send.calledWith({
          message: "Product already exists in cart",
          data: req.body,
        })).to.be.true;
        done();
      }, 10);
    });
  });

  describe("update", () => {
    it("should update the product quantity in cart", (done) => {
      const req = {
        body: {
          id: "123",
        },
      };

      const res = {
        status: sinon.stub().returnsThis(),
        send: sinon.stub(),
      };

      const updatedCart = {
        id: "123",
        quantity: 2,
      };

      sinon
        .mock(Cart)
        .expects("findOneAndUpdate")
        .withArgs({ id: req.body.id }, { $inc: { quantity: 1 } })
        .chain("exec")
        .resolves(updatedCart);

      cartController.update(req, res);

      setTimeout(() => {
        expect(res.status.calledWith(200)).to.be.true;
        expect(res.send.calledWith({
          message: "Quantity increased successfully",
          data: updatedCart,
        })).to.be.true;
        done();
      }, 10);
    });
  });

  describe("delete", () => {
    it("should decrease the product quantity in cart", (done) => {
      const req = {
        body: {
          id: "123",
        },
      };

      const res = {
        status: sinon.stub().returnsThis(),
        send: sinon.stub(),
      };

      const updatedCart = {
        id: "123",
        quantity: 0,
      };

      sinon
        .mock(Cart)
        .expects("findOneAndUpdate")
        .withArgs({ id: req.body.id }, { $inc: { quantity: -1 } })
        .chain("exec")
        .resolves(updatedCart);

      sinon
        .mock(Cart)
        .expects("findOneAndRemove")
        .withArgs({ id: req.body.id })
        .yields(null);

      cartController.delete(req, res);

      setTimeout(() => {
        expect(res.status.calledWith(200)).to.be.true;
        expect(res.send.calledWith({
          message: "Product removed from cart successfully",
          data: null,
        })).to.be.true;
        done();
      }, 10);
    });
  });

  describe("get", () => {
    it("should retrieve the cart for a user", (done) => {
      const req = {
        body: {
          userId: "user123",
        },
      };

      const res = {
        status: sinon.stub().returnsThis(),
        send: sinon.stub(),
      };

      const cartData = [
        {
          id: "123",
          name: "Test Product",
          quantity: 1,
        },
      ];

      sinon
        .mock(Cart)
        .expects("find")
        .withArgs({ userId: req.body.userId })
        .chain("exec")
        .resolves(cartData);

      cartController.get(req, res);

      setTimeout(() => {
        expect(res.send.calledWith({
          message: "Cart retrieved successfully",
          data: cartData,
        })).to.be.true;
        done();
      }, 10);
    });
  });

  describe("getAll", () => {
    it("should retrieve all items in the cart", (done) => {
      const req = {};

      const res = {
        status: sinon.stub().returnsThis(),
        send: sinon.stub(),
      };

      const cartData = [
        {
          id: "123",
          name: "Test Product",
          quantity: 1,
        },
        {
          id: "456",
          name: "Another Product",
          quantity: 2,
        },
      ];

      sinon
        .mock(Cart)
        .expects("find")
        .withArgs({})
        .chain("exec")
        .resolves(cartData);

      cartController.getAll(req, res);

      setTimeout(() => {
        expect(res.status.calledWith(200)).to.be.true;
        expect(res.send.calledWith({
          message: "All items fetched from cart successfully",
          data: cartData,
        })).to.be.true;
        done();
      }, 10);
    });
  });
});
