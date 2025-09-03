import React, { useEffect, useRef } from 'react';

const DonationButton = ({ buttonId = 'pl_RD3kiXc8kmbonR' }) => {
  const formRef = useRef(null);

  useEffect(() => {
    if (!formRef.current) return;
    // Razorpay's payment-button.js expects a literal script tag inside the form.
    // Inject the exact HTML so their loader can parse data-payment_button_id.
    formRef.current.innerHTML = `\n      <script src="https://checkout.razorpay.com/v1/payment-button.js" data-payment_button_id="${buttonId}" async>\n      </script>\n    `;
  }, [buttonId]);

  return (
    <form ref={formRef}></form>
  );
};

export default DonationButton;


