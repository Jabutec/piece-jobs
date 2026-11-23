import os
import re

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict, Field
from supabase import create_client

load_dotenv()
supabase = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_KEY"])

app = FastAPI(title="Piece Jobs API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # we add the live site later
    allow_methods=["*"],
    allow_headers=["*"],
)


class JobIn(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    title: str = Field(min_length=1, max_length=60)
    description: str = Field(min_length=1, max_length=300)
    area: str = Field(min_length=1, max_length=40)
    pay: str = Field(min_length=1, max_length=20)
    when_text: str = Field(min_length=1, max_length=30)
    poster_name: str = Field(min_length=1, max_length=30)
    phone: str


def normalise_phone(raw: str) -> str | None:
    digits = re.sub(r"\D", "", raw)
    if digits.startswith("0"):
        digits = "27" + digits[1:]
    elif len(digits) == 9:
        digits = "27" + digits
    return digits if re.fullmatch(r"27\d{9}", digits) else None


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/jobs")
def list_jobs():
    res = (
        supabase.table("jobs")
        .select("*")
        .order("created_at", desc=True)
        .limit(100)
        .execute()
    )
    return res.data


@app.post("/jobs", status_code=201)
def create_job(job: JobIn):
    phone = normalise_phone(job.phone)
    if not phone:
        raise HTTPException(
            422, "Enter a valid South African number, like 082 123 4567."
        )
    data = job.model_dump()
    data["phone"] = phone
    res = supabase.table("jobs").insert(data).execute()
    return res.data[0]
