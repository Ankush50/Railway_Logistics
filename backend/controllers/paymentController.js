const crypto = require('crypto');
const Razorpay = require('razorpay');
const PDFDocument = require('pdfkit');
const Booking = require('../models/Booking');
const ErrorResponse = require('../utils/ErrorResponse');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_key',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_secret'
});

// Create an order tied to a booking
exports.createOrder = async (req, res, next) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) return next(new ErrorResponse('bookingId is required', 400));

    if (!req.user?._id) {
      return next(new ErrorResponse('Unauthorized: missing user context', 401));
    }

    const booking = await Booking.findOne({ _id: bookingId, userId: req.user._id });
    if (!booking) return next(new ErrorResponse('Booking not found for this user', 404));

    // Amount in paise
    const amountNumber = Number(booking.total);
    if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
      return next(new ErrorResponse('Invalid booking total amount', 400));
    }
    const amountPaise = Math.round(amountNumber * 100);

    let order;
    try {
      order = await razorpay.orders.create({
        amount: amountPaise,
        currency: 'INR',
        receipt: `rcpt_${bookingId}_${Date.now()}`,
        notes: {
          bookingId: booking._id.toString(),
          userId: req.user._id.toString()
        }
      });
    } catch (rzpErr) {
      const code = rzpErr?.statusCode || rzpErr?.error?.statusCode || 400;
      const message = rzpErr?.error?.description || rzpErr?.message || 'Failed to create Razorpay order';
      // Attach diagnostic info (non-sensitive)
      return res.status(code).json({ success: false, message, data: {
        hint: 'Check Razorpay key id/secret and amount >= 100 paise',
        amountPaise
      }});
    }

    booking.payment = {
      orderId: order.id,
      currency: order.currency,
      amount: order.amount,
      status: 'created'
    };
    await booking.save();

    res.status(201).json({ success: true, data: { orderId: order.id, amount: order.amount, currency: order.currency, key: process.env.RAZORPAY_KEY_ID } });
  } catch (err) {
    next(err);
  }
};

// Verify payment signature on success
exports.verifyPayment = async (req, res, next) => {
  try {
    const { bookingId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!bookingId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return next(new ErrorResponse('Missing payment verification fields', 400));
    }

    const booking = await Booking.findOne({ _id: bookingId, userId: req.user._id });
    if (!booking || !booking.payment?.orderId) {
      return next(new ErrorResponse('Booking or order not found', 404));
    }

    // Compute expected signature
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'rzp_test_secret');
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const expectedSignature = hmac.digest('hex');

    const valid = expectedSignature === razorpay_signature;
    if (!valid) {
      return next(new ErrorResponse('Invalid payment signature', 400));
    }

    booking.payment.paymentId = razorpay_payment_id;
    booking.payment.signature = razorpay_signature;
    booking.payment.status = 'paid';
    booking.payment.paidAt = new Date();
    booking.status = 'Confirmed';
    await booking.save();

    res.status(200).json({ success: true, data: { bookingId: booking._id } });
  } catch (err) {
    next(err);
  }
};

// Secure webhook (optional, ready for future use)
exports.webhook = async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!secret) return res.status(200).send('webhook disabled');

  const body = JSON.stringify(req.body);
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  if (expectedSignature !== signature) {
    return res.status(400).send('Invalid signature');
  }

  // Process events as needed in future
  res.status(200).send('ok');
};

// Generate a simple PDF receipt for a paid booking
exports.receipt = async (req, res, next) => {
  try {
    const { id } = req.params; // bookingId
    const booking = await Booking.findOne({ _id: id, userId: req.user._id }).populate('serviceId');
    if (!booking) return next(new ErrorResponse('Booking not found', 404));
    if (booking.payment?.status !== 'paid') return next(new ErrorResponse('Receipt available only after payment', 400));

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=receipt-${booking._id}.pdf`);

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    doc.pipe(res);

    // Header
    doc.fontSize(20).text('TurboTransit Railway Logistics', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(14).text('Payment Receipt', { align: 'center' });
    doc.moveDown(1);

    // Details
    const paidAt = booking.payment.paidAt ? new Date(booking.payment.paidAt).toLocaleString() : '-';
    doc.fontSize(12).text(`Receipt No: RCPT-${booking._id}`);
    doc.text(`Date: ${paidAt}`);
    doc.text(`Booking ID: ${booking._id}`);
    doc.text(`User ID: ${booking.userId}`);
    doc.text(`Service: ${booking.serviceId?.name || booking.route}`);
    doc.text(`Route: ${booking.route}`);
    doc.text(`Quantity: ${booking.quantity}`);
    doc.text(`Status: ${booking.status}`);
    doc.moveDown(0.5);
    doc.text(`Razorpay Order ID: ${booking.payment.orderId}`);
    doc.text(`Razorpay Payment ID: ${booking.payment.paymentId}`);
    doc.moveDown(0.5);

    // Amount
    const total = Number(booking.total).toFixed(2);
    doc.moveDown(1);
    doc.fontSize(14).text(`Amount Paid: ₹${total} ${booking.payment.currency}`, { align: 'right' });

    doc.moveDown(2);
    doc.fontSize(10).text('This is a system generated receipt for your successful payment. Thank you!', { align: 'center' });

    doc.end();
  } catch (err) {
    next(err);
  }
};


