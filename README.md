## Prerequisites:

- Node.js 20.17.0 version installed
- MongoDB Community Server installed and running locally at mongodb://127.0.0.1:27017
- MongoDB Compass installed(optional GUI for checking data)

## Steps to getting the web app to run, all comments are in parenthesis.

These instructions are intended for Windows Command Prompt (CMD).

### Step1:open terminal in the folder designated for the project

### Step2:run these 2 commands:

```cmd
git clone https://github.com/Dareomer/groceryStore.git
cd groceryStore
```

(clones the repository and makes a local copy of it in your folder)

### Step3: run these commands:

```cmd
cd ./backend
npm install
cd ..
cd ./frontend
npm install
cd ..
cd ./backend
npm run seed
```

(installs the neccessary modules for the frontend and backend, aswell as running the script that populates the database)

### Step4:run this command and copy its output to the next command

```cmd
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

(whatever this outputs copy and replace with the part in the next command that says YOUR_SESSION_SECRET)

### Step5:set session secret and run backend

```cmd
set SESSION_SECRET=YOUR_GENERATED_SECRET
npm run dev
```

(after the = put the output of the above command in Step4,npm run dev starts the backend)

### Step6:running the frontend

Open 1 new terminal in the groceryStore folder,in your created folder

in the first terminal run these commands:

```cmd
cd ./frontend
npm start
```

(starts the frontend)

## Running tests:

For the frontend tests position the terminal directory to the groceryStore/frontend folder
and run this command:

```cmd
npm test -- --watch=false
```

For the backend tests position the terminal directory to the groceryStore/backend folder
and run this command:

```cmd
npm test
```

## Useful info:

There will be a credentials.txt file for the credentials for the users in the database to test functionalities.

Backend: http://localhost:4000  
Frontend: http://localhost:4200
