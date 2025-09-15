import React, { useState } from "react";
import { Input, Select, Button, Card } from "./Primitives";

const SearchHero = ({ onSearch }) => {
	const [form, setForm] = useState({ from: "", to: "", mode: "FCL", date: "" });

	const handleChange = (e) => {
		setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		onSearch?.(form);
	};

	return (
		<section className="-mt-6">
			<div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
				<Card className="shadow-xl ring-1 ring-black/5">
					<form onSubmit={handleSubmit} className="grid md:grid-cols-5 gap-3 items-end">
						<div className="md:col-span-1">
							<label className="block text-xs text-gray-600 mb-1">From Port or City</label>
							<Input name="from" placeholder="Delhi" value={form.from} onChange={handleChange} />
						</div>
						<div className="md:col-span-1">
							<label className="block text-xs text-gray-600 mb-1">Deliver to Port or City</label>
							<Input name="to" placeholder="Monrovia" value={form.to} onChange={handleChange} />
						</div>
						<div className="md:col-span-1">
							<label className="block text-xs text-gray-600 mb-1">Mode</label>
							<Select name="mode" value={form.mode} onChange={handleChange}>
								<option value="FCL">FCL</option>
								<option value="LCL">LCL</option>
								<option value="Air">Air</option>
								<option value="Rail">Rail</option>
								<option value="Trailer">Trailer</option>
							</Select>
						</div>
						<div className="md:col-span-1">
							<label className="block text-xs text-gray-600 mb-1">When</label>
							<Input type="date" name="date" value={form.date} onChange={handleChange} />
						</div>
						<div className="md:col-span-1">
							<Button type="submit" className="w-full">Discover Shipping Price</Button>
						</div>
					</form>
				</Card>
			</div>
		</section>
	);
};

export default SearchHero;


