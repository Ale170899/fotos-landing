import cv2
import os

video_path = "Woman_presenting_and_drinking_be…_20260910191041.mp4"
output_dir = "frames"

if not os.path.exists(output_dir):
    os.makedirs(output_dir)

cap = cv2.VideoCapture(video_path)
count = 1

# Optional: To not generate too many frames, we can extract every Nth frame, or just resize them for better performance on web.
# But let's see how many frames there are in total first.
total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
print(f"Total frames in video: {total_frames}")

# For a smooth web scroll animation, 150-300 frames is usually the sweet spot. 
# If total frames > 300, we might want to skip frames.
skip = max(1, total_frames // 300)

frame_id = 0
saved_count = 0

while True:
    ret, frame = cap.read()
    if not ret:
        break
    
    if frame_id % skip == 0:
        # Save frame as JPG to save space
        # We can also resize the frame if it's too large, for example 1280x720 is good for web
        height, width, _ = frame.shape
        if width > 1920:
            frame = cv2.resize(frame, (1920, int(1920 * height / width)))
        
        frame_filename = os.path.join(output_dir, f"frame_{saved_count:04d}.jpg")
        cv2.imwrite(frame_filename, frame, [int(cv2.IMWRITE_JPEG_QUALITY), 80])
        saved_count += 1
        
    frame_id += 1

cap.release()
print(f"Extracted {saved_count} frames to {output_dir}/")
