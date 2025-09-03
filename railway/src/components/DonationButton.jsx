import React, { useEffect, useRef } from 'react';

const DonationButton = ({ buttonId = 'pl_RD3kiXc8kmbonR' }) => {
  const formRef = useRef(null);

  useEffect(() => {
    if (!formRef.current) return;
    // Clear previous content to avoid duplicates
    formRef.current.innerHTML = '';
    // Create the script element so it executes
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/payment-button.js';
    script.async = true;
    script.setAttribute('data-payment_button_id', buttonId);
    formRef.current.appendChild(script);
  }, [buttonId]);

  return (
    <form ref={formRef} style={{ minHeight: 44 }}></form>
  );
};

export default DonationButton;


