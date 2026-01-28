import requests
import base64
import os
import time
from datetime import datetime

url = "http://127.0.0.1:8990/data"
folder_name = "images"
wait_time = 1  # seconds

def get_image_data():
    os.makedirs(folder_name, exist_ok=True)

    print("Starting to fetch images...")

    while True:
        try:
            response = requests.get(url, timeout=5)

            if response.status_code != 200:
                print("Server error:", response.status_code)
                print("Stopping fetch.")
                break

            data = response.json()

            image_text = data["image_base64"]
            severity = data.get("severity", "unknown")
            timestamp = data.get("timestamp", datetime.utcnow().isoformat())

            timestamp = timestamp.replace(":", "-").replace(".", "-")

            image_bytes = base64.b64decode(image_text)

            file_name = f"{severity}_{timestamp}.jpg"
            file_path = os.path.join(folder_name, file_name)

            with open(file_path, "wb") as image_file:
                image_file.write(image_bytes)

            print("Saved image:", file_name)

            time.sleep(wait_time)

        except requests.exceptions.RequestException as error:
            print("Connection error:", error)
            break

        except Exception as error:
            print("Something went wrong:", error)
            break


if __name__ == "__main__":
    get_image_data()
