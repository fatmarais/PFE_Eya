const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, updateUser, deleteUser, getAgents, createUser } = require('../Controllers/userController');

// Get all agents
router.get('/agents', getAgents);

// Get all users
router.get('/', getAllUsers);

// creqte a user
router.post('/', createUser);

// Get a specific user by ID
router.get('/:id', getUserById);

// Update a user
router.put('/:id', updateUser);

// Delete a user
router.delete('/:id', deleteUser);



module.exports = router;