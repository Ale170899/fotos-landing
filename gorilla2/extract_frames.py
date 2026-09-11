import cv2, os, sys

video_path = r"c:\Users\Administrador\Desktop\FOTOS\Gorilla_turning_head_slowly_1080p_20260910203035.mp4"
output_dir = r"c:\Users\Administrador\Desktop\FOTOS\gorilla2\frames"

os.makedirs(output_dir, exist_ok=True)

cap = cv2.VideoCapture(video_path)
if not cap.isOpened():
    print(f"ERRO: Não foi possível abrir {video_path}"); sys.exit(1)

total  = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
fps    = cap.get(cv2.CAP_PROP_FPS)
dur    = total / fps if fps > 0 else 0
print(f"Total frames: {total} | FPS: {fps:.1f} | Duração: {dur:.1f}s")

TARGET = 240
skip   = max(1, total // TARGET)
print(f"skip={skip} -> ~{total // skip} frames extraidos")

fid = saved = 0
while True:
    ret, frame = cap.read()
    if not ret: break
    if fid % skip == 0:
        h, w = frame.shape[:2]
        if w > 1920:
            frame = cv2.resize(frame, (1920, int(h * 1920 / w)), interpolation=cv2.INTER_AREA)
        cv2.imwrite(os.path.join(output_dir, f"frame_{saved:04d}.jpg"),
                    frame, [int(cv2.IMWRITE_JPEG_QUALITY), 82])
        saved += 1
    fid += 1

cap.release()
print(f"Pronto! {saved} frames → {output_dir}")
