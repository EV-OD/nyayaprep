'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { addMcq } from '@/lib/firebase/firestore'; // Import Firestore function
import { processCSVData } from '@/lib/utils/csv-processor'; // Import CSV processing function
import type { Question } from '@/types/quiz';

interface CSVUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void; // Callback for successful upload
}

export function CSVUploadDialog({ isOpen, onClose, onUploadSuccess }: CSVUploadDialogProps) {
  const [csvFile, setCsvFile] = React.useState<File | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
    } else {
      setCsvFile(null);
      toast({
        variant: 'destructive',
        title: 'Invalid File Type',
        description: 'Please select a CSV file.',
      });
    }
  };

  const handleUpload = async () => {
    if (!csvFile) {
      toast({
        variant: 'destructive',
        title: 'No File Selected',
        description: 'Please select a CSV file to upload.',
      });
      return;
    }

    setIsLoading(true);
    try {
      const mcqs: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>[] = await processCSVData(csvFile);

      // Upload MCQs to Firestore
      for (const mcq of mcqs) {
        await addMcq(mcq); // Use your existing addMcq function
      }

      toast({
        title: 'Upload Successful',
        description: `Successfully uploaded ${mcqs.length} MCQs.`,
      });

      onUploadSuccess(); // Call the success callback
      onClose(); // Close the dialog
      setCsvFile(null); // Reset file state
    } catch (error) {
      console.error('CSV Upload Error:', error);
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: 'An error occurred while processing the CSV file. Please check the format and try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload MCQs from CSV</DialogTitle>
          <DialogDescription>
            Select a CSV file containing MCQ data to upload.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input type="file" accept=".csv" onChange={handleFileChange} disabled={isLoading} />
          {csvFile && (
            <p className="text-sm text-muted-foreground">
              Selected file: {csvFile.name}
            </p>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isLoading}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleUpload} disabled={isLoading || !csvFile} className="bg-primary hover:bg-primary/90">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isLoading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
