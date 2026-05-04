from datetime import datetime
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    email: str
    role: str
    is_active: bool


class LoginIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1)


class LoginOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class TeacherCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    specialty: str | None = None
    password: str = Field(default="teacher123", min_length=6)


class TeacherOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: int
    name: str
    email: str
    specialty: str | None
    created_at: datetime


class StudentCreate(BaseModel):
    teacher_id: int | None = None
    name: str = Field(min_length=1, max_length=120)
    age: int | None = Field(default=None, ge=1, le=100)
    level: str = "Beginner"
    parent_name: str | None = None
    parent_email: EmailStr | None = None
    parent_password: str | None = Field(default=None, min_length=6)

    @field_validator("parent_name", "parent_email", "parent_password", mode="before")
    @classmethod
    def blank_to_none(cls, value):
        if value == "":
            return None
        return value


class StudentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    teacher_id: int
    parent_user_id: int | None
    name: str
    age: int | None
    level: str
    parent_name: str | None
    parent_email: str | None
    created_at: datetime
    teacher: TeacherOut


class AdviceRecordCreate(BaseModel):
    teacher_id: int | None = None
    student_id: int
    piece_title: str = Field(min_length=1, max_length=180)
    teacher_feedback: str = Field(min_length=10)


class AdviceRecordOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    teacher_id: int
    student_id: int
    piece_title: str
    teacher_feedback: str
    ai_parent_advice: str | None
    ai_advice_generated_at: datetime | None
    created_at: datetime
    updated_at: datetime | None
    teacher: TeacherOut
    student: StudentOut


class AIStatusOut(BaseModel):
    ok: bool
    configured_model: str
    model_available: bool
    base_url: str
    message: str | None = None


class DashboardOut(BaseModel):
    teachers: int
    students: int
    advice_records: int
    generated_advice: int


class PublicHomepageHeroIn(BaseModel):
    locale: str = Field(default="en", pattern="^(en|vi|ko)$")
    eyebrow: str | None = None
    title: str = Field(min_length=1, max_length=260)
    subtitle: str = Field(min_length=5)
    primary_button_text: str | None = None
    primary_button_href: str | None = "/courses"
    secondary_button_text: str | None = None
    secondary_button_href: str | None = "/dashboard"
    image_url: str | None = None
    image_alt: str | None = None
    card_title: str | None = None
    card_text: str | None = None
    stat_1_value: str | None = "10 min"
    stat_1_label: str | None = None
    stat_2_value: str | None = "1x"
    stat_2_label: str | None = None
    stat_3_value: str | None = "100%"
    stat_3_label: str | None = None
    is_published: bool = True


class PublicHomepageHeroOut(PublicHomepageHeroIn):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime
    updated_at: datetime | None = None


class PublicCourseIn(BaseModel):
    locale: str = Field(default="en", pattern="^(en|vi|ko)$")
    title: str = Field(min_length=1, max_length=180)
    age: str | None = None
    level: str | None = None
    description: str = Field(min_length=5)
    outcomes: str | None = None
    image_url: str | None = None
    image_alt: str | None = None
    is_published: bool = True
    sort_order: int = 0


class PublicCourseOut(PublicCourseIn):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime
    updated_at: datetime | None = None


class PublicTeacherIn(BaseModel):
    locale: str = Field(default="en", pattern="^(en|vi|ko)$")
    name: str = Field(min_length=1, max_length=120)
    role: str = Field(min_length=1, max_length=180)
    bio: str = Field(min_length=5)
    initials: str | None = None
    image_url: str | None = None
    image_alt: str | None = None
    is_published: bool = True
    sort_order: int = 0


class PublicTeacherOut(PublicTeacherIn):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime
    updated_at: datetime | None = None


class PublicTestimonialIn(BaseModel):
    locale: str = Field(default="en", pattern="^(en|vi|ko)$")
    student: str = Field(min_length=1, max_length=120)
    result: str = Field(min_length=5)
    parent_quote: str = Field(min_length=5)
    image_url: str | None = None
    image_alt: str | None = None
    is_published: bool = True
    sort_order: int = 0


class PublicTestimonialOut(PublicTestimonialIn):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime
    updated_at: datetime | None = None


class BlogPostIn(BaseModel):
    locale: str = Field(default="en", pattern="^(en|vi|ko)$")
    slug: str = Field(min_length=1, max_length=180)
    title: str = Field(min_length=1, max_length=220)
    excerpt: str = Field(min_length=5)
    content: str = Field(min_length=20)
    read_time: str | None = "5 min read"
    image_url: str | None = None
    image_alt: str | None = None
    is_published: bool = True
    sort_order: int = 0


class BlogPostOut(BlogPostIn):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime
    updated_at: datetime | None = None


class PublicSiteOut(BaseModel):
    hero: PublicHomepageHeroOut | None = None
    courses: list[PublicCourseOut]
    teachers: list[PublicTeacherOut]
    testimonials: list[PublicTestimonialOut]
    posts: list[BlogPostOut]
