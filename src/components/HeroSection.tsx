import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Clip } from '@/components/ui/icons';

const roles = [
	{ label: 'Dominant', effect: 'dom' },
	{ label: 'Submissive', effect: 'sub' },
	{ label: 'Switch', effect: 'switch' },
];

const typewriterPhrases = ['Find your voice.', 'Own your audience.', 'Control the economy.'];

const tributeFeed = [
	'MistressA just received 200 $DOM.',
	'A new submissive joined for initiation.',
];

const HeroSection: React.FC = () => {
	const [role, setRole] = useState(roles[0]);
	const [typeIndex, setTypeIndex] = useState(0);
	const [feedIndex, setFeedIndex] = useState(0);

	React.useEffect(() => {
		const interval = setInterval(() => {
			setTypeIndex((i) => (i + 1) % typewriterPhrases.length);
		}, 2500);
		return () => clearInterval(interval);
	}, []);

	React.useEffect(() => {
		const interval = setInterval(() => {
			setFeedIndex((i) => (i + 1) % tributeFeed.length);
		}, 10000);
		return () => clearInterval(interval);
	}, []);

	return (
		<section className="w-full min-h-[90vh] flex items-center justify-center bg-gradient-to-br from-black via-[#2a001a] to-[#a1003a] relative overflow-hidden">
			<div className="flex flex-col md:flex-row w-full max-w-6xl px-6 py-12 gap-12 z-10">
				{/* Left Side: Text & Actions */}
				<div className="flex-1 flex flex-col justify-center items-center gap-8">
					<h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight mb-2 tracking-tight text-center">
						Where Power Becomes Profile.
					</h1>
					<h2 className="text-2xl md:text-3xl text-gray-200 font-medium mb-6 text-center">
						Join the only social network built to amplify control, deepen devotion, and monetize erotic power.
					</h2>
					<div className="flex gap-4 mb-4 justify-center">
						<Button
							variant="default"
							size="lg"
							className="flex items-center gap-2 px-8 py-3 text-lg font-bold bg-black/80 hover:bg-[#a1003a]/80 transition-shadow shadow-lg rounded-full"
						>
							<span>Explore SubSpace</span>
							<Clip className="animate-pulse text-crimson" />
						</Button>
						<Button
							variant="outline"
							size="lg"
							className="px-8 py-3 text-lg font-semibold border-crimson rounded-full shadow-md hover:border-white"
						>
							Apply as a Creator
						</Button>
					</div>
				</div>
				{/* Right Side: Device Mockup */}
				<div className="flex-1 flex items-center justify-center">
					<Card
						variant="dark"
						size="lg"
						elevated
						className="w-[350px] min-h-[420px] flex flex-col items-center justify-center shadow-2xl border border-white/10 bg-black/60"
					>
						<CardHeader className="flex flex-row items-center gap-3 w-full justify-center">
							<Avatar>
								<AvatarImage src="/logo.svg" alt="MistressA" />
								<AvatarFallback>MA</AvatarFallback>
							</Avatar>
							<CardTitle className="text-white text-lg font-bold">@MistressA</CardTitle>
						</CardHeader>
						<CardContent className="flex flex-col items-center gap-6 w-full mt-4">
							<div className="flex gap-3 w-full justify-center">
								<Button variant="secondary" size="sm" className="profile-btn tip w-1/3">
									Tip
								</Button>
								<Button variant="default" size="sm" className="profile-btn tribute w-1/3">
									Tribute
								</Button>
								<Button variant="outline" size="sm" className="profile-btn unlock w-1/3">
									Unlock
								</Button>
							</div>
						</CardContent>
						<CardFooter />
					</Card>
				</div>
			</div>
			{/* Live Tribute Feed */}
			<div className="absolute bottom-8 right-8 bg-black/80 text-white text-lg font-semibold rounded-xl px-6 py-3 shadow-xl z-20 animate-fadeIn">
				{tributeFeed[feedIndex]}
			</div>
			{/* Optional: Abstract animated background can be added here with a separate component or SVG */}
		</section>
	);
};

export default HeroSection;
