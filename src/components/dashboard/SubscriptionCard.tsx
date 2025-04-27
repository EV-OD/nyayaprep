
import type * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, CheckCircle, AlertTriangle, CalendarClock, Clock, Zap } from 'lucide-react';
import type { UserProfile, SubscriptionPlan } from '@/types/user';
import { format, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { SubscriptionSkeleton } from './skeletons'; // Import skeleton

interface SubscriptionCardProps {
  profile: UserProfile | null;
  isValidated: boolean;
  loading: boolean;
  subscriptionDetails: Record<SubscriptionPlan, { name: string; features: { text: string; included: boolean }[]; colorClass: string; price: string, askLimit: number }>;
  onUpgradeClick: () => void;
}

export function SubscriptionCard({ profile, isValidated, loading, subscriptionDetails, onUpgradeClick }: SubscriptionCardProps) {

  const getSubscriptionBadgeVariant = (plan?: SubscriptionPlan): "default" | "secondary" | "outline" | "destructive" | null | undefined => {
      switch (plan) {
          case 'premium': return 'default';
          case 'basic': return 'secondary';
          case 'free': return 'outline';
          default: return 'outline';
      }
  };

  const getRemainingDays = () => {
      if (profile?.expiryDate) {
          const now = new Date();
          const expiry = profile.expiryDate.toDate();
          if (now > expiry) return 0; // Expired
          return differenceInDays(expiry, now);
      }
      return null; // No expiry date set
  };

  const remainingDays = getRemainingDays();
  const currentPlanDetails = profile?.subscription ? subscriptionDetails[profile.subscription] : subscriptionDetails.free;

  return (
    <Card className="lg:col-span-1">
       <CardHeader>
           <CardTitle>Subscription Details</CardTitle>
           <CardDescription>Your current plan and features.</CardDescription>
       </CardHeader>
       <CardContent>
           {loading ? (
               <SubscriptionSkeleton />
           ) : profile ? (
              <>
                <div className={cn("p-4 rounded-lg border mb-4", currentPlanDetails.colorClass)}>
                    <div className="flex justify-between items-center mb-1">
                        <h3 className="text-lg font-semibold">{currentPlanDetails.name} Plan</h3>
                        <Badge variant={getSubscriptionBadgeVariant(profile?.subscription)}>
                            {profile?.subscription === 'premium' && <Star className="mr-1 h-3 w-3 fill-current" />}
                            <span className="capitalize">{profile?.subscription || 'Free'}</span>
                        </Badge>
                    </div>
                    <p className="text-sm font-medium mb-1">{currentPlanDetails.price}</p>
                    {profile?.subscription !== 'free' && (
                       <div className="text-xs mb-3 flex items-center gap-1">
                           {isValidated ? (
                               <><CheckCircle size={14} className="text-green-600 dark:text-green-400"/> Active</>
                           ) : (
                                <><AlertTriangle size={14} className="text-yellow-600 dark:text-yellow-400"/> Pending Validation / Expired</>
                           )}
                       </div>
                    )}
                    {/* Display Expiry Date and Remaining Days */}
                    {profile?.subscription !== 'free' && profile.expiryDate && isValidated && (
                        <div className="text-xs mt-2 mb-3 space-y-0.5">
                           <div className="flex items-center gap-1 text-muted-foreground">
                               <CalendarClock size={12} />
                               <span>Expires on: {format(profile.expiryDate.toDate(), 'PPP')}</span>
                           </div>
                           {remainingDays !== null && remainingDays >= 0 && (
                               <div className="flex items-center gap-1 text-muted-foreground">
                                   <Clock size={12} />
                                   <span>{remainingDays} day{remainingDays !== 1 ? 's' : ''} remaining</span>
                               </div>
                           )}
                        </div>
                    )}

                   <ul className="space-y-1.5 text-xs mt-3">
                        {currentPlanDetails.features.map((feature, index) => (
                           <li key={index} className="flex items-center gap-2">
                                {feature.included ? (
                                   <CheckCircle size={14} className="text-green-600 dark:text-green-400" />
                                 ) : (
                                   <X size={14} className="text-red-500 dark:text-red-400" /> // Ensure X is imported
                                 )}
                               <span>{feature.text}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                 {profile?.subscription !== 'premium' && (
                   <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={onUpgradeClick}
                   >
                       {profile?.subscription === 'free' ? 'Upgrade Plan' : 'Renew / Upgrade'}
                       <Zap className="ml-1.5 h-4 w-4" />
                   </Button>
                 )}
              </>
           ) : (
                <p className="text-center text-muted-foreground py-6">Could not load subscription details.</p>
           )}
       </CardContent>
   </Card>
  );
}

// Ensure X icon is imported if not already available globally
import { X } from 'lucide-react';
