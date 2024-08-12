// test/productController.test.js

import chai from 'chai';
import chaiHttp from 'chai-http';
import mongoose from 'mongoose';
import app from '../app'; // Assuming app.js is your Express server

const { expect } = chai;
chai.use(chaiHttp);

describe('Product Controller', () => {
  before((done) => {
    mongoose.connect('mongodb://localhost/testDatabase', { useNewUrlParser: true, useUnifiedTopology: true }, () => {
      mongoose.connection.db.dropDatabase(done);
    });
  });

  after((done) => {
    mongoose.connection.close(done);
  });

  describe('POST /add', () => {
    it('should add a new product', async () => {
      const productData = {
        name: 'Product 1',
        price: 100,
        description: 'This is a test product',
        image: 'http://example.com/image.jpg',
        category: 'Test Category'
      };

      const res = await chai.request(app)
        .post('/add')
        .send(productData);

      expect(res).to.have.status(201);
      expect(res.body).to.have.property('message', 'Product added successfully');
      expect(res.body.data).to.have.property('name', 'Product 1');
    });

    it('should return error if required fields are missing', async () => {
      const res = await chai.request(app)
        .post('/add')
        .send({});

      expect(res).to.have.status(400);
      expect(res.body).to.have.property('message', 'Name, price, description, and category are required');
    });
  });

  describe('PUT /update', () => {
    let productId;

    before(async () => {
      const product = await new Product({
        name: 'Product 2',
        price: 200,
        description: 'Another test product',
        image: 'http://example.com/image2.jpg',
        category: 'Test Category'
      }).save();
      productId = product._id;
    });

    it('should update an existing product', async () => {
      const updatedData = {
        name: 'Updated Product',
        price: 150,
        description: 'Updated description',
        image: 'http://example.com/newimage.jpg',
        category: 'New Category'
      };

      const res = await chai.request(app)
        .put(`/update?_id=${productId}`)
        .send(updatedData);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('message', 'Product updated successfully');
      expect(res.body.data).to.have.property('name', 'Updated Product');
    });

    it('should return error if product id is missing', async () => {
      const res = await chai.request(app)
        .put('/update')
        .send({});

      expect(res).to.have.status(400);
      expect(res.body).to.have.property('message', 'All fields are required');
    });
  });

  describe('DELETE /delete', () => {
    let productId;

    before(async () => {
      const product = await new Product({
        name: 'Product 3',
        price: 300,
        description: 'Another product for deletion',
        image: 'http://example.com/image3.jpg',
        category: 'Delete Category'
      }).save();
      productId = product._id;
    });

    it('should delete a product', async () => {
      const res = await chai.request(app)
        .delete(`/delete?_id=${productId}`);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('message', 'Product deleted successfully');
    });

    it('should return error if product id is missing', async () => {
      const res = await chai.request(app)
        .delete('/delete');

      expect(res).to.have.status(400);
      expect(res.body).to.have.property('message', 'Product id is required');
    });
  });

  describe('GET /get', () => {
    before(async () => {
      await new Product({
        name: 'Product 4',
        price: 400,
        description: 'Yet another product',
        image: 'http://example.com/image4.jpg',
        category: 'Fetch Category'
      }).save();
    });

    it('should fetch all products', async () => {
      const res = await chai.request(app).get('/get');

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('message', 'Products fetched successfully');
      expect(res.body.data).to.be.an('array');
    });

    it('should return empty array if no products exist', async () => {
      await mongoose.connection.db.dropDatabase();
      const res = await chai.request(app).get('/get');

      expect(res).to.have.status(200);
      expect(res.body.data).to.be.an('array').that.is.empty;
    });
  });
});
