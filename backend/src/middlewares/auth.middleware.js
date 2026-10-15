import jwt from 'jsonwebtoken';
import Customer from '../models/customer.model.js';

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ success: false, message: 'Unauthorized: No token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const customer = await Customer.findById(decoded.id).select('-password');

    if (!customer) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Customer not found' });
    }

    req.user = customer;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
  }
};

export default authMiddleware;
