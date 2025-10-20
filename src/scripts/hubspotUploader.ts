import axios from 'axios';
import { BabyName } from '../models';
import dotenv from 'dotenv';

dotenv.config();

const HUBSPOT_API_KEY = process.env.HUBSPOT_API_KEY;
const HUBSPOT_API_URL = 'https://api.hubapi.com/crm/v3/objects/contacts/batch/create';

async function uploadToHubSpot() {
  try {
    if (!HUBSPOT_API_KEY) {
      throw new Error('HUBSPOT_API_KEY not found in .env file');
    }

    console.log(' Uploading to HubSpot...');

    const allRecords = await BabyName.findAll({
      attributes: ['name', 'sex'],
      raw: true,
      limit: 100, 
    });

    if (allRecords.length === 0) {
      console.log(' No records to upload');
      return 0;
    }

    const contacts = allRecords.map((record: any) => ({
      properties: {
        firstname: record.name,
        lastname: record.sex === 'M' ? 'Male' : 'Female',
        hs_lead_status: 'NEW',
      },
    }));

    const BATCH_SIZE = 100;
    let uploadedCount = 0;

    for (let i = 0; i < contacts.length; i += BATCH_SIZE) {
      const batch = contacts.slice(i, i + BATCH_SIZE);

      const response = await axios.post(HUBSPOT_API_URL, {
        inputs: batch,
      }, {
        headers: {
          'Authorization': `Bearer ${HUBSPOT_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      uploadedCount += batch.length;
    }

    console.log(` Successfully uploaded ${uploadedCount} contacts to HubSpot!`);
    return uploadedCount;

  } catch (error: any) {
    console.error(' HubSpot upload error:', error.response?.data || error.message);
    throw error;
  }
}

export default uploadToHubSpot;