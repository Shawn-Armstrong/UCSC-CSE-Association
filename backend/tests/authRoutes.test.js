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
    pool.query.mockReset();
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

  it('should return 200 and set an HTTP-only cookie if credentials are valid', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 1, is_verified: true, password_hash: 'hashedpassword' }]
    });
    bcrypt.compare.mockResolvedValue(true);

    const response = await request(app)
      .post('/login')
      .send({ email: 'user@example.com', password: 'password123' });

    expect(response.statusCode).toBe(200);

    expect(response.headers['set-cookie']).toBeDefined();

    // Use a more flexible regex to account for the presence of the 'Secure' attribute
    const cookieRegex = /token=.+; Path=\/; HttpOnly; (Secure; )?SameSite=Strict/;
    expect(response.headers['set-cookie'][0]).toMatch(cookieRegex);

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

  it('should return 500 on server error', async () => {
    // Step 1: Mock console.error
    jest.spyOn(console, 'error').mockImplementation(() => { });

    // Mock the database query to throw an error
    pool.query.mockRejectedValue(new Error('Server error'));

    // Step 2: Run your test
    const response = await request(app)
      .post('/login')
      .send({ email: 'user@example.com', password: 'password123' });

    expect(response.statusCode).toBe(500);
    expect(response.text).toBe('Server error during login');

    // Step 3: Assert that console.error was called with an Error
    expect(console.error).toHaveBeenCalledWith(expect.any(Error));

    // Step 4: Restore console.error
    console.error.mockRestore();
  });

});

