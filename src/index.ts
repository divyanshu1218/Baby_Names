import downloadFromKaggle from './scripts/kaggleDownloader';
import parseAndStoreCSV from './scripts/csvParser';
import uploadToHubSpot from './scripts/hubspotUploader';
import sequelize from './config/database';
import { BabyName } from './models';
import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';

async function main() {
  try {
    console.log('\n Starting Emma Robot Task...\n');

    // Sync database and create table
    console.log('Setting up database...');
    await sequelize.sync({ force: false, alter: true });
    console.log(' Database ready\n');

    // Step 1: Download from Kaggle
    const zipFilePath = await downloadFromKaggle();

    // Step 2: Extract zip file
    const downloadDir = path.dirname(zipFilePath);
    const zip = new AdmZip(zipFilePath);
    zip.extractAllTo(downloadDir, true);

    // Step 3: Find the CSV file
    const files = fs.readdirSync(downloadDir);
    const csvFile = files.find(file => file.endsWith('.csv'));

    if (!csvFile) {
      throw new Error('No CSV file found after extraction');
    }

    const csvFilePath = path.join(downloadDir, csvFile);

    // Step 4: Parse and store in database
    console.log(' Processing CSV and storing in database...');
    const recordsStored = await parseAndStoreCSV(csvFilePath);
    console.log(` Stored ${recordsStored} records in database`);

    // Step 5: Upload to HubSpot
    const uploadedCount = await uploadToHubSpot();

    console.log(`\n TASK COMPLETED!`);
    console.log(`Summary:`);
    console.log(`   Records stored in DB: ${recordsStored}`);
    console.log(`   Contacts uploaded to HubSpot: ${uploadedCount}\n`);

  } catch (error) {
    console.error('Task failed:', error);
  } finally {
    await sequelize.close();
  }
}

main();