import requests
import pandas as pd
import time

API_URL = "https://api.usaspending.gov/api/v2/search/spending_by_award/"
FIELDS = [
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
LIMIT = 100
START_DATE = "2023-10-01"

def fetch_all_award_data():
    all_results = []
    page = 1
    has_next = True

    while has_next:
        payload = {
            "subawards": False,
            "limit": LIMIT,
            "page": page,
            "filters": {
                "award_type_codes": ["A", "B", "C"],
                "time_period": [{
                    "start_date": START_DATE
                }]
            },
            "fields": FIELDS
        }

        try:
            response = requests.post(API_URL, json=payload, timeout=60)
            response.raise_for_status()
            data = response.json()
            results = data.get("results", [])
            all_results.extend(results)
            has_next = data.get("page_metadata", {}).get("hasNext", False)
            page += 1
            time.sleep(0.5)  # prevent rate-limiting
        except Exception as e:
            print(f"Error on page {page}: {e}")
            break

    return pd.DataFrame(all_results)

# Pull the data
df_awards = fetch_all_award_data()

# Show basic info
print(f"✅ Pulled {len(df_awards)} rows")
df_awards.head()
