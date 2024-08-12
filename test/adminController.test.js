// Use import statements instead of require
import chai from 'chai';
import chaiHttp from 'chai-http';
import sinon from 'sinon';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import app from '../app.js'; // Your Express app
import Admin from '../models/admin.js';
import adminController from '../controllers/adminController.js'; // If needed

const { expect } = chai;
chai.use(chaiHttp);

describe('Admin Controller', () => {
  before((done) => {
    mongoose.connect('mongodb://localhost/testDatabase', { useNewUrlParser: true, useUnifiedTopology: true }, () => {
      mongoose.connection.db.dropDatabase(done);
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  after((done) => {
    mongoose.connection.close(done);
  });

  describe('POST /register', () => {
    it('should register a new admin', async () => {
      const adminData = { name: 'Admin1', email: 'admin1@example.com', password: 'password123' };

      const res = await chai.request(app)
        .post('/register')
        .send(adminData);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('message', 'Admin created successfully');
      expect(res.body.data).to.have.property('email', 'admin1@example.com');
    });

    it('should return error if admin already exists', async () => {
      const adminData = { name: 'Admin1', email: 'admin1@example.com', password: 'password123' };

      // First register the admin
      await chai.request(app).post('/register').send(adminData);

      // Try to register again
      const res = await chai.request(app).post('/register').send(adminData);

      expect(res).to.have.status(400);
      expect(res.body).to.have.property('message', 'Admin already exists');
    });

    it('should return error if fields are missing', async () => {
      const res = await chai.request(app).post('/register').send({});

      expect(res).to.have.status(400);
      expect(res.body).to.have.property('message', 'All fields are required');
    });
  });

  describe('POST /login', () => {
    it('should login an admin', async () => {
      const adminData = { name: 'Admin2', email: 'admin2@example.com', password: 'password123' };
      const savedAdmin = new Admin(adminData);
      savedAdmin.password = await bcrypt.hash(savedAdmin.password, 10);
      await savedAdmin.save();

      const res = await chai.request(app).post('/login').send({
        email: 'admin2@example.com',
        password: 'password123',
      });

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('message', 'Login successful');
      expect(res.body).to.have.property('token');
    });

    it('should return error if admin not found', async () => {
      const res = await chai.request(app).post('/login').send({
        email: 'nonexistent@example.com',
        password: 'password123',
      });

      expect(res).to.have.status(400);
      expect(res.body).to.have.property('message', 'Admin not found');
    });

    it('should return error for invalid credentials', async () => {
      const adminData = { name: 'Admin3', email: 'admin3@example.com', password: 'password123' };
      const savedAdmin = new Admin(adminData);
      savedAdmin.password = await bcrypt.hash(savedAdmin.password, 10);
      await savedAdmin.save();

      const res = await chai.request(app).post('/login').send({
        email: 'admin3@example.com',
        password: 'wrongpassword',
      });

      expect(res).to.have.status(400);
      expect(res.body).to.have.property('message', 'Invalid credentials');
    });
  });

  describe('DELETE /delete', () => {
    it('should delete an admin', async () => {
      const adminData = { name: 'Admin4', email: 'admin4@example.com', password: 'password123' };
      const savedAdmin = new Admin(adminData);
      await savedAdmin.save();

      const res = await chai.request(app).delete(`/delete?_id=${savedAdmin._id}`);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('message', 'Admin deleted successfully');
    });

    it('should return error if admin id is missing', async () => {
      const res = await chai.request(app).delete('/delete');

      expect(res).to.have.status(400);
      expect(res.body).to.have.property('message', 'Admin id is required');
    });

    it('should return error if admin not found', async () => {
      const res = await chai.request(app).delete('/delete?_id=invalidid');

      expect(res).to.have.status(400);
      expect(res.body).to.have.property('message', 'Admin not found');
    });
  });

  describe('GET /get', () => {
    it('should fetch all admins', async () => {
      await new Admin({ name: 'Admin5', email: 'admin5@example.com', password: 'password123' }).save();

      const res = await chai.request(app).get('/get');

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('message', 'Admins fetched successfully');
      expect(res.body.data).to.be.an('array');
    });

    it('should return error if no admins found', async () => {
      // Drop the database to ensure no admins exist
      await mongoose.connection.db.dropDatabase();

      const res = await chai.request(app).get('/get');

      expect(res).to.have.status(400);
      expect(res.body).to.have.property('message', 'Admin not found');
    });
  });
});
