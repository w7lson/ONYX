import prisma from '../utils/prisma.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

// Internal helper — used by other controllers to create notifications
export const createNotification = async (userId, { type, title, message, link }) => {
    return prisma.notification.create({
        data: { userId, type, title, message, link },
    });
};

export const getNotifications = asyncHandler(async (req, res) => {
    const { userId } = req.auth;
    const { limit = 50, unreadOnly } = req.query;

    const where = { userId };
    if (unreadOnly === 'true') where.isRead = false;

    const notifications = await prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
    });

    res.json(notifications);
});

export const getUnreadCount = asyncHandler(async (req, res) => {
    const { userId } = req.auth;

    const count = await prisma.notification.count({
        where: { userId, isRead: false },
    });

    res.json({ count });
});

export const markAsRead = asyncHandler(async (req, res) => {
    const { userId } = req.auth;
    const { notificationId } = req.params;

    const notification = await prisma.notification.findUnique({
        where: { id: notificationId },
    });

    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    if (notification.userId !== userId) return res.status(403).json({ error: 'Unauthorized' });

    const updated = await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true },
    });

    res.json(updated);
});

export const markAllAsRead = asyncHandler(async (req, res) => {
    const { userId } = req.auth;

    await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
    });

    res.json({ success: true });
});

export const deleteNotification = asyncHandler(async (req, res) => {
    const { userId } = req.auth;
    const { notificationId } = req.params;

    const notification = await prisma.notification.findUnique({
        where: { id: notificationId },
    });

    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    if (notification.userId !== userId) return res.status(403).json({ error: 'Unauthorized' });

    await prisma.notification.delete({ where: { id: notificationId } });

    res.json({ success: true });
});
