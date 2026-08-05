from fastapi import APIRouter, HTTPException
from backend.schemas import Order
from backend.data import ORDERS_DB

router = APIRouter(prefix="/api/orders", tags=["orders"])

@router.get("/{order_id}", response_model=Order)
def get_order(order_id: str):
    if order_id in ORDERS_DB:
        return ORDERS_DB[order_id]
    raise HTTPException(status_code=404, detail="Order not found")
