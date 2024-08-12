// test/dbConnection.test.js

const chai = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const { connect } = require('../dbConnection'); // Update with the correct path to your connection module

const { expect } = chai;

describe('MongoDB Connection', () => {
  let connectStub;

  beforeEach(() => {
    connectStub = sinon.stub(mongoose, 'connect');
  });

  afterEach(() => {
    connectStub.restore();
  });

  it('should call mongoose.connect with the correct URI and options', async () => {
    connectStub.resolves(); // Mock the connection to succeed

    const MONGO_URI = 'mongodb://localhost/testDatabase'; // Use your test MongoDB URI
    process.env.MONGO_URI = MONGO_URI;

    await connect();

    expect(connectStub.calledOnce).to.be.true;
    expect(connectStub.firstCall.args[0]).to.equal(MONGO_URI);
    expect(connectStub.firstCall.args[1]).to.deep.equal({
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  it('should log a success message when connection is successful', async () => {
    connectStub.resolves();

    const consoleInfoStub = sinon.stub(console, 'info');

    await connect();

    expect(consoleInfoStub.calledOnce).to.be.true;
    expect(consoleInfoStub.calledWith('MongoDB connected successfully')).to.be.true;

    consoleInfoStub.restore();
  });

  it('should log an error message when connection fails', async () => {
    const error = new Error('Connection failed');
    connectStub.rejects(error);

    const consoleErrorStub = sinon.stub(console, 'error');

    await connect();

    expect(consoleErrorStub.calledOnce).to.be.true;
    expect(consoleErrorStub.calledWith('Connection to MongoDB failed', error)).to.be.true;

    consoleErrorStub.restore();
  });
});

