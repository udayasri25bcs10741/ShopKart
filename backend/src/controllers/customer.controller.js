import bcrypt from 'bcryptjs';
import Customer from '../models/customer.model.js';
import generateToken from '../utils/generateToken.js';

// Helper — set JWT as HttpOnly cookie
const setAuthCookie = (res, token) => {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });
};          

// POST /customers/register
export const registerCustomer = async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;

    if (!fullName || !email || !password || !phone) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const exists = await Customer.findOne({ email: email.toLowerCase().trim() });
    if (exists) {
      return res.status(409).json({ success: false, message: 'Email already exists' });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const customer = await Customer.create({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone.trim(),
    });

    return res.status(201).json({
      success: true,
      message: 'Customer registered successfully',
      customer: { _id: customer._id, fullName: customer.fullName, email: customer.email, phone: customer.phone },
    });
  } catch (err) {
    console.error('Register Error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /customers/login
export const loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const customer = await Customer.findOne({ email: email.toLowerCase().trim() });
    if (!customer || !(await bcrypt.compare(password, customer.password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(customer._id);
    setAuthCookie(res, token);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      customer: { _id: customer._id, fullName: customer.fullName, email: customer.email, phone: customer.phone },
    });
  } catch (err) {
    console.error('Login Error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /customers/me
export const getMyProfile = async (req, res) => {
  return res.status(200).json({
    _id: req.user._id,
    fullName: req.user.fullName,
    email: req.user.email,
    phone: req.user.phone,
    createdAt: req.user.createdAt,
  });
};

// POST /customers/logout
export const logoutCustomer = async (req, res) => {
  const isProd = process.env.NODE_ENV === 'production';
  res.clearCookie('token', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
  });
  return res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// PATCH /customers/change-password
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both old and new passwords are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    const customer = await Customer.findById(req.user._id);
    if (!customer || !(await bcrypt.compare(oldPassword, customer.password))) {
      return res.status(400).json({ success: false, message: 'Incorrect current password' });
    }

    // Hash new password and save
    customer.password = await bcrypt.hash(newPassword, 10);
    await customer.save();

    return res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    console.error('Change Password Error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
