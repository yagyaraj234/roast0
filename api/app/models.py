from typing import Literal

from pydantic import BaseModel

Category = Literal["security", "reliability", "cost"]
Source = Literal["synthetic", "upload", "bfcl", "gaia", "live"]


class Finding(BaseModel):
    category: Category
    title: str
    detail: str
    severity: int


class Roast(BaseModel):
    id: str
    slug: str
    title: str
    source: Source
    score: int
    tier: str
    roast_line: str | None = None
    findings: list[Finding] = []
