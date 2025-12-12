# Contributing to the Image Denoising Web Application

Thank you for your interest in contributing to this open‑source project.  
We welcome improvements, bug fixes, new denoising methods, documentation updates, and general enhancements.

This document outlines the guidelines for contributing to the project.

## How to Contribute

### 1. Fork the Repository

Click the **Fork** button on GitHub to create your own copy of the repository.

### 2. Clone Your Fork

```bash
git clone https://github.com/PaulOnyekwelu/image_denoiser.git
cd image_denoiser
```

### 3. Create a New Branch

```bash
git checkout -b feature/<your-feature-name>
```

Use descriptive names such as:

- `feature/add-wavelet-variant`
- `fix/cors-configuration`
- `docs/improve-readme`

### 4. Make Your Changes

- Ensure your code is clean and readable.
- Follow existing code style for consistency.
- Add comments where appropriate.
- Test your changes locally:

**Backend:**
```bash
cd backend
uvicorn main:app --reload
```

**Frontend:**
```bash
cd frontend
npm start
```

### 5. Commit Your Changes

```bash
git add .
git commit -m "Describe your changes clearly"
```

### 6. Push Your Branch

```bash
git push origin feature/your-feature-name
```

### 7. Submit a Pull Request (PR)

Go to GitHub → open a **Pull Request** from your branch.  
Please ensure your PR includes:

- A clear description of what the change does  
- Screenshots if UI-related  
- Tests or test instructions (if applicable)

Maintainers will review the request and may ask for revisions.

## Development Guidelines

### Code Style

- **Frontend:** React (Create React App), functional components preferred  
- **Backend:** FastAPI (Python), follow PEP 8 conventions  
- Use meaningful variable/function names  
- Keep functions small and focused  

### Documentation

If you add a feature, update:

- `README.md` (if users need to know about it)
- Comments in the code
- `CONTRIBUTING.md` if workflow changes are needed  

### Testing

Before submitting a PR, ensure:

- Backend routes behave correctly  
- Frontend UI does not break  
- CORS and API integration work in local development  


## Types of Contributions Welcome

- New denoising algorithms  
- Improved CDAE implementation  
- Performance optimizations  
- UI/UX improvements  
- Bug fixes  
- Documentation enhancements  
- Deployment improvements (Render/Vercel)  


## Code of Conduct

By participating, you agree to maintain a respectful, constructive tone.  
Harassment, discrimination, or unprofessional behavior will not be tolerated.


## Questions or Ideas?

Feel free to:

- Open an **Issue**  
- Start a **Discussion**  
- Submit a **Pull Request**  

Your contributions help grow and improve this project. Thank you for supporting open-source development.
