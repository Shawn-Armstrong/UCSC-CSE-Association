// authRoutes.test.js
const request = require('supertest');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const app = require('../app');
const sinon = require("sinon");
const transporter = require('../services/emailService');

jest.mock('bcrypt');
jest.mock('jsonwebtoken');

jest.mock('pg', () => {
  const mPool = {
    query: jest.fn(),
  };
  return { Pool: jest.fn(() => mPool) };
});

describe('/login route', () => {
  let pool;

  beforeAll(() => {
    pool = new Pool();
    jwt.sign = jest.fn().mockReturnValue('token');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if user does not exist', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] }); // no user found

    const response = await request(app)
      .post('/login')
      .send({ email: 'nonexistent@example.com', password: 'password123' });

    expect(response.statusCode).toBe(401);
    expect(response.text).toBe('User does not exist');
  });

  it('should return 403 if account is not verified', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 1, is_verified: false, password_hash: 'hashedpassword' }]
    });

    const response = await request(app)
      .post('/login')
      .send({ email: 'unverified@example.com', password: 'password123' });

    expect(response.statusCode).toBe(403);
    expect(response.text).toBe('Account verification required');
  });

  it('should return 200 with a token if credentials are valid', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 1, is_verified: true, password_hash: 'hashedpassword' }]
    });
    bcrypt.compare.mockResolvedValue(true);

    const response = await request(app)
      .post('/login')
      .send({ email: 'user@example.com', password: 'password123' });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(jwt.sign).toHaveBeenCalledTimes(1);
  });

  it('should return 401 for invalid credentials', async () => {
    // Mock the database query to return a user
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 1, email: 'user@example.com', password_hash: 'hashedpassword', is_verified: true }]
    });

    // Mock bcrypt.compare to simulate password mismatch
    bcrypt.compare.mockResolvedValue(false);

    const response = await request(app)
      .post('/login')
      .send({ email: 'user@example.com', password: 'wrongpassword' });

    expect(response.statusCode).toBe(401);
    expect(response.text).toBe('Invalid credentials');
  });
});

describe('/verify-email route', () => {
  let pool;

  beforeAll(() => {
    pool = new Pool();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if token is invalid or expired', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] }); // no user found with the token

    const response = await request(app)
      .get('/verify-email')
      .query({ token: 'invalidtoken' });

    expect(response.statusCode).toBe(400);
    expect(response.text).toBe('Invalid or expired token');
  });

  it('should return 200 if email is successfully verified', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 1, email: 'user@example.com', is_verified: false }]
    });

    const response = await request(app)
      .get('/verify-email')
      .query({ token: 'validtoken' });

    expect(response.statusCode).toBe(200);
    expect(response.text).toBe('Email successfully verified!');
  });
});

describe('/register route', () => {
  let pool;
  let sendMailMock;

  beforeAll(() => {
    pool = new Pool();
    // Mock bcrypt for password hashing
    bcrypt.hash.mockResolvedValue('hashedpassword');
  });

  beforeEach(() => {
    // Mock transporter.sendMail to simulate email sending
    sendMailMock = jest.spyOn(transporter, 'sendMail');
  });

  afterEach(() => {
    jest.clearAllMocks();
    sendMailMock.mockRestore();
  });

  it('should return 409 if email is already registered', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ email: 'test@example.com' }] });
    bcrypt.hash.mockResolvedValue('hashedpassword');

    const response = await request(app)
      .post('/register')
      .send({ username: 'newuser', email: 'test@example.com', password: 'password123' });

    expect(response.statusCode).toBe(409);
    expect(response.body.message).toBe('Email is already registered');
  });

  it('should return 409 if username is already taken', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ username: 'newuser' }] });
    bcrypt.hash.mockResolvedValue('hashedpassword');

    const response = await request(app)
      .post('/register')
      .send({ username: 'newuser', email: 'newemail@example.com', password: 'password123' });

    expect(response.statusCode).toBe(409);
    expect(response.body.message).toBe('Username is already taken');
  });

  it('should successfully register a new user', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] }); // no user found
    pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] }); // simulate user insertion
    bcrypt.hash.mockResolvedValue('hashedpassword');

    const response = await request(app)
      .post('/register')
      .send({ username: 'newuser', email: 'newemail@example.com', password: 'password123' });

    expect(response.statusCode).toBe(201);
    expect(response.body.message).toContain('Registration successful');
  });

  it('should return 500 if email sending fails', async () => {
    // Mock the database query to simulate successful user registration
    pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });

    // Simulate email sending failure
    sendMailMock.mockImplementation((mailOptions, callback) => {
      callback(new Error('Email sending error'), null);
    });

    const response = await request(app)
      .post('/register')
      .send({ username: 'newuser', email: 'user@example.com', password: 'password123' });

    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual({ message: 'Error sending email' });
  });

  
});

