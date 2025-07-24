const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const SendBirdClient = require('./sendbird-client');

const app = express();
const PORT = process.env.PORT || 3000;

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SendBird API Server',
      version: '1.0.0',
      description: 'REST API server for SendBird operations including user management and token generation',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      },
      servers: [
        {
          url: `http://localhost:${PORT}`,
          description: 'Development server'
        }
      ]
    },
    components: {
      schemas: {
        User: {
          type: 'object',
          required: ['user_id'],
          properties: {
            user_id: {
              type: 'string',
              description: 'Unique identifier for the user'
            },
            nickname: {
              type: 'string',
              description: 'Display name for the user'
            },
            profile_url: {
              type: 'string',
              format: 'uri',
              description: 'URL to user profile image'
            },
            issue_access_token: {
              type: 'boolean',
              description: 'Whether to issue access token immediately'
            }
          }
        },
        UserResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean'
            },
            data: {
              type: 'object',
              properties: {
                user_id: { type: 'string' },
                nickname: { type: 'string' },
                profile_url: { type: 'string' },
                access_token: { type: 'string' }
              }
            },
            message: { type: 'string' }
          }
        },
        TokenResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean'
            },
            data: {
              type: 'object',
              properties: {
                access_token: { type: 'string' },
                expires_at: { type: 'number' }
              }
            },
            message: { type: 'string' }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean'
            },
            error: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    }
  },
  apis: ['./server.js'] // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS for frontend
app.use(morgan('combined')); // Logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Initialize SendBird client
let sendbirdClient;
try {
    sendbirdClient = new SendBirdClient();
} catch (error) {
    console.error('Failed to initialize SendBird client:', error.message);
    process.exit(1);
}

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Check if the server is running properly
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 service:
 *                   type: string
 *                   example: SendBird API Server
 */
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'SendBird API Server'
    });
});

/**
 * @swagger
 * /api/users/{userId}/token:
 *   get:
 *     summary: Get user access token
 *     description: Retrieve access token for a specific user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to get token for
 *         example: "User 2"
 *     responses:
 *       200:
 *         description: Token retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
app.get('/api/users/:userId/token', async (req, res) => {
    try {
        const { userId } = req.params;
        
        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'User ID is required',
                message: 'Please provide a valid user ID'
            });
        }

        console.log(`Getting token for user: ${userId}`);
        const tokenData = await sendbirdClient.getUserToken(userId);
        
        res.json({
            success: true,
            data: tokenData,
            message: `Token retrieved successfully for user: ${userId}`
        });
        
    } catch (error) {
        console.error('Error getting user token:', error.response?.data || error.message);
        
        const statusCode = error.response?.status || 500;
        const errorMessage = error.response?.data?.message || error.message;
        
        res.status(statusCode).json({
            success: false,
            error: errorMessage,
            message: 'Failed to get user token'
        });
    }
});

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     description: Create a new user with custom information
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *           example:
 *             user_id: "john_doe"
 *             nickname: "John Doe"
 *             profile_url: "https://example.com/avatar.jpg"
 *             issue_access_token: true
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: Bad request - missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
app.post('/api/users', async (req, res) => {
    try {
        const userData = req.body;
        
        // Validate required fields
        if (!userData.user_id) {
            return res.status(400).json({
                success: false,
                error: 'user_id is required',
                message: 'Please provide a user_id in the request body'
            });
        }

        console.log('Creating user with data:', userData);
        const newUser = await sendbirdClient.createUser(userData);
        
        res.status(201).json({
            success: true,
            data: newUser,
            message: 'User created successfully'
        });
        
    } catch (error) {
        console.error('Error creating user:', error.response?.data || error.message);
        
        const statusCode = error.response?.status || 500;
        const errorMessage = error.response?.data?.message || error.message;
        
        res.status(statusCode).json({
            success: false,
            error: errorMessage,
            message: 'Failed to create user'
        });
    }
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        message: `The requested endpoint ${req.originalUrl} does not exist`,
        availableEndpoints: [
            'GET /health',
            'GET /api/users/:userId/token',
            'POST /api/users',
            'GET /api-docs'
        ]
    });
});

// Error handler
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Something went wrong on the server'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 SendBird API Server is running on port ${PORT}`);
    console.log(`📋 Health check: http://localhost:${PORT}/health`);
    console.log(`📋 Swagger Documentation: http://localhost:${PORT}/api-docs`);
    console.log(`\nAvailable endpoints:`);
    console.log(`  GET  /health`);
    console.log(`  GET  /api/users/:userId/token`);
    console.log(`  POST /api/users`);
    console.log(`  GET  /api-docs`);
});

module.exports = app; 