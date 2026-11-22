from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.workspace import Workspace
from app.models.intelligence import Simulation
from app.schemas.simulation import SimulationRequest, SimulationResponse
from app.api.deps import get_current_workspace
from app.financial_engine.simulation import execute_simulation

router = APIRouter(prefix="/simulations", tags=["What-If Simulations"])


@router.post("", response_model=SimulationResponse, status_code=status.HTTP_201_CREATED)
def run_what_if_simulation(
    req: SimulationRequest,
    workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_db),
):
    """Run a deterministic What-If simulation comparing baseline vs simulated cash trajectory."""
    sim = execute_simulation(
        db=db,
        workspace=workspace,
        title=req.title,
        scenario_type=req.scenario_type,
        parameters=req.parameters,
    )
    return SimulationResponse.model_validate(sim)


@router.get("", response_model=List[SimulationResponse])
def list_simulations(
    workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_db),
):
    """List historical simulation runs in this workspace."""
    sims = (
        db.query(Simulation)
        .filter(Simulation.workspace_id == workspace.id)
        .order_by(Simulation.created_at.desc())
        .all()
    )
    return [SimulationResponse.model_validate(s) for s in sims]


@router.get("/{simulation_id}", response_model=SimulationResponse)
def get_simulation(
    simulation_id: str,
    workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_db),
):
    """Retrieve detailed trajectory points and verdict for a specific simulation."""
    sim = (
        db.query(Simulation)
        .filter(Simulation.id == simulation_id, Simulation.workspace_id == workspace.id)
        .first()
    )
    if not sim:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Simulation not found.")
    return SimulationResponse.model_validate(sim)
