
import type * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video, Lock, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UpgradeAlertDialog } from './UpgradeAlertDialog';

interface VideoLecturesCardProps {
  locked: boolean;
  onUpgradeClick: () => void;
}

export function VideoLecturesCard({ locked, onUpgradeClick }: VideoLecturesCardProps) {
  return (
    <Card className="relative overflow-hidden flex flex-col">
        <CardHeader>
           <CardTitle className="flex items-center gap-2"><Video size={20} /> Video Lectures</CardTitle>
           <CardDescription>Watch recorded lectures and tutorials.</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow relative">
            {locked && (
               <div className="absolute inset-0 bg-background/80 dark:bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 z-10 rounded-b-lg">
                   <Lock size={40} className="text-primary mb-4" />
                   <p className="text-center font-semibold mb-4">Requires validated Premium plan.</p>
                   <UpgradeAlertDialog
                       triggerButton={<Button variant="default"><Zap className="mr-2 h-4 w-4" /> Upgrade Now</Button>}
                       featureName="Video Lectures"
                       onUpgradeClick={onUpgradeClick}
                   />
               </div>
           )}
            {/* Actual content */}
             <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-4", locked ? "opacity-30 pointer-events-none" : "")}>
                 <div className="border rounded-md overflow-hidden">
                      <div className="aspect-video bg-muted flex items-center justify-center"> <Video size={48} className="text-muted-foreground" /> </div>
                      <div className="p-3"> <p className="text-sm font-medium mb-1 line-clamp-1">Intro to Criminal Law</p> <Button variant="link" size="sm" className="p-0 h-auto text-xs" disabled={locked}>Watch Now</Button> </div>
                 </div>
                 <div className="border rounded-md overflow-hidden">
                      <div className="aspect-video bg-muted flex items-center justify-center"> <Video size={48} className="text-muted-foreground" /> </div>
                      <div className="p-3"> <p className="text-sm font-medium mb-1 line-clamp-1">Understanding Writs</p> <Button variant="link" size="sm" className="p-0 h-auto text-xs" disabled={locked}>Watch Now</Button> </div>
                 </div>
                 {/* Add more video placeholders */}
             </div>
        </CardContent>
    </Card>
  );
}
