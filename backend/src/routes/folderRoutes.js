const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Roles = require('../config/roles');
const { createFolder, getFolders, getFolderById, updateFolder, deleteFolder } = require('../controllers/folderController');

// Protect all folder routes
router.use(authMiddleware());

router.post('/', authMiddleware([Roles.OWNER, Roles.EDITOR]), createFolder);
router.get('/', authMiddleware([Roles.OWNER, Roles.EDITOR, Roles.VIEWER]), getFolders);
router.get('/:id', authMiddleware([Roles.OWNER, Roles.EDITOR, Roles.VIEWER]), getFolderById);
router.put('/:id', authMiddleware([Roles.OWNER, Roles.EDITOR]), updateFolder);
router.delete('/:id', authMiddleware([Roles.OWNER]), deleteFolder);

module.exports = router;
