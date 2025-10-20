import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { BabyName } from '../models';

async function parseAndStoreCSV(filePath: string) {
  return new Promise((resolve, reject) => {
    console.log(` Reading CSV from: ${filePath}`);

    const names: { name: string; sex: string }[] = [];
    let lineCount = 0;
    let totalStored = 0;
    const BATCH_SIZE = 1000; // Insert in batches of 1000

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', async (row) => {
        lineCount++;
        
        // Extract Name and Sex fields
        const name = row.Name || row.name;
        const sex = row.Sex || row.sex;

        if (name && sex) {
          names.push({
            name: name.trim(),
            sex: sex.trim(),
          });
        }

        // Insert batch when it reaches BATCH_SIZE
        if (names.length >= BATCH_SIZE) {
          try {
            const batch = names.splice(0, BATCH_SIZE);
            await BabyName.bulkCreate(batch, { ignoreDuplicates: true });
            totalStored += batch.length;
            console.log(` Batch inserted: ${totalStored} total records stored...`);
          } catch (error) {
            console.error(' Error storing batch:', error);
            reject(error);
          }
        }

        if (lineCount % 10000 === 0) {
          console.log(` Processed ${lineCount} rows from CSV...`);
        }
      })
      .on('end', async () => {
        try {
          console.log(` CSV parsing complete. Total records read: ${lineCount}`);

          // Insert remaining records
          if (names.length > 0) {
            console.log(` Storing final ${names.length} records...`);
            await BabyName.bulkCreate(names, { ignoreDuplicates: true });
            totalStored += names.length;
          }

          console.log(` Successfully stored ${totalStored} total records in database!`);
          resolve(totalStored);
        } catch (error) {
          console.error(' Error storing final records:', error);
          reject(error);
        }
      })
      .on('error', (error) => {
        console.error(' Error reading CSV:', error);
        reject(error);
      });
  });
}

export default parseAndStoreCSV;