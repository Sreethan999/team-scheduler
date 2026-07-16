from sqlalchemy.orm import Session
from sqlalchemy import asc, desc, or_
from sqlalchemy import String
from app import models, schemas
from app.scheduler import find_best_slot

# ==========================================================
# MEMBER CRUD
# ==========================================================

# Create a new team member
def create_member(
    db: Session,
    member: schemas.MemberCreate
):

    db_member = models.TeamMember(
        name=member.name,
        email=member.email,
        department=member.department
    )

    db.add(db_member)

    db.commit()

    db.refresh(db_member)

    return db_member


# ==========================================================
# GET MEMBERS
# Search + Sort + Pagination
# ==========================================================

def get_members(
    db: Session,
    page: int = 1,
    page_size: int = 10,
    search: str = "",
    sort_by: str = "id",
    order: str = "asc"
):

    query = db.query(models.TeamMember)

    # -------------------------
    # SEARCH
    # -------------------------

    if search:

        query = query.filter(

            or_(

                models.TeamMember.name.ilike(
                    f"%{search}%"
                ),

                models.TeamMember.email.ilike(
                    f"%{search}%"
                ),

                models.TeamMember.department.ilike(
                    f"%{search}%"
                )

            )

        )

    # -------------------------
    # SORT
    # -------------------------

    allowed_columns = {

        "id": models.TeamMember.id,

        "name": models.TeamMember.name,

        "email": models.TeamMember.email,

        "department": models.TeamMember.department

    }

    column = allowed_columns.get(
        sort_by,
        models.TeamMember.id
    )

    if order.lower() == "desc":

        query = query.order_by(
            desc(column)
        )

    else:

        query = query.order_by(
            asc(column)
        )

    total = query.count()

    members = (

        query

        .offset(
            (page - 1) * page_size
        )

        .limit(page_size)

        .all()

    )

    return {

        "items": members,

        "total": total,

        "page": page,

        "page_size": page_size

    }


# ==========================================================
# SEARCH MEMBERS
# ==========================================================

def search_members(
    db: Session,
    keyword: str
):

    return (

        db.query(models.TeamMember)

        .filter(

            or_(

                models.TeamMember.name.ilike(
                    f"%{keyword}%"
                ),

                models.TeamMember.email.ilike(
                    f"%{keyword}%"
                ),

                models.TeamMember.department.ilike(
                    f"%{keyword}%"
                )

            )

        )

        .all()

    )


# ==========================================================
# SORT MEMBERS
# ==========================================================

def sort_members(
    db: Session,
    sort_by: str = "id",
    order: str = "asc"
):

    allowed_columns = {

        "id": models.TeamMember.id,

        "name": models.TeamMember.name,

        "email": models.TeamMember.email,

        "department": models.TeamMember.department

    }

    column = allowed_columns.get(
        sort_by,
        models.TeamMember.id
    )

    if order.lower() == "desc":

        return (

            db.query(models.TeamMember)

            .order_by(
                desc(column)
            )

            .all()

        )

    return (

        db.query(models.TeamMember)

        .order_by(
            asc(column)
        )

        .all()

    )


# ==========================================================
# PAGINATE MEMBERS
# ==========================================================

def paginate_members(
    db: Session,
    page: int = 1,
    page_size: int = 10
):

    query = db.query(models.TeamMember)

    total = query.count()

    members = (

        query

        .offset(
            (page - 1) * page_size
        )

        .limit(page_size)

        .all()

    )

    return {

        "items": members,

        "total": total,

        "page": page,

        "page_size": page_size

    }


# ==========================================================
# RETRIEVE MEMBER BY ID
# ==========================================================

def get_member(
    db: Session,
    member_id: int
):

    return (

        db.query(models.TeamMember)

        .filter(
            models.TeamMember.id == member_id
        )

        .first()

    )


# ==========================================================
# UPDATE MEMBER
# ==========================================================

def update_member(
    db: Session,
    member_id: int,
    member: schemas.MemberUpdate
):

    db_member = get_member(
        db,
        member_id
    )

    if db_member is None:

        return None

    update_data = member.model_dump(
        exclude_unset=True
    )

    for key, value in update_data.items():

        setattr(
            db_member,
            key,
            value
        )

    db.commit()

    db.refresh(db_member)

    return db_member


