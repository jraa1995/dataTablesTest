import os
import requests
import pandas as pd
from google.oauth2 import service_account
from googleapiclient.discovery import build

# CONFIG
SERVICE_ACCOUNT_FILE = 'service_account.json'
SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID'
SHEET_NAME = 'test'

FIELDS = [
    "Award ID", "Recipient Name", "Start Date", "End Date", "Award Amount",
    "Awarding Agency", "Awarding Sub Agency", "Contract Award Type",
    "Award Type", "Funding Agency", "Funding Sub Agency"
]

API_URL = "https://api.usaspending.gov/api/v2/search/spending_by_award/"
LIMIT = 100
START_DATE = "2018-10-01"
END_DATE = "2019-09-30"


def get_authenticated_sheet_service():
    creds = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE,
        scopes=['https://www.googleapis.com/auth/spreadsheets']
    )
    return build('sheets', 'v4', credentials=creds)


def fetch_all_awards():
    page = 1
    has_next = True
    all_results = []

    while has_next:
        payload = {
            "subawards": False,
            "limit": LIMIT,
            "page": page,
            "filters": {
                "award_type_codes": ["A", "B", "C"],
                "time_period": [{
                    "start_date": START_DATE,
                    "end_date": END_DATE
                }]
            },
            "fields": FIELDS
        }

        response = requests.post(API_URL, json=payload)
        if response.status_code != 200:
            raise Exception(f"❌ Error: {response.status_code}\n{response.text}")

        data = response.json()
        results = data.get('results', [])
        if not results:
            break

        all_results.extend(results)
        has_next = data.get('page_metadata', {}).get('hasNext', False)
        page += 1

    return all_results


def upload_to_google_sheets(data):
    df = pd.DataFrame(data)
    df = df[FIELDS]  # ensure column order
    values = [FIELDS] + df.fillna("").astype(str).values.tolist()

    service = get_authenticated_sheet_service()
    sheet = service.spreadsheets()

    # Clear the sheet first
    clear_request = {"requests": [{"updateCells": {"range": {"sheetId": 0}, "fields": "*"}}]}
    try:
        sheet.batchUpdate(spreadsheetId=SPREADSHEET_ID, body=clear_request).execute()
    except:
        pass  # continue even if we can't clear

    body = {"values": values}
    sheet.values().update(
        spreadsheetId=SPREADSHEET_ID,
        range=f"{SHEET_NAME}!A1",
        valueInputOption="RAW",
        body=body
    ).execute()


def main():
    print("🔄 Fetching data from USAspending.gov...")
    data = fetch_all_awards()
    print(f"✅ Fetched {len(data)} records")

    print("📤 Uploading to Google Sheets...")
    upload_to_google_sheets(data)
    print("✅ Upload complete!")


if __name__ == "__main__":
    main()
