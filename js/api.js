import { config } from './config.js';

const { resourceId, recordsPerPage, baseUrl } = config.api;

/**
 * Fetches all records with concurrency control and cleaner URL handling.
 */
export async function fetchAllRecords() {
  // 1. Build the base URL object once
  const url = new URL(baseUrl);
  url.searchParams.set('resource_id', resourceId);
  url.searchParams.set('limit', 1); 

  // 2. Initial Fetch
  const initialResponse = await fetch(url.toString());
  if (!initialResponse.ok) throw new Error(`Init Error: ${initialResponse.statusText}`);
  
  const initialData = await initialResponse.json();
  const totalRecords = initialData.result.total;

  // 3. Create offsets
  const offsets = [];
  for (let offset = 0; offset < totalRecords; offset += recordsPerPage) {
    offsets.push(offset);
  }

  // 4. Batch Processing (Concurrency Control)
  // Process 5 requests at a time to avoid rate limiting
  const BATCH_SIZE = 5; 
  const allRecords = [];

  for (let i = 0; i < offsets.length; i += BATCH_SIZE) {
    const batchOffsets = offsets.slice(i, i + BATCH_SIZE);
    
    // Create promises for this batch only
    const batchPromises = batchOffsets.map(offset => {
      // Clone URL to avoid modifying the original repeatedly
      const pageUrl = new URL(url); 
      pageUrl.searchParams.set('limit', recordsPerPage);
      pageUrl.searchParams.set('offset', offset);
      
      return fetch(pageUrl.toString())
        .then(res => {
            if (!res.ok) throw new Error(`Status ${res.status}`);
            return res.json();
        })
        .then(data => data.result?.records || []) // Safety check
        .catch(err => {
            console.error(`Failed to fetch offset ${offset}:`, err);
            return []; // Return empty array so one failure doesn't crash the script
        });
    });

    // Wait for this batch to finish before starting the next
    const batchResults = await Promise.all(batchPromises);
    
    // Flatten and store
    batchResults.forEach(records => allRecords.push(...records));
  }

  return allRecords;
}