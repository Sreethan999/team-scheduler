from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    Date,
    Time,
    ForeignKey
)

from sqlalchemy.orm import relationship

from app.database import Base


# Stores information about each team member
class TeamMember(Base):
    __tablename__ = "team_members"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    department = Column(String(100))
    is_active = Column(Boolean, default=True)

    # One member can have multiple availability records
    availability = relationship("Availability", back_populates="member")


# Stores the available time slots of team members
class Availability(Base):
    __tablename__ = "availability"

    id = Column(Integer, primary_key=True, index=True)

    # Links the availability to a team member
    member_id = Column(Integer, ForeignKey("team_members.id"))

    date = Column(Date, nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)

    # Creates a two-way relationship with TeamMember
    member = relationship("TeamMember", back_populates="availability")


# Stores meeting requests created by users
class MeetingRequest(Base):
    __tablename__ = "meeting_requests"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String(200), nullable=False)

    # Duration of the meeting in minutes
    duration = Column(Integer, nullable=False)

    preferred_start_date = Column(Date)

    preferred_end_date = Column(Date)

    status = Column(String(50), default="Pending")

    # One meeting can have multiple participants
    participants = relationship(
        "MeetingParticipant",
        back_populates="meeting"
    )


# Connects team members with meeting requests
class MeetingParticipant(Base):
    __tablename__ = "meeting_participants"

    id = Column(Integer, primary_key=True, index=True)

    meeting_id = Column(
        Integer,
        ForeignKey("meeting_requests.id")
    )

    member_id = Column(
        Integer,
        ForeignKey("team_members.id")
    )

    # Creates a two-way relationship with MeetingRequest
    meeting = relationship(
        "MeetingRequest",
        back_populates="participants"
    )

    # Links the participant to a team member
    member = relationship("TeamMember")


# Stores the final scheduled meeting details
class ScheduledMeeting(Base):
    __tablename__ = "scheduled_meetings"

    id = Column(Integer, primary_key=True, index=True)

    # References the original meeting request
    request_id = Column(Integer, ForeignKey("meeting_requests.id"))

    scheduled_date = Column(Date)

    start_time = Column(Time)

    end_time = Column(Time)

    status = Column(String(20), default="Scheduled")