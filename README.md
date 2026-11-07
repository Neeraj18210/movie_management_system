# 🎬 Neeraj Movie Theatre - Ticket Management System (Full-Stack)

A complete, modern, responsive, and interactive **Neeraj Movie Theatre Ticket Management System** built with **HTML5, CSS3, JavaScript (ES6+), Node.js, Express.js**, and a real **MySQL** database managed via **MySQL Workbench**.

---

## 🌟 Key Highlights & Features

- **Real MySQL Database Integration**: Fully connected to a local MySQL server via `mysql2` connection pooling. No mock data or `localStorage` replacements.
- **Seat Concurrency & Transaction Safety**: MySQL transactions (`START TRANSACTION`, `FOR UPDATE`, `COMMIT`, `ROLLBACK`) prevent double-booking collisions when multiple customers attempt to reserve the same seats simultaneously.
- **Cinema-Themed Dark Design**: Sleek cinematic black background (`#0a0b0f`), vibrant red highlights (`#e50914`), and luxe gold accents (`#f5c518`) with glassmorphism and smooth animations.
- **Interactive Cinema Seat Grid**: Realistic curved screen, aisle division, visual color indicators (Available, Selected, Reserved), real-time seat counter, and dynamic price calculation.
- **Full Booking Lifecycle**: Browse movies &rarr; Pick theatre & showtime &rarr; Choose seats &rarr; Transactional confirmation &rarr; Digital QR Pass &rarr; Booking cancellation (frees up seats).
- **Comprehensive Admin Control Panel**:
  - Add, edit, and delete movies (instant live updates on frontend).
  - Add, edit, and delete theatres and seating capacities.
  - Schedule new movie shows with custom dates, timings, and prices.
  - View all registered customers and their spending history.
  - View all customer ticket bookings and monitor live box-office revenue.
- **Role-Based Authentication**: Secure registration and login using **bcrypt** password hashing and **JWT** session tokens. Admin routes and dashboard are strictly protected.

---

## 📁 Project Architecture

```
movie-ticket-management/
│
├── public/
│   ├── css/
│   │   └── style.css                 # Comprehensive cinema theme styles & responsive rules
│   ├── js/
│   │   ├── api.js                    # Unified API client, JWT manager & toast notifications
│   │   ├── navbar.js                 # Dynamic sticky navbar with user session state & footer
│   │   ├── home.js                   # Homepage banner, filter, and movie grid logic
│   │   ├── movies.js                 # Catalog filtering, search, and sorting
│   │   ├── movie-details.js          # Full movie synopsis & grouped theatre showtimes
│   │   ├── theatres.js               # Theatres grid with location and capacity
│   │   ├── shows.js                  # Showtimings with movie & theatre filters
│   │   ├── seats.js                  # Interactive cinema seating layout & selection
│   │   ├── confirmation.js           # Order review, transactional booking & digital ticket
│   │   ├── my-bookings.js            # Customer booking history & cancellation
│   │   ├── auth.js                   # Login, registration & quick demo account fillers
│   │   ├── admin.js                  # Admin dashboard statistics, CRUD modals & controls
│   │   └── script.js                 # Global utilities & smooth interactions
│   ├── images/                       # Graphical assets and posters
│   └── pages/
│       ├── index.html                # Page 1: Home Page
│       ├── movies.html               # Page 2: Movies Catalog
│       ├── movie-details.html        # Page 3: Movie Details
│       ├── theatres.html             # Page 4: Theatres Page
│       ├── shows.html                # Page 5: Show Timings Page
│       ├── seats.html                # Page 6: Seat Selection Page
│       ├── confirmation.html         # Page 7: Booking Confirmation Page
│       ├── my-bookings.html          # Page 8: My Bookings Page
│       ├── login.html                # Page 9: Login Page
│       ├── register.html             # Page 9: Customer Registration Page
│       └── admin.html                # Page 10: Admin Dashboard
│
├── config/
│   └── db.js                         # MySQL connection pool configuration
├── controllers/
│   ├── userController.js             # Auth, profile, and customer queries
│   ├── movieController.js            # Movie CRUD and search queries
│   ├── theatreController.js          # Theatre CRUD queries
│   ├── showController.js             # Show schedule and seat queries
│   ├── bookingController.js          # Transactional booking & cancellation
│   └── adminController.js            # Admin KPI dashboard statistics
├── middleware/
│   └── authMiddleware.js             # JWT verification & Admin RBAC guard
├── routes/
│   ├── userRoutes.js                 # /api/users
│   ├── movieRoutes.js                # /api/movies
│   ├── theatreRoutes.js              # /api/theatres
│   ├── showRoutes.js                 # /api/shows
│   ├── bookingRoutes.js              # /api/bookings
│   └── adminRoutes.js                # /api/admin
├── database.sql                      # Complete MySQL database creation & sample data script
├── server.js                         # Express server entry point & clean page routing
├── .env                              # Active environment variables
├── .env.example                      # Template environment variables
├── package.json                      # Project metadata & dependencies
└── README.md                         # Setup and execution guide
```

