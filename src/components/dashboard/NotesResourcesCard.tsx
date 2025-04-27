
import type * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Newspaper, Lock, Zap, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UpgradeAlertDialog } from './UpgradeAlertDialog';

interface NotesResourcesCardProps {
  locked: boolean;
  onUpgradeClick: () => void;
}

const pdfUrl = "https://ag.gov.np/files/Constitution-of-Nepal_2072_Eng_www.moljpa.gov_.npDate-72_11_16.pdf";

export function NotesResourcesCard({ locked, onUpgradeClick }: NotesResourcesCardProps) {
  return (
    <Card className="relative overflow-hidden flex flex-col">
        <CardHeader>
           <CardTitle className="flex items-center gap-2"><Newspaper size={20} /> Notes & Resources</CardTitle>
           <CardDescription>Access study materials, PDFs, and important notes.</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow relative">
           {locked && (
               <div className="absolute inset-0 bg-background/80 dark:bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 z-10 rounded-b-lg">
                   <Lock size={40} className="text-primary mb-4" />
                   <p className="text-center font-semibold mb-4">Requires validated Premium plan.</p>
                    <UpgradeAlertDialog
                       triggerButton={<Button variant="default"><Zap className="mr-2 h-4 w-4" /> Upgrade Now</Button>}
                       featureName="Notes & Resources"
                       onUpgradeClick={onUpgradeClick}
                    />
               </div>
           )}
           {/* Actual content */}
            <div className={cn("space-y-3", locked ? "opacity-30 pointer-events-none" : "")}>
                <div className="flex justify-between items-center p-3 border rounded-md">
                    <span className="text-sm font-medium">Constitution of Nepal - Key Articles PDF</span>
                    <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className={cn(locked ? 'pointer-events-none' : '')}>
                       <Button variant="outline" size="sm" disabled={locked} aria-disabled={locked}>
                          Open PDF <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                       </Button>
                    </a>
                </div>
                <div className="flex justify-between items-center p-3 border rounded-md">
                    <span className="text-sm font-medium">Legal Theory Summaries</span>
                    <Button variant="outline" size="sm" disabled={locked}>View</Button>
                </div>
                 <div className="flex justify-between items-center p-3 border rounded-md">
                    <span className="text-sm font-medium">Sample Contract Drafts</span>
                    <Button variant="outline" size="sm" disabled={locked}>View</Button>
                </div>
            </div>
        </CardContent>
    </Card>
  );
}
