const request = require('supertest');
const mongoose = require('mongoose');

// Express application
const app = require('../server');

// User model (for test setup / teardown)
const User = require('../user.model');

// Increase Jest timeout (Mongo connection on CI can be slow)
jest.setTimeout(30000);

// Test lifecycle hooks
beforeAll(async () => {
  // Prefer a dedicated test database URI but fall back to default
  const uri = process.env.DATABASE_TEST || process.env.DATABASE || 'mongodb://localhost:27017/node_template_test';
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

beforeEach(async () => {
  await User.deleteMany({});
});

// -----------------------------Tests-----------------------------
describe('Auth Endpoints', () => {
  describe('POST /api/auth/register', () => {
    it('registers a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.user).toHaveProperty('username', 'testuser');
      expect(res.body.data.user).toHaveProperty('email', 'test@example.com');

      // Persisted in DB?
      const userInDb = await User.findOne({ email: 'test@example.com' });
      expect(userInDb).not.toBeNull();
    });

    it('rejects duplicate email', async () => {
      // Seed first user
      await request(app).post('/api/auth/register').send({
        username: 'first',
        email: 'dup@example.com',
        password: 'password123'
      });

      // Attempt duplicate
      const res = await request(app).post('/api/auth/register').send({
        username: 'second',
        email: 'dup@example.com',
        password: 'password123'
      });

      expect(res.statusCode).toBe(409);
      expect(res.body.status).toBe('error');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send({
        username: 'loginuser',
        email: 'login@example.com',
        password: 'password123'
      });
    });

    it('logs in with correct credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'login@example.com',
        password: 'password123'
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user).toHaveProperty('email', 'login@example.com');
    });

    it('rejects incorrect password', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'login@example.com',
        password: 'wrongpassword'
      });

      expect(res.statusCode).toBe(401);
      expect(res.body.status).toBe('error');
    });
  });
});
