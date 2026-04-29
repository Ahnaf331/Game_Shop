# Backend Setup

## Quick start (development)

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt

cp .env.example .env           # fill in your values

python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

## With Celery (async email/tasks)

```bash
# Terminal 2 — requires Redis running on localhost:6379
celery -A config.celery worker --loglevel=info

# Terminal 3 — beat scheduler (periodic tasks)
celery -A config.celery beat --loglevel=info
```

## API docs

Visit http://localhost:8000/api/docs/ for Swagger UI.

## Admin panel

Visit http://localhost:8000/admin/ after creating a superuser.

## Stripe webhooks (local testing)

Install Stripe CLI, then:
```bash
stripe listen --forward-to localhost:8000/api/webhook/stripe/
```
Copy the webhook signing secret into `.env` as `STRIPE_WEBHOOK_SECRET`.
