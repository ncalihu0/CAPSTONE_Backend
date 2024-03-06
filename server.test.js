
const request = require('supertest');
const { app } = require('./server');

jest.mock('axios');

jest.mock('axios', () => ({
    get: jest.fn((url) => {
        if (url.includes('budgeting+events+in+NewYork')) {
            return Promise.resolve({
                data: {
                    events_results: [
                        // Mock data for events_results array
                    ]
                }
            });
        } else {
            return Promise.resolve({ data: {} }); // Mock response for other URLs if needed
        }
    })
}));
jest.mock('mysql2', () => {
    return {
        createConnection: jest.fn(() => {
            return {
                query: jest.fn((query, callback) => {
                    // Simulate database response
                    if (query.includes('SELECT * FROM User')) {
                        // Simulate user data based on query
                        const email = query.match(/email = "([^"]*)"/)[1];
                        if (email === 'test@example.com') {
                            // Simulate user found in database
                            callback(null, [{ email: 'test@example.com', password: 'password', admin: 1, first_name: 'Test' }]);
                        } else {
                            // Simulate user not found in database
                            callback(null, []);
                        }
                    }
                })
            };
        })
    };
});

describe('Server endpoints', () => {

    it('should respond with articles or events based on query parameters on GET "/resources"', async () => {
        const response = await request(app).get('/resources?location=NewYork');
        expect(response.status).toBe(200);
        // Add more assertions based on your expected response data
    });
});

test('server to be running', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Hello World');
})

describe('Login endpoint', () => {
    it('should respond with a redirect to admin dashboard for admin user', async () => {
        const response = await request(app).get('/login?email=test@example.com&password=password');
        expect(response.status).toBe(200);
        expect(response.body.redirect).toBe('/admin');
        expect(response.body.message).toBe('Welcome back Test');
    });
});
