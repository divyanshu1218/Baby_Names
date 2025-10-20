# Emma Robot Task - Kaggle to HubSpot Data Pipeline

## Overview

This project automates the process of fetching baby names data from Kaggle, storing it in a MySQL database, and syncing it to HubSpot as contacts. The system uses Playwright for web automation, Sequelize for database management, and the HubSpot API for CRM integration.

## Features

- Automated Kaggle login and CSV download using Playwright
- CSV parsing and batch insertion into MySQL database
- HubSpot contact creation via REST API
- Sequelize ORM with TypeScript support
- Error handling and logging

## Prerequisites

- Node.js (v14 or higher)
- MySQL (local or cloud instance)
- Kaggle account with credentials
- HubSpot free account with API key

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/divyanshu1218/Baby_Names.git
cd emma-robot-plena-assignment
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```
KAGGLE_EMAIL=your_kaggle_email@gmail.com
KAGGLE_PASSWORD=your_kaggle_password
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=baby_names_db
HUBSPOT_API_KEY=your_hubspot_api_key
```

### 4. Create MySQL Database

```sql
CREATE DATABASE baby_names_db;
```

## Setup Instructions

### Step 1: Get Kaggle Credentials

1. Visit https://www.kaggle.com/account
2. Scroll to API section
3. Click "Create New API Token" if you haven't already
4. Use your Kaggle email and password in `.env`

### Step 2: Get HubSpot API Key

1. Sign up for free at https://www.hubspot.com/
2. Go to Settings → Integrations → Private apps
3. Create a new private app with "crm.objects.contacts.write" scope
4. Generate and copy the API token
5. Add it to `.env`

### Step 3: Configure MySQL

Update `.env` with your MySQL credentials:
- `DB_HOST`: Usually `localhost`
- `DB_USER`: Your MySQL username (default: `root`)
- `DB_PASSWORD`: Your MySQL password
- `DB_NAME`: `baby_names_db`

## Running the Application

### Development Mode

```bash
npm run dev
```

This will execute the complete pipeline:
1. Download baby names CSV from Kaggle
2. Extract and parse the CSV file
3. Store 95,025 records in MySQL database
4. Upload first 1,000 contacts to HubSpot

## Project Structure

```
src/
├── config/
│   └── database.ts          # Sequelize configuration
├── models/
│   ├── BabyName.ts         # Baby name model
│   └── index.ts            # Model exports
├── scripts/
│   ├── kaggleDownloader.ts # Playwright automation
│   ├── csvParser.ts        # CSV parsing logic
│   └── hubspotUploader.ts  # HubSpot API integration
└── index.ts                # Main entry point
```

## How It Works

https://github.com/user-attachments/assets/3080b88c-d547-498e-9f62-e8d14686d6a1

### 1. Kaggle Download (kaggleDownloader.ts)

- Uses Playwright to automate browser actions
- Logs into Kaggle with provided credentials
- Navigates to the baby names dataset
- Downloads the ZIP file to `downloads/` folder

### 2. CSV Processing (csvParser.ts)

- Extracts ZIP file
- Reads CSV file using csv-parser
- Batch inserts records (1,000 at a time) to prevent database overload
- Extracts only `Name` and `Sex` fields

### 3. HubSpot Sync (hubspotUploader.ts)

- Fetches first 100 records from database
- Transforms data to HubSpot contact format
- Batch uploads 100 contacts per API request
- Uses HubSpot CRM API v3

## Data Fields

Records stored in database:

| Field | Type | Source |
|-------|------|--------|
| id | Integer | Auto-generated |
| name | String | CSV Name column |
| sex | String | CSV Sex column (M/F) |
| createdAt | DateTime | Auto-generated |
| updatedAt | DateTime | Auto-generated |

## Limitations

- Free HubSpot tier limited to 1,000 contacts
- CSV contains 95,025+ records; only 1,000 are synced
- Kaggle automation depends on website structure (may break if UI changes)
- Batch size set to 1,000 to avoid MySQL connection issues

## Performance Notes

- CSV parsing: ~5-10 seconds for 95,000+ records
- Database insertion: ~30-60 seconds (batch processing)
- HubSpot upload: ~20-30 seconds (10 API requests for 1,000 contacts)
- Total runtime: ~2-3 minutes

## Tech Stack

- Node.js with TypeScript
- Playwright (v1.x) - Web automation
- Sequelize (v6.x) - ORM
- MySQL2 - Database driver
- Axios - HTTP client for APIs
- csv-parser - CSV parsing
- adm-zip - ZIP extraction

## License

This project is part of the Kalvium Emma Robot placement assessment.# Baby_Names
