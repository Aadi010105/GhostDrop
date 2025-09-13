const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Roles = require('../config/roles');
const { createShare, getShareDetails, revokeShare } = require('../controllers/shareController');

// Protect all share creation/revocation routes (getting details might be public if OTP/password protected)
router.post('/', authMiddleware([Roles.OWNER, Roles.EDITOR]), createShare);
router.get('/:shareToken', getShareDetails); // Public, but details protected by password/OTP
router.delete('/:id', authMiddleware([Roles.OWNER, Roles.EDITOR]), revokeShare);

module.exports = router;
