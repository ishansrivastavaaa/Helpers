import { Star, Heart } from 'lucide-react';
import { Helper } from '../types';

interface HelperCardProps {
  helper: Helper;
  onClick: (helper: Helper) => void;
}

export default function HelperCard({ helper, onClick }: HelperCardProps) {
  // Use user-provided image or fallback
  const imageUrl = helper.imageUrl || `https://picsum.photos/seed/${helper.id}/600/600`;

  return (
    <div 
      onClick={() => onClick(helper)}
      className="group cursor-pointer flex flex-col gap-3"
    >
      {/* Image Container */}
      <div className="relative aspect-[20/19] overflow-hidden rounded-xl bg-muted">
        <img 
          src={imageUrl} 
          alt={helper.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        
        {/* Top Badges / Icons */}
        <div className="absolute top-3 left-3">
          {(!helper.rating || helper.rating >= 4.8) && (
            <span className="bg-background/95 backdrop-blur-md text-foreground text-[13px] font-semibold px-3 py-1.5 rounded-full shadow-sm shadow-black/10">
              Guest favourite
            </span>
          )}
        </div>
        
        <button 
          className="absolute top-3 right-3 text-white drop-shadow-md transition-transform active:scale-90"
          onClick={(e) => { 
            e.stopPropagation(); 
            // Save logic would go here
          }}
        >
          <Heart className="h-6 w-6 stroke-[1.5] transition-colors hover:text-primary hover:fill-primary/30" />
        </button>
      </div>
      
      {/* Content */}
      <div className="flex flex-col">
        <div className="flex justify-between items-start gap-4">
           <h3 className="font-semibold text-foreground text-[15px] leading-snug truncate">
             {helper.name}
           </h3>
           <div className="flex items-center gap-1 text-[14px]">
             <Star className="h-[14px] w-[14px] fill-foreground text-foreground" />
             <span className="inline-block mt-[1px]">{helper.rating || '4.95'}</span>
           </div>
        </div>
        <p className="text-muted-foreground text-[15px] truncate mt-0.5">{helper.category}</p>
        <p className="text-muted-foreground text-[15px] truncate">
          {helper.languages ? helper.languages.join(', ') : 'Verified Professional'}
        </p>
        <div className="mt-[6px] text-[15px]">
          <span className="font-semibold text-foreground">
            {helper.priceRange ? helper.priceRange.split(' - ')[0] : '₹499'}
          </span>
          <span className="text-foreground ml-1 font-light">per booking</span>
        </div>
      </div>
    </div>
  );
}