# ==========================================================
# DELETE MEMBER
# ==========================================================

def delete_member(
    db: Session,
    member_id: int
):

    db_member = get_member(
        db,
        member_id
    )

    if db_member is None:

        return None

    # Delete member availability
    db.query(models.Availability).filter(
        models.Availability.member_id == member_id
    ).delete()

    # Delete meeting participant records
    db.query(models.MeetingParticipant).filter(
        models.MeetingParticipant.member_id == member_id
    ).delete()

    # Delete the member
    db.delete(db_member)

    db.commit()

    return db_member

# ==========================================================
# AVAILABILITY CRUD
# ==========================================================

# Create availability
def create_availability(
    db: Session,
    availability: schemas.AvailabilityCreate
):

    db_availability = models.Availability(

        member_id=availability.member_id,

        date=availability.date,

        start_time=availability.start_time,

        end_time=availability.end_time

    )

    db.add(db_availability)

    db.commit()

    db.refresh(db_availability)

    return db_availability


# ==========================================================
# GET AVAILABILITY
# (SEARCH + SORT + PAGINATION)
# ==========================================================

def get_availability(

    db: Session,

    page: int = 1,

    page_size: int = 10,

    search: str = "",

    sort_by: str = "id",

    order: str = "asc"

):

    query = db.query(

        models.Availability

    )

    # ----------------------------
    # SEARCH
    # ----------------------------

    if search:

        query = query.filter(

            models.Availability.member_id.cast(String).ilike(

                f"%{search}%"

            )

        )

    # ----------------------------
    # SORT
    # ----------------------------

    sort_column = getattr(

        models.Availability,

        sort_by,

        models.Availability.id

    )

    if order.lower() == "desc":

        query = query.order_by(

            sort_column.desc()

        )

    else:

        query = query.order_by(

            sort_column.asc()

        )

    # ----------------------------
    # PAGINATION
    # ----------------------------

    total = query.count()

    items = (

        query

        .offset(

            (page - 1) * page_size

        )

        .limit(

            page_size

        )

        .all()

    )

    return {

        "items": items,

        "total": total,

        "page": page,

        "page_size": page_size

    }

# ==========================================================
# SEARCH AVAILABILITY
# ==========================================================

def search_availability(
    db: Session,
    keyword: str
):

    return (

        db.query(

            models.Availability

        )

        .filter(

            models.Availability.member_id.cast(

                String

            ).ilike(

                f"%{keyword}%"

            )

        )

        .all()

    )

# ==========================================================
# SORT AVAILABILITY
# ==========================================================

def sort_availability(
    db: Session,
    sort_by: str,
    order: str
):

    sort_column = getattr(

        models.Availability,

        sort_by,

        models.Availability.id

    )

    if order.lower() == "desc":

        return (

            db.query(

                models.Availability

            )

            .order_by(

                sort_column.desc()

            )

            .all()

        )

    return (

        db.query(

            models.Availability

        )

        .order_by(

            sort_column.asc()

        )

        .all()

    )

# ==========================================================
# PAGINATE AVAILABILITY
# ==========================================================

def paginate_availability(

    db: Session,

    page: int,

    page_size: int

):

    query = db.query(

        models.Availability

    )

    total = query.count()

    items = (

        query

        .offset(

            (page - 1) * page_size

        )

        .limit(

            page_size

        )

        .all()

    )

    return {

        "items": items,

        "total": total,

        "page": page,

        "page_size": page_size

    }


# ==========================================================
# GET AVAILABILITY BY ID
# ==========================================================

def get_availability_by_id(
    db: Session,
    availability_id: int
):

    return (

        db.query(
            models.Availability
        )

        .filter(
            models.Availability.id == availability_id
        )

        .first()

    )


# ==========================================================
# UPDATE AVAILABILITY
# ==========================================================

