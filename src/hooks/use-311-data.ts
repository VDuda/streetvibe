'use client';

import { useQuery } from '@tanstack/react-query';
import { ServiceRequest, ServiceRequestSchema } from '@/types/boston-311';

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

function csvToServiceRequests(csvText: string): ServiceRequest[] {
  const lines = csvText.trim().split('\n');
  const headers = parseCSVLine(lines[0]);
  
  const requests: ServiceRequest[] = [];
  
  // Process lines starting from index 1 (skip header)
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    
    if (values.length !== headers.length) {
      continue; // Skip malformed rows
    }
    
    const record: Record<string, string | null> = {};
    headers.forEach((header, index) => {
      const value = values[index];
      // Convert empty strings to null for nullable fields
      record[header] = value === '' ? null : value;
    });
    
    // Add _id field (using index as ID)
    (record as Record<string, string | number | null>)._id = i;
    
    try {
      const validatedRecord = ServiceRequestSchema.parse(record);
      requests.push(validatedRecord);
    } catch (error) {
      // Skip invalid records
      console.warn(`Skipped invalid record at line ${i + 1}:`, error);
    }
  }
  
  return requests;
}

function sortByDateDescending(requests: ServiceRequest[]): ServiceRequest[] {
  return requests.sort((a, b) => {
    // Handle null dates
    if (!a.open_dt && !b.open_dt) return 0;
    if (!a.open_dt) return 1;
    if (!b.open_dt) return -1;
    
    const dateA = new Date(a.open_dt);
    const dateB = new Date(b.open_dt);
    
    return dateB.getTime() - dateA.getTime();
  });
}

async function fetch311Data(): Promise<ServiceRequest[]> {
  const response = await fetch('/311-data.csv');
  if (!response.ok) {
    throw new Error('Failed to fetch CSV data');
  }
  
  const csvText = await response.text();
  const allRequests = csvToServiceRequests(csvText);
  
  // Sort by date (newest first) and take the last 100
  const sortedRequests = sortByDateDescending(allRequests);
  const last100Requests = sortedRequests.slice(0, 100);
  
  return last100Requests;
}

export function use311Data() {
  return useQuery<ServiceRequest[], Error>({
    queryKey: ['311data-csv'],
    queryFn: fetch311Data,
  });
}
