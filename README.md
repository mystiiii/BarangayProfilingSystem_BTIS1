# Barangay Profiling System - Configuration Guide

## How to Configure the Project

Copy the environment template from the root into the `backend` folder:

```bash
cp .envcopy backend/.env
```

Open `backend/.env` and update the database details (e.g. MS SQL configuration variables, ports, credentials) as needed.

---

## How to Run the Program

We have provided quick startup scripts for macOS and Windows. 

- **macOS/Linux**: Double-click or run `./run.sh` from the root directory.
- **Windows**: Double-click or run `run.bat` from the root directory.

*Note: The startup scripts will automatically detect and install all necessary backend dependencies (`npm install`) on their first execution.*
