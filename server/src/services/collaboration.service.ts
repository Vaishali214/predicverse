import * as crypto from 'crypto';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../utils/AppError.js';

export class CollaborationService {
  /**
   * Helper: Determine user role for a trip ('OWNER' | 'EDITOR' | 'VIEWER' | null)
   */
  static async getUserRole(tripId: string, userId: string): Promise<'OWNER' | 'EDITOR' | 'VIEWER' | null> {
    const trip = await prisma.trip.findUnique({ where: { id: tripId }, select: { userId: true } });
    if (!trip) return null;
    if (trip.userId === userId) return 'OWNER';

    const collab = await prisma.tripCollaborator.findUnique({
      where: { tripId_userId: { tripId, userId } },
    });

    if (collab) {
      return (collab.role as 'EDITOR' | 'VIEWER') || 'VIEWER';
    }

    return null;
  }

  /**
   * Create a secure share link for a trip (Owner only)
   */
  static async createShareLink(
    userId: string,
    tripId: string,
    options: { role?: 'VIEWER' | 'EDITOR'; expirationDays?: number | null }
  ) {
    const role = await this.getUserRole(tripId, userId);
    if (role !== 'OWNER') {
      throw new AppError('Only the trip owner can create share links.', 403);
    }

    // Generate cryptographically secure random token (64 hex characters)
    const token = crypto.randomBytes(32).toString('hex');
    const accessRole = options.role === 'EDITOR' ? 'EDITOR' : 'VIEWER';

    let expiresAt: Date | null = null;
    if (options.expirationDays && options.expirationDays > 0) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + options.expirationDays);
    }

    const shareLink = await prisma.tripShareLink.create({
      data: {
        tripId,
        token,
        role: accessRole,
        expiresAt,
      },
    });

    return {
      id: shareLink.id,
      token: shareLink.token,
      role: shareLink.role,
      expiresAt: shareLink.expiresAt,
      shareUrl: `/shared/trips/${shareLink.token}`,
    };
  }

  /**
   * List all share links for a trip (Owner only)
   */
  static async getShareLinks(userId: string, tripId: string) {
    const role = await this.getUserRole(tripId, userId);
    if (role !== 'OWNER') {
      throw new AppError('Access denied.', 403);
    }

    const links = await prisma.tripShareLink.findMany({
      where: { tripId, isRevoked: false },
      orderBy: { createdAt: 'desc' },
    });

    return { links };
  }

  /**
   * Revoke a share link (Owner only)
   */
  static async revokeShareLink(userId: string, tripId: string, linkId: string) {
    const role = await this.getUserRole(tripId, userId);
    if (role !== 'OWNER') {
      throw new AppError('Access denied.', 403);
    }

    const link = await prisma.tripShareLink.findFirst({
      where: { id: linkId, tripId },
    });

    if (!link) {
      throw new AppError('Share link not found.', 404);
    }

    await prisma.tripShareLink.update({
      where: { id: linkId },
      data: { isRevoked: true },
    });

    return { message: 'Share link revoked successfully.' };
  }

  /**
   * Resolve a public share link token to view the shared trip
   * Sanitizes payload and returns HTTP 410 if expired or HTTP 404 if revoked
   */
  static async resolveSharedTrip(token: string) {
    if (!token || typeof token !== 'string' || token.trim() === '') {
      throw new AppError('Invalid share token.', 400);
    }

    const shareLink = await prisma.tripShareLink.findUnique({
      where: { token },
      include: {
        trip: {
          include: {
            user: {
              select: { name: true, avatar: true },
            },
          },
        },
      },
    });

    if (!shareLink || shareLink.isRevoked) {
      throw new AppError('THIS GAZETTE EDITION IS NO LONGER AVAILABLE', 404);
    }

    if (shareLink.expiresAt && new Date() > new Date(shareLink.expiresAt)) {
      throw new AppError('THIS GAZETTE EDITION HAS EXPIRED', 410);
    }

    const trip = shareLink.trip;
    if (!trip) {
      throw new AppError('Trip not found.', 404);
    }

    let interests: string[] = [];
    try {
      interests = typeof trip.interests === 'string' ? JSON.parse(trip.interests) : trip.interests;
    } catch {
      interests = [];
    }

    // Return strictly sanitized shared trip information (no private credentials, tokens, or hashes)
    return {
      success: true,
      data: {
        id: trip.id,
        title: trip.title,
        destination: trip.destination,
        country: trip.country,
        city: trip.city,
        startDate: trip.startDate,
        endDate: trip.endDate,
        budget: trip.budget,
        days: trip.days,
        travelers: trip.travelers,
        travelStyle: trip.travelStyle,
        interests,
        itinerary: trip.itinerary,
        ownerName: trip.user.name,
        shareRole: shareLink.role,
        isShared: true,
      },
    };
  }

  /**
   * Add a collaborator by email (Owner only)
   */
  static async addCollaborator(
    userId: string,
    tripId: string,
    targetEmail: string,
    role: 'VIEWER' | 'EDITOR' = 'VIEWER'
  ) {
    const userRole = await this.getUserRole(tripId, userId);
    if (userRole !== 'OWNER') {
      throw new AppError('Only the trip owner can add collaborators.', 403);
    }

    const targetUser = await prisma.user.findUnique({
      where: { email: targetEmail.toLowerCase().trim() },
    });

    if (!targetUser) {
      throw new AppError('No PredicVerse account found for this address.', 404);
    }

    if (targetUser.id === userId) {
      throw new AppError('You are already the trip owner.', 400);
    }

    const collaborator = await prisma.tripCollaborator.upsert({
      where: {
        tripId_userId: {
          tripId,
          userId: targetUser.id,
        },
      },
      update: { role },
      create: {
        tripId,
        userId: targetUser.id,
        role,
      },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });

    return {
      collaborator: {
        id: collaborator.id,
        userId: collaborator.userId,
        name: collaborator.user.name,
        email: collaborator.user.email,
        role: collaborator.role,
        createdAt: collaborator.createdAt,
      },
    };
  }

  /**
   * Get all collaborators for a trip (Collaborators & Owner)
   */
  static async getCollaborators(userId: string, tripId: string) {
    const role = await this.getUserRole(tripId, userId);
    if (!role) {
      throw new AppError('Access denied.', 403);
    }

    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        collaborators: {
          include: {
            user: { select: { id: true, name: true, email: true, avatar: true } },
          },
        },
      },
    });

    if (!trip) {
      throw new AppError('Trip not found.', 404);
    }

    const owner = {
      userId: trip.user.id,
      name: trip.user.name,
      email: trip.user.email,
      role: 'OWNER',
    };

    const collaborators = trip.collaborators.map((c) => ({
      id: c.id,
      userId: c.userId,
      name: c.user.name,
      email: c.user.email,
      role: c.role,
    }));

    return { owner, collaborators, userRole: role };
  }

  /**
   * Update collaborator role (Owner only)
   */
  static async updateCollaboratorRole(
    userId: string,
    tripId: string,
    targetUserId: string,
    newRole: 'VIEWER' | 'EDITOR'
  ) {
    const userRole = await this.getUserRole(tripId, userId);
    if (userRole !== 'OWNER') {
      throw new AppError('Only the trip owner can manage collaborator roles.', 403);
    }

    const existing = await prisma.tripCollaborator.findUnique({
      where: { tripId_userId: { tripId, userId: targetUserId } },
    });

    if (!existing) {
      throw new AppError('Collaborator not found on this trip.', 404);
    }

    const updated = await prisma.tripCollaborator.update({
      where: { tripId_userId: { tripId, userId: targetUserId } },
      data: { role: newRole },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    return {
      collaborator: {
        id: updated.id,
        userId: updated.userId,
        name: updated.user.name,
        email: updated.user.email,
        role: updated.role,
      },
    };
  }

  /**
   * Remove collaborator from a trip (Owner or Self)
   */
  static async removeCollaborator(userId: string, tripId: string, targetUserId: string) {
    const userRole = await this.getUserRole(tripId, userId);

    // Owner can remove anyone; non-owner can only remove themselves
    if (userRole !== 'OWNER' && userId !== targetUserId) {
      throw new AppError('Only the owner can remove other collaborators.', 403);
    }

    const existing = await prisma.tripCollaborator.findUnique({
      where: { tripId_userId: { tripId, userId: targetUserId } },
    });

    if (!existing) {
      throw new AppError('Collaborator not found on this trip.', 404);
    }

    await prisma.tripCollaborator.delete({
      where: { tripId_userId: { tripId, userId: targetUserId } },
    });

    return { message: 'Collaborator removed successfully.' };
  }
}
