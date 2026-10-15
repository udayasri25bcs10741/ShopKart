import 'dotenv/config';
import http from 'http';
import crypto from 'crypto';
import { disconnectDB } from '../src/config/db.js';
import { startServer } from '../src/index.js';

const PORT = process.env.PORT || 5000;
const BASE = `http://localhost:${PORT}`;

function request({ method, path, body = null, cookie = null }) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE);
    const headers = { 'Content-Type': 'application/json' };
    if (cookie) headers['Cookie'] = cookie;

    const payload = body ? JSON.stringify(body) : null;
    if (payload) headers['Content-Length'] = Buffer.byteLength(payload);

    const req = http.request(url, { method, headers }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let parsed;
        try { parsed = JSON.parse(data); } catch { parsed = data; }
        resolve({
          status: res.statusCode,
          body: parsed,
          cookies: res.headers['set-cookie'] || [],
        });
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runTests() {
  console.log('\n======================================================');
  console.log('   SHOPKART COMPLETE AUTOMATED TEST SUITE (Labs 1-6)  ');
  console.log('======================================================\n');

  let server = null;
  let passed = 0;
  let failed = 0;

  const assert = (condition, msg) => {
    if (condition) { console.log(`  ✅ ${msg}`); passed++; }
    else { console.error(`  ❌ ${msg}`); failed++; }
  };

  try {
    server = await startServer();
    const email = `test.${Date.now()}@example.com`;
    let cookie = null;
    let productId = null;

    // --- Lab 01 & 02: Auth Tests ---
    console.log('[Lab 01 & 02: Auth Tests]');
    let res = await request({ method: 'POST', path: '/customers/register', body: { fullName: 'X', email: 'x@x.com' } });
    assert(res.status === 400, 'Register rejects missing fields');

    res = await request({ method: 'POST', path: '/customers/register', body: { fullName: 'X', email: `s.${Date.now()}@x.com`, password: '123', phone: '1234567890' } });
    assert(res.status === 400, 'Register rejects short password');

    res = await request({ method: 'POST', path: '/customers/register', body: { fullName: 'John Doe', email, password: 'password123', phone: '9876543210' } });
    assert(res.status === 201, 'Register succeeds with 201');
    assert(res.body.success === true, 'Register returns success: true');
    assert(res.body.customer?.fullName === 'John Doe', 'Register returns customer name');
    assert(!res.body.customer?.password, 'Register hides password');

    res = await request({ method: 'POST', path: '/customers/register', body: { fullName: 'Dup', email, password: 'password123', phone: '9876543210' } });
    assert(res.status === 409, 'Register rejects duplicate email');

    res = await request({ method: 'POST', path: '/customers/login', body: { email, password: 'wrong' } });
    assert(res.status === 401, 'Login rejects wrong password');
    assert(res.body.message === 'Invalid credentials', 'Login uses generic error');

    res = await request({ method: 'POST', path: '/customers/login', body: { email, password: 'password123' } });
    assert(res.status === 200, 'Login succeeds');
    assert(res.cookies.length > 0, 'Login sets cookie');
    assert(res.cookies[0].includes('HttpOnly'), 'Cookie is HttpOnly');
    cookie = res.cookies[0].split(';')[0];

    res = await request({ method: 'GET', path: '/customers/me' });
    assert(res.status === 401, 'Profile without cookie is 401');

    res = await request({ method: 'GET', path: '/customers/me', cookie });
    assert(res.status === 200, 'Profile with cookie is 200');
    assert(res.body.email === email, 'Profile returns correct email');

    // --- Lab 03: Product Catalog Tests ---
    console.log('\n[Lab 03: Product Tests]');
    res = await request({ method: 'POST', path: '/products', body: { name: 'Gaming Mouse', description: 'Wireless RGB Gaming Mouse', price: 1499, category: 'Electronics', image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46', stock: 10 } });
    assert(res.status === 201, 'Create product succeeds');
    productId = res.body.product?._id;

    res = await request({ method: 'GET', path: '/products' });
    assert(res.status === 200 && Array.isArray(res.body.products), 'Get all products returns list');

    res = await request({ method: 'GET', path: `/products/${productId}` });
    assert(res.status === 200 && res.body.product?._id === productId, 'Get product by ID works');

    // --- Lab 04: Wishlist Tests ---
    console.log('\n[Lab 04: Wishlist Tests]');
    res = await request({ method: 'POST', path: `/wishlist/${productId}` });
    assert(res.status === 401, 'Wishlist without token is 401');

    res = await request({ method: 'POST', path: `/wishlist/${productId}`, cookie });
    assert(res.status === 200, 'Add to wishlist succeeds with 200');
    assert(res.body.success === true, 'Response contains success: true');

    res = await request({ method: 'POST', path: `/wishlist/${productId}`, cookie });
    assert(res.status === 409, 'Duplicate wishlist entry returns 409 Conflict');

    res = await request({ method: 'GET', path: '/wishlist', cookie });
    assert(res.status === 200, 'Get wishlist returns 200');
    assert(Array.isArray(res.body.wishlist), 'Wishlist is an array');
    assert(res.body.wishlist.some(p => p._id === productId), 'Product populated in wishlist');

    res = await request({ method: 'DELETE', path: `/wishlist/${productId}`, cookie });
    assert(res.status === 200, 'Remove from wishlist returns 200');

    res = await request({ method: 'DELETE', path: `/wishlist/${productId}`, cookie });
    assert(res.status === 404, 'Remove non-wishlisted item returns 404');

    // --- Lab 05: Shopping Cart Tests ---
    console.log('\n[Lab 05: Shopping Cart Tests]');
    res = await request({ method: 'POST', path: `/cart/${productId}` });
    assert(res.status === 401, 'Cart without token is 401');

    res = await request({ method: 'POST', path: `/cart/${productId}`, cookie });
    assert(res.status === 200, 'Add to cart succeeds with 200');
    let cartItem = res.body.cart?.find(i => i.product._id === productId);
    assert(cartItem?.quantity === 1, 'Initial cart quantity is 1');

    res = await request({ method: 'POST', path: `/cart/${productId}`, cookie });
    assert(res.status === 200, 'Adding same product again increments quantity');
    cartItem = res.body.cart?.find(i => i.product._id === productId);
    assert(cartItem?.quantity === 2, 'Quantity updated to 2');

    res = await request({ method: 'GET', path: '/cart', cookie });
    assert(res.status === 200, 'Get cart returns populated items');
    assert(res.body.cart?.length >= 1, 'Cart contains items');

    res = await request({ method: 'PATCH', path: `/cart/${productId}`, body: { quantity: 5 }, cookie });
    assert(res.status === 200, 'Update quantity to 5 succeeds');

    res = await request({ method: 'PATCH', path: `/cart/${productId}`, body: { quantity: 999 }, cookie });
    assert(res.status === 400, 'Quantity exceeding stock is rejected with 400');

    res = await request({ method: 'PATCH', path: `/cart/${productId}`, body: { quantity: 0 }, cookie });
    assert(res.status === 400, 'Quantity less than 1 is rejected with 400');

    // --- Lab 06: Checkout & Orders Tests ---
    console.log('\n[Lab 06: Checkout & Orders Tests]');
    const validShipping = {
      fullName: 'Aarav Sharma',
      phone: '9876543210',
      addressLine1: '42 Brigade Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560001',
    };

    res = await request({ method: 'POST', path: '/orders/create-payment-order', body: { shippingAddress: { ...validShipping, pincode: '123' } }, cookie });
    assert(res.status === 400, 'Invalid pincode (< 6 digits) rejected with 400');

    // Create payment order
    res = await request({ method: 'POST', path: '/orders/create-payment-order', body: { shippingAddress: validShipping }, cookie });
    assert(res.status === 200, 'Create payment order succeeds with 200');
    assert(res.body.shopKartOrderId && res.body.razorpayOrderId, 'ShopKart and Razorpay Order IDs created');
    assert(res.body.amount === res.body.totalAmount * 100, 'Amount correctly converted to paise');

    const shopKartOrderId = res.body.shopKartOrderId;
    const razorpayOrderId = res.body.razorpayOrderId;

    // Cart should still exist BEFORE payment verification
    res = await request({ method: 'GET', path: '/cart', cookie });
    assert(res.body.cart?.length > 0, 'Cart remains populated before payment verification');

    // Invalid signature rejection test
    res = await request({
      method: 'POST',
      path: '/orders/verify-payment',
      body: {
        shopKartOrderId,
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: 'pay_test_123',
        razorpay_signature: 'fake_invalid_signature',
      },
      cookie,
    });
    assert(res.status === 400, 'Invalid signature rejected with 400');

    // Valid signature verification test
    const secret = process.env.RAZORPAY_KEY_SECRET || 'shopkart_test_secret_key_101';
    const testPaymentId = `pay_${Date.now()}`;
    const validSignature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpayOrderId}|${testPaymentId}`)
      .digest('hex');

    res = await request({
      method: 'POST',
      path: '/orders/verify-payment',
      body: {
        shopKartOrderId,
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: testPaymentId,
        razorpay_signature: validSignature,
      },
      cookie,
    });
    assert(res.status === 200, 'Valid signature verified with 200');
    assert(res.body.order?.paymentStatus === 'PAID' && res.body.order?.status === 'PLACED', 'Order status marked PAID and PLACED');

    // Cart must be cleared AFTER verified payment
    res = await request({ method: 'GET', path: '/cart', cookie });
    assert(res.body.cart?.length === 0, 'Cart is cleared after verified payment');

    // Get My Orders
    res = await request({ method: 'GET', path: '/orders', cookie });
    assert(res.status === 200, 'Get my orders returns 200');
    assert(res.body.orders?.some(o => o._id === shopKartOrderId), 'Created order appears in order history');

    // Get Single Order
    res = await request({ method: 'GET', path: `/orders/${shopKartOrderId}`, cookie });
    assert(res.status === 200, 'Get single order by ID returns 200');
    assert(res.body.order?.items?.length > 0, 'Order snapshot items preserved');

    console.log('\n======================================================');
    console.log(`   FULL TEST SUITE FINISHED: ${passed} PASSED, ${failed} FAILED `);
    console.log('======================================================\n');
  } catch (err) {
    console.error('Fatal Test Suite Error:', err);
    failed++;
  } finally {
    if (server) server.close();
    await disconnectDB();
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();
