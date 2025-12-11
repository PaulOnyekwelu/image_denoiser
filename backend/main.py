from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import Response, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from io import BytesIO

from PIL import Image
import numpy as np
import cv2
import pywt

# If you use PyTorch / TensorFlow for CDAE, import them here
# import torch
# from your_model_module import YourCDAEModel

app = FastAPI()

# Allow frontend dev origins (adjust when you deploy)
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # you can set ["*"] during dev if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Utility functions ----------


def _pil_to_np(image: Image.Image) -> np.ndarray:
    """Convert PIL image to RGB numpy array."""
    return np.array(image.convert("RGB"))


def _np_to_pil(array: np.ndarray) -> Image.Image:
    """Convert numpy array (H, W, C) back to PIL RGB image."""
    array = np.clip(array, 0, 255).astype(np.uint8)
    return Image.fromarray(array, mode="RGB")


# ---------- Denoising implementations ----------


def denoise_mean(image: Image.Image, strength: float = 0.5) -> Image.Image:
    """
    Simple mean/box filter denoising using OpenCV.
    Strength controls the kernel size.
    """
    img_np = _pil_to_np(image)
    # Map strength 0–1 → kernel size 3–11 (odd numbers only)
    k = int(3 + strength * 8)  # 3–11
    if k % 2 == 0:
        k += 1
    denoised = cv2.blur(img_np, (k, k))
    return _np_to_pil(denoised)


def denoise_median(image: Image.Image, strength: float = 0.5) -> Image.Image:
    """
    Median filtering – good for salt-and-pepper noise.
    """
    img_np = _pil_to_np(image)
    k = int(3 + strength * 8)  # 3–11
    if k % 2 == 0:
        k += 1
    denoised = cv2.medianBlur(img_np, k)
    return _np_to_pil(denoised)


def denoise_wavelet(image: Image.Image, strength: float = 0.5) -> Image.Image:
    """
    Basic wavelet denoising using PyWavelets.
    For simplicity, operate on each channel separately.
    """
    img_np = _pil_to_np(image).astype(np.float32)
    denoised_channels = []

    # Strength scales the threshold
    base_threshold = 20.0
    threshold = base_threshold * (0.2 + strength)  # avoid 0

    for c in range(3):  # R, G, B channels
        channel = img_np[:, :, c]
        coeffs = pywt.wavedec2(channel, "db1", level=2)
        cA, detail_coeffs = coeffs[0], coeffs[1:]

        # Soft-threshold detail coefficients
        new_detail_coeffs = []
        for cH, cV, cD in detail_coeffs:
            cH = pywt.threshold(cH, threshold, mode="soft")
            cV = pywt.threshold(cV, threshold, mode="soft")
            cD = pywt.threshold(cD, threshold, mode="soft")
            new_detail_coeffs.append((cH, cV, cD))

        new_coeffs = [cA] + new_detail_coeffs
        denoised_channel = pywt.waverec2(new_coeffs, "db1")
        # Clip to original shape
        denoised_channel = denoised_channel[: channel.shape[0], : channel.shape[1]]
        denoised_channels.append(denoised_channel)

    denoised_np = np.stack(denoised_channels, axis=-1)
    return _np_to_pil(denoised_np)


# Placeholder CDAE denoiser – replace with your model
def denoise_cdae(image: Image.Image, strength: float = 0.5) -> Image.Image:
    """
    Placeholder for your Convolutional Denoising Autoencoder.
    Currently just calls median denoising as a stand-in.
    Replace this with your trained CDAE inference code.
    """
    return denoise_median(image, strength=strength)


# Example stub if you later integrate PyTorch:
#
# device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
# cdae_model = YourCDAEModel()
# cdae_model.load_state_dict(torch.load("models/cdae_weights.pth", map_location=device))
# cdae_model.to(device)
# cdae_model.eval()
#
# def denoise_cdae(image: Image.Image, strength: float = 0.5) -> Image.Image:
#     img = image.convert("L")  # or "RGB" depending on how you trained
#     arr = np.array(img) / 255.0
#     tensor = torch.from_numpy(arr).float().unsqueeze(0).unsqueeze(0).to(device)
#     with torch.no_grad():
#         out = cdae_model(tensor)
#     out = out.squeeze().cpu().numpy()
#     out = (out * 255.0).clip(0, 255).astype(np.uint8)
#     return Image.fromarray(out)

# ---------- API endpoints ----------


@app.get("/api/health")
async def health():
    return {"status": "ok"}


@app.post("/api/denoise")
async def denoise_image(
    file: UploadFile = File(...),
    method: str = Form("cdae"),
    strength: float = Form(0.5),
):
    """
    Accepts an uploaded image file and denoising parameters,
    returns a PNG image of the denoised result.
    """
    try:
        contents = await file.read()
        image = Image.open(BytesIO(contents))

        method = method.lower()

        if method == "cdae":
            denoised = denoise_cdae(image, strength=strength)
        elif method == "mean":
            denoised = denoise_mean(image, strength=strength)
        elif method == "median":
            denoised = denoise_median(image, strength=strength)
        elif method == "wavelet":
            denoised = denoise_wavelet(image, strength=strength)
        else:
            return JSONResponse(
                status_code=400,
                content={"error": f"Unknown method '{method}'"},
            )

        buf = BytesIO()
        denoised.save(buf, format="PNG")
        buf.seek(0)

        return Response(content=buf.getvalue(), media_type="image/png")

    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)},
        )
