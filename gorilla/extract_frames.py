import cv2
import os
import sys

video_path = r"c:\Users\Administrador\Desktop\FOTOS\Gorilla_wearing_hoodie_headphone…_1080p_20260910202753.mp4"
output_dir = r"c:\Users\Administrador\Desktop\FOTOS\gorilla\frames"

if not os.path.exists(output_dir):
    os.makedirs(output_dir)

cap = cv2.VideoCapture(video_path)

if not cap.isOpened():
    print(f"ERRO: Nao foi possivel abrir o video: {video_path}")
    sys.exit(1)

total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
fps = cap.get(cv2.CAP_PROP_FPS)
duration = total_frames / fps if fps > 0 else 0
print(f"Total frames: {total_frames}, FPS: {fps:.1f}, Duração: {duration:.1f}s")

# Alvo: 200-280 frames para scroll suave sem excesso de memória
TARGET = 240
skip = max(1, total_frames // TARGET)
print(f"Extraindo 1 de cada {skip} frames (alvo ~{TARGET} frames)")

frame_id = 0
saved = 0

while True:
    ret, frame = cap.read()
    if not ret:
        break

    if frame_id % skip == 0:
        # Redimensionar para largura máxima 1920 mantendo proporção
        h, w = frame.shape[:2]
        if w > 1920:
            new_w = 1920
            new_h = int(h * new_w / w)
            frame = cv2.resize(frame, (new_w, new_h), interpolation=cv2.INTER_AREA)

        out_path = os.path.join(output_dir, f"frame_{saved:04d}.jpg")
        cv2.imwrite(out_path, frame, [int(cv2.IMWRITE_JPEG_QUALITY), 82])
        saved += 1

    frame_id += 1

cap.release()
print(f"Pronto! {saved} frames salvos em: {output_dir}")
