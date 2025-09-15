import React from "react";

const Hero = ({ onDiscover }) => {
	return (
		<section className="bg-gradient-to-b from-white to-gray-50">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 grid md:grid-cols-2 gap-10 items-center">
				<div>
					<h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900">
						Book Freight — Any Mode, Any Route, Instantly
					</h1>
					<p className="mt-4 text-gray-600 leading-relaxed">
						Discover real‑time rates, book in seconds, track and manage documents, and pay online — all in one modern platform inspired by best‑in‑class trade tech.
					</p>
					<div className="mt-6 flex flex-col sm:flex-row gap-3">
						<button onClick={onDiscover} className="px-5 py-3 text-sm font-semibold rounded-md bg-red-600 text-white hover:bg-red-700">Discover Shipping Price</button>
						<a href="#features" className="px-5 py-3 text-sm font-semibold rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100">See features</a>
					</div>
					<ul className="mt-6 grid grid-cols-2 gap-4 text-sm text-gray-600">
						<li>Transparent pricing</li>
						<li>Multi‑modal support</li>
						<li>Secure payments</li>
						<li>24x7 support</li>
					</ul>
				</div>
				<div className="relative">
					<img src="/hero-map.png" alt="Global routes" className="w-full rounded-xl shadow-lg ring-1 ring-black/5" />
					<div className="absolute -bottom-6 -left-6 bg-white rounded-lg shadow p-4 w-56 ring-1 ring-black/5">
						<p className="text-xs text-gray-500">Estimated Freight Price Range</p>
						<p className="mt-1 font-semibold">$2,787 – $3,576 /ctr</p>
					</div>
				</div>
			</div>
		</section>
	);
};

export default Hero;


