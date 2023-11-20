import cv2
import numpy as np
import matplotlib.pyplot as plt
import time

# Constants
GREEN = (0, 255, 0)
RED = (0, 0, 255)
NEUTRAL_POSITION = 0

# Data storage for tracked points
tracked_points = []
tracked_points_data = {i: [] for i in range(len(tracked_points))}
initial_dots = []
new_dots = []
point_labels = []

def select_points(frame):
    global initial_dots, new_dots, point_labels
    points = []

    def click_event(event, x, y, flags, param):
        nonlocal points
        if event == cv2.EVENT_LBUTTONDOWN:
            points.append((x, y))
            cv2.circle(frame, (x, y), 5, GREEN, -1)
            cv2.imshow("Select Points", frame)

    cv2.imshow("Select Points", frame.copy())
    cv2.setMouseCallback("Select Points", click_event)

    while True:
        key = cv2.waitKey(1) & 0xFF
        if key == 13:  # Enter key
            break

    cv2.destroyAllWindows()  # Move this line outside the loop

    # Save initial points and initialize new_dots
    initial_dots = points.copy()
    new_dots = initial_dots.copy()
    point_labels = [f"Point {i + 1}" for i in range(len(initial_dots))]

    print(initial_dots)
    # Draw low-opacity dots for the initial positions
    for x, y in initial_dots:
        cv2.circle(frame, (x, y), 5, RED, -1)

    cv2.destroyAllWindows()

def track_points(video_path):
    global initial_dots, new_dots, tracked_points_data
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    # Prepare the video writer
    fourcc = cv2.VideoWriter_fourcc(*"XVID")
    out = cv2.VideoWriter("output.avi", fourcc, fps, (width, height))

    # Initialize Lucas-Kanade parameters
    lk_params = dict(
        winSize=(15, 15),
        maxLevel=2,
        criteria=(cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 10, 0.03),
    )

    # Initialize previous frame and initial x-coordinates
    ret, first_frame = cap.read()
    gray_prev = cv2.cvtColor(first_frame, cv2.COLOR_BGR2GRAY)
    tracked_points_np = np.array(new_dots, dtype=np.float32).reshape(-1, 1, 2)
    initial_x_coordinates = [x for x, _ in new_dots]

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
        good_old = tracked_points_np[st == 1]

        # Update tracked points and data
        tracked_points_np = good_new.reshape(-1, 1, 2)
        timestamp = time.time()
        for i, point in enumerate(tracked_points_np):
            x, y = point[0]
            if i in tracked_points_data:  # Check if the key exists
                tracked_points_data[i].append((timestamp, x))
            else:
                tracked_points_data[i] = [(timestamp, x)]

            # Update the initial x-coordinate
            initial_x = initial_x_coordinates[i]
            
            # Calculate relative movement from the initial x-coordinate
            relative_movement = x - initial_x

            # Display the relative movement for each point with color-coded and prefixed values
            cv2.circle(frame, tuple(map(int, point[0])), 5, GREEN if relative_movement >= 0 else RED, -1)
            cv2.putText(frame, f"Tacka {i + 1}: {'+' if relative_movement >= 0 else '-'}{int(abs(relative_movement))}", 
                        (int(point[0][0]) + 10, int(point[0][1]) + 20),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, GREEN if relative_movement >= 0 else RED, 2)

        out.write(frame)
        cv2.imshow("Video Tracking", frame)

        key = cv2.waitKey(int(1000 / fps)) & 0xFF
        if key == 27:  # Esc key to exit
            break

        # Update previous frame
        gray_prev = gray.copy()

    cap.release()
    out.release()

def plot_chart():
    global tracked_points_data
    plt.figure(figsize=(20, 10))

    for i, point_data in tracked_points_data.items():
        if not point_data:
            continue  # Skip if there's no data for this point

        timestamps, x_positions = zip(*point_data)
        initial_x = x_positions[0]
        y_positions = [x - initial_x for x in x_positions]
        plt.plot(timestamps, y_positions, label=f"Tacka {i + 1}")

    if any(tracked_points_data.values()):
        plt.axhline(NEUTRAL_POSITION, color='black', linestyle='--', label='Prvobitna pozicija')
        plt.xlabel('Vreme')
        plt.ylabel('Relativna horizontalna promena tačaka')
        plt.ylim(-250, 250)  # Set y-axis limits
        plt.legend()
        plt.title('Promena u toku vremena')
        plt.show()
    else:
        print("No data to plot.")

if __name__ == "__main__":
    video_path = "kicma2.mp4"  # Replace with your video file path
    cap = cv2.VideoCapture(video_path)

    # Load video and select points
    select_points(cap.read()[1])

    # Track selected points in the video
    track_points(video_path)

    # Plot the chart
    plot_chart()
