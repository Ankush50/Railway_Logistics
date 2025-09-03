import React, { useEffect, useRef, useState } from 'react';

const DonationButton = ({ buttonId = 'pl_RD3kiXc8kmbonR' }) => {
  const formRef = useRef(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  // Load script only when the form is visible
  useEffect(() => {
    if (!formRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(formRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!shouldLoad || !formRef.current) return;
    formRef.current.innerHTML = '';
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/payment-button.js';
    script.async = true;
    script.setAttribute('data-payment_button_id', buttonId);
    formRef.current.appendChild(script);
  }, [shouldLoad, buttonId]);

  return <form ref={formRef} style={{ minHeight: 44 }} aria-label="Donate"></form>;
};

export default DonationButton;


