import { Request, Response, NextFunction } from 'express';
import { CollaborationService } from '../services/collaboration.service.js';
import {
  createShareLinkSchema,
  addCollaboratorSchema,
  updateCollaboratorRoleSchema,
  formatZodError,
} from '../lib/validation.js';
import { AppError } from '../utils/AppError.js';

export class CollaborationController {
  static async createShareLink(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = createShareLinkSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(formatZodError(parsed.error), 400);
      }
      const result = await CollaborationService.createShareLink(
        req.userId!,
        req.params.id,
        parsed.data
      );
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getShareLinks(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await CollaborationService.getShareLinks(req.userId!, req.params.id);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async revokeShareLink(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await CollaborationService.revokeShareLink(
        req.userId!,
        req.params.id,
        req.params.linkId
      );
      res.json({ success: true, message: result.message });
    } catch (error) {
      next(error);
    }
  }

  static async resolveSharedTrip(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await CollaborationService.resolveSharedTrip(req.params.token);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async addCollaborator(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = addCollaboratorSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(formatZodError(parsed.error), 400);
      }
      const result = await CollaborationService.addCollaborator(
        req.userId!,
        req.params.id,
        parsed.data.email,
        parsed.data.role
      );
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getCollaborators(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await CollaborationService.getCollaborators(req.userId!, req.params.id);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async updateCollaboratorRole(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = updateCollaboratorRoleSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(formatZodError(parsed.error), 400);
      }
      const result = await CollaborationService.updateCollaboratorRole(
        req.userId!,
        req.params.id,
        req.params.targetUserId,
        parsed.data.role
      );
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async removeCollaborator(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await CollaborationService.removeCollaborator(
        req.userId!,
        req.params.id,
        req.params.targetUserId
      );
      res.json({ success: true, message: result.message });
    } catch (error) {
      next(error);
    }
  }
}
