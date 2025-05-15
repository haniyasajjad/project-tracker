# Project Tracker

A web application for tracking projects with paginated data fetching and real-time updates.

## Features

- REST API for fetching paginated project data from PostgreSQL.
- Real-time updates to the frontend when project data changes, using Socket.IO.
- Displays only changed projects in a dedicated section.
- Pagination controls for browsing projects.

## Technologies

**Backend:**
- Node.js
- Express.js
- PostgreSQL 16
- Socket.IO
- `pg` (PostgreSQL client)

**Frontend:**
- React
- Socket.IO Client
- Axios

**Environment:**
- macOS (tested with Homebrew)

## Prerequisites

- Node.js `22.7.0` (recommended via `nvm`)
- PostgreSQL `16` (installed via Homebrew)
- Git
- `npm` (comes with Node.js)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/haniyasajjad/project-tracker.git
cd project-tracker
```

### 2. Set Up PostgreSQL (for mac)

#### Install and start PostgreSQL 16:

```bash
brew install postgresql@16
brew services start postgresql@16
```

#### Create the `project_tracker` database:

```bash
psql postgres
CREATE DATABASE project_tracker;
```

#### Create the `projects` table:

```bash
psql -d project_tracker

CREATE TABLE projects (
    proid TEXT PRIMARY KEY,
    project_title TEXT,
    date_created TIMESTAMP,
    coid TEXT,
    creator_uid TEXT,
    creator_employee_id TEXT,
    project_type TEXT,
    archived BOOLEAN,
    status INTEGER
);
```

#### (Optional) Insert sample data:

```sql
INSERT INTO projects (proid, project_title, date_created, coid, creator_uid, creator_employee_id, project_type, archived, status)
VALUES
    ('proj1', 'Project Alpha', CURRENT_TIMESTAMP, 'co1', 'uid1', 'emp1', 'development', false, 1),
    ('proj2', 'Project Beta', CURRENT_TIMESTAMP, 'co2', 'uid2', 'emp2', 'research', false, 2);
```

#### Set up real-time notifications:

```sql
CREATE OR REPLACE FUNCTION notify_project_changes()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM pg_notify(
        'project_changes',
        json_build_object(
            'proid', NEW.proid,
            'project_title', NEW.project_title,
            'date_created', NEW.date_created,
            'coid', NEW.coid,
            'creator_uid', NEW.creator_uid,
            'creator_employee_id', NEW.creator_employee_id,
            'project_type', NEW.project_type,
            'archived', NEW.archived,
            'status', NEW.status
        )::text
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER project_update_trigger
AFTER INSERT OR UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION notify_project_changes();
```

### 3. Install Backend Dependencies

```bash
cd backend
npm install
```

### 4. Configure Backend

Update `backend/db/db.js` with your PostgreSQL credentials:

```js
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres', // or your custom user
    host: 'localhost',
    database: 'project_tracker',
    password: 'your_password', // Omit if no password
    port: 5432,
});

module.exports = pool;
```

### 5. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

## Running the Project

### Start the Backend:

```bash
cd backend
node server.js
```

> Runs on [http://localhost:3001](http://localhost:3001)

### Start the Frontend:

```bash
cd ../frontend
npm start
```

> Opens [http://localhost:3000](http://localhost:3000)

##  Testing Real-Time Updates

1. Open [http://localhost:3000](http://localhost:3000) in a browser.
2. Update a project using `psql`:

```sql
UPDATE projects
SET project_title = 'Project Alpha Updated', status = 3
WHERE proid = 'proj1';
```

3. The "Changed Projects" section should reflect the update in real-time.

##  Project Structure

```
project-tracker/
├── backend/
│   ├── db/
│   │   └── db.js
│   ├── routes/
│   │   └── projects.js
│   └── server.js
├── frontend/
│   └── src/
│       └── App.js
├── .gitignore
└── README.md
```

##  Troubleshooting

**PostgreSQL Connection Errors**
- Ensure PostgreSQL is running:  
  `brew services list`
- Double-check credentials in `db.js`.

**Node.js Version Issues**
- Use `nvm` to manage Node.js versions:

```bash
nvm install 22.7.0
nvm use 22.7
```

---


