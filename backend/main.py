from fastapi import FastAPI

app = FastAPI(title="Piece Jobs API")


@app.get("/health")
def health():
    return {"status": "ok"}
