const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');

const Roles = require('../config/roles');
const { presign, complete, download } = require('../controllers/fileController');

router.post('/presign', authMiddleware([Roles.OWNER, Roles.EDITOR]), presign);
router.post('/complete', authMiddleware([Roles.OWNER, Roles.EDITOR]), complete);
router.get('/:id/download', authMiddleware([Roles.OWNER, Roles.EDITOR, Roles.VIEWER]), download);

module.exports = router; 
