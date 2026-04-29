# Game Shop

A full-stack web application for exploring and purchasing games, featuring user authentication, catalog browsing, and premium memberships.

## Technologies Used

### Frontend
* **Next.js** 
* **TypeScript**
* **Tailwind CSS**

### Backend
* **Django** & **Django REST Framework (DRF)**
* **PostgreSQL**
* **Redis**
* **Celery**

### Integrations
* **Stripe** (Payments & Subscriptions)

## Run Instructions

### Prerequisites
* Node.js and npm
* Python 3.10+
* PostgreSQL
* Redis (for Celery background tasks)

### Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # On Windows
# source venv/bin/activate     # On macOS/Linux
pip install -r requirements.txt

# Configure your environment variables
cp .env.example .env

# Run database migrations
python manage.py migrate
python manage.py createsuperuser

# Start the development server
python manage.py runserver
```

### Celery Workers (Optional, for async tasks)
Requires Redis running on `localhost:6379`.
```bash
# Terminal 2 - Celery worker
cd backend
venv\Scripts\activate
celery -A config.celery worker --loglevel=info

# Terminal 3 - Celery beat scheduler
cd backend
venv\Scripts\activate
celery -A config.celery beat --loglevel=info
```

### Frontend Setup
```bash
cd frontend
npm install

# Set up local environment variables
# Ensure your NEXT_PUBLIC_API_URL and Stripe keys are configured in .env.local

# Start the development server
npm run dev
```

## Screenshots

### Homepage
![Homepage](screenshots/homepage.png)

### Featured Games
![Featured Games](screenshots/featured_games.png)

### Browse by Genre & Premium Membership
![Browse by Genre and Premium Membership](screenshots/genres_and_premium.png)

### Register / Create Account
![Register](screenshots/register.png)

### Login
![Login](screenshots/login.png)
