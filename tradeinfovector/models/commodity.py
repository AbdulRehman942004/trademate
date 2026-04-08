from typing import Annotated, Optional

from bson import ObjectId
from pydantic import BaseModel, BeforeValidator, ConfigDict, Field

# Coerces MongoDB's ObjectId to str transparently during validation
PyObjectId = Annotated[str, BeforeValidator(str)]


class ExportRule(BaseModel):
    rule: str
    authority: Optional[str] = None   # e.g. "WTO", "EU", "USITC"
    notes: Optional[str] = None


class CommodityModel(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,       # accept both 'id' and '_id'
        arbitrary_types_allowed=True,
    )

    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    hs_code: str = Field(..., description="Harmonized System code, e.g. '0101.21'")
    commodity_name: str
    description_vector: list[float] = Field(
        default_factory=list,
        description="Embedding vector for semantic search",
    )
    export_rules: list[ExportRule] = Field(default_factory=list)

    def to_mongo(self) -> dict:
        """Return a dict suitable for inserting into MongoDB (no 'id' key, uses '_id')."""
        data = self.model_dump(by_alias=True, exclude_none=True)
        if "_id" in data and data["_id"] is not None:
            data["_id"] = ObjectId(data["_id"])
        else:
            data.pop("_id", None)   # let MongoDB generate _id on insert
        return data


class CommodityResponse(CommodityModel):
    """Read model — always includes the resolved string id."""
    id: PyObjectId = Field(..., alias="_id")
