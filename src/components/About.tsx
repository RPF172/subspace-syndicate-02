
import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Zap } from 'lucide-react';

const About = () => {
  return (
    <section id="about" className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div 
          className="flex flex-col items-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="glass px-3 py-1 rounded-full mb-6">
            <span className="text-white/80 text-sm font-medium">Our Mission</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-6">
            This Isn't Just a Platform. <br className="hidden md:block" />
            <span className="text-gradient">It's a Revolution.</span>
          </h2>
          <p className="text-white/70 text-center max-w-2xl text-lg">
            SubSpace isn't for everyone. It's for those who refuse to settle for mediocrity. 
            For the fearless. The visionaries. The disruptors.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          {features.map((feature, index) => (
            <FeatureCard 
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>

      {/* Background elements */}
      <div className="absolute top-1/4 -left-20 w-40 h-40 bg-crimson/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/3 -right-20 w-60 h-60 bg-gold/5 rounded-full blur-3xl"></div>
    </section>
  );
};

const features = [
  {
    icon: <Shield className="w-10 h-10 text-crimson" />,
    title: "Uncompromising Privacy",
    description: "End-to-end encryption. Anonymous browsing. Your data is yours—period."
  },
  {
    icon: <Lock className="w-10 h-10 text-gold" />,
    title: "Exclusivity & Prestige",
    description: "This isn't just another social network—it's an invite-only society for the elite."
  },
  {
    icon: <Zap className="w-10 h-10 text-crimson" />,
    title: "Technological Superiority",
    description: "A futuristic, cutting-edge platform that leaves outdated competitors in the dust."
  }
];

const FeatureCard = ({ 
  icon, 
  title, 
  description,
  delay = 0
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  delay?: number;
}) => {
  return (
    <motion.div 
      className="bg-abyss border border-white/10 rounded-xl p-6 glass"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
      <p className="text-white/70">{description}</p>
    </motion.div>
  );
};

export default About;
