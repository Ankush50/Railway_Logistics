import React from "react";

const steps = [
	{ title: "Discover Real‑Time Rates", desc: "Instantly compare transparent pricing across modes and routes." },
	{ title: "Book In Seconds", desc: "Secure shipments tailored to your requirements with reliability." },
	{ title: "Track & Manage Docs", desc: "Automated document handling built into every shipment." },
	{ title: "Pay Online or Pay Later", desc: "Flexible payment options with instant confirmation." },
];

const HowItWorks = () => {
	return (
		<section id="how" className="py-16 bg-gray-50">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">How It Works</h2>
				<div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
					{steps.map((s) => (
						<div key={s.title} className="rounded-xl bg-white border border-gray-200 p-5">
							<h3 className="font-semibold">{s.title}</h3>
							<p className="mt-2 text-sm text-gray-600">{s.desc}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
};

export default HowItWorks;


