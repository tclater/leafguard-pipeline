from pydantic import BaseModel


class MetricsRead(BaseModel):
    total_pipeline: float
    avg_deal_size: float
    total_deals: int
    stagnant_deals: int
    conversion_rate: float
    closed_count: int
