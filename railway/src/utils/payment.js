import { createPaymentOrder, verifyPayment } from '../api';

// Launch Razorpay checkout for a booking and verify on success
export const payForBooking = async (bookingId, user, onSuccess, onError) => {
  try {
    const { orderId, amount, currency, key } = await createPaymentOrder(bookingId);

    // Ensure Razorpay script loaded
    if (!window.Razorpay) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.defer = true;
        script.onload = resolve;
        script.onerror = () => reject(new Error('Failed to load Razorpay'));
        document.body.appendChild(script);
      });
    }

    const options = {
      key,
      amount,
      currency,
      name: 'TurboTransit',
      description: `Booking ${bookingId}`,
      order_id: orderId,
     method: {
        netbanking: true,
        card: true,
        upi: true,
        wallet: true,
        emi: false,
        paylater: false
      },
      prefill: {
        name: user?.name || '',
        email: user?.email || ''
      },
      theme: { color: '#1e40af' },
      handler: async function (response) {
        try {
          const result = await verifyPayment({
            bookingId,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          });
          onSuccess && onSuccess(result);
        } catch (err) {
          onError && onError(err);
        }
      },
      modal: { ondismiss: () => onError && onError(new Error('Payment cancelled')) }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (error) {
    onError && onError(error);
  }
};


