// server/controllers/userController.js
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/userSchema');

const stripPassword = doc => doc ? { ...doc.toObject(), password: undefined } : doc;


// Users Endpoint
exports.getMe = async (req, res) => {
  try {
    // Write more code...
  } catch (err) {
    // You may add or edit some ...
    console.error('getMe: ', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.updateMe = async (req, res) => {
  try {
    // Write more code...
  } catch (err) {
    // You may add or edit some ...
    console.error('updateMe: ', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Admin Endpoint
exports.getAllUsers = async (_req, res) => {
  try {
    // Write more code...
  } catch (err) {
    // You may add or edit some ...
    console.error('getAllUsers: ', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.adminUpdateUser = async (req, res) => {
  try {
    // Write more code...
  } catch (err) {
    // You may add or edit some ...
    console.error('adminUpdateUser: ', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.adminDeleteUser = async (req, res) => {
  try {
    // Write more code...
  } catch (err) {
    // You may add or edit some ...
    console.error('adminDeleteUser: ', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
