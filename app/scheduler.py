from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app import models


# Finds the earliest common available slot for all participants in a meeting request
def find_best_slot(db: Session, meeting_request):

    # Retrieve all participants for the meeting
    participants = (
        db.query(models.MeetingParticipant)
        .filter(
            models.MeetingParticipant.meeting_id == meeting_request.id
        )
        .all()
    )

    # Stop if meeting has no participants 
    if not participants:
        return None

    availabilities = []

    for participant in participants:

        # Fetch the participant's available time slot
        slots = (
            db.query(models.Availability)
            .filter(
                models.Availability.member_id == participant.member_id,
                models.Availability.date == meeting_request.preferred_start_date
            )
            .all()
        )

        # Stop if any participant is unavailable on that date
        if not slots:
            return None

        availabilities.append(slots)


    # Find the latest starting time among all participants
    latest_start = max(
        slot[0].start_time
        for slot in availabilities
    )

    # Find the earliest ending time among all participants
    earliest_end = min(
        slot[0].end_time
        for slot in availabilities
    )

    # Calculate the common overlapping duration
    overlap = (
        datetime.combine(
            meeting_request.preferred_start_date,
            earliest_end
        )
        -
        datetime.combine(
            meeting_request.preferred_start_date,
            latest_start
        )
    )

    
    # Convert the meeting duration into a time interval
    required_duration = timedelta(
        minutes=meeting_request.duration
    )

    # Check if the common overlap is long enough
    if overlap >= required_duration:

        # Calculate the meeting end time
        end_time = (
            datetime.combine(
                meeting_request.preferred_start_date,
                latest_start
            )
            +
            required_duration
        ).time()

        return latest_start, end_time

    # No common time slot found
    return None