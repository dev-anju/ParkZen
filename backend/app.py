from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
import os

app = Flask(__name__)
CORS(app)

# =========================================================
# PARKZEN YOLO11 MODEL
# =========================================================

MODEL_PATH = "best.pt"

model = YOLO(MODEL_PATH)

print("======================================")
print("ParkZen model loaded successfully")
print("Classes:", model.names)
print("======================================")


# =========================================================
# PARKING IMAGES FOR EACH LOCATION
# =========================================================

PARKING_IMAGES = {
    "Mall A": "parking_images/Mall_A.jpg",
    "Mall B": "parking_images/Mall_B.jpg",
    "Mall C": "parking_images/Mall_C.jpg",

    "Restaurant A": "parking_images/Restaurant_A.jpg",
    "Restaurant B": "parking_images/Restaurant_B.jpg",
    "Restaurant C": "parking_images/Restaurant_C.jpg",
}


# =========================================================
# HOME
# =========================================================

@app.route("/")
def home():

    return jsonify({
        "message": "ParkZen AI Backend is running",
        "model": "YOLO11",
        "classes": model.names,
        "locations": list(PARKING_IMAGES.keys())
    })


# =========================================================
# PREDICT PARKING
# =========================================================

@app.route("/predict", methods=["POST"])
def predict():

    try:

        data = request.get_json(silent=True)

        if not data:
            return jsonify({
                "error": "No request data received"
            }), 400

        venue = data.get("venue")

        if not venue:
            return jsonify({
                "error": "Venue was not provided"
            }), 400

        print()
        print("======================================")
        print("ParkZen Request")
        print("Venue:", venue)
        print("======================================")


        # -------------------------------------------------
        # CHECK VENUE
        # -------------------------------------------------

        if venue not in PARKING_IMAGES:

            return jsonify({
                "error": f"No parking source configured for {venue}"
            }), 404


        image_path = PARKING_IMAGES[venue]


        # -------------------------------------------------
        # CHECK IMAGE
        # -------------------------------------------------

        if not os.path.exists(image_path):

            return jsonify({
                "error": f"Parking image not found: {image_path}"
            }), 404


        print("Analyzing:", image_path)


        # -------------------------------------------------
        # YOLO11 DETECTION
        # -------------------------------------------------

        results = model(
            image_path,
            conf=0.25
        )


        detections = []


        # -------------------------------------------------
        # COLLECT DETECTIONS
        # -------------------------------------------------

        for result in results:

            for box in result.boxes:

                class_id = int(box.cls[0])

                confidence = float(box.conf[0])

                coordinates = box.xyxy[0].tolist()


                # -----------------------------------------
                # CLASS 0 = EMPTY
                # CLASS 1 = OCCUPIED
                # -----------------------------------------

                if class_id == 0:

                    status = "empty"

                elif class_id == 1:

                    status = "occupied"

                else:

                    continue


                detections.append({

                    "status": status,

                    "confidence": round(
                        confidence,
                        4
                    ),

                    "coordinates": coordinates
                })


        # =================================================
        # SORT DETECTIONS
        # =================================================
        #
        # We sort parking boxes approximately from
        # top-to-bottom and left-to-right.
        #
        # This allows ParkZen to assign:
        #
        # P01
        # P02
        # P03
        # ...
        #
        # =================================================

        detections.sort(
            key=lambda d: (
                d["coordinates"][1],
                d["coordinates"][0]
            )
        )


        # =================================================
        # ASSIGN PARKING SLOT IDs
        # =================================================

        slots = []

        for index, detection in enumerate(
            detections,
            start=1
        ):

            slot_id = f"P{index:02d}"

            slots.append({

                "slot_id": slot_id,

                "status": detection["status"],

                "confidence": detection["confidence"],

                "coordinates": detection["coordinates"]
            })


        # =================================================
        # COUNT SLOTS
        # =================================================

        total_slots = len(slots)

        occupied = sum(
            1
            for slot in slots
            if slot["status"] == "occupied"
        )

        empty = sum(
            1
            for slot in slots
            if slot["status"] == "empty"
        )


        # =================================================
        # OCCUPANCY
        # =================================================

        occupancy = 0

        if total_slots > 0:

            occupancy = (
                occupied /
                total_slots
            ) * 100


        # =================================================
        # RECOMMENDED SLOT
        # =================================================

        recommended_slot = None

        for slot in slots:

            if slot["status"] == "empty":

                recommended_slot = slot["slot_id"]

                break


        # =================================================
        # PARKING STATUS
        # =================================================

        if total_slots == 0:

            parking_status = "NO DATA"

        elif empty == 0:

            parking_status = "FULL"

        elif occupancy >= 80:

            parking_status = "HIGH OCCUPANCY"

        else:

            parking_status = "AVAILABLE"


        # =================================================
        # RESPONSE
        # =================================================

        response = {

            "venue": venue,

            "total_slots": total_slots,

            "empty": empty,

            "occupied": occupied,

            "occupancy": round(
                occupancy,
                2
            ),

            "parking_status": parking_status,

            "recommended_slot": recommended_slot,

            "slots": slots

        }


        print()
        print("ParkZen Result")
        print("--------------------------------------")
        print("Venue:", venue)
        print("Total:", total_slots)
        print("Empty:", empty)
        print("Occupied:", occupied)
        print("Occupancy:", round(occupancy, 2), "%")
        print("Recommended:", recommended_slot)
        print("Status:", parking_status)
        print("--------------------------------------")


        return jsonify(response)


    except Exception as error:

        print()
        print("ParkZen Error:")
        print(error)

        return jsonify({

            "error": str(error)

        }), 500


# =========================================================
# RUN SERVER
# =========================================================

if __name__ == "__main__":

    app.run(

        host="127.0.0.1",

        port=5000,

        debug=True
    )