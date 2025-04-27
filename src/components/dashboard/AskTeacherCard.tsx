
import type * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { MessageSquareQuote, Lock, Zap, AlertTriangle } from 'lucide-react';
import type { UserProfile } from '@/types/user';
import { cn } from '@/lib/utils';
import { UpgradeAlertDialog } from './UpgradeAlertDialog';

interface AskTeacherCardProps {
  locked: boolean;
  featuresLocked: boolean; // For validation lock specifically
  profile: UserProfile | null;
  limit: number;
  usage: number;
  limitReached: boolean;
  onAskClick: () => void;
  onUpgradeClick: () => void;
}

// Dialog for Limit Reached
const LimitReachedDialog = ({ triggerButton, limit, plan, onUpgradeClick }: { triggerButton: React.ReactNode, limit: number, plan: string, onUpgradeClick: () => void }) => (
    <AlertDialog>
        <AlertDialogTrigger asChild>{triggerButton}</AlertDialogTrigger>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="text-yellow-500" /> Daily Limit Reached
                </AlertDialogTitle>
                <AlertDialogDescription>
                    You have reached your daily limit of {limit} question(s) for the 'Ask Teacher' feature on the {plan} plan.
                    Please try again tomorrow or upgrade your plan for a higher limit.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Ask Tomorrow</AlertDialogCancel>
                {plan !== 'premium' && (
                    <AlertDialogAction onClick={onUpgradeClick} asChild={false}>
                        <Zap className="mr-2 h-4 w-4" /> Upgrade Plan
                    </AlertDialogAction>
                )}
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
);

export function AskTeacherCard({
  locked,
  featuresLocked,
  profile,
  limit,
  usage,
  limitReached,
  onAskClick,
  onUpgradeClick
}: AskTeacherCardProps) {
  return (
    <Card className="relative overflow-hidden flex flex-col">
        <CardHeader>
           <CardTitle className="flex items-center gap-2"><MessageSquareQuote size={20} /> Ask a Teacher</CardTitle>
           <CardDescription>Get your MCQs and quiz queries answered by experts.</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow relative flex flex-col items-center justify-center text-center">
            {locked && (
               <div className="absolute inset-0 bg-background/80 dark:bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 z-10 rounded-b-lg">
                   <Lock size={40} className="text-primary mb-4" />
                   <p className="text-center font-semibold mb-4">Available for Basic & Premium plans.</p>
                    <UpgradeAlertDialog
                       triggerButton={<Button variant="default"><Zap className="mr-2 h-4 w-4" /> Upgrade Plan</Button>}
                       featureName="Ask a Teacher"
                       onUpgradeClick={onUpgradeClick}
                    />
                    {featuresLocked && profile?.subscription !== 'free' && <p className="text-xs text-muted-foreground mt-2">Account validation pending or expired.</p>}
               </div>
           )}
           {/* Content visible to Basic/Premium users */}
           <div className={cn("flex flex-col items-center justify-center text-center", locked ? "opacity-30 pointer-events-none" : "")}>
               <p className="text-sm text-muted-foreground mb-4">
                    You have {Math.max(0, limit - usage)} question(s) remaining today.
               </p>
               {limitReached && profile?.subscription !== 'free' ? (
                   <LimitReachedDialog
                       triggerButton={
                          <Button size="lg" disabled>
                              <AlertTriangle className="mr-2 h-4 w-4" /> Limit Reached
                          </Button>
                       }
                       limit={limit}
                       plan={profile?.subscription || 'basic'}
                       onUpgradeClick={onUpgradeClick}
                   />
               ) : (
                    <Button size="lg" onClick={onAskClick} disabled={locked}>
                        Ask Question
                    </Button>
               )}
           </div>
        </CardContent>
    </Card>
  );
}
