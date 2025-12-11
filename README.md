# Image Denoising Web Application

An open-source, web-based image denoising application that demonstrates and compares multiple denoising techniques, including a convolutional denoising autoencoder (CDAE) and classical filtering methods. The application allows users to upload an image, apply denoising, visually compare results, and download the processed output, all through a simple, single-page interface.

**Live demo:** https://image-denoiser.vercel.app  

## Overview

Image denoising is a fundamental image processing task with applications in photography, remote sensing, scientific imaging, and computer vision pipelines. This project provides:

- A lightweight, browser-based interface for testing denoising methods  
- A Python FastAPI backend that performs denoising operations  
- A React single-page frontend with no authentication or persistent user data  
- An open-source codebase designed for experimentation, extension, and research demonstrations  

The application is intentionally simple and transparent, making it suitable for educational use, algorithm comparison, and showcasing research-oriented image processing techniques.

## Features

- Upload any image directly from your browser  
- Select from multiple denoising methods:
  - Convolutional Denoising Autoencoder (CDAE – placeholder for trained model)
  - Mean (box) filtering
  - Median filtering
  - Wavelet-based denoising
- Adjustable denoising strength parameter  
- Side-by-side visual comparison (original vs denoised)  
- Download the denoised image  
- No user accounts, no database, no tracking  
- Local storage used only for saving UI preferences  
- Fully open source  

## Project Architecture

```text
image-denoiser-webapp/
├── backend/
│   ├── main.py
│   └── requirements.txt
├── frontend/
│   ├── public/
│   └── src/
│       ├── App.js
│       ├── App.css
│       └── index.js
└── README.md
```

## Getting Started (Local Development)

### Prerequisites

- Node.js (>= 18)
- Python (>= 3.9)
- pip

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

## Disclaimer

This application is provided **for research and demonstration purposes only**.  
It is **not** intended for safety-critical, diagnostic, or clinical use.


## License

MIT License.


## Contributing

Contributions are welcome. Please open an issue or submit a pull request.