describe('/reset-password/confirm route', () => {
  let pool;

  beforeAll(() => {
    pool = new Pool();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if password reset token is invalid or has expired', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] }); // token not found or expired

    const response = await request(app)
      .post('/reset-password/confirm')
      .send({ token: 'invalidtoken', newPassword: 'newPassword123' });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Password reset token is invalid or has expired.");
  });

  it('should return 200 if password has been reset successfully', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] }); // token found
    bcrypt.hash.mockResolvedValue('newHashedPassword');

    const response = await request(app)
      .post('/reset-password/confirm')
      .send({ token: 'validtoken', newPassword: 'newPassword123' });

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Your password has been reset successfully.");
  });
});

describe('/resend-verification route', () => {
  let pool;
  let sendMailStub;

  beforeEach(() => {
    pool = new Pool();
    sendMailStub = sinon
      .stub(transporter, "sendMail")
      .callsFake((mailOptions, callback) => {
        callback(null, { response: "250 OK" });
      });
  });

  afterEach(() => {
    jest.clearAllMocks();
    sendMailStub.restore();
  });

  it('should return 404 if user not found', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] }); // User not found

    const response = await request(app)
      .post('/resend-verification')
      .send({ email: 'nonexistent@example.com' });

    expect(response.statusCode).toBe(404);
    expect(response.text).toBe('User not found');
  });

  it('should return 400 if account is already verified', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ is_verified: true }] }); // User is already verified

    const response = await request(app)
      .post('/resend-verification')
      .send({ email: 'verified@example.com' });

    expect(response.statusCode).toBe(400);
    expect(response.text).toBe('Account already verified');
  });

  it('should return 429 if verification email resend limit reached', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ is_verified: false, verification_attempts: 3 }] }); // Verification attempts limit reached

    const response = await request(app)
      .post('/resend-verification')
      .send({ email: 'user@example.com' });

    expect(response.statusCode).toBe(429);
    expect(response.text).toBe('Verification email resend limit reached. Please try again later.');
  });

  it('should return 200 if verification email is resent successfully', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ is_verified: false, verification_attempts: 1 }] }); // Able to resend

    const response = await request(app)
      .post('/resend-verification')
      .send({ email: 'user@example.com' });

    expect(response.statusCode).toBe(200);
    expect(response.text).toBe('Verification email resent');
    expect(sendMailStub.calledOnce).toBeTruthy()
  });
});

describe('authenticateToken middleware', () => {
  let pool;

  beforeAll(() => {
    pool = new Pool();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if no token is provided', async () => {
    const response = await request(app)
      .get('/profile'); // Assuming /profile uses authenticateToken middleware

    expect(response.statusCode).toBe(401);
  });

  it('should return 403 if token is invalid', async () => {
    jwt.verify.mockImplementation((token, secret, callback) => {
      callback(new Error('Invalid token'), null);
    });

    const response = await request(app)
      .get('/profile')
      .set('Authorization', 'Bearer invalid.token');

    expect(response.statusCode).toBe(403);
  });

  it('should allow access with a valid token', async () => {
    // Mock jwt.verify for a valid token scenario
    jwt.verify.mockImplementation((token, secret, callback) => {
      // Simulate a valid token with a user object
      callback(null, { userId: 1 });
    });

    // Mock database response for the profile route
    pool.query.mockResolvedValueOnce({ rows: [{ id: 1, username: 'testuser', email: 'test@example.com' }] });

    const response = await request(app)
      .get('/profile') // Replace with your actual protected route
      .set('Authorization', 'Bearer valid.token');

    expect(response.statusCode).toBe(200);
    // Further assertions based on the expected response
  });
});

describe('/profile route', () => {
  let pool;

  beforeAll(() => {
    pool = new Pool();
    // Mock jwt.verify to always return a valid userId
    jwt.verify.mockImplementation((token, secret, callback) => {
      callback(null, { userId: 1 });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 404 if user is not found', async () => {
    // Mock the database query to return an empty array
    pool.query.mockResolvedValueOnce({ rows: [] });

    const response = await request(app)
      .get('/profile')
      .set('Authorization', 'Bearer valid.token');

    expect(response.statusCode).toBe(404);
    expect(response.text).toBe('User not found');
  });

  it('should return 500 on server error', async () => {
    // Mock the database query to reject with an error
    pool.query.mockRejectedValue(new Error('Server error'));

    const response = await request(app)
      .get('/profile')
      .set('Authorization', 'Bearer valid.token');

    expect(response.statusCode).toBe(500);
    expect(response.text).toBe('Server error retrieving profile');
  });

  it('should return 500 on server error', async () => {
    // Mock the database query to throw an error
    pool.query.mockRejectedValue(new Error('Database error'));

    const response = await request(app)
      .post('/login')
      .send({ email: 'user@example.com', password: 'password123' });

    expect(response.statusCode).toBe(500);
    expect(response.text).toBe('Server error during login');
  });
});