def update_availability(
    db: Session,
    availability_id: int,
    availability: schemas.AvailabilityUpdate
):

    db_availability = get_availability_by_id(
        db,
        availability_id
    )

    if db_availability is None:

        return None

    update_data = availability.model_dump(
        exclude_unset=True
    )

    for key, value in update_data.items():

        setattr(
            db_availability,
            key,
            value
        )

    db.commit()

    db.refresh(db_availability)

    return db_availability


# ==========================================================
# DELETE AVAILABILITY
# ==========================================================

def delete_availability(
    db: Session,
    availability_id: int
):

    db_availability = get_availability_by_id(
        db,
        availability_id
    )

    if db_availability is None:

        return None

    db.delete(
        db_availability
    )

    db.commit()

    return db_availability

# ==========================================================
# MEETING CRUD
# ==========================================================

# Create a new meeting request
def create_meeting(
    db: Session,
    meeting: schemas.MeetingCreate
):

    db_meeting = models.MeetingRequest(
        title=meeting.title,
        duration=meeting.duration,
        preferred_start_date=meeting.preferred_start_date,
        preferred_end_date=meeting.preferred_end_date
    )

    db.add(db_meeting)

    db.commit()

    db.refresh(db_meeting)

    return db_meeting


# ==========================================================
# GET MEETINGS
# (SEARCH + SORT + PAGINATION)
# ==========================================================

def get_meetings(

    db: Session,

    page: int = 1,

    page_size: int = 10,

    search: str = "",

    sort_by: str = "id",

    order: str = "asc"

):

    query = db.query(

        models.MeetingRequest

    )

    # ----------------------------
    # SEARCH
    # ----------------------------

    if search:

        query = query.filter(

            models.MeetingRequest.title.ilike(

                f"%{search}%"

            )

        )

    # ----------------------------
    # SORT
    # ----------------------------

    sort_column = getattr(

        models.MeetingRequest,

        sort_by,

        models.MeetingRequest.id

    )

    if order.lower() == "desc":

        query = query.order_by(

            sort_column.desc()

        )

    else:

        query = query.order_by(

            sort_column.asc()

        )

    # ----------------------------
    # PAGINATION
    # ----------------------------

    total = query.count()

    items = (

        query

        .offset(

            (page - 1) * page_size

        )

        .limit(

            page_size

        )

        .all()

    )

    return {

        "items": items,

        "total": total,

        "page": page,

        "page_size": page_size

    }


# ==========================================================
# GET MEETING BY ID
# ==========================================================

def get_meeting(
    db: Session,
    meeting_id: int
):

    return (

        db.query(
            models.MeetingRequest
        )

        .filter(
            models.MeetingRequest.id == meeting_id
        )

        .first()

    )


# ==========================================================
# UPDATE MEETING
# ==========================================================

def update_meeting(
    db: Session,
    meeting_id: int,
    meeting: schemas.MeetingUpdate
):

    db_meeting = get_meeting(
        db,
        meeting_id
    )

    if db_meeting is None:

        return None

    update_data = meeting.model_dump(
        exclude_unset=True
    )

    for key, value in update_data.items():

        setattr(
            db_meeting,
            key,
            value
        )

    db.commit()

    db.refresh(db_meeting)

    return db_meeting


# ==========================================================
# DELETE MEETING
# ==========================================================

def delete_meeting(
    db: Session,
    meeting_id: int
):

    db_meeting = get_meeting(
        db,
        meeting_id
    )

    if db_meeting is None:

        return None

    db.delete(db_meeting)

    db.commit()

    return db_meeting


# ==========================================================
# UPDATE MEETING STATUS
# ==========================================================

def update_meeting_status(
    db: Session,
    meeting_id: int,
    status_update: schemas.MeetingStatusUpdate
):

    meeting = get_meeting(
        db,
        meeting_id
    )

    if meeting is None:

        return None

    meeting.status = status_update.status

    db.commit()

    db.refresh(meeting)

    return meeting


# ==========================================================
# SEARCH MEETINGS
# ==========================================================

def search_meetings(
    db: Session,
    keyword: str
):

    return (

        db.query(models.MeetingRequest)

        .filter(

            or_(

                models.MeetingRequest.title.ilike(
                    f"%{keyword}%"
                ),

                models.MeetingRequest.status.ilike(
                    f"%{keyword}%"
                )

            )

        )

        .all()

    )


