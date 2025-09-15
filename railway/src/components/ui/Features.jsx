import React from "react";

const features = [
	{ title: "Assured Service", desc: "Guaranteed reliability with vetted partners and priority handling." },
	{ title: "Freight Contracts", desc: "Fix rates for the long term and avoid market volatility." },
	{ title: "Spot Booking", desc: "Instant rates and booking in minutes at competitive prices." },
	{ title: "Pay Later", desc: "Unlock instant credit and pay at your convenience." },
];

const Features = () => {
	return (
		<section id="features" className="py-16 bg-white">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">Ship reliably with TurboAssured</h2>
				<div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
					{features.map((f) => (
						<div key={f.title} className="rounded-xl border border-gray-200 p-5 bg-white hover:shadow-sm transition">
							<h3 className="font-semibold text-gray-900">{f.title}</h3>
							<p className="mt-2 text-sm text-gray-600">{f.desc}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
};

export default Features;