---

## 🗄️ MySQL Database Setup in MySQL Workbench

### 1. Database Connection Specifications
The backend connects using the following credentials specified in `.env`:
- **Host**: `localhost`
- **Port**: `3306`
- **Username**: `root`
- **Password**: `root`
- **Database Name**: `movie_ticket_management`

### 2. Importing `database.sql`
1. Open **MySQL Workbench**.
2. Connect to your local MySQL instance (`localhost:3306`).
3. Click on **File** &rarr; **Open SQL Script...** (or press `Ctrl + Shift + O`).
4. Select the `database.sql` file located in the project root:
   ```
   movie-ticket-management/database.sql
   ```
5. Click the **Execute (Lightning Bolt ⚡)** button to run the entire script.
6. In the Navigator tab on the left, right-click and choose **Refresh All**. You will see the database `movie_ticket_management` containing all 6 tables:
   - `users`
   - `movies`
   - `theatres`
   - `shows`
   - `bookings`
   - `booking_seats`
7. The script automatically populates rich sample data (8 movies, 5 theatres, 18 scheduled shows, pre-booked seats, and sample user accounts).

---

## 🚀 Running the Project in VS Code / Terminal

### Step 1: Open the Project in VS Code
Open VS Code, select **File &rarr; Open Folder...**, and navigate to:
```
C:\Users\chenn\.gemini\antigravity\scratch\movie-ticket-management
```

### Step 2: Install Node.js Dependencies
Open the VS Code Terminal (`Ctrl + \`` or **Terminal &rarr; New Terminal**) and execute:
```bash
npm install
```

### Step 3: Verify Environment Configuration
Check that `.env` contains:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=movie_ticket_management
DB_PORT=3306
JWT_SECRET=cinemax_super_secret_jwt_token_key_2026_987654321
```
*(If your MySQL `root` user uses a different password, update `DB_PASSWORD` accordingly).*

### Step 4: Start the Server
Start the Express server with:
```bash
npm start
```
You should see:
```
=======================================================
🎬 Neeraj Movie Theatre - Ticket Management System Server is Running!
📡 URL: http://localhost:5000
🗄️  Database: MySQL (movie_ticket_management)
✅ MySQL Connected Successfully to database: movie_ticket_management
=======================================================
```

### Step 5: Open in Your Web Browser
Navigate to:
```
http://localhost:5000
```
or open `http://localhost:5000/pages/index.html`.

---

## 👥 Seed Test Accounts

You can test all functionalities right away using the pre-seeded accounts or register your own customer account:

| Account Type | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@neerajtheatre.com` | `Admin@123` | Full access to Admin Dashboard, CRUD movies, theatres, shows, and revenue |
| **Backup Admin** | `admin@cinemax.com` | `Admin@123` | Backup Administrator account |
| **Customer 1** | `john@example.com` | `Password@123` | Book tickets, view reservations, cancel bookings |
| **Customer 2** | `sarah@example.com` | `Password@123` | Pre-existing reservations on the seat layout |

> 💡 **Quick Demo Feature**: On the Login page (`/pages/login.html`), click the **"Customer Demo"** or **"Admin Demo"** buttons to auto-populate the test credentials with a single click.

---

## 🌐 Complete REST API Reference

### 🔐 Authentication & Users (`/api/users`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/users/register` | Public | Register a new customer account |
| `POST` | `/api/users/login` | Public | Sign in and receive JWT token |
| `GET` | `/api/users/profile` | Authenticated | Retrieve current user profile |
| `GET` | `/api/users/customers` | Admin Only | Get all registered customers and spending |

