
import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Clock, CreditCard, Users, Shield } from 'lucide-react';

const Features = () => {
  return (
    <section id="features" className="py-24 bg-abyss/60 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-abyss/80 to-abyss z-0"></div>
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div 
          className="flex flex-col items-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="glass px-3 py-1 rounded-full mb-6">
            <span className="text-white/80 text-sm font-medium">Core Features</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-6">
            Designed for Those Who <span className="text-gradient">Demand More</span>
          </h2>
          <p className="text-white/70 text-center max-w-2xl text-lg">
            Every feature is engineered with a purpose. No clutter, no compromise—just power in your hands.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
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
      <div className="absolute top-1/2 -left-20 w-80 h-80 bg-crimson/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/3 -right-40 w-96 h-96 bg-gold/5 rounded-full blur-3xl"></div>
    </section>
  );
};

const features = [
  {
    icon: <MessageSquare className="w-8 h-8 text-crimson" />,
    title: "Encrypted Private Messaging",
    description: "Completely private, no receipts, no tracking. Your conversations stay exactly where they belong—between you and your connections."
  },
  {
    icon: <Clock className="w-8 h-8 text-gold" />,
    title: "Stories That Captivate",
    description: "24-hour content that demands attention. Share your most intense moments with those who deserve to see them."
  },
  {
    icon: <CreditCard className="w-8 h-8 text-crimson" />,
    title: "Monetization-First Model",
    description: "Subscription-based, pay-per-view content, and direct tributes. We've built the platform with creator earnings at the forefront."
  },
  {
    icon: <Users className="w-8 h-8 text-gold" />,
    title: "Invite-Only Groups",
    description: "The most elite conversations happen behind closed doors. Create exclusive spaces for your most dedicated followers."
  },
  {
    icon: <Shield className="w-8 h-8 text-crimson" />,
    title: "Raw, Unfiltered Timeline",
    description: "No algorithm manipulation. No censorship. Just a real-time, high-engagement experience controlled by you."
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
      className="bg-abyss border border-white/10 rounded-xl p-6 flex gap-4 glass"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <div className="mt-1 flex-shrink-0">{icon}</div>
      <div>
        <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
        <p className="text-white/70">{description}</p>
      </div>
    </motion.div>
  );
};

export default Features;
