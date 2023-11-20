import cv2
import numpy as np
import time
import os
import sys
import json

# Constants
GREEN = (0, 255, 0)
RED = (0, 0, 255)

# Data storage for tracked points
tracked_points_data = {i: [] for i in range(len(sys.argv) - 2)}
new_dots = []

def track_points(video_path, coordinates):
    global tracked_points_data, new_dots
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    # Extract the filename and extension from the input video path
    file_name, file_extension = os.path.splitext(os.path.basename(video_path))

    # Construct the output video file name
    output_file_name = os.path.join('temp', 'final-video', f"{file_name}-final{file_extension}")

    # Prepare the video writer
    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    out = cv2.VideoWriter(output_file_name, fourcc, fps, (width, height))

    # Initialize Lucas-Kanade parameters
    lk_params = dict(
        winSize=(15, 15),
        maxLevel=2,
        criteria=(cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 10, 0.03),
    )

    # Initialize previous frame and initial x-coordinates
    ret, first_frame = cap.read()
    gray_prev = cv2.cvtColor(first_frame, cv2.COLOR_BGR2GRAY)
    tracked_points_np = np.array(coordinates, dtype=np.float32).reshape(-1, 1, 2)
    new_dots = coordinates.copy()

    tracking_data = {i: [] for i in range(len(coordinates))}

    frame_count = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        # Calculate optical flow
        new_points, st, _ = cv2.calcOpticalFlowPyrLK(
            gray_prev, gray, tracked_points_np, None, **lk_params
        )

        # Select good points
        good_new = new_points[st == 1]

        # Update tracked points and data
        tracked_points_np = good_new.reshape(-1, 1, 2)
        seconds_of_video = frame_count / fps  # Convert frame count to seconds
        for i, point in enumerate(tracked_points_np):
            x, y = point[0]
            if i in tracked_points_data:  # Check if the key exists
                tracked_points_data[i].append((seconds_of_video, x))
            else:
                tracked_points_data[i] = [(seconds_of_video, x)]

            # Update the initial x-coordinate
            initial_x = new_dots[i][0]

            # Calculate relative movement from the initial x-coordinate
            relative_movement = x - initial_x

            # Append tracking data
            if seconds_of_video % 0.5 == 0:
                tracking_data[i].append({"x": float(relative_movement), "time": seconds_of_video})


            # Display the relative movement for each point with color-coded and prefixed values
            cv2.circle(frame, tuple(map(int, point[0])), 5, GREEN if relative_movement >= 0 else RED, -1)
            cv2.putText(frame, f"Point {i + 1}: {'+' if relative_movement >= 0 else '-'}{int(abs(relative_movement))}",
                        (int(point[0][0]) + 10, int(point[0][1]) + 20),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, GREEN if relative_movement >= 0 else RED, 2)

        out.write(frame)

        # Update previous frame
        gray_prev = gray.copy()
        frame_count += 1

    cap.release()
    out.release()

    return tracking_data

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python video-create.py <video_path> <x1,y1> <x2,y2> ...")
        sys.exit(1)

    video_path = sys.argv[1]
    coordinates = [tuple(map(int, coord.split(','))) for coord in sys.argv[2:]]

    # Track selected points in the video and save to a new video file
    tracking_data = track_points(video_path, coordinates)

    # Convert the tracking data to JSON and print
    print(json.dumps(tracking_data))

    cv2.destroyAllWindows()  # Close OpenCV windows after video is saved
