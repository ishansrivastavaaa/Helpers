import { Star, MapPin, ShieldCheck, ArrowRight } from 'lucide-react';
import { Helper } from '../types';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';

interface HelperCardProps {
  helper: Helper;
  onClick: (helper: Helper) => void;
}

export default function HelperCard({ helper, onClick }: HelperCardProps) {
  return (
    <Card 
      onClick={() => onClick(helper)}
      className="overflow-hidden group hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 transition-all duration-500 border border-muted/50 bg-card/40 backdrop-blur-md cursor-pointer rounded-[2rem]"
    >
      <div className="relative aspect-square overflow-hidden rounded-[1.5rem] m-3">
        <img 
          src={helper.imageUrl} 
          alt={helper.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute top-3 left-3">
          <Badge className="bg-background/80 dark:bg-black/40 backdrop-blur-md text-[10px] font-bold text-primary border-none shadow-sm">
            {helper.category}
          </Badge>
        </div>
      </div>
      
      <CardHeader className="p-5 pt-2 pb-0">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-serif font-bold tracking-tight group-hover:text-primary transition-colors">{helper.name}</h3>
              {helper.isAadhaarVerified && (
                <ShieldCheck className="h-4 w-4 text-green-500" />
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
              <div className="flex items-center gap-0.5">
                <Star className="h-3 w-3 fill-primary text-primary" />
                <span className="font-bold text-foreground">{helper.rating}</span>
              </div>
              <span className="opacity-50">•</span>
              <span>{helper.reviewCount} reviews</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 pt-4">
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-4">
          {helper.description}
        </p>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[9px] uppercase tracking-widest border-green-500/30 text-green-600 bg-green-500/10 rounded-lg">
            UPI
          </Badge>
          <Badge variant="outline" className="text-[9px] uppercase tracking-widest border-blue-500/30 text-blue-600 bg-blue-500/10 rounded-lg">
            Cash
          </Badge>
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">From</span>
          <span className="font-bold text-primary text-lg">{helper.priceRange ? String(helper.priceRange).split(' - ')[0] : 'Negotiable'}</span>
        </div>
        <Button onClick={(e) => { e.stopPropagation(); onClick(helper); }} size="sm" className="rounded-xl h-10 px-5 text-xs font-bold shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
          View Profile
        </Button>
      </CardFooter>
    </Card>
  );
}