# ==========================================================
# SORT MEETINGS
# ==========================================================

def sort_meetings(
    db: Session,
    sort_by: str = "id",
    order: str = "asc"
):

    allowed_columns = {

        "id": models.MeetingRequest.id,

        "title": models.MeetingRequest.title,

        "duration": models.MeetingRequest.duration,

        "preferred_start_date": models.MeetingRequest.preferred_start_date,

        "preferred_end_date": models.MeetingRequest.preferred_end_date,

        "status": models.MeetingRequest.status

    }

    column = allowed_columns.get(
        sort_by,
        models.MeetingRequest.id
    )

    if order.lower() == "desc":

        return (

            db.query(models.MeetingRequest)

            .order_by(
                desc(column)
            )

            .all()

        )

    return (

        db.query(models.MeetingRequest)

        .order_by(
            asc(column)
        )

        .all()

    )


# ==========================================================
# PAGINATE MEETINGS
# ==========================================================

def paginate_meetings(
    db: Session,
    page: int = 1,
    page_size: int = 10
):

    query = db.query(
        models.MeetingRequest
    )

    total = query.count()

    meetings = (

        query

        .offset(
            (page - 1) * page_size
        )

        .limit(page_size)

        .all()

    )

    return {

        "items": meetings,

        "total": total,

        "page": page,

        "page_size": page_size

    }

# ==========================================================
# MEETING PARTICIPANT CRUD
# ==========================================================

# Add participant to meeting
def create_meeting_participant(
    db: Session,
    participant: schemas.MeetingParticipantCreate
):

    # Check if meeting exists
    meeting = db.query(
        models.MeetingRequest
    ).filter(
        models.MeetingRequest.id == participant.meeting_id
    ).first()

    if meeting is None:
        return None

    # Check if member exists
    member = db.query(
        models.TeamMember
    ).filter(
        models.TeamMember.id == participant.member_id
    ).first()

    if member is None:
        return None

    # Prevent duplicate participant
    existing = (
        db.query(models.MeetingParticipant)
        .filter(
            models.MeetingParticipant.meeting_id == participant.meeting_id,
            models.MeetingParticipant.member_id == participant.member_id
        )
        .first()
    )

    if existing:
        return None

    db_participant = models.MeetingParticipant(
        meeting_id=participant.meeting_id,
        member_id=participant.member_id
    )

    db.add(db_participant)

    db.commit()

    db.refresh(db_participant)

    return db_participant


# ==========================================================
# GET ALL PARTICIPANTS
# ==========================================================

def get_meeting_participants(
    db: Session
):

    return (
        db.query(models.MeetingParticipant)
        .all()
    )


# ==========================================================
# GET PARTICIPANT BY ID
# ==========================================================

def get_meeting_participant(
    db: Session,
    participant_id: int
):

    return (
        db.query(models.MeetingParticipant)
        .filter(
            models.MeetingParticipant.id == participant_id
        )
        .first()
    )


# ==========================================================
# DELETE PARTICIPANT
# ==========================================================

def delete_meeting_participant(
    db: Session,
    participant_id: int
):

    participant = get_meeting_participant(
        db,
        participant_id
    )

    if participant is None:
        return None

    db.delete(participant)

    db.commit()

    return participant

# ==========================================================
# SCHEDULED MEETING CRUD
# ==========================================================

# Create scheduled meeting
def create_scheduled_meeting(
    db: Session,
    meeting: schemas.ScheduleMeetingCreate
):

    meeting_request = get_meeting(
        db,
        meeting.request_id
    )

    if meeting_request is None:
        return None

    # Check date is within preferred range
    if not (
        meeting_request.preferred_start_date
        <= meeting.scheduled_date
        <= meeting_request.preferred_end_date
    ):
        return None

    db_meeting = models.ScheduledMeeting(

        request_id=meeting.request_id,

        scheduled_date=meeting.scheduled_date,

        start_time=meeting.start_time,

        end_time=meeting.end_time,

        status="Scheduled"

    )

    db.add(db_meeting)

    meeting_request.status = "Scheduled"

    db.commit()

    db.refresh(db_meeting)

    return db_meeting


