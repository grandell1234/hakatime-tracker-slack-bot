from datetime import datetime, timedelta
import time
import requests
from pyairtable import Table

API_KEY = "REPLACE_WITH_YOUR_AIRTABLE_API_KEY"
BASE_ID = "REPLACE_WITH_YOUR_AIRTABLE_BASE_ID"
TABLE_NAME = "REPLACE_WITH_YOUR_AIRTABLE_TABLE_NAME"

airtable_table = Table(API_KEY, BASE_ID, TABLE_NAME)

def is_project_in_airtable(project_name):
    """Check if a project exists in Airtable."""
    try:
        records = airtable_table.all(formula=f"{{Name}} = '{project_name}'")
        return len(records) > 0
    except Exception as e:
        print(f"Error checking Airtable: {e}")
        return False

def monitor_heartbeat_log(log_file, tracking_interval, webhook_url):
    project_times = {}
    progress_tracker = {}
    last_position = 0

    while True:
        try:
            with open(log_file, 'r') as file:
                file.seek(last_position)
                new_lines = file.readlines()
                last_position = file.tell()

            for line in new_lines:
                if ' - ' not in line:
                    print(f"Skipping malformed line: {line.strip()}")
                    continue

                try:
                    timestamp_str, project = line.strip().split(' - ', 1)

                    if '.' in timestamp_str:
                        timestamp = datetime.strptime(timestamp_str, '%Y-%m-%dT%H:%M:%S.%fZ')
                    else:
                        timestamp = datetime.strptime(timestamp_str, '%Y-%m-%dT%H:%M:%SZ')

                    if project not in project_times:
                        project_times[project] = timestamp
                        progress_tracker[project] = timedelta(0)
                    else:
                        elapsed_time = timestamp - project_times[project]

                        if elapsed_time > timedelta(0):
                            progress_tracker[project] += elapsed_time

                            if progress_tracker[project] >= tracking_interval:
                                print(f"Reached interval for: {project}")
                                
                                if is_project_in_airtable(project):
                                    print(f"Project {project} exists in Airtable. Skipping webhook.")
                                else:
                                    try:
                                        response = requests.post(
                                            webhook_url,
                                            json={"project": project},
                                            timeout=10 
                                        )
                                        if response.status_code == 200:
                                            print(f"Webhook successfully called for project: {project}")
                                        else:
                                            print(f"Failed to call webhook for project: {project}, Status Code: {response.status_code}, Response: {response.text}")
                                    except requests.RequestException as e:
                                        print(f"Error calling webhook for project: {project}, Error: {e}")

                                progress_tracker[project] = timedelta(0)

                        project_times[project] = timestamp

                except ValueError as e:
                    print(f"Skipping line due to parsing error: {line.strip()} ({e})")

        except FileNotFoundError:
            print(f"Log file {log_file} not found. Retrying...")

        time.sleep(5)

tracking_interval = timedelta(hours=1)  # Change this to (minutes=1) for minute tracking (mostly for debugging.)

webhook_url = "https://zach-code-track.elijah-a82.workers.dev/webhook"

monitor_heartbeat_log('heartbeat_log.txt', tracking_interval, webhook_url)