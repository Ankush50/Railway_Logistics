import React from "react";

const Header = ({ onSignIn, onSignUp }) => {
	return (
		<header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-gray-200">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<img src="/logo.svg" alt="Turbo Transit" className="h-6 w-6" />
					<span className="font-semibold tracking-tight">Turbo Transit</span>
				</div>
				<nav className="hidden md:flex items-center gap-8 text-sm text-gray-600">
					<a href="#features" className="hover:text-gray-900">Features</a>
					<a href="#how" className="hover:text-gray-900">How it works</a>
					<a href="#industries" className="hover:text-gray-900">Industries</a>
				</nav>
				<div className="flex items-center gap-3">
					<button onClick={onSignIn} className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">Sign in</button>
					<button onClick={onSignUp} className="px-3 py-2 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700">Register</button>
				</div>
			</div>
		</header>
	);
};

export default Header;


