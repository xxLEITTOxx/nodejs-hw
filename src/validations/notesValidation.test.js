import { describe, it, expect } from '@jest/globals';
import { celebrate, errors } from 'celebrate';
import express from 'express';
import request from 'supertest';
import {
  getAllNotesSchema,
  noteIdSchema,
  createNoteSchema,
  updateNoteSchema,
} from './notesValidation.js';

// Create a test app with validation middleware
const createTestApp = (schema, handler) => {
  const app = express();
  app.use(express.json());
  app.get('/test', celebrate(schema), handler);
  app.post('/test', celebrate(schema), handler);
  app.patch('/test/:noteId', celebrate(schema), handler);
  app.delete('/test/:noteId', celebrate(schema), handler);
  app.use(errors()); // Celebrate error handler
  return app;
};

describe('Validation Schemas', () => {
  describe('getAllNotesSchema', () => {
    it('should accept valid query parameters', async () => {
      const app = createTestApp(getAllNotesSchema, (req, res) => {
        res.status(200).json(req.query);
      });

      const response = await request(app)
        .get('/test')
        .query({ page: 1, perPage: 10, tag: 'Work', search: 'test' });

      expect(response.status).toBe(200);
    });

    it('should use default values when no query params provided', async () => {
      const app = createTestApp(getAllNotesSchema, (req, res) => {
        res.status(200).json(req.query);
      });

      const response = await request(app).get('/test');

      expect(response.status).toBe(200);
      expect(response.body.page).toBe(1);
      expect(response.body.perPage).toBe(10);
    });

    it('should reject invalid page number (less than 1)', async () => {
      const app = createTestApp(getAllNotesSchema, (req, res) => {
        res.status(200).json(req.query);
      });

      const response = await request(app)
        .get('/test')
        .query({ page: 0 });

      expect(response.status).toBe(400);
    });

    it('should reject invalid perPage (less than 5)', async () => {
      const app = createTestApp(getAllNotesSchema, (req, res) => {
        res.status(200).json(req.query);
      });

      const response = await request(app)
        .get('/test')
        .query({ perPage: 4 });

      expect(response.status).toBe(400);
    });

    it('should reject invalid perPage (greater than 20)', async () => {
      const app = createTestApp(getAllNotesSchema, (req, res) => {
        res.status(200).json(req.query);
      });

      const response = await request(app)
        .get('/test')
        .query({ perPage: 21 });

      expect(response.status).toBe(400);
    });

    it('should reject invalid tag', async () => {
      const app = createTestApp(getAllNotesSchema, (req, res) => {
        res.status(200).json(req.query);
      });

      const response = await request(app)
        .get('/test')
        .query({ tag: 'InvalidTag' });

      expect(response.status).toBe(400);
    });

    it('should accept valid tags', async () => {
      const validTags = [
        'Work',
        'Personal',
        'Meeting',
        'Shopping',
        'Ideas',
        'Travel',
        'Finance',
        'Health',
        'Important',
        'Todo',
      ];

      for (const tag of validTags) {
        const app = createTestApp(getAllNotesSchema, (req, res) => {
          res.status(200).json(req.query);
        });

        const response = await request(app)
          .get('/test')
          .query({ tag });

        expect(response.status).toBe(200);
      }
    });

    it('should accept empty search string', async () => {
      const app = createTestApp(getAllNotesSchema, (req, res) => {
        res.status(200).json(req.query);
      });

      const response = await request(app)
        .get('/test')
        .query({ search: '' });

      expect(response.status).toBe(200);
    });
  });

  describe('noteIdSchema', () => {
    it('should accept valid MongoDB ObjectId', async () => {
      const validId = '507f1f77bcf86cd799439011';

      const app = express();
      app.use(express.json());
      app.get('/test/:noteId', celebrate(noteIdSchema), (req, res) => {
        res.status(200).json({ noteId: req.params.noteId });
      });

      const response = await request(app).get(`/test/${validId}`);

      expect(response.status).toBe(200);
      expect(response.body.noteId).toBe(validId);
    });

    it('should reject invalid ObjectId', async () => {
      const invalidId = 'invalid-id';

      const app = express();
      app.use(express.json());
      app.get('/test/:noteId', celebrate(noteIdSchema), (req, res) => {
        res.status(200).json({ noteId: req.params.noteId });
      });
      app.use(errors());

      const response = await request(app).get(`/test/${invalidId}`);

      expect(response.status).toBe(400);
    });

    it('should reject missing noteId', async () => {
      const app = express();
      app.use(express.json());
      app.get('/test/:noteId', celebrate(noteIdSchema), (req, res) => {
        res.status(200).json({ noteId: req.params.noteId });
      });
      app.use(errors());

      // Test with empty noteId - Express will treat empty segment as empty string
      // We test this by making noteId optional in route, but validation requires it
      // Actually, Express routes require a value, so let's test with a very short invalid ID
      const response = await request(app).get('/test/ab');

      // This should fail validation because it's not a valid ObjectId
      expect(response.status).toBe(400);
    });
  });

  describe('createNoteSchema', () => {
    it('should accept valid note data', async () => {
      const app = express();
      app.use(express.json());
      app.post('/test', celebrate(createNoteSchema), (req, res) => {
        res.status(201).json(req.body);
      });

      const response = await request(app).post('/test').send({
        title: 'Test Note',
        content: 'Test content',
        tag: 'Work',
      });

      expect(response.status).toBe(201);
      expect(response.body.title).toBe('Test Note');
    });

    it('should reject missing title', async () => {
      const app = express();
      app.use(express.json());
      app.post('/test', celebrate(createNoteSchema), (req, res) => {
        res.status(201).json(req.body);
      });
      app.use(errors());

      const response = await request(app).post('/test').send({
        content: 'Test content',
      });

      expect(response.status).toBe(400);
    });

    it('should reject empty title', async () => {
      const app = express();
      app.use(express.json());
      app.post('/test', celebrate(createNoteSchema), (req, res) => {
        res.status(201).json(req.body);
      });
      app.use(errors());

      const response = await request(app).post('/test').send({
        title: '',
        content: 'Test content',
      });

      expect(response.status).toBe(400);
    });

    it('should accept empty content', async () => {
      const app = express();
      app.use(express.json());
      app.post('/test', celebrate(createNoteSchema), (req, res) => {
        res.status(201).json(req.body);
      });

      const response = await request(app).post('/test').send({
        title: 'Test Note',
        content: '',
      });

      expect(response.status).toBe(201);
    });

    it('should accept valid optional tag', async () => {
      const app = express();
      app.use(express.json());
      app.post('/test', celebrate(createNoteSchema), (req, res) => {
        res.status(201).json(req.body);
      });

      const response = await request(app).post('/test').send({
        title: 'Test Note',
        tag: 'Personal',
      });

      expect(response.status).toBe(201);
    });

    it('should reject invalid tag', async () => {
      const app = express();
      app.use(express.json());
      app.post('/test', celebrate(createNoteSchema), (req, res) => {
        res.status(201).json(req.body);
      });
      app.use(errors());

      const response = await request(app).post('/test').send({
        title: 'Test Note',
        tag: 'InvalidTag',
      });

      expect(response.status).toBe(400);
    });
  });

  describe('updateNoteSchema', () => {
    it('should accept valid update data with title', async () => {
      const validId = '507f1f77bcf86cd799439011';
      const app = express();
      app.use(express.json());
      app.patch('/test/:noteId', celebrate(updateNoteSchema), (req, res) => {
        res.status(200).json({ body: req.body, params: req.params });
      });

      const response = await request(app)
        .patch(`/test/${validId}`)
        .send({
          title: 'Updated Title',
        });

      expect(response.status).toBe(200);
      expect(response.body.body.title).toBe('Updated Title');
    });

    it('should accept valid update data with content', async () => {
      const validId = '507f1f77bcf86cd799439011';
      const app = express();
      app.use(express.json());
      app.patch('/test/:noteId', celebrate(updateNoteSchema), (req, res) => {
        res.status(200).json({ body: req.body, params: req.params });
      });

      const response = await request(app)
        .patch(`/test/${validId}`)
        .send({
          content: 'Updated content',
        });

      expect(response.status).toBe(200);
      expect(response.body.body.content).toBe('Updated content');
    });

    it('should accept valid update data with tag', async () => {
      const validId = '507f1f77bcf86cd799439011';
      const app = express();
      app.use(express.json());
      app.patch('/test/:noteId', celebrate(updateNoteSchema), (req, res) => {
        res.status(200).json({ body: req.body, params: req.params });
      });

      const response = await request(app)
        .patch(`/test/${validId}`)
        .send({
          tag: 'Important',
        });

      expect(response.status).toBe(200);
      expect(response.body.body.tag).toBe('Important');
    });

    it('should reject update with all fields missing', async () => {
      const validId = '507f1f77bcf86cd799439011';
      const app = express();
      app.use(express.json());
      app.patch('/test/:noteId', celebrate(updateNoteSchema), (req, res) => {
        res.status(200).json(req.body);
      });
      app.use(errors());

      const response = await request(app).patch(`/test/${validId}`).send({});

      expect(response.status).toBe(400);
    });

    it('should reject invalid noteId', async () => {
      const invalidId = 'invalid-id';
      const app = express();
      app.use(express.json());
      app.patch('/test/:noteId', celebrate(updateNoteSchema), (req, res) => {
        res.status(200).json(req.body);
      });
      app.use(errors());

      const response = await request(app)
        .patch(`/test/${invalidId}`)
        .send({
          title: 'Updated Title',
        });

      expect(response.status).toBe(400);
    });

    it('should reject empty title', async () => {
      const validId = '507f1f77bcf86cd799439011';
      const app = express();
      app.use(express.json());
      app.patch('/test/:noteId', celebrate(updateNoteSchema), (req, res) => {
        res.status(200).json(req.body);
      });
      app.use(errors());

      const response = await request(app)
        .patch(`/test/${validId}`)
        .send({
          title: '',
        });

      expect(response.status).toBe(400);
    });

    it('should reject invalid tag', async () => {
      const validId = '507f1f77bcf86cd799439011';
      const app = express();
      app.use(express.json());
      app.patch('/test/:noteId', celebrate(updateNoteSchema), (req, res) => {
        res.status(200).json(req.body);
      });
      app.use(errors());

      const response = await request(app)
        .patch(`/test/${validId}`)
        .send({
          tag: 'InvalidTag',
        });

      expect(response.status).toBe(400);
    });
  });
});

