import cv2
import base64
import time
import threading
import requests
import numpy as np
import os
from datetime import datetime, timezone
from io import BytesIO
from PIL import Image
from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn
import torch
from ultralyticsplus import YOLO

# ================= CONFIG =================
API_ENDPOINT = "http://127.0.0.1:8990/data"

VIDEO_PATH = "testvid.mp4"   # None = live camera
CAMERA_INDEX = 0

SAVE_DIR = "received_potholes"

CONF_THRESHOLD = 0.25
IOU_THRESHOLD = 0.45

SEND_INTERVAL = 2        
FRAME_SKIP = 1          
RESIZE_WIDTH = 640       

CROP_SIZE = 224         
JPEG_QUALITY = 60        


os.makedirs(SAVE_DIR, exist_ok=True)


app = FastAPI()
latest_event = None

class PotholeData(BaseModel):
    severity: str
    timestamp: str
    image: str  # base64

@app.post("/data")
def receive_data(data: PotholeData):
    global latest_event
    try:
        img_bytes = base64.b64decode(data.image)
        img = Image.open(BytesIO(img_bytes))

        ts = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S_%f")
        filename = f"{data.severity}_{ts}.jpg"
        img.save(os.path.join(SAVE_DIR, filename))

        latest_event = {
            "severity": data.severity,
            "timestamp": data.timestamp,
            "image_base64": data.image
        }

        print(f"[SERVER] Updated pothole → {data.severity}")
        return {"status": "ok"}

    except Exception as e:
        return {"status": "error", "detail": str(e)}

@app.get("/data")
def show_latest_data():
    if latest_event is None:
        return {"status": "no data yet"}
    return latest_event

def start_server():
    uvicorn.run(app, host="0.0.0.0", port=8990, log_level="error")

# ================= YOLO MODEL =================
print("[INFO] Loading YOLO model...")
model = YOLO("keremberke/yolov8n-pothole-segmentation")

# ---- CUDA SAFE ENABLE ----
if torch.cuda.is_available():
    model.to("cuda")
    model.overrides["half"] = True  # FP16 for GPU speed
    print("[INFO] YOLO running on CUDA")
else:
    model.to("cpu")
    print("[INFO] YOLO running on CPU")

model.overrides["conf"] = CONF_THRESHOLD
model.overrides["iou"] = IOU_THRESHOLD
model.overrides["agnostic_nms"] = False
model.overrides["max_det"] = 1000

last_sent = 0
frame_count = 0

# ================= UTILS =================
def severity_from_mask(mask, frame_area):
    ratio = np.sum(mask > 0) / frame_area
    if ratio < 0.01:
        return "low"
    elif ratio < 0.05:
        return "medium"
    else:
        return "high"

def image_to_base64(img):
    img = cv2.resize(img, (CROP_SIZE, CROP_SIZE))
    encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), JPEG_QUALITY]
    success, buffer = cv2.imencode(".jpg", img, encode_param)
    if not success:
        return None
    return base64.b64encode(buffer).decode("utf-8")

def process_frame(frame):
    global last_sent

    results = model.predict(frame, verbose=False)
    r = results[0]

    if r.masks is None:
        return frame

    masks = r.masks.data.cpu().numpy()
    boxes = r.boxes.xyxy.cpu().numpy()
    frame_area = frame.shape[0] * frame.shape[1]

    for i, mask in enumerate(masks):
        sev = severity_from_mask(mask, frame_area)
        x1, y1, x2, y2 = boxes[i].astype(int)

        crop = frame[y1:y2, x1:x2]
        if crop.size == 0:
            continue

        color = (0,255,0) if sev=="low" else (0,255,255) if sev=="medium" else (0,0,255)
        cv2.rectangle(frame, (x1,y1), (x2,y2), color, 2)
        cv2.putText(frame, sev.upper(), (x1, y1-8),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)

        if time.time() - last_sent > SEND_INTERVAL:
            payload = {
                "severity": sev,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "image": image_to_base64(crop)
            }
            try:
                requests.post(API_ENDPOINT, json=payload, timeout=1)
                print(f"[CLIENT] Sent → {sev}")
                last_sent = time.time()
            except:
                pass

    return frame

# ================= MAIN =================
if __name__ == "__main__":

    print("[*] API server → http://127.0.0.1:8990/data")
    threading.Thread(target=start_server, daemon=True).start()
    time.sleep(1)

    cap = cv2.VideoCapture(VIDEO_PATH if VIDEO_PATH else CAMERA_INDEX)
    if not cap.isOpened():
        print("[-] Camera / Video failed")
        exit(1)

    print("[*] Detection running (press Q to quit)")

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        frame_count += 1

        # resize main frame for speed
        h, w = frame.shape[:2]
        scale = RESIZE_WIDTH / w
        frame = cv2.resize(frame, (RESIZE_WIDTH, int(h * scale)))

        if frame_count % FRAME_SKIP == 0:
            frame = process_frame(frame)

        cv2.imshow("Pothole Detection", frame)

        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

    cap.release()
    cv2.destroyAllWindows()
