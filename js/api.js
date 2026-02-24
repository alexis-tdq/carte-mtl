import { config } from './config.js';

const { resourceId, recordsPerPage, baseUrl } = config.api;

export async function fetchAllRecords() {
  const url = new URL(baseUrl);
  url.searchParams.set('resource_id', resourceId);
  url.searchParams.set('limit', 1); 

  const initialResponse = await fetch(url.toString());
  if (!initialResponse.ok) throw new Error(`Init Error: ${initialResponse.statusText}`);
  
  const initialData = await initialResponse.json();
  const totalRecords = initialData?.result?.total || 0;

  const offsets = [];
  for (let offset = 0; offset < totalRecords; offset += recordsPerPage) {
    offsets.push(offset);
  }

  const BATCH_SIZE = 5; 
  const allRecords = [];

  for (let i = 0; i < offsets.length; i += BATCH_SIZE) {
    const batchOffsets = offsets.slice(i, i + BATCH_SIZE);
    
    const batchPromises = batchOffsets.map(offset => {
      const pageUrl = new URL(url); 
      pageUrl.searchParams.set('limit', recordsPerPage);
      pageUrl.searchParams.set('offset', offset);
      
      return fetch(pageUrl.toString())
        .then(res => {
            if (!res.ok) throw new Error(`Status ${res.status}`);
            return res.json();
        })
        .then(data => data.result?.records || []) 
        .catch(err => {
            console.error(`Failed to fetch offset ${offset}:`, err);
            return [];
        });
    });

    const batchResults = await Promise.all(batchPromises);
    batchResults.forEach(records => allRecords.push(...records));
  }

  return allRecords;
}