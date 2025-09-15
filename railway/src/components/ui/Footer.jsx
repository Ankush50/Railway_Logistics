import React from "react";

const Footer = ({ onSignUp }) => {
	return (
		<footer className="border-t border-gray-200 bg-white">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 grid md:grid-cols-2 gap-8 items-center">
				<div>
					<h3 className="text-lg font-semibold">Get Started Today</h3>
					<p className="mt-2 text-sm text-gray-600">Plan, Book and Finance your shipment in one place.</p>
				</div>
				<div className="flex md:justify-end">
					<button onClick={onSignUp} className="px-5 py-3 text-sm font-semibold rounded-md bg-gray-900 text-white hover:bg-black">Get Started</button>
				</div>
			</div>
			<div className="bg-gray-50">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 text-xs text-gray-500 flex justify-between">
					<p>© 2025 Turbo Transit</p>
					<p>Terms · Privacy · Cookies</p>
				</div>
			</div>
		</footer>
	);
};

export default Footer;


