# Movement Tracker API

## Installation Instructions
To set up the movement tracker API on your local machine, follow these steps:

1. Install the necessary node packages:
run `npm install`

2. Start the server using nodemon:
run `nodemon`


## Cleanup Script Usage
The project includes a `cleanup.sh` script for maintaining the asset directories by deleting files older than 15 minutes. Use the following steps to utilize this script:

### 1. Make the Script Executable
Grant execution permissions to the `cleanup.sh` script with this one-time setup command:

run `chmod +x scripts/cleanup.sh`

This allows the script to be run as a program.

### 2. Running the Script
Execute the script directly from the root of your project without navigating to the `scripts` directory:

run `./scripts/cleanup.sh`

The script will automatically find and delete files older than 15 minutes in the specified directories.
