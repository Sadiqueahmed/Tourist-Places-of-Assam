# 🚀 Dynamic Website Conversion - TODO List

## Project: Tourist Places of Assam - Dynamic Website
**Tech Stack:** Node.js + Express + Supabase (PostgreSQL) + EJS

---

## Phase 1: Setup & Configuration ⏳

### 1.1 Initialize Node.js Project
- [ ] Create `package.json` with dependencies
- [ ] Install Express, EJS, Supabase client, bcrypt, JWT, multer
- [ ] Setup project folder structure
- [ ] Create `.env` file for environment variables
- [ ] Create `.gitignore` file

### 1.2 Supabase Setup
- [ ] Create Supabase project
- [ ] Setup database tables (schema)
- [ ] Configure authentication
- [ ] Setup storage buckets for images
- [ ] Configure Row Level Security (RLS) policies
- [ ] Get API keys and add to `.env`

### 1.3 Database Schema Creation
- [ ] Create `users` table
- [ ] Create `places` table
- [ ] Create `events` table
- [ ] Create `products` table
- [ ] Create `reviews` table
- [ ] Create `categories` table
- [ ] Create `adventures` table

---

## Phase 2: Backend Development ⏳

### 2.1 Project Structure
```
backend/
├── config/
│   └── supabase.js
├── controllers/
│   ├── authController.js
│   ├── placeController.js
│   ├── eventController.js
│   ├── productController.js
│   ├── reviewController.js
│   └── adminController.js
├── middleware/
│   ├── auth.js
│   ├── upload.js
│   └── errorHandler.js
├── models/
│   └── (Supabase queries)
├── routes/
│   ├── auth.js
│   ├── places.js
│   ├── events.js
│   ├── products.js
│   ├── reviews.js
│   └── admin.js
├── views/
│   ├── layouts/
│   ├── partials/
│   └── pages/
├── public/
│   ├── css/
│   ├── js/
│   └── uploads/
└── server.js
```

### 2.2 Core Backend Files
- [ ] Create `server.js` - Express app setup
- [ ] Create `config/supabase.js` - Database connection
- [ ] Create middleware files
- [ ] Create route files
- [ ] Create controller files

### 2.3 Authentication System
- [ ] User registration API
- [ ] User login API
- [ ] JWT token generation
- [ ] Password hashing with bcrypt
- [ ] Protected route middleware
- [ ] Role-based access control (User/Admin)

### 2.4 CRUD APIs
- [ ] Places CRUD (Create, Read, Update, Delete)
- [ ] Events CRUD
- [ ] Products CRUD
- [ ] Reviews CRUD
- [ ] Adventures CRUD
- [ ] Image upload handling

---

## Phase 3: Frontend Conversion ⏳

### 3.1 Template Setup
- [ ] Convert `index.html` to `views/index.ejs`
- [ ] Convert `adventure.html` to `views/adventure.ejs`
- [ ] Convert `discover.html` to `views/discover.ejs`
- [ ] Convert `events.html` to `views/events.ejs`
- [ ] Convert `products.html` to `views/products.ejs`
- [ ] Convert `about us.html` to `views/about.ejs`
- [ ] Convert `login.html` to `views/login.ejs`
- [ ] Convert `signup.html` to `views/signup.ejs`

### 3.2 Layout & Partials
- [ ] Create `views/layouts/main.ejs` - Main layout
- [ ] Create `views/partials/header.ejs` - Navigation
- [ ] Create `views/partials/footer.ejs` - Footer
- [ ] Create `views/partials/head.ejs` - Common head content
- [ ] Create `views/partials/scripts.ejs` - Common scripts

### 3.3 Admin Dashboard
- [ ] Create `views/admin/dashboard.ejs`
- [ ] Create `views/admin/places.ejs` - Manage places
- [ ] Create `views/admin/events.ejs` - Manage events
- [ ] Create `views/admin/products.ejs` - Manage products
- [ ] Create `views/admin/reviews.ejs` - Manage reviews
- [ ] Create `views/admin/users.ejs` - Manage users

### 3.4 Dynamic Components
- [ ] Dynamic hero slider (from database)
- [ ] Dynamic popular places cards
- [ ] Dynamic events section
- [ ] Dynamic products slider
- [ ] Dynamic reviews section
- [ ] Search functionality
- [ ] Filter by category

---

## Phase 4: Data Migration ⏳

### 4.1 Extract Existing Content
- [ ] Extract all places from `locations details/`
- [ ] Extract events from `events.html`
- [ ] Extract products from `products.html`
- [ ] Extract adventures from `adventure.html`

### 4.2 Migration Script
- [ ] Create migration script
- [ ] Upload images to Supabase Storage
- [ ] Insert data into database tables
- [ ] Verify data integrity

---

## Phase 5: Features Implementation ⏳

### 5.1 User Features
- [ ] User registration page
- [ ] User login page
- [ ] User profile page
- [ ] User dashboard
- [ ] Wishlist/Favorites functionality
- [ ] User reviews submission

### 5.2 Search & Filter
- [ ] Search places by name
- [ ] Filter by category (Wildlife, Hill Stations, Holy Places)
- [ ] Filter by location
- [ ] Sort by rating, popularity

### 5.3 Reviews & Ratings
- [ ] Display reviews on place pages
- [ ] Submit review form
- [ ] Star rating system
- [ ] Average rating calculation

### 5.4 External APIs
- [ ] Weather API integration
- [ ] Google Maps integration
- [ ] Real-time updates

---

## Phase 6: Testing & Optimization ⏳

### 6.1 Testing
- [ ] Test all CRUD operations
- [ ] Test authentication flow
- [ ] Test image uploads
- [ ] Test responsive design
- [ ] Cross-browser testing

### 6.2 Performance
- [ ] Optimize images
- [ ] Implement caching
- [ ] Lazy loading for images
- [ ] Database query optimization

### 6.3 Security
- [ ] Input validation
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF protection
- [ ] Secure headers

---

## Phase 7: Deployment ⏳

### 7.1 Production Setup
- [ ] Environment variables configuration
- [ ] Database production settings
- [ ] Error handling and logging

### 7.2 Deployment
- [ ] Deploy backend to Render/Vercel
- [ ] Configure Supabase production
- [ ] Setup custom domain (optional)
- [ ] SSL certificate

### 7.3 Documentation
- [ ] API documentation
- [ ] Admin user guide
- [ ] Deployment guide

---

## Progress Tracking

**Current Phase:** Phase 1 - Setup & Configuration
**Status:** ⏳ In Progress
**Started:** [Date]
**Estimated Completion:** 10-14 days

---

## Notes
- Keep existing design and styling
- Use Supabase for database, auth, and storage
- Migrate all existing content to database
- Make all sections dynamic and manageable via admin panel

