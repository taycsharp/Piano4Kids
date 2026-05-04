from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .db import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(180), nullable=False, unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(220), nullable=False)
    role: Mapped[str] = mapped_column(String(30), nullable=False, index=True)  # admin, teacher, parent
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    teacher_profile: Mapped["Teacher | None"] = relationship(back_populates="user", uselist=False)
    parent_students: Mapped[list["Student"]] = relationship(back_populates="parent_user", foreign_keys="Student.parent_user_id")


class Teacher(Base):
    __tablename__ = "teachers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(180), nullable=False, unique=True, index=True)
    specialty: Mapped[str | None] = mapped_column(String(180), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped[User] = relationship(back_populates="teacher_profile")
    students: Mapped[list["Student"]] = relationship(back_populates="teacher", cascade="all, delete-orphan")
    advice_records: Mapped[list["AdviceRecord"]] = relationship(back_populates="teacher")


class Student(Base):
    __tablename__ = "students"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    teacher_id: Mapped[int] = mapped_column(ForeignKey("teachers.id", ondelete="CASCADE"), nullable=False, index=True)
    parent_user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    age: Mapped[int | None] = mapped_column(Integer, nullable=True)
    level: Mapped[str] = mapped_column(String(80), nullable=False, default="Beginner")
    parent_name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    parent_email: Mapped[str | None] = mapped_column(String(180), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    teacher: Mapped[Teacher] = relationship(back_populates="students")
    parent_user: Mapped[User | None] = relationship(back_populates="parent_students", foreign_keys=[parent_user_id])
    advice_records: Mapped[list["AdviceRecord"]] = relationship(back_populates="student", cascade="all, delete-orphan")


class AdviceRecord(Base):
    __tablename__ = "advice_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    teacher_id: Mapped[int] = mapped_column(ForeignKey("teachers.id", ondelete="RESTRICT"), nullable=False, index=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    piece_title: Mapped[str] = mapped_column(String(180), nullable=False)
    teacher_feedback: Mapped[str] = mapped_column(Text, nullable=False)
    ai_parent_advice: Mapped[str | None] = mapped_column(Text, nullable=True)
    ai_advice_generated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    teacher: Mapped[Teacher] = relationship(back_populates="advice_records")
    student: Mapped[Student] = relationship(back_populates="advice_records")


class PublicHomepageHero(Base):
    __tablename__ = "public_homepage_heroes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    locale: Mapped[str] = mapped_column(String(8), nullable=False, unique=True, index=True, default="en")
    eyebrow: Mapped[str | None] = mapped_column(String(180), nullable=True)
    title: Mapped[str] = mapped_column(String(260), nullable=False)
    subtitle: Mapped[str] = mapped_column(Text, nullable=False)
    primary_button_text: Mapped[str | None] = mapped_column(String(80), nullable=True)
    primary_button_href: Mapped[str | None] = mapped_column(String(180), nullable=True)
    secondary_button_text: Mapped[str | None] = mapped_column(String(80), nullable=True)
    secondary_button_href: Mapped[str | None] = mapped_column(String(180), nullable=True)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    image_alt: Mapped[str | None] = mapped_column(String(220), nullable=True)
    card_title: Mapped[str | None] = mapped_column(String(180), nullable=True)
    card_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    stat_1_value: Mapped[str | None] = mapped_column(String(40), nullable=True)
    stat_1_label: Mapped[str | None] = mapped_column(String(120), nullable=True)
    stat_2_value: Mapped[str | None] = mapped_column(String(40), nullable=True)
    stat_2_label: Mapped[str | None] = mapped_column(String(120), nullable=True)
    stat_3_value: Mapped[str | None] = mapped_column(String(40), nullable=True)
    stat_3_label: Mapped[str | None] = mapped_column(String(120), nullable=True)
    is_published: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class PublicCourse(Base):
    __tablename__ = "public_courses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    locale: Mapped[str] = mapped_column(String(8), nullable=False, default="en", index=True)
    title: Mapped[str] = mapped_column(String(180), nullable=False)
    age: Mapped[str | None] = mapped_column(String(80), nullable=True)
    level: Mapped[str | None] = mapped_column(String(80), nullable=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    outcomes: Mapped[str | None] = mapped_column(Text, nullable=True)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    image_alt: Mapped[str | None] = mapped_column(String(220), nullable=True)
    is_published: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class PublicTeacher(Base):
    __tablename__ = "public_teachers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    locale: Mapped[str] = mapped_column(String(8), nullable=False, default="en", index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    role: Mapped[str] = mapped_column(String(180), nullable=False)
    bio: Mapped[str] = mapped_column(Text, nullable=False)
    initials: Mapped[str | None] = mapped_column(String(10), nullable=True)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    image_alt: Mapped[str | None] = mapped_column(String(220), nullable=True)
    is_published: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class PublicTestimonial(Base):
    __tablename__ = "public_testimonials"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    locale: Mapped[str] = mapped_column(String(8), nullable=False, default="en", index=True)
    student: Mapped[str] = mapped_column(String(120), nullable=False)
    result: Mapped[str] = mapped_column(Text, nullable=False)
    parent_quote: Mapped[str] = mapped_column(Text, nullable=False)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    image_alt: Mapped[str | None] = mapped_column(String(220), nullable=True)
    is_published: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class BlogPost(Base):
    __tablename__ = "blog_posts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    locale: Mapped[str] = mapped_column(String(8), nullable=False, default="en", index=True)
    slug: Mapped[str] = mapped_column(String(180), nullable=False, unique=True, index=True)
    title: Mapped[str] = mapped_column(String(220), nullable=False)
    excerpt: Mapped[str] = mapped_column(Text, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    read_time: Mapped[str | None] = mapped_column(String(40), nullable=True)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    image_alt: Mapped[str | None] = mapped_column(String(220), nullable=True)
    is_published: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