# ==========================================================
# GET ALL SCHEDULED MEETINGS
# ==========================================================

def get_all_scheduled_meetings(
    db: Session
):

    return (
        db.query(models.ScheduledMeeting)
        .all()
    )

# ==========================================================
# GET SCHEDULED MEETINGS
# (Search + Sort + Pagination)
# ==========================================================

def get_scheduled_meetings_paginated(

    db: Session,

    page: int = 1,

    page_size: int = 10,

    search: str = "",

    sort_by: str = "id",

    order: str = "asc"

):

    query = db.query(models.ScheduledMeeting)

    # ======================================================
    # SEARCH
    # ======================================================

    if search:

        query = query.filter(

            models.ScheduledMeeting.status.ilike(

                f"%{search}%"

            )

        )

    # ======================================================
    # TOTAL RECORDS
    # ======================================================

    total = query.count()

    # ======================================================
    # SORT
    # ======================================================

    sort_column = getattr(

        models.ScheduledMeeting,

        sort_by

    )

    if order == "desc":

        query = query.order_by(

            sort_column.desc()

        )

    else:

        query = query.order_by(

            sort_column.asc()

        )

    # ======================================================
    # PAGINATION
    # ======================================================

    meetings = (

        query

        .offset(

            (page - 1) * page_size

        )

        .limit(

            page_size

        )

        .all()

    )

    return {

        "items": meetings,

        "total": total,

        "page": page,

        "page_size": page_size

    }

# ==========================================================
# SEARCH SCHEDULED MEETINGS
# ==========================================================

def search_scheduled_meetings(
    db: Session,
    keyword: str
):

    return (

        db.query(models.ScheduledMeeting)

        .filter(

            models.ScheduledMeeting.status.ilike(
                f"%{keyword}%"
            )

        )

        .all()

    )


# ==========================================================
# SORT SCHEDULED MEETINGS
# ==========================================================

def sort_scheduled_meetings(
    db: Session,
    sort_by: str = "id",
    order: str = "asc"
):

    allowed_columns = {

        "id": models.ScheduledMeeting.id,

        "request_id": models.ScheduledMeeting.request_id,

        "scheduled_date": models.ScheduledMeeting.scheduled_date,

        "start_time": models.ScheduledMeeting.start_time,

        "end_time": models.ScheduledMeeting.end_time,

        "status": models.ScheduledMeeting.status

    }

    column = allowed_columns.get(
        sort_by,
        models.ScheduledMeeting.id
    )

    if order.lower() == "desc":

        return (

            db.query(models.ScheduledMeeting)

            .order_by(
                desc(column)
            )

            .all()

        )

    return (

        db.query(models.ScheduledMeeting)

        .order_by(
            asc(column)
        )

        .all()

    )


# ==========================================================
# PAGINATE SCHEDULED MEETINGS
# ==========================================================

def paginate_scheduled_meetings(
    db: Session,
    page: int = 1,
    page_size: int = 10
):

    return (

        db.query(models.ScheduledMeeting)

        .offset(
            (page - 1) * page_size
        )

        .limit(page_size)

        .all()

    )


# ==========================================================
# FILTER SCHEDULED MEETINGS
# ==========================================================

def get_scheduled_meetings(
    db: Session,
    scheduled_date=None,
    member_id=None,
    status=None
):

    query = db.query(
        models.ScheduledMeeting
    )

    if scheduled_date:

        query = query.filter(
            models.ScheduledMeeting.scheduled_date == scheduled_date
        )

    if status:

        query = query.filter(
            models.ScheduledMeeting.status == status
        )

    if member_id:

        query = (

            query

            .join(
                models.MeetingRequest,
                models.MeetingRequest.id ==
                models.ScheduledMeeting.request_id
            )

            .join(
                models.MeetingParticipant,
                models.MeetingParticipant.meeting_id ==
                models.MeetingRequest.id
            )

            .filter(
                models.MeetingParticipant.member_id == member_id
            )

        )

    return query.all()


# ==========================================================
# GET SCHEDULED MEETING BY ID
# ==========================================================

