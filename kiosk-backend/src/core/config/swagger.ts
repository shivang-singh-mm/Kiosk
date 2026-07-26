import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Aura Realty Kiosk Pro REST API',
      version: '1.0.0',
      description: 'Production OpenAPI documentation for real-time sales kiosk backend endpoints.',
    },
    servers: [
      {
        url: 'http://localhost:8000',
        description: 'Local Development Server',
      },
    ],
    components: {
      schemas: {
        BookingRequest: {
          type: 'object',
          required: ['unitId', 'customerName', 'phone'],
          properties: {
            unitId: {
              type: 'integer',
              example: 1,
              description: 'Unique ID of the unit to reserve',
            },
            customerName: {
              type: 'string',
              example: 'Eleanor Vance',
              description: 'Customer full name (at least 2 characters)',
            },
            phone: {
              type: 'string',
              example: '+1 (555) 234-5678',
              description: 'Customer phone number (at least 7 digits)',
            },
            sessionId: {
              type: 'string',
              example: 'sales-room-101',
              description: 'Optional sales presentation session ID',
            },
          },
        },
        BookingResponse: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            unitId: { type: 'integer', example: 1 },
            customerName: { type: 'string', example: 'Eleanor Vance' },
            phone: { type: 'string', example: '+1 (555) 234-5678' },
            bookedAt: { type: 'string', format: 'date-time' },
          },
        },
        GalleryItem: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            title: { type: 'string', example: 'Penthouse Living Room' },
            imageUrl: { type: 'string', example: 'https://images.unsplash.com/...' },
          },
        },
        VideoItem: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            title: { type: 'string', example: 'Grand Tower Walkthrough' },
            thumbnail: { type: 'string', example: 'https://images.unsplash.com/...' },
            videoUrl: { type: 'string', example: 'https://res.cloudinary.com/...' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Validation error message' },
            details: { type: 'array', items: { type: 'object' } },
          },
        },
      },
    },
  },
  apis: ['./src/modules/**/*.ts', './src/app.ts', './src/**/*.ts', './dist/modules/**/*.js', './dist/app.js'],
};

export const swaggerSpec = swaggerJSDoc(options);
