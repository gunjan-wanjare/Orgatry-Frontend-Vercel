import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { scrollReveal } from '@/modules/landing/animations/landingMotion';
import type { RevealProps } from '@/modules/landing/types/landing.types';

export function Reveal({ children, className, delay = 0, once = true }: RevealProps) {
  return (
    <motion.div
      className={cn(className)}
      variants={scrollReveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 0.2 }}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}
