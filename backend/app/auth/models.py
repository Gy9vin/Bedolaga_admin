from pydantic import BaseModel


class AdminUser(BaseModel):
    id: str
    roles: list[str] = []
