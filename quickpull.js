import requests
import pandas as pd
import time
from datetime import datetime, timedelta
import gspread
from oauth2client.service_account import ServiceAccountCredentials

# Setup Google Sheets
scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]
credentials = ServiceAccountCredentials.from_json_keyfile_name("service_account.json", scope)
gc = gspread.authorize(credentials)
sheet = gc.open("USAspending Data").worksheet("Sheet1")
sheet.clear()

# Define fields
fields = [
    "Award ID",
    "Recipient Name",
    "Start Date",
    "End Date",
    "Award Amount",
    "Awarding Agency",
    "Awarding Sub Agency",
    "Contract Award Type",
    "Award Type",
    "Funding Agency",
    "Funding Sub Agency"
]
sheet.append_row(fields)

# Setup requests session with retry logic
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

session = requests.Session()
retries = Retry(total=5, backoff_factor=1, status_forcelist=[429, 500, 502, 503, 504])
session.mount('https://', HTTPAdapter(max_retries=retries))

# Helper to get monthly periods
def generate_monthly_periods(start_date, end_date):
    periods = []
    current = start_date
    while current <= end_date:
        period_end = (current.replace(day=1) + timedelta(days=32)).replace(day=1) - timedelta(days=1)
        periods.append((current.strftime("%Y-%m-%d"), period_end.strftime("%Y-%m-%d")))
        current = period_end + timedelta(days=1)
    return periods

# API Pull Logic
base_url = "https://api.usaspending.gov/api/v2/search/spending_by_award/"
limit = 100
start_date = datetime(2023, 10, 1)
end_date = datetime.today()
monthly_periods = generate_monthly_periods(start_date, end_date)

for period_start, period_end in monthly_periods:
    page = 1
    while True:
        payload = {
            "subawards": False,
            "limit": limit,
            "page": page,
            "filters": {
                "award_type_codes": ["A", "B", "C"],
                "time_period": [{"start_date": period_start, "end_date": period_end}]
            },
            "fields": fields
        }

        response = session.post(base_url, json=payload)
        if response.status_code != 200:
            print(f"Error {response.status_code}: {response.text}")
            break

        data = response.json()
        results = data.get("results", [])
        if not results:
            break

        for result in results:
            row = [result.get(field, "") for field in fields]
            sheet.append_row(row)

        if not data.get("page_metadata", {}).get("hasNext", False):
            break

        page += 1
        time.sleep(1.2)  # respect API rate limits

print("✅ Data successfully pulled into Google Sheet test.")
