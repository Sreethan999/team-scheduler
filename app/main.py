from fastapi import FastAPI, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import engine, Base, get_db
from app import models, schemas, crud

from datetime import date as DateType
from typing import Optional

import app.models

from fastapi.middleware.cors import CORSMiddleware

# Create all database tables if they do not already exist
Base.metadata.create_all(bind=engine)

# Initialize the FastAPI application
app = FastAPI(
    title="Team Scheduler API",
    description="Team Call Scheduling System",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================================
# HOME
# ==========================================================

@app.get("/")
def home():

    return {
        "message": "Team Scheduler API is running successfully!"
    }

# ==========================================================
# MEMBER CRUD
# ==========================================================

# Create a new Team Member
@app.post(
    "/members",
    response_model=schemas.MemberResponse
)
def create_member(
    member: schemas.MemberCreate,
    db: Session = Depends(get_db)
):

    return crud.create_member(
        db,
        member
    )


# Retrieve all team members
@app.get(
    "/members",
    response_model=schemas.MemberPaginationResponse
)
def get_members(

    page: int = Query(1, ge=1),

    page_size: int = Query(10, ge=1, le=100),

    search: str = Query("", description="Search by name, email or department"),

    sort_by: str = Query(
        "id",
        pattern="^(id|name|email|department)$"
    ),

    order: str = Query(
        "asc",
        pattern="^(asc|desc)$"
    ),

    db: Session = Depends(get_db)

):

    return crud.get_members(

        db=db,

        page=page,

        page_size=page_size,

        search=search,

        sort_by=sort_by,

        order=order

    )


# Search team members
@app.get(
    "/members/search",
    response_model=list[schemas.MemberResponse]
)
def search_members(
    keyword: str,
    db: Session = Depends(get_db)
):

    return crud.search_members(
        db,
        keyword
    )


# Sort team members
@app.get(
    "/members/sort",
    response_model=list[schemas.MemberResponse]
)
def sort_members(
    sort_by: str = "id",
    order: str = "asc",
    db: Session = Depends(get_db)
):

    return crud.sort_members(
        db,
        sort_by,
        order
    )


# Paginate team members
@app.get(
    "/members/paginate",
    response_model=schemas.MemberPaginationResponse
)
def paginate_members(

    page: int = Query(1, ge=1),

    page_size: int = Query(10, ge=1, le=100),

    db: Session = Depends(get_db)

):

    return crud.paginate_members(

        db=db,

        page=page,

        page_size=page_size

    )


# Retrieve a member using their ID
@app.get(
    "/members/{member_id}",
    response_model=schemas.MemberResponse
)
def get_member(
    member_id: int,
    db: Session = Depends(get_db)
):

    member = crud.get_member(
        db,
        member_id
    )

    if member is None:

        raise HTTPException(
            status_code=404,
            detail="Member not found"
        )

    return member


# Update an existing member
@app.put(
    "/members/{member_id}",
    response_model=schemas.MemberResponse
)
def update_member(
    member_id: int,
    member: schemas.MemberUpdate,
    db: Session = Depends(get_db)
):

    updated_member = crud.update_member(
        db,
        member_id,
        member
    )

    if updated_member is None:

        raise HTTPException(
            status_code=404,
            detail="Member not found"
        )

    return updated_member


# Delete a member
@app.delete(
    "/members/{member_id}"
)
def delete_member(
    member_id: int,
    db: Session = Depends(get_db)
):

    deleted_member = crud.delete_member(
        db,
        member_id
    )

    if deleted_member is None:

        raise HTTPException(
            status_code=404,
            detail="Member not found"
        )

    return {
        "message": "Member deleted successfully"
    }

# ==========================================================
# AVAILABILITY CRUD
# ==========================================================

# Add a new availability record for a team member
@app.post(
    "/availability",
    response_model=schemas.AvailabilityResponse
)
def create_availability(
    availability: schemas.AvailabilityCreate,
    db: Session = Depends(get_db)
):

    return crud.create_availability(
        db,
        availability
    )


# Retrieve all availability records
# Retrieve all availability records
@app.get(
    "/availability",
    response_model=schemas.AvailabilityPaginationResponse
)
def get_availability(

    page: int = Query(1, ge=1),

    page_size: int = Query(10, ge=1, le=100),

    search: str = Query(
        "",
        description="Search by Member ID"
    ),

    sort_by: str = Query(
        "id",
        pattern="^(id|member_id|date|start_time|end_time)$"
    ),

    order: str = Query(
        "asc",
        pattern="^(asc|desc)$"
    ),

    db: Session = Depends(get_db)

):

    return crud.get_availability(

        db=db,

        page=page,

        page_size=page_size,

        search=search,

        sort_by=sort_by,

        order=order

    )

# Search availability
@app.get(
    "/availability/search",
    response_model=list[schemas.AvailabilityResponse]
)
def search_availability(
    keyword: str,
    db: Session = Depends(get_db)
):

    return crud.search_availability(
        db,
        keyword
    )

# Sort availability
@app.get(
    "/availability/sort",
    response_model=list[schemas.AvailabilityResponse]
)
def sort_availability(
    sort_by: str = "id",
    order: str = "asc",
    db: Session = Depends(get_db)
):

    return crud.sort_availability(
        db,
        sort_by,
        order
    )

# Paginate availability
@app.get(
    "/availability/paginate",
    response_model=schemas.AvailabilityPaginationResponse
)
def paginate_availability(

    page: int = Query(1, ge=1),

    page_size: int = Query(10, ge=1, le=100),

    db: Session = Depends(get_db)

):

    return crud.paginate_availability(

        db=db,

        page=page,

        page_size=page_size

    )



# Retrieve an availability record using its ID
@app.get(
    "/availability/{availability_id}",
    response_model=schemas.AvailabilityResponse
)
def get_availability_by_id(
    availability_id: int,
    db: Session = Depends(get_db)
):

    availability = crud.get_availability_by_id(
        db,
        availability_id
    )

    if availability is None:

        raise HTTPException(
            status_code=404,
            detail="Availability not found"
        )

    return availability


# Update an existing availability record
@app.put(
    "/availability/{availability_id}",
    response_model=schemas.AvailabilityResponse
)
def update_availability(
    availability_id: int,
    availability: schemas.AvailabilityUpdate,
    db: Session = Depends(get_db)
):

    updated = crud.update_availability(
        db,
        availability_id,
        availability
    )

    if updated is None:

        raise HTTPException(
            status_code=404,
            detail="Availability not found"
        )

    return updated


# Delete an availability record
@app.delete(
    "/availability/{availability_id}"
)
def delete_availability(
    availability_id: int,
    db: Session = Depends(get_db)
):

    deleted = crud.delete_availability(
        db,
        availability_id
    )

    if deleted is None:

        raise HTTPException(
            status_code=404,
            detail="Availability not found"
        )

    return {
        "message": "Availability deleted successfully"
    }

# ==========================================================
# MEETING CRUD
# ==========================================================

# Create a new meeting request
@app.post(
    "/meetings",
    response_model=schemas.MeetingResponse
)
def create_meeting(
    meeting: schemas.MeetingCreate,
    db: Session = Depends(get_db)
):

    return crud.create_meeting(
        db,
        meeting
    )


# Retrieve all meetings
@app.get(
    "/meetings",
    response_model=schemas.MeetingPaginationResponse
)
def get_meetings(

    page: int = Query(1, ge=1),

    page_size: int = Query(10, ge=1, le=100),

    search: str = Query(""),

    sort_by: str = Query(

        "id",

        pattern="^(id|title|duration|preferred_start_date|preferred_end_date|status)$"

    ),

    order: str = Query(

        "asc",

        pattern="^(asc|desc)$"

    ),

    db: Session = Depends(get_db)

):

    return crud.get_meetings(

        db=db,

        page=page,

        page_size=page_size,

        search=search,

        sort_by=sort_by,

        order=order

    )


# Search meetings
@app.get(
    "/meetings/search",
    response_model=list[schemas.MeetingResponse]
)
def search_meetings(
    keyword: str,
    db: Session = Depends(get_db)
):

    return crud.search_meetings(
        db,
        keyword
    )


# Sort meetings
@app.get(
    "/meetings/sort",
    response_model=list[schemas.MeetingResponse]
)
def sort_meetings(
    sort_by: str = "id",
    order: str = "asc",
    db: Session = Depends(get_db)
):

    return crud.sort_meetings(
        db,
        sort_by,
        order
    )


# Paginate meetings
@app.get(
    "/meetings/paginate",
    response_model=schemas.MeetingPaginationResponse
)
def paginate_meetings(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):

    return crud.paginate_meetings(
        db,
        page,
        page_size
    )


# Retrieve a meeting using its ID
@app.get(
    "/meetings/{meeting_id}",
    response_model=schemas.MeetingResponse
)
def get_meeting(
    meeting_id: int,
    db: Session = Depends(get_db)
):

    meeting = crud.get_meeting(
        db,
        meeting_id
    )

    if meeting is None:

        raise HTTPException(
            status_code=404,
            detail="Meeting not found"
        )

    return meeting


# Update an existing meeting
@app.put(
    "/meetings/{meeting_id}",
    response_model=schemas.MeetingResponse
)
def update_meeting(
    meeting_id: int,
    meeting: schemas.MeetingUpdate,
    db: Session = Depends(get_db)
):

    updated = crud.update_meeting(
        db,
        meeting_id,
        meeting
    )

    if updated is None:

        raise HTTPException(
            status_code=404,
            detail="Meeting not found"
        )

    return updated


# Delete a meeting
@app.delete(
    "/meetings/{meeting_id}"
)
def delete_meeting(
    meeting_id: int,
    db: Session = Depends(get_db)
):

    deleted = crud.delete_meeting(
        db,
        meeting_id
    )

    if deleted is None:

        raise HTTPException(
            status_code=404,
            detail="Meeting not found"
        )

    return {
        "message": "Meeting deleted successfully"
    }


# Update meeting status
@app.patch(
    "/meetings/{meeting_id}/status",
    response_model=schemas.MeetingResponse
)
def update_meeting_status(
    meeting_id: int,
    status: schemas.MeetingStatusUpdate,
    db: Session = Depends(get_db)
):

    meeting = crud.update_meeting_status(
        db,
        meeting_id,
        status
    )

    if meeting is None:

        raise HTTPException(
            status_code=404,
            detail="Meeting not found"
        )

    return meeting

# ==========================================================
# MEETING PARTICIPANT CRUD
# ==========================================================

# Add a participant to a meeting
@app.post(
    "/meeting-participants",
    response_model=schemas.MeetingParticipantResponse
)
def create_meeting_participant(
    participant: schemas.MeetingParticipantCreate,
    db: Session = Depends(get_db)
):

    participant_obj = crud.create_meeting_participant(
        db,
        participant
    )

    if participant_obj is None:

        raise HTTPException(
            status_code=400,
            detail="Participant already exists in this meeting."
        )

    return participant_obj


# Retrieve all meeting participants
@app.get(
    "/meeting-participants",
    response_model=list[schemas.MeetingParticipantResponse]
)
def get_meeting_participants(
    db: Session = Depends(get_db)
):

    return crud.get_meeting_participants(
        db
    )


# Retrieve one meeting participant using its ID
@app.get(
    "/meeting-participants/{participant_id}",
    response_model=schemas.MeetingParticipantResponse
)
def get_meeting_participant(
    participant_id: int,
    db: Session = Depends(get_db)
):

    participant = crud.get_meeting_participant(
        db,
        participant_id
    )

    if participant is None:

        raise HTTPException(
            status_code=404,
            detail="Participant not found"
        )

    return participant


# Remove a participant from a meeting
@app.delete(
    "/meeting-participants/{participant_id}"
)
def delete_meeting_participant(
    participant_id: int,
    db: Session = Depends(get_db)
):

    deleted = crud.delete_meeting_participant(
        db,
        participant_id
    )

    if deleted is None:

        raise HTTPException(
            status_code=404,
            detail="Participant not found"
        )

    return {
        "message": "Participant removed successfully"
    }


# ==========================================================
# SCHEDULED MEETING CRUD
# ==========================================================

# Create a scheduled meeting
@app.post(
    "/scheduled-meetings/create",
    response_model=schemas.ScheduleMeetingResponse
)
def create_scheduled_meeting(
    meeting: schemas.ScheduleMeetingCreate,
    db: Session = Depends(get_db)
):

    scheduled = crud.create_scheduled_meeting(
        db,
        meeting
    )

    if scheduled is None:

        raise HTTPException(
            status_code=400,
            detail="Unable to create scheduled meeting."
        )

    return scheduled


# Retrieve all scheduled meetings
# ==========================================================
# RETRIEVE SCHEDULED MEETINGS
# (Search + Sort + Pagination)
# ==========================================================

@app.get(
    "/scheduled-meetings",
    response_model=schemas.ScheduleMeetingPaginationResponse
)
def get_scheduled_meetings(

    page: int = Query(1, ge=1),

    page_size: int = Query(10, ge=1, le=100),

    search: str = Query(""),

    sort_by: str = Query(

        "id",

        pattern="^(id|scheduled_date|start_time|end_time|status)$"

    ),

    order: str = Query(

        "asc",

        pattern="^(asc|desc)$"

    ),

    db: Session = Depends(get_db)

):

    return crud.get_scheduled_meetings_paginated(

        db=db,

        page=page,

        page_size=page_size,

        search=search,

        sort_by=sort_by,

        order=order

    )


# Search scheduled meetings
@app.get(
    "/scheduled-meetings/search",
    response_model=list[schemas.ScheduleMeetingResponse]
)
def search_scheduled_meetings(
    keyword: str,
    db: Session = Depends(get_db)
):

    return crud.search_scheduled_meetings(
        db,
        keyword
    )


# Sort scheduled meetings
@app.get(
    "/scheduled-meetings/sort",
    response_model=list[schemas.ScheduleMeetingResponse]
)
def sort_scheduled_meetings(
    sort_by: str = "id",
    order: str = "asc",
    db: Session = Depends(get_db)
):

    return crud.sort_scheduled_meetings(
        db,
        sort_by,
        order
    )


# Paginate scheduled meetings
@app.get(
    "/scheduled-meetings/paginate",
    response_model=list[schemas.ScheduleMeetingResponse]
)
def paginate_scheduled_meetings(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):

    return crud.paginate_scheduled_meetings(
        db,
        page,
        page_size
    )


# Retrieve one scheduled meeting using its ID
@app.get(
    "/scheduled-meetings/{meeting_id}",
    response_model=schemas.ScheduleMeetingResponse
)
def get_scheduled_meeting(
    meeting_id: int,
    db: Session = Depends(get_db)
):

    meeting = crud.get_scheduled_meeting(
        db,
        meeting_id
    )

    if meeting is None:

        raise HTTPException(
            status_code=404,
            detail="Scheduled meeting not found"
        )

    return meeting

# Update a scheduled meeting
@app.put(
    "/scheduled-meetings/{meeting_id}",
    response_model=schemas.ScheduleMeetingResponse
)
def update_scheduled_meeting(
    meeting_id: int,
    meeting: schemas.ScheduleMeetingUpdate,
    db: Session = Depends(get_db)
):

    updated = crud.update_scheduled_meeting(
        db,
        meeting_id,
        meeting
    )

    if updated is None:

        raise HTTPException(
            status_code=404,
            detail="Scheduled meeting not found"
        )

    return updated


# Delete a scheduled meeting
@app.delete(
    "/scheduled-meetings/{meeting_id}"
)
def delete_scheduled_meeting(
    meeting_id: int,
    db: Session = Depends(get_db)
):

    deleted = crud.delete_scheduled_meeting(
        db,
        meeting_id
    )

    if deleted is None:

        raise HTTPException(
            status_code=404,
            detail="Scheduled meeting not found"
        )

    return {
        "message": "Scheduled meeting deleted successfully"
    }


# ==========================================================
# AUTOMATIC MEETING SCHEDULER
# ==========================================================

@app.post(
    "/meetings/{meeting_id}/schedule",
    response_model=schemas.ScheduleMeetingResponse
)
def schedule_meeting(
    meeting_id: int,
    db: Session = Depends(get_db)
):

    scheduled = crud.auto_schedule_meeting(
        db,
        meeting_id
    )

    if scheduled is None:

        raise HTTPException(
            status_code=404,
            detail="Meeting already scheduled or no common availability found."
        )

    return scheduled


# ==========================================================
# SCHEDULED MEETING FILTERING
# ==========================================================

@app.get(
    "/scheduled-meetings/filter",
    response_model=list[schemas.ScheduleMeetingResponse]
)
def get_scheduled_meetings(
    scheduled_date: Optional[DateType] = Query(None),
    member_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):

    return crud.get_scheduled_meetings(
        db=db,
        scheduled_date=scheduled_date,
        member_id=member_id,
        status=status
    )


# ==========================================================
# DASHBOARD STATISTICS
# ==========================================================

@app.get(
    "/dashboard/statistics",
    response_model=schemas.DashboardStatsResponse
)
def dashboard_statistics(
    db: Session = Depends(get_db)
):

    return crud.get_dashboard_statistics(
        db
    )

