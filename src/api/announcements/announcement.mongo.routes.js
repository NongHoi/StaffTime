const express = require('express');
const router = express.Router();
const requireLogin = require('../../middlewares/requireLogin');
const requireRole = require('../../middlewares/requireRole');

module.exports = (io, connectedUsers) => {
    const announcementController = require('./announcement.mongo.controller')(io, connectedUsers);

    // Admin creates an announcement
    router.post('/', requireLogin, requireRole([1]), announcementController.createAnnouncement);

    // Get all announcements (for admin) or unread announcements (for user)
    router.get('/', requireLogin, announcementController.getAnnouncements);

    // Get all announcements for the current user (history)
    router.get('/history', requireLogin, announcementController.getAnnouncementHistory);

    // Mark an announcement as read
    router.post('/:id/read', requireLogin, announcementController.markAsRead);

    return router;
};
