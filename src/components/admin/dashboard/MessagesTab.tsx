'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { Message } from '@/types/user';
import { format } from 'date-fns';

interface MessagesTabProps {
  messages: Message[];
  isLoading: boolean;
  searchTerm: string;
}

export function MessagesTab({ messages, isLoading, searchTerm }: MessagesTabProps) {
  const filteredMessages = messages.filter(message =>
    (message.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (message.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (message.message?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <MessagesTableSkeleton />;
  }

  return (
    <Card className="overflow-hidden border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px]">Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Message</TableHead>
            <TableHead className="text-right">Submitted At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredMessages.map((message) => (
            <TableRow key={message.id}>
              <TableCell className="font-medium">{message.name}</TableCell>
              <TableCell>{message.email}</TableCell>
              <TableCell className="max-w-[300px] truncate">{message.message}</TableCell>
              <TableCell className="text-right">
                {message.createdAt ? format(message.createdAt.toDate(), 'PPP p') : 'N/A'}
              </TableCell>
            </TableRow>
          ))}
          {filteredMessages.length === 0 && !isLoading && (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                No messages found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
}

function MessagesTableSkeleton() {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                    <TableHead><Skeleton className="h-4 w-40" /></TableHead>
                    <TableHead><Skeleton className="h-4 w-60" /></TableHead>
                    <TableHead className="text-right"><Skeleton className="h-4 w-32" /></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {[...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-96" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-4 w-24" /></TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
