const request = require('supertest');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const app = require('../app'); 

jest.mock('bcrypt');
jest.mock('pg', () => {
  const mPool = {
    query: jest.fn(),
  };
  return { Pool: jest.fn(() => mPool) };
});

describe('/register route', () => {
  let pool;

  beforeAll(() => {
    pool = new Pool();
  });

  afterEach(() => {
    jest.clearAllMocks();
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

  // Add more tests as needed
});
