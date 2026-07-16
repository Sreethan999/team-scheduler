from pydantic import BaseModel, EmailStr
from datetime import date as DateType
from datetime import time as TimeType
from typing import Optional, Literal, List


# ==========================================================
# MEMBER SCHEMAS
# ==========================================================

# Schema used when creating a new team member
class MemberCreate(BaseModel):
    name: str
    email: EmailStr
    department: str


# Schema used for updating member details
class MemberUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    department: Optional[str] = None
    is_active: Optional[bool] = None


# Schema returned in API responses
class MemberResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    department: str
    is_active: bool

    class Config:
        from_attributes = True


# ==========================================================
# MEMBER PAGINATION
# ==========================================================

class MemberPaginationResponse(BaseModel):

    items: List[MemberResponse]

    total: int

    page: int

    page_size: int

    class Config:
        from_attributes = True



# ==========================================================
# AVAILABILITY SCHEMAS
# ==========================================================

# Schema used to add a member's availability
class AvailabilityCreate(BaseModel):
    member_id: int
    date: DateType
    start_time: TimeType
    end_time: TimeType


# Schema used to update availability details
class AvailabilityUpdate(BaseModel):
    date: Optional[DateType] = None
    start_time: Optional[TimeType] = None
    end_time: Optional[TimeType] = None


# Schema returned after availability operations
class AvailabilityResponse(BaseModel):
    id: int
    member_id: int
    date: DateType
    start_time: TimeType
    end_time: TimeType

    class Config:
        from_attributes = True

# ==========================================================
# AVAILABILITY PAGINATION
# ==========================================================

class AvailabilityPaginationResponse(BaseModel):

    items: List[AvailabilityResponse]

    total: int

    page: int

    page_size: int

    class Config:

        from_attributes = True

# ==========================================================
# MEETING REQUEST SCHEMAS
# ==========================================================

# Schema used to create a meeting request
class MeetingCreate(BaseModel):
    title: str
    duration: int
    preferred_start_date: DateType
    preferred_end_date: DateType


# Schema used to update meeting details
class MeetingUpdate(BaseModel):
    title: Optional[str] = None
    duration: Optional[int] = None
    preferred_start_date: Optional[DateType] = None
    preferred_end_date: Optional[DateType] = None
    status: Optional[str] = None


# Schema returned after meeting operations
class MeetingResponse(BaseModel):
    id: int
    title: str
    duration: int
    preferred_start_date: DateType
    preferred_end_date: DateType
    status: str

    class Config:
        from_attributes = True

# ==========================================================
# MEETING PAGINATION
# ==========================================================

class MeetingPaginationResponse(BaseModel):

    items: List[MeetingResponse]

    total: int

    page: int

    page_size: int

    class Config:
        from_attributes = True


# ==========================================================
# MEETING STATUS SCHEMA
# ==========================================================

class MeetingStatusUpdate(BaseModel):
    status: Literal[
        "Pending",
        "Scheduled",
        "Completed",
        "Cancelled"
    ]


# ==========================================================
# MEETING PARTICIPANT SCHEMAS
# ==========================================================

# Schema used to add a participant to a meeting
class MeetingParticipantCreate(BaseModel):
    meeting_id: int
    member_id: int


# Schema returned after participant operations
class MeetingParticipantResponse(BaseModel):
    id: int
    meeting_id: int
    member_id: int

    class Config:
        from_attributes = True


# ==========================================================
# SCHEDULED MEETING SCHEMAS
# ==========================================================

# Schema used when creating a scheduled meeting
class ScheduleMeetingCreate(BaseModel):
    request_id: int
    scheduled_date: DateType
    start_time: TimeType
    end_time: TimeType


# Schema used when updating a scheduled meeting
class ScheduleMeetingUpdate(BaseModel):
    scheduled_date: Optional[DateType] = None
    start_time: Optional[TimeType] = None
    end_time: Optional[TimeType] = None
    status: Optional[str] = None


# Schema returned after scheduling a meeting
class ScheduleMeetingResponse(BaseModel):
    id: int
    request_id: int
    scheduled_date: DateType
    start_time: TimeType
    end_time: TimeType
    status: str

    class Config:
        from_attributes = True

# ==========================================================
# SCHEDULED MEETING PAGINATION
# ==========================================================

class ScheduleMeetingPaginationResponse(BaseModel):

    items: List[ScheduleMeetingResponse]

    total: int

    page: int

    page_size: int

    class Config:

        from_attributes = True


# ==========================================================
# DASHBOARD STATISTICS SCHEMA
# ==========================================================

class DashboardStatsResponse(BaseModel):

    total_scheduled_meetings: int

    completed_meetings: int

    pending_meetings: int

    cancelled_meetings: int

    total_members: int

    total_meeting_requests: int


