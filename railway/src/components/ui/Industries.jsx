import React from "react";

const items = [
	"Agriculture","Food & Beverages","Automobiles","Solar & Renewable Energy",
	"Heavy Machinery","Medical Devices","Textiles & Apparel","Science & Technology",
	"Chemicals & Fertilizers","Retail & E‑commerce","Manufacturing","Construction Materials",
];

const Industries = () => {
	return (
		<section id="industries" className="py-16 bg-white">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">Industries Served</h2>
				<div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
					{items.map((i) => (
						<div key={i} className="rounded-lg border border-gray-200 p-4 text-sm text-gray-700 bg-white hover:bg-gray-50">
							{i}
						</div>
					))}
				</div>
			</div>
		</section>
	);
};

export default Industries;


