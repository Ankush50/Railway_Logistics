import React from "react";
import { Leaf, Utensils, Car, Sun, Factory, HeartPulse, Shirt, Cpu, FlaskConical, ShoppingBag, Cog, Building2 } from "lucide-react";

const items = [
	{ icon: Leaf, label: "Agriculture" },
	{ icon: Utensils, label: "Food & Beverages" },
	{ icon: Car, label: "Automobiles" },
	{ icon: Sun, label: "Solar & Renewable Energy" },
	{ icon: Factory, label: "Heavy Machinery" },
	{ icon: HeartPulse, label: "Medical Devices" },
	{ icon: Shirt, label: "Textiles & Apparel" },
	{ icon: Cpu, label: "Science & Technology" },
	{ icon: FlaskConical, label: "Chemicals & Fertilizers" },
	{ icon: ShoppingBag, label: "Retail & E‑commerce" },
	{ icon: Cog, label: "Manufacturing" },
	{ icon: Building2, label: "Construction Materials" },
];

const Industries = () => {
	return (
		<section id="industries" className="py-16 bg-white">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">Industries Served</h2>
				<div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
					{items.map(({icon: Icon, label}) => (
						<div key={label} className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 text-sm text-gray-700 bg-white hover:bg-gray-50">
							<Icon className="h-5 w-5 text-brand-red-600" />
							<span>{label}</span>
						</div>
					))}
				</div>
			</div>
		</section>
	);
};

export default Industries;