### 🎬 Movies (`/api/movies`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/movies` | Public | Get all movies (supports `?search=`, `?genre=`, `?language=`) |
| `GET` | `/api/movies/:id` | Public | Get single movie details and its scheduled shows |
| `POST` | `/api/movies` | Admin Only | Add a new movie to MySQL |
| `PUT` | `/api/movies/:id` | Admin Only | Update existing movie details |
| `DELETE` | `/api/movies/:id` | Admin Only | Delete a movie and cascade shows |

### 🏛️ Theatres (`/api/theatres`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/theatres` | Public | Get all theatres with active show counts |
| `GET` | `/api/theatres/:id` | Public | Get single theatre details and shows |
| `POST` | `/api/theatres` | Admin Only | Create a new cinema theatre |
| `PUT` | `/api/theatres/:id` | Admin Only | Update theatre details |
| `DELETE` | `/api/theatres/:id` | Admin Only | Delete a theatre |

### ⏰ Shows & Timings (`/api/shows`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/shows` | Public | Get scheduled shows (supports `?movie_id=`, `?theatre_id=`, `?date=`) |
| `GET` | `/api/shows/:id` | Public | Get show details with booked seats list |
| `GET` | `/api/shows/:id/seats`| Public | Get reserved seat numbers for a show |
| `POST` | `/api/shows` | Admin Only | Schedule a new show in MySQL |
| `PUT` | `/api/shows/:id` | Admin Only | Update show date, time, or ticket price |
| `DELETE` | `/api/shows/:id` | Admin Only | Remove a scheduled show |

### 🎟️ Bookings (`/api/bookings`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/bookings` | Authenticated | **Transactional ticket booking** (checks seat collisions & creates reservation) |
| `GET` | `/api/bookings/my-bookings`| Authenticated | Get current user's personal booking history |
| `GET` | `/api/bookings/:id` | Authenticated | Get booking details by ID or reference |
| `PUT` | `/api/bookings/:id/cancel`| Authenticated | Cancel booking & release reserved seats |
| `GET` | `/api/bookings` | Admin Only | View all ticket bookings across all customers |

### 📊 Admin Overview (`/api/admin`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/stats` | Admin Only | Aggregated KPI stats (movies, theatres, shows, revenue, sales) |

---

## 🛡️ Database Concurrency & Double-Booking Prevention

When confirming a reservation, the system invokes a dedicated database transaction:
```sql
START TRANSACTION;

-- 1. Lock show row and check validity
SELECT ticket_price FROM shows WHERE show_id = ? FOR UPDATE;

-- 2. Concurrency verification for requested seats
SELECT bs.seat_number 
FROM booking_seats bs
JOIN bookings b ON bs.booking_id = b.booking_id
WHERE bs.show_id = ? AND bs.seat_number IN (?) AND b.booking_status = 'CONFIRMED'
FOR UPDATE;

-- 3. If any seat is taken:
-- ROLLBACK; Return HTTP 409 Conflict

-- 4. Otherwise:
INSERT INTO bookings (booking_reference, user_id, show_id, seats, total_amount, booking_status) VALUES (...);
INSERT INTO booking_seats (booking_id, show_id, seat_number) VALUES (...);

COMMIT;
```
This guarantees absolute data integrity in high-traffic cinema booking scenarios.

---

## 🖥️ Responsive Page Previews

- **Desktop**: Full multi-column grids, interactive wide cinema auditorium screen, and tabbed admin control center.
- **Tablet**: Adaptive layout with horizontal scrolling tables and responsive search cards.
- **Mobile**: Collapsible hamburger navigation, touch-friendly seat buttons, and stacked ticket cards.

---

© 2026 Neeraj Movie Theatre. Built with Node.js, Express, and MySQL.
