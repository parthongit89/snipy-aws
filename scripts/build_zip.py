import os
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
EXTENSION_DIR = ROOT / "extension"
OUTPUT_ZIPS = [
    ROOT / "frontend" / "snipy-extension.zip",
    ROOT / "frontend" / "sniply-extension.zip",
    ROOT / "backend" / "static" / "snipy-extension.zip",
    ROOT / "backend" / "static" / "sniply-extension.zip"
]

def build_extension_zip():
    for output_zip in OUTPUT_ZIPS:
        print(f"Creating zip from {EXTENSION_DIR} to {output_zip}...")
        output_zip.parent.mkdir(parents=True, exist_ok=True)
        with zipfile.ZipFile(output_zip, "w", zipfile.ZIP_DEFLATED) as zf:
            for root, dirs, files in os.walk(EXTENSION_DIR):
                for file in files:
                    file_path = Path(root) / file
                    rel_path = file_path.relative_to(EXTENSION_DIR)
                    if any(part.startswith(".") for part in rel_path.parts):
                        continue
                    zf.write(file_path, arcname=str(rel_path).replace("\\", "/"))
        print(f"Successfully packaged {output_zip} ({output_zip.stat().st_size} bytes)")

if __name__ == "__main__":
    build_extension_zip()
