import React, { useEffect, useRef } from 'react';

const DonationButton = ({ buttonId = 'pl_RD3kiXc8kmbonR' }) => {
  const formRef = useRef(null);

  useEffect(() => {
    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/payment-button.js"]');
    if (existing) return; // already loaded elsewhere
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/payment-button.js';
    script.async = true;
    script.dataset.payment_button_id = buttonId;
    formRef.current?.appendChild(script);
    return () => {
      // keep script for subsequent navigations; Razorpay recommends single load
    };
  }, [buttonId]);

  return (
    <form ref={formRef}></form>
  );
};

export default DonationButton;