describe('/verify-email route', () => {
  let pool;

  beforeAll(() => {
    pool = new Pool();
  });

  afterEach(() => {
    jest.clearAllMocks();
    pool.query.mockReset();
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

  it('should return 500 if a server error occurs during email verification', async () => {
    // Mock the database query to throw an error
    pool.query.mockRejectedValue(new Error('Database error'));

    const response = await request(app)
      .get('/verify-email')
      .query({ token: 'someverificationtoken' });

    expect(response.statusCode).toBe(500);
    expect(response.text).toBe('Server error during verification');
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
    pool.query.mockReset();
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

  it('should return 500 if a server error occurs during registration', async () => {
    // Mock the database query to throw an error
    pool.query.mockRejectedValue(new Error('Database error'));

    const response = await request(app)
      .post('/register')
      .send({ username: 'newuser', email: 'user@example.com', password: 'password123' });

    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual({ message: 'Server error during registration' });
  });
});

describe('/reset-password/confirm route', () => {
  let pool;

  beforeAll(() => {
    pool = new Pool();
  });

  afterEach(() => {
    jest.clearAllMocks();
    pool.query.mockReset();
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

  it('should respond with a generic message even if the user does not exist', async () => {
    // Mock the database query to return no user
    pool.query.mockResolvedValueOnce({ rows: [] });

    const response = await request(app)
      .post('/reset-password')
      .send({ email: 'nonexistent@example.com' });

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("If an account with that email exists, a password reset link has been sent.");
  });

  it('should return 500 if a server error occurs during password reset', async () => {
    // Mock the database query to throw an error
    pool.query.mockRejectedValue(new Error('Database error'));

    const response = await request(app)
      .post('/reset-password')
      .send({ email: 'user@example.com' });

    expect(response.statusCode).toBe(500);
    expect(response.body.message).toBe('Server error during password reset');
  });

  it('should send a password reset email if the user exists', async () => {
    // Mock the database query to return a user
    pool.query.mockResolvedValueOnce({ rows: [{ id: 1, email: 'existinguser@example.com' }] });

    // Mock the email sending to be successful
    jest.spyOn(transporter, 'sendMail').mockImplementation((mailOptions, callback) => {
      callback(null, { response: '250 OK' });
    });

    const response = await request(app)
      .post('/reset-password')
      .send({ email: 'existinguser@example.com' });

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("If an account with that email exists, a password reset link has been sent.");
  });

  it('should return 500 if there is an error sending the reset password email', async () => {
    // Mock the database query to return a user
    pool.query.mockResolvedValueOnce({ rows: [{ id: 1, email: 'user@example.com' }] });

    // Mock the email sending to fail
    jest.spyOn(transporter, 'sendMail').mockImplementation((mailOptions, callback) => {
      callback(new Error('Email sending error'), null);
    });

    const response = await request(app)
      .post('/reset-password')
      .send({ email: 'user@example.com' });

    expect(response.statusCode).toBe(500);
    expect(response.body.message).toBe('Error sending reset password email');
  });

  it('should return 500 if a server error occurs during password reset confirmation', async () => {
    // Mock the database query to throw an error
    pool.query.mockRejectedValue(new Error('Database error'));

    const response = await request(app)
      .post('/reset-password/confirm')
      .send({ token: 'validtoken', newPassword: 'newPassword123' });

    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual({ message: "Server error during password reset confirmation." });
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
    sendMailMock2 = jest.spyOn(transporter, 'sendMail');
  });

  afterEach(() => {
    jest.clearAllMocks();
    pool.query.mockReset();
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

  it('should return 500 on server error', async () => {
    // Mock the database query to throw an error
    pool.query.mockRejectedValue(new Error('Database error'));

    const response = await request(app)
      .post('/resend-verification')
      .send({ email: 'user@example.com' });

    expect(response.statusCode).toBe(500);
    expect(response.text).toBe('Server error');
  });

  it('should reset verification attempts if the last attempt was more than an hour ago', async () => {
    // Simulate a user whose last verification attempt was more than an hour ago
    const pastDate = new Date(Date.now() - 2 * 3600000); // 2 hours ago
    const user = {
      id: 1,
      email: 'user@example.com',
      is_verified: false,
      verification_attempts: 2,
      last_verification_attempt: pastDate
    };

    // Mock the first query to return this user
    pool.query.mockResolvedValueOnce({ rows: [user] });

    // Mock the second query for resetting the verification attempts
    pool.query.mockResolvedValueOnce({ rows: [] });

    // Simulate sending the verification email successfully
    jest.spyOn(transporter, 'sendMail').mockImplementation((mailOptions, callback) => {
      callback(null, { response: '250 OK' });
    });

    const response = await request(app)
      .post('/resend-verification')
      .send({ email: 'user@example.com' });

    // Check the response status and message
    expect(response.statusCode).toBe(200);
    expect(response.text).toBe('Verification email resent');

    // Verify that the query to reset the verification attempts was called with the correct user ID
    expect(pool.query).toHaveBeenCalledWith(
      'UPDATE users SET verification_attempts = 0 WHERE id = $1',
      [user.id]
    );
  });

  it('should return 500 if there is an error sending email', async () => {
    // Ensure there are no conflicting mocks on transporter.sendMail
    jest.restoreAllMocks();

    // Mock transporter.sendMail to simulate an error
    jest.spyOn(transporter, 'sendMail').mockImplementation((mailOptions, callback) => {
      callback(new Error('Email sending failed'), null);
    });

    // Mock database query to return a user who needs verification
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 1, email: 'user@example.com', is_verified: false, verification_attempts: 0, last_verification_attempt: null }]
    });

    // Call the /resend-verification endpoint
    const response = await request(app)
      .post('/resend-verification')
      .send({ email: 'user@example.com' });

    // Assert the response
    expect(response.statusCode).toBe(500);
    expect(response.text).toBe('Error sending email');

    // Restore the original sendMail method
    transporter.sendMail.mockRestore();
  });
});

describe('authenticateToken middleware', () => {
  let pool;

  beforeAll(() => {
    pool = new Pool();
  });

  afterEach(() => {
    jest.clearAllMocks();
    pool.query.mockReset();
  });

  it('should return 401 if no token is provided', async () => {
    const response = await request(app)
      .get('/profile'); // Assuming /profile uses authenticateToken middleware

    expect(response.statusCode).toBe(401);
  });

  it('should return 401 if token is invalid', async () => {
    jwt.verify.mockImplementation((token, secret, callback) => {
      callback(new Error('Invalid token'), null);
    });

    const response = await request(app)
      .get('/profile')
      .set('Authorization', 'Bearer invalid.token');

    expect(response.statusCode).toBe(401);
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
      .get('/profile')
      .set('Cookie', [`token=valid.token`]); // Simulate sending the token as a cookie

    expect(response.statusCode).toBe(200);
    // Further assertions based on the expected response
  });

  it('should return 403 if token verification fails', async () => {
    // Mock jwt.verify to simulate a verification error
    jwt.verify.mockImplementation((token, secret, callback) => {
      callback(new Error('Token verification failed'), null); // Simulate verification failure
    });

    // Send a request with a token that will trigger the verification failure
    const response = await request(app)
      .get('/profile') // Assuming /profile uses authenticateToken middleware
      .set('Cookie', [`token=failing.token`]);

    expect(response.statusCode).toBe(403);
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
    pool.query.mockReset();
  });

  it('should return 404 if user is not found', async () => {
    // Mock jwt.verify for a valid token scenario
    jwt.verify.mockImplementation((token, secret, callback) => {
      callback(null, { userId: 1 }); // Simulate a valid user context
    });

    // Mock the database query to return an empty array, simulating user not found
    pool.query.mockResolvedValueOnce({ rows: [] });

    const response = await request(app)
      .get('/profile')
      .set('Cookie', [`token=valid.token`]); // Simulate sending the token as a cookie

    expect(response.statusCode).toBe(404);
    expect(response.text).toBe('User not found');
  });

  it('should return 500 on server error', async () => {
    // Mock jwt.verify for a valid token scenario
    jwt.verify.mockImplementation((token, secret, callback) => {
      callback(null, { userId: 1 }); // Simulate a valid user context
    });

    // Mock the database query to reject with an error
    pool.query.mockRejectedValue(new Error('Server error'));

    const response = await request(app)
      .get('/profile')
      .set('Cookie', [`token=valid.token`]); // Simulate sending the token as a cookie

    expect(response.statusCode).toBe(500);
    expect(response.text).toBe('Server error retrieving profile');
  });

});

describe('/validate-session route', () => {
  it('should return isAuthenticated true for a valid token', async () => {
    // Generate a valid JWT token
    const validToken = jwt.sign({ userId: 1 }, 'your_secret_key', { expiresIn: '1h' });

    const response = await request(app)
      .get('/validate-session')
      .set('Cookie', [`token=${validToken}`]); // Send the valid token as a cookie

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ isAuthenticated: true });
  });

  it('should return 401 for an invalid or missing token', async () => {
    const response = await request(app)
      .get('/validate-session');

    expect(response.statusCode).toBe(401);
  });
});


describe('/logout route', () => {
  it('should clear the token cookie and return a success message', async () => {
    const response = await request(app)
      .post('/logout');

    // Check if the cookie 'token' is being cleared. Look for a cookie set with an expired or immediate expiry date
    const cookieHeader = response.headers['set-cookie'][0];
    expect(cookieHeader).toContain('token=;');
    expect(cookieHeader).toContain('Expires=');

    // Check if the response status is 200
    expect(response.statusCode).toBe(200);

    // Check if the response message is 'Logged out successfully'
    expect(response.text).toBe('Logged out successfully');
  });
});