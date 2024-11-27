import requests
import base64
from datetime import datetime
import time
import re

username = "REPLACE_WITH_YOUR_SLACK_ID"
api_key = "REPLACE_WITH_YOUR_HACKATIME_API_KEY"
log_file = "heartbeat_log.txt"

def fetch_project():
    url = f"https://waka.hackclub.com/api/compat/wakatime/v1/users/{username}"
    headers = {
        "Authorization": f"Basic {api_key}",
        "Accept": "application/json"
    }

    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            data = response.json().get("data", {})
            return data.get("last_project", "").strip() 
        else:
            print(f"Error fetching project: {response.status_code}, {response.text}")
            return ""
    except Exception as e:
        print(f"An error occurred while fetching the project: {e}")
        return ""

def fetch_last_heartbeat_time():
    url = f"https://waka.hackclub.com/api/compat/wakatime/v1/users/{username}"
    headers = {
        "Authorization": f"Basic {api_key}",
        "Accept": "application/json"
    }

    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            data = response.json().get("data", {})
            return data.get("last_heartbeat_at", "Unknown Time")
        else:
            print(f"Error fetching time: {response.status_code}, {response.text}")
            return "Unknown Time"
    except Exception as e:
        print(f"An error occurred while fetching the time: {e}")
        return "Unknown Time"

def fetch_and_log_combined():
    project = fetch_project()
    if project:
        last_heartbeat_time = fetch_last_heartbeat_time()
        with open(log_file, "a") as log:
            log.write(f"{last_heartbeat_time} - {project}\n")
        print(f"Logged: {last_heartbeat_time} - {project}")
    else:
        print("No project name found. Skipping log entry.")

if __name__ == "__main__":
    while True:
        fetch_and_log_combined()
        time.sleep(30)