def get_scheduled_meeting(
    db: Session,
    meeting_id: int
):

    return (

        db.query(models.ScheduledMeeting)

        .filter(
            models.ScheduledMeeting.id == meeting_id
        )

        .first()

    )


# ==========================================================
# UPDATE SCHEDULED MEETING
# ==========================================================

def update_scheduled_meeting(
    db: Session,
    meeting_id: int,
    meeting: schemas.ScheduleMeetingUpdate
):

    db_meeting = get_scheduled_meeting(
        db,
        meeting_id
    )

    if db_meeting is None:
        return None

    update_data = meeting.model_dump(
        exclude_unset=True
    )

    for key, value in update_data.items():

        setattr(
            db_meeting,
            key,
            value
        )

    db.commit()

    db.refresh(db_meeting)

    return db_meeting


# ==========================================================
# DELETE SCHEDULED MEETING
# ==========================================================

def delete_scheduled_meeting(
    db: Session,
    meeting_id: int
):

    db_meeting = get_scheduled_meeting(
        db,
        meeting_id
    )

    if db_meeting is None:
        return None

    db.delete(db_meeting)

    db.commit()

    return db_meeting

# ==========================================================
# AUTOMATIC MEETING SCHEDULER
# ==========================================================

def auto_schedule_meeting(
    db: Session,
    meeting_id: int
):

    meeting = get_meeting(
        db,
        meeting_id
    )

    # Meeting does not exist
    if meeting is None:
        return None

    # Already scheduled
    existing = (
        db.query(models.ScheduledMeeting)
        .filter(
            models.ScheduledMeeting.request_id == meeting.id
        )
        .first()
    )

    if existing:
        return None

    # Find best available slot
    slot = find_best_slot(
        db,
        meeting
    )

    if slot is None:
        return None

    start_time, end_time = slot

    # Conflict detection
    for participant in meeting.participants:

        conflicts = (

            db.query(models.ScheduledMeeting)

            .join(
                models.MeetingParticipant,
                models.MeetingParticipant.meeting_id ==
                models.ScheduledMeeting.request_id
            )

            .filter(

                models.MeetingParticipant.member_id ==
                participant.member_id,

                models.ScheduledMeeting.scheduled_date ==
                meeting.preferred_start_date

            )

            .all()

        )

        for booked in conflicts:

            if (
                start_time < booked.end_time
                and
                end_time > booked.start_time
            ):

                return None

    scheduled = models.ScheduledMeeting(

        request_id=meeting.id,

        scheduled_date=meeting.preferred_start_date,

        start_time=start_time,

        end_time=end_time,

        status="Scheduled"

    )

    db.add(scheduled)

    meeting.status = "Scheduled"

    db.commit()

    db.refresh(scheduled)

    return scheduled


# ==========================================================
# DASHBOARD STATISTICS
# ==========================================================

def get_dashboard_statistics(
    db: Session
):

    total_scheduled_meetings = (
        db.query(models.ScheduledMeeting)
        .count()
    )

    completed_meetings = (
        db.query(models.ScheduledMeeting)
        .filter(
            models.ScheduledMeeting.status == "Completed"
        )
        .count()
    )

    pending_meetings = (
        db.query(models.ScheduledMeeting)
        .filter(
            models.ScheduledMeeting.status == "Pending"
        )
        .count()
    )

    scheduled_meetings = (
        db.query(models.ScheduledMeeting)
        .filter(
            models.ScheduledMeeting.status == "Scheduled"
        )
        .count()
    )

    cancelled_meetings = (
        db.query(models.ScheduledMeeting)
        .filter(
            models.ScheduledMeeting.status == "Cancelled"
        )
        .count()
    )

    total_members = (
        db.query(models.TeamMember)
        .count()
    )

    total_meeting_requests = (
        db.query(models.MeetingRequest)
        .count()
    )

    return {

        "total_scheduled_meetings":
            total_scheduled_meetings,

        "completed_meetings":
            completed_meetings,

        "pending_meetings":
            pending_meetings,

        "cancelled_meetings":
            cancelled_meetings,

        "total_members":
            total_members,

        "total_meeting_requests":
            total_meeting_requests

    }

