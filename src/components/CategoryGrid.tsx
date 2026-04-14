import { motion } from 'motion/react';
import { 
  Home, 
  Droplets, 
  Zap, 
  Paintbrush, 
  Stethoscope, 
  ShoppingBag, 
  Hammer, 
  Flower2,
  Wind,
  Waves,
  UserRound,
  UtensilsCrossed
} from 'lucide-react';
import { CATEGORIES } from '../constants';

const ICON_MAP: Record<string, any> = {
  'Housekeeping': Home,
  'Plumbing': Droplets,
  'Electrician': Zap,
  'Painting': Paintbrush,
  'AC Repair': Wind,
  'RO Service': Waves,
  'Carpentry': Hammer,
  'Gardening': Flower2,
  'Pandit/Pooja': UserRound,
  'Cook/Chef': UtensilsCrossed,
  'Medical Store': Stethoscope,
  'General Store': ShoppingBag,
};

interface CategoryGridProps {
  onSelectCategory: (category: any) => void;
}

export default function CategoryGrid({ onSelectCategory }: CategoryGridProps) {
  return (
    <section className="py-24 border-y border-muted/50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 sm:gap-4">
          {CATEGORIES.map((category, index) => {
            const Icon = ICON_MAP[category] || Home;
            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group cursor-pointer"
                onClick={() => onSelectCategory(category)}
              >
                <div className="flex flex-col items-center gap-3 p-4 rounded-3xl hover:bg-background/80 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 text-center border border-transparent hover:border-border/50 backdrop-blur-sm">
                  <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 group-hover:scale-110 transition-all duration-300 shadow-inner">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-bold tracking-tight text-muted-foreground group-hover:text-foreground transition-colors">{category}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
