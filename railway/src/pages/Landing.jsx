import React from "react";
import Header from "../components/ui/Header";
import Hero from "../components/ui/Hero";
import Features from "../components/ui/Features";
import HowItWorks from "../components/ui/HowItWorks";
import Industries from "../components/ui/Industries";
import Footer from "../components/ui/Footer";
import SearchHero from "../components/ui/SearchHero";

const Landing = ({ onSignIn, onSignUp, onDiscover }) => {
	return (
		<div className="min-h-screen bg-white text-gray-900">
			<Header onSignIn={onSignIn} onSignUp={onSignUp} />
			<main>
				<Hero onDiscover={onDiscover} />
				<SearchHero onSearch={onDiscover} />
				<Features />
				<HowItWorks />
				<Industries />
			</main>
			<Footer onSignUp={onSignUp} />
		</div>
	);
};

export default Landing;


