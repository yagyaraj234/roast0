# Roast0 API

FastAPI server, separate from the TanStack app. Mirrors the `roasts` table for external/API consumers.

## Run

```
cd api
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in Supabase + OpenAI keys
uvicorn app.main:app --reload --port 8000
```

## Test

```
pip install pytest httpx
pytest
```
