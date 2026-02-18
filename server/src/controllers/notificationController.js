import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Internal helper — used by other controllers to create notifications
export const createNotification = async (userId, { type, title, message, link }) => {
    return prisma.notification.create({
        data: { userId, type, title, message, link },
    });
};

export const getNotifications = async (req, res) => {
    const { userId } = req.auth;
    const { limit = 50, unreadOnly } = req.query;

    try {
        const where = { userId };
        if (unreadOnly === 'true') where.isRead = false;

        const notifications = await prisma.notification.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: parseInt(limit),
        });

        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
};

export const getUnreadCount = async (req, res) => {
    const { userId } = req.auth;

    try {
        const count = await prisma.notification.count({
            where: { userId, isRead: false },
        });

        res.json({ count });
    } catch (error) {
        console.error('Error fetching unread count:', error);
        res.status(500).json({ error: 'Failed to fetch unread count' });
    }
};

export const markAsRead = async (req, res) => {
    const { userId } = req.auth;
    const { notificationId } = req.params;

    try {
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
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ error: 'Failed to mark notification as read' });
    }
};

export const markAllAsRead = async (req, res) => {
    const { userId } = req.auth;

    try {
        await prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Error marking all as read:', error);
        res.status(500).json({ error: 'Failed to mark all as read' });
    }
};

export const deleteNotification = async (req, res) => {
    const { userId } = req.auth;
    const { notificationId } = req.params;

    try {
        const notification = await prisma.notification.findUnique({
            where: { id: notificationId },
        });

        if (!notification) return res.status(404).json({ error: 'Notification not found' });
        if (notification.userId !== userId) return res.status(403).json({ error: 'Unauthorized' });

        await prisma.notification.delete({ where: { id: notificationId } });

        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ error: 'Failed to delete notification' });
    }
};
