
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const Creators = () => {
  return (
    <section id="creators" className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="order-2 lg:order-1"
          >
            <div className="glass px-3 py-1 rounded-full inline-block mb-6">
              <span className="text-white/80 text-sm font-medium">For Creators</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Monetize Your Content <span className="text-gradient">On Your Terms</span>
            </h2>
            <p className="text-white/70 text-lg mb-8">
              Take control of your content and your income. SubSpace gives you the tools to build your empire, 
              without the censorship and revenue cuts that plague other platforms.
            </p>
            
            <div className="space-y-4 mb-8">
              {creatorBenefits.map((benefit, index) => (
                <motion.div 
                  key={benefit}
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="w-5 h-5 rounded-full bg-crimson flex-shrink-0 mt-1"></div>
                  <p className="text-white/90">{benefit}</p>
                </motion.div>
              ))}
            </div>
            
            <Button className="bg-crimson hover:bg-crimson/90 text-white px-8 py-6 rounded-md text-lg">
              Apply for Creator Access <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="order-1 lg:order-2"
          >
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-crimson/50 to-gold/50 rounded-2xl blur-xl opacity-50"></div>
              <div className="relative glass rounded-2xl overflow-hidden border border-white/10">
                <div className="aspect-[4/3] bg-abyss/60 p-6 lg:p-10">
                  <div className="space-y-8">
                    <div className="glass p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-4">
                        <div className="text-white font-medium">Monthly Earnings</div>
                        <div className="text-gradient font-bold">+28.4%</div>
                      </div>
                      <div className="text-2xl md:text-3xl font-bold text-white mb-1">$8,240</div>
                      <div className="text-white/50 text-sm">Last month: $6,418</div>
                    </div>
                    
                    <div className="space-y-4">
                      {revenueStreams.map((stream, index) => (
                        <div key={stream.name} className="flex justify-between items-center glass p-3 rounded-lg">
                          <div className="text-white">{stream.name}</div>
                          <div className="text-gold font-medium">${stream.amount}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Background elements */}
      <div className="absolute top-1/4 -left-20 w-40 h-40 bg-crimson/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/3 -right-20 w-60 h-60 bg-gold/5 rounded-full blur-3xl"></div>
    </section>
  );
};

const creatorBenefits = [
  "Keep up to 90% of your earnings with our creator-first revenue split",
  "Full creative freedom with zero censorship on legal content",
  "Direct messaging with fans and pay-to-view content options",
  "Robust analytics to understand your audience and optimize your strategy",
  "Multiple payment options for your subscribers with instant payouts"
];

const revenueStreams = [
  { name: "Subscriptions", amount: "4,120" },
  { name: "Pay-per-view", amount: "2,845" },
  { name: "Tips & Tributes", amount: "1,275" }
];

export default Creators;
