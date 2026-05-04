from contextlib import asynccontextmanager
from datetime import datetime, timezone
from pathlib import Path

import hashlib

from fastapi import Depends, FastAPI, File, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload

from .ai import check_ollama_status, generate_parent_advice_once, mark_advice_generated
from .config import settings
from .db import Base, engine, get_db
from .models import AdviceRecord, BlogPost, PublicCourse, PublicHomepageHero, PublicTeacher, PublicTestimonial, Student, Teacher, User
from .schemas import (
    AdviceRecordCreate,
    AdviceRecordOut,
    AIStatusOut,
    DashboardOut,
    LoginIn,
    LoginOut,
    StudentCreate,
    StudentOut,
    TeacherCreate,
    TeacherOut,
    UserOut,
    BlogPostIn,
    BlogPostOut,
    PublicCourseIn,
    PublicCourseOut,
    PublicHomepageHeroIn,
    PublicHomepageHeroOut,
    PublicSiteOut,
    PublicTeacherIn,
    PublicTeacherOut,
    PublicTestimonialIn,
    PublicTestimonialOut,
)
from .security import create_access_token, get_current_user, hash_password, require_role, verify_password


MEDIA_ROOT = Path(__file__).resolve().parent.parent / "media"
UPLOAD_DIR = MEDIA_ROOT / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
ALLOWED_IMAGE_SUFFIXES = {".jpg", ".jpeg", ".png", ".webp"}
MAX_UPLOAD_IMAGE_SIZE = 8 * 1024 * 1024


def media_url_for_path(path: Path) -> str:
    relative = path.relative_to(MEDIA_ROOT).as_posix()
    return f"/media/{relative}"


def build_media_asset(path: Path) -> dict:
    return {
        "filename": path.name,
        "url": media_url_for_path(path),
        "library": path.parent.name,
        "size_bytes": path.stat().st_size,
        "updated_at": datetime.fromtimestamp(path.stat().st_mtime, tz=timezone.utc).isoformat(),
    }


def find_duplicate_image(content: bytes) -> Path | None:
    digest = hashlib.sha256(content).hexdigest()
    for folder in (UPLOAD_DIR, MEDIA_ROOT / "sample"):
        if not folder.exists():
            continue
        for path in folder.iterdir():
            if path.is_file() and path.suffix.lower() in ALLOWED_IMAGE_SUFFIXES:
                try:
                    if hashlib.sha256(path.read_bytes()).hexdigest() == digest:
                        return path
                except OSError:
                    continue
    return None




def path_from_media_url(url: str) -> Path:
    if not url or not url.startswith("/media/"):
        raise HTTPException(status_code=400, detail="Only local media library URLs can be deleted")
    relative = Path(url.removeprefix("/media/"))
    if relative.is_absolute() or ".." in relative.parts:
        raise HTTPException(status_code=400, detail="Invalid media URL")
    path = (MEDIA_ROOT / relative).resolve()
    try:
        path.relative_to(MEDIA_ROOT.resolve())
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid media URL")
    if path.suffix.lower() not in ALLOWED_IMAGE_SUFFIXES:
        raise HTTPException(status_code=400, detail="Only image files can be deleted")
    return path


def list_media_assets() -> list[dict]:
    assets = []
    for folder_name in ("uploads", "sample"):
        folder = MEDIA_ROOT / folder_name
        if not folder.exists():
            continue
        for path in folder.iterdir():
            if path.is_file() and path.suffix.lower() in ALLOWED_IMAGE_SUFFIXES:
                assets.append(build_media_asset(path))
    return sorted(assets, key=lambda item: (item["library"] == "uploads", item["updated_at"]), reverse=True)


def media_url_in_use(url: str, db: Session) -> list[str]:
    usage: list[str] = []
    if db.scalar(select(PublicHomepageHero.id).where(PublicHomepageHero.image_url == url).limit(1)):
        usage.append("homepage")
    if db.scalar(select(PublicTeacher.id).where(PublicTeacher.image_url == url).limit(1)):
        usage.append("teacher")
    if db.scalar(select(PublicCourse.id).where(PublicCourse.image_url == url).limit(1)):
        usage.append("course")
    if db.scalar(select(PublicTestimonial.id).where(PublicTestimonial.image_url == url).limit(1)):
        usage.append("result")
    if db.scalar(select(BlogPost.id).where(BlogPost.image_url == url).limit(1)):
        usage.append("blog")
    return usage


def seed_demo_data(db: Session) -> None:
    admin = db.scalar(select(User).where(User.email == "admin@example.com"))
    if not admin:
        admin = User(name="Academy Admin", email="admin@example.com", role="admin", password_hash=hash_password("admin123"))
        db.add(admin)
        db.commit()

    teacher_user = db.scalar(select(User).where(User.email == "teacher@example.com"))
    if not teacher_user:
        teacher_user = User(name="Teacher Anna", email="teacher@example.com", role="teacher", password_hash=hash_password("teacher123"))
        db.add(teacher_user)
        db.commit()
        db.refresh(teacher_user)
        teacher = Teacher(user_id=teacher_user.id, name="Teacher Anna", email=teacher_user.email, specialty="Children beginner piano")
        db.add(teacher)
        db.commit()
    else:
        teacher = db.scalar(select(Teacher).where(Teacher.user_id == teacher_user.id))

    parent_user = db.scalar(select(User).where(User.email == "parent@example.com"))
    if not parent_user:
        parent_user = User(name="Ms Hue", email="parent@example.com", role="parent", password_hash=hash_password("parent123"))
        db.add(parent_user)
        db.commit()
        db.refresh(parent_user)

    if teacher and not db.scalar(select(Student).where(Student.name == "An", Student.teacher_id == teacher.id)):
        student = Student(
            teacher_id=teacher.id,
            parent_user_id=parent_user.id,
            name="An",
            age=3,
            level="Beginner",
            parent_name=parent_user.name,
            parent_email=parent_user.email,
        )
        db.add(student)
        db.commit()
        db.refresh(student)
        record = AdviceRecord(
            teacher_id=teacher.id,
            student_id=student.id,
            piece_title="First Piano Lesson",
            teacher_feedback="An showed good focus and enjoyed finding high and low sounds. Please practice short 5-minute sessions with simple clapping and finger numbers.",
            ai_parent_advice="Demo advice already saved: Keep practice short and happy. Clap a simple rhythm together, praise focus, and stop before An becomes tired.",
            ai_advice_generated_at=datetime.now(timezone.utc),
        )
        db.add(record)
        db.commit()

    seed_public_content(db)


def seed_public_content(db: Session) -> None:
    if db.scalar(select(func.count(PublicHomepageHero.id))) == 0:
        db.add_all([
            PublicHomepageHero(
                locale="en",
                eyebrow="PIANO ACADEMY FOR CHILDREN AND FAMILIES",
                title="Better piano lessons, clearer feedback, happier home practice.",
                subtitle="Piano Academy AI combines professional piano teaching with clear parent communication. Teachers give expert feedback; AI helps explain it simply for parents.",
                primary_button_text="Explore courses",
                primary_button_href="/courses",
                secondary_button_text="Login dashboard",
                secondary_button_href="/dashboard",
                image_url="/media/sample/piano_lesson_in_a_bright_room.png",
                image_alt="Child learning piano with family and teacher",
                card_title="Weekly student progress",
                card_text="Canon in D · better rhythm · practice plan saved",
                stat_1_value="10 min",
                stat_1_label="daily practice",
                stat_2_value="1x",
                stat_2_label="AI advice saved",
                stat_3_value="100%",
                stat_3_label="teacher confirmed",
            ),
            PublicHomepageHero(
                locale="vi",
                eyebrow="HỌC VIỆN PIANO CHO TRẺ EM VÀ GIA ĐÌNH",
                title="Bài học piano tốt hơn, phản hồi rõ hơn, luyện tập tại nhà vui hơn.",
                subtitle="Piano Academy AI kết hợp giảng dạy piano chuyên nghiệp với hệ thống trao đổi rõ ràng cho phụ huynh. Giáo viên đưa ra phản hồi chuyên môn; AI giúp diễn giải dễ hiểu cho phụ huynh.",
                primary_button_text="Xem khóa học",
                primary_button_href="/courses",
                secondary_button_text="Đăng nhập hệ thống",
                secondary_button_href="/dashboard",
                image_url="/media/sample/piano_lesson_in_a_bright_room.png",
                image_alt="Trẻ học piano cùng gia đình và giáo viên",
                card_title="Tiến độ hằng tuần của học viên",
                card_text="Canon in D · Nhịp tốt hơn · Kế hoạch luyện tập đã lưu",
                stat_1_value="10 min",
                stat_1_label="luyện tập mỗi ngày",
                stat_2_value="1x",
                stat_2_label="lời khuyên AI đã lưu",
                stat_3_value="100%",
                stat_3_label="giáo viên xác nhận",
            ),
        ])

    if db.scalar(select(func.count(PublicCourse.id))) == 0:
        db.add_all([
            PublicCourse(locale="en", title="Little Pianist Foundation", age="Ages 4–6", level="Beginner", image_url="/media/sample/piano_lesson_in_a_bright_room.png", image_alt="Child learning piano with parents", description="A playful first piano course for children. Students learn finger numbers, rhythm, listening, simple melodies, and confident lesson habits.", outcomes="Finger control\nBasic rhythm\nListening skills\nShort daily practice routine", sort_order=1),
            PublicCourse(locale="en", title="Beginner Academic Piano", age="Ages 6–10", level="Beginner to Grade Prep", description="Structured lessons for note reading, posture, timing, technique, and expressive playing with weekly teacher feedback for parents.", outcomes="Note reading\nMetronome practice\nTwo-hand coordination\nTeacher progress notes", sort_order=2),
            PublicCourse(locale="en", title="Exam & Performance Track", age="Ages 8+", level="Intermediate", description="A focused track for students preparing for recitals, school performance, or graded music exams with detailed progress monitoring.", outcomes="Exam discipline\nPerformance confidence\nPractice planning\nMusical expression", sort_order=3),
            PublicCourse(locale="vi", title="Nền tảng Piano Nhí", age="4–6 tuổi", level="Mới bắt đầu", image_url="/media/sample/piano_lesson_in_a_bright_room.png", image_alt="Trẻ học piano cùng phụ huynh", description="Khóa học đầu tiên vui vẻ cho trẻ nhỏ. Học viên làm quen số ngón tay, tiết tấu, lắng nghe, giai điệu đơn giản và thói quen học tích cực.", outcomes="Kiểm soát ngón tay\nNhịp cơ bản\nKỹ năng lắng nghe\nThói quen luyện tập ngắn mỗi ngày", sort_order=1),
            PublicCourse(locale="vi", title="Piano Học thuật Cơ bản", age="6–10 tuổi", level="Cơ bản đến chuẩn bị cấp độ", description="Lộ trình có cấu trúc về đọc nốt, tư thế, nhịp, kỹ thuật và biểu cảm, kèm phản hồi hằng tuần cho phụ huynh.", outcomes="Đọc nốt\nLuyện với metronome\nPhối hợp hai tay\nGhi chú tiến bộ từ giáo viên", sort_order=2),
            PublicCourse(locale="vi", title="Luyện thi & Biểu diễn", age="8+ tuổi", level="Trung cấp", description="Chương trình tập trung cho học viên chuẩn bị biểu diễn, hoạt động trường học hoặc kỳ thi âm nhạc có theo dõi tiến bộ chi tiết.", outcomes="Kỷ luật luyện thi\nTự tin biểu diễn\nKế hoạch luyện tập\nBiểu cảm âm nhạc", sort_order=3),
        ])
    if db.scalar(select(func.count(PublicTeacher.id))) == 0:
        db.add_all([
            PublicTeacher(locale="en", name="Ms. Linh Nguyen", image_url="/media/sample/music_lesson_with_piano_guidance.png", image_alt="Teacher guiding a child at piano", role="Children Beginner Piano Specialist", bio="Focuses on early-childhood piano foundations, playful rhythm training, and building daily practice habits.", initials="LN", sort_order=1),
            PublicTeacher(locale="en", name="Mr. Daniel Tran", role="Academic Piano & Performance Coach", bio="Coaches students on technique, musical expression, exam preparation, and recital confidence.", initials="DT", sort_order=2),
            PublicTeacher(locale="vi", name="Cô Linh Nguyễn", image_url="/media/sample/music_lesson_with_piano_guidance.png", image_alt="Giáo viên hướng dẫn trẻ học piano", role="Chuyên gia piano cơ bản cho trẻ em", bio="Tập trung vào nền tảng piano tuổi nhỏ, luyện nhịp bằng trò chơi và xây dựng thói quen luyện tập hằng ngày.", initials="LN", sort_order=1),
            PublicTeacher(locale="vi", name="Thầy Daniel Trần", role="Huấn luyện piano học thuật & biểu diễn", bio="Hướng dẫn kỹ thuật, biểu cảm âm nhạc, chuẩn bị thi và sự tự tin khi biểu diễn.", initials="DT", sort_order=2),
        ])
    if db.scalar(select(func.count(PublicTestimonial.id))) == 0:
        db.add_all([
            PublicTestimonial(locale="en", student="Minh, age 5", image_url="/media/sample/young_pianist_s_recital_in_focus.png", image_alt="Young student performing in recital", result="Built a 10-minute daily practice habit and improved rhythm stability with metronome games.", parent_quote="The teacher notes are now easy for us to understand. We know exactly what to encourage at home.", sort_order=1),
            PublicTestimonial(locale="en", student="An, age 7", result="Improved two-hand coordination and confidence in playing short pieces for family.", parent_quote="The parent advice makes piano practice less stressful and more positive.", sort_order=2),
            PublicTestimonial(locale="vi", student="Minh, 5 tuổi", image_url="/media/sample/young_pianist_s_recital_in_focus.png", image_alt="Học viên biểu diễn piano", result="Xây dựng thói quen luyện tập 10 phút mỗi ngày và cải thiện độ ổn định nhịp bằng trò chơi metronome.", parent_quote="Ghi chú của giáo viên bây giờ rất dễ hiểu. Chúng tôi biết cần khuyến khích con điều gì ở nhà.", sort_order=1),
            PublicTestimonial(locale="vi", student="An, 7 tuổi", result="Cải thiện phối hợp hai tay và tự tin hơn khi chơi những bài ngắn cho gia đình nghe.", parent_quote="Lời khuyên cho phụ huynh giúp việc luyện piano bớt căng thẳng và tích cực hơn.", sort_order=2),
        ])
    if db.scalar(select(func.count(BlogPost.id))) == 0:
        db.add_all([
            BlogPost(locale="en", slug="help-child-practice-piano", image_url="/media/sample/piano_lesson_in_a_cozy_studio.png", image_alt="Children piano classroom", title="How to Help Your Child Practice Piano Without Pressure", excerpt="A simple parent guide for creating short, positive, and consistent piano practice at home.", content="Young children usually improve more from short, consistent practice than from long stressful sessions.\n\nParents should praise effort, listening, and rhythm before speed.\n\nUse the teacher feedback as the main source of truth. The parent role is not to replace the teacher, but to help the child repeat the right small task at home.", read_time="5 min read", sort_order=1),
            BlogPost(locale="en", slug="why-teacher-feedback-matters", title="Why Teacher Feedback Matters More Than Generic Practice Tips", excerpt="Personalized feedback helps parents understand what their child needs right now.", content="Every child struggles with different details.\n\nGeneric advice is helpful, but teacher feedback connects directly to the child’s lesson, piece, and current progress.\n\nAI can make teacher notes easier to understand, but the teacher remains the expert voice.", read_time="4 min read", sort_order=2),
            BlogPost(locale="vi", slug="giup-con-luyen-piano", image_url="/media/sample/piano_lesson_in_a_cozy_studio.png", image_alt="Lớp học piano cho trẻ em", title="Cách giúp con luyện piano mà không tạo áp lực", excerpt="Hướng dẫn đơn giản để phụ huynh tạo thói quen luyện tập ngắn, tích cực và đều đặn tại nhà.", content="Trẻ nhỏ thường tiến bộ tốt hơn với các buổi luyện ngắn và đều đặn thay vì luyện quá lâu và căng thẳng.\n\nPhụ huynh nên khen nỗ lực, khả năng lắng nghe và giữ nhịp trước khi yêu cầu tốc độ.\n\nHãy dùng phản hồi của giáo viên làm định hướng chính. Vai trò của phụ huynh là hỗ trợ con lặp lại đúng nhiệm vụ nhỏ ở nhà.", read_time="5 phút đọc", sort_order=1),
            BlogPost(locale="vi", slug="phan-hoi-giao-vien-quan-trong", title="Vì sao phản hồi của giáo viên quan trọng hơn mẹo luyện tập chung chung", excerpt="Phản hồi cá nhân hóa giúp phụ huynh hiểu con đang cần gì ngay lúc này.", content="Mỗi trẻ gặp khó khăn ở những chi tiết khác nhau.\n\nLời khuyên chung có ích, nhưng phản hồi của giáo viên liên kết trực tiếp với bài học, bản nhạc và tiến bộ hiện tại của trẻ.\n\nAI có thể giúp diễn giải dễ hiểu hơn, nhưng giáo viên vẫn là tiếng nói chuyên môn chính.", read_time="4 phút đọc", sort_order=2),
        ])
    db.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    db = next(get_db())
    try:
        seed_demo_data(db)
    finally:
        db.close()
    yield


app = FastAPI(title="Piano Academy AI", version="3.1.0-i18n-cms-images", lifespan=lifespan)
app.mount("/media", StaticFiles(directory=str(MEDIA_ROOT)), name="media")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict:
    return {"ok": True, "service": "piano-academy-backend"}


@app.get("/ai/status", response_model=AIStatusOut)
async def ai_status() -> dict:
    return await check_ollama_status()


@app.post("/auth/login", response_model=LoginOut)
def login(payload: LoginIn, db: Session = Depends(get_db)) -> dict:
    user = db.scalar(select(User).where(User.email == str(payload.email).lower()))
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {"access_token": create_access_token(user), "user": user}


@app.get("/auth/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)) -> User:
    return user


@app.get("/dashboard", response_model=DashboardOut)
def dashboard(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    if user.role == "teacher":
        teacher = get_teacher_for_user(user, db)
        student_q = select(func.count(Student.id)).where(Student.teacher_id == teacher.id)
        record_q = select(func.count(AdviceRecord.id)).where(AdviceRecord.teacher_id == teacher.id)
        generated_q = select(func.count(AdviceRecord.id)).where(AdviceRecord.teacher_id == teacher.id, AdviceRecord.ai_advice_generated_at.is_not(None))
        return {"teachers": 1, "students": db.scalar(student_q), "advice_records": db.scalar(record_q), "generated_advice": db.scalar(generated_q)}
    if user.role == "parent":
        student_ids = [s.id for s in db.scalars(select(Student).where(Student.parent_user_id == user.id)).all()]
        if not student_ids:
            return {"teachers": 0, "students": 0, "advice_records": 0, "generated_advice": 0}
        record_q = select(func.count(AdviceRecord.id)).where(AdviceRecord.student_id.in_(student_ids))
        generated_q = select(func.count(AdviceRecord.id)).where(AdviceRecord.student_id.in_(student_ids), AdviceRecord.ai_advice_generated_at.is_not(None))
        return {"teachers": 0, "students": len(student_ids), "advice_records": db.scalar(record_q), "generated_advice": db.scalar(generated_q)}
    return {
        "teachers": db.scalar(select(func.count(Teacher.id))),
        "students": db.scalar(select(func.count(Student.id))),
        "advice_records": db.scalar(select(func.count(AdviceRecord.id))),
        "generated_advice": db.scalar(select(func.count(AdviceRecord.id)).where(AdviceRecord.ai_advice_generated_at.is_not(None))),
    }


def get_teacher_for_user(user: User, db: Session) -> Teacher:
    teacher = db.scalar(select(Teacher).where(Teacher.user_id == user.id))
    if not teacher:
        raise HTTPException(status_code=403, detail="Teacher profile not found")
    return teacher


@app.post("/teachers", response_model=TeacherOut)
def create_teacher(payload: TeacherCreate, db: Session = Depends(get_db), _: User = Depends(require_role("admin"))) -> Teacher:
    email = str(payload.email).lower()
    existing_user = db.scalar(select(User).where(User.email == email))
    if existing_user:
        raise HTTPException(status_code=409, detail="A user with this email already exists.")
    user = User(name=payload.name.strip(), email=email, role="teacher", password_hash=hash_password(payload.password))
    db.add(user)
    db.flush()
    teacher = Teacher(user_id=user.id, name=payload.name.strip(), email=email, specialty=payload.specialty)
    db.add(teacher)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=409, detail="A teacher with this email already exists.") from exc
    db.refresh(teacher)
    return teacher


@app.get("/teachers", response_model=list[TeacherOut])
def list_teachers(db: Session = Depends(get_db), user: User = Depends(require_role("admin", "teacher"))) -> list[Teacher]:
    if user.role == "teacher":
        return [get_teacher_for_user(user, db)]
    return list(db.scalars(select(Teacher).order_by(Teacher.created_at.desc())).all())


@app.post("/students", response_model=StudentOut)
def create_student(payload: StudentCreate, db: Session = Depends(get_db), user: User = Depends(require_role("admin", "teacher"))) -> Student:
    if user.role == "teacher":
        teacher = get_teacher_for_user(user, db)
    else:
        if not payload.teacher_id:
            raise HTTPException(status_code=422, detail="teacher_id is required for admin")
        teacher = db.get(Teacher, payload.teacher_id)
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    parent_user = None
    parent_email = str(payload.parent_email).lower() if payload.parent_email else None
    if parent_email:
        parent_user = db.scalar(select(User).where(User.email == parent_email))
        if parent_user and parent_user.role != "parent":
            raise HTTPException(status_code=409, detail="This email is already used by a non-parent account")
        if not parent_user:
            parent_user = User(
                name=payload.parent_name or f"Parent of {payload.name}",
                email=parent_email,
                role="parent",
                password_hash=hash_password(payload.parent_password or "parent123"),
            )
            db.add(parent_user)
            db.flush()

    student = Student(
        teacher_id=teacher.id,
        parent_user_id=parent_user.id if parent_user else None,
        name=payload.name.strip(),
        age=payload.age,
        level=(payload.level or "Beginner").strip(),
        parent_name=payload.parent_name,
        parent_email=parent_email,
    )
    db.add(student)
    db.commit()
    stmt = select(Student).options(joinedload(Student.teacher)).where(Student.id == student.id)
    return db.scalars(stmt).first()


@app.get("/students", response_model=list[StudentOut])
def list_students(db: Session = Depends(get_db), user: User = Depends(require_role("admin", "teacher"))) -> list[Student]:
    stmt = select(Student).options(joinedload(Student.teacher)).order_by(Student.created_at.desc())
    if user.role == "teacher":
        teacher = get_teacher_for_user(user, db)
        stmt = stmt.where(Student.teacher_id == teacher.id)
    return list(db.scalars(stmt).all())


@app.post("/advice-records", response_model=AdviceRecordOut)
def create_advice_record(payload: AdviceRecordCreate, db: Session = Depends(get_db), user: User = Depends(require_role("teacher", "admin"))) -> AdviceRecord:
    if user.role == "teacher":
        teacher = get_teacher_for_user(user, db)
    else:
        if not payload.teacher_id:
            raise HTTPException(status_code=422, detail="teacher_id is required for admin")
        teacher = db.get(Teacher, payload.teacher_id)
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    student = db.get(Student, payload.student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    if student.teacher_id != teacher.id:
        raise HTTPException(status_code=400, detail="This student does not belong to this teacher")

    record = AdviceRecord(
        teacher_id=teacher.id,
        student_id=student.id,
        piece_title=payload.piece_title.strip(),
        teacher_feedback=payload.teacher_feedback.strip(),
    )
    db.add(record)
    db.commit()
    stmt = select(AdviceRecord).options(joinedload(AdviceRecord.teacher), joinedload(AdviceRecord.student).joinedload(Student.teacher)).where(AdviceRecord.id == record.id)
    return db.scalars(stmt).first()


@app.get("/advice-records", response_model=list[AdviceRecordOut])
def list_advice_records(db: Session = Depends(get_db), user: User = Depends(require_role("admin", "teacher"))) -> list[AdviceRecord]:
    stmt = select(AdviceRecord).options(joinedload(AdviceRecord.teacher), joinedload(AdviceRecord.student).joinedload(Student.teacher)).order_by(AdviceRecord.created_at.desc())
    if user.role == "teacher":
        teacher = get_teacher_for_user(user, db)
        stmt = stmt.where(AdviceRecord.teacher_id == teacher.id)
    return list(db.scalars(stmt).all())


@app.post("/advice-records/{record_id}/generate-ai", response_model=AdviceRecordOut)
async def generate_ai_advice(record_id: int, db: Session = Depends(get_db), user: User = Depends(require_role("teacher", "admin"))) -> AdviceRecord:
    stmt = select(AdviceRecord).options(joinedload(AdviceRecord.teacher), joinedload(AdviceRecord.student).joinedload(Student.teacher)).where(AdviceRecord.id == record_id)
    record = db.scalars(stmt).first()
    if not record:
        raise HTTPException(status_code=404, detail="Advice record not found")
    if user.role == "teacher" and record.teacher.user_id != user.id:
        raise HTTPException(status_code=403, detail="You can only generate advice for your own students")
    if record.ai_parent_advice or record.ai_advice_generated_at:
        raise HTTPException(status_code=409, detail="AI parent advice was already generated for this feedback record")
    try:
        advice = await generate_parent_advice_once(record)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Could not generate advice from Ollama: {exc}") from exc
    mark_advice_generated(record, advice)
    db.add(record)
    db.commit()
    return db.scalars(stmt).first()


@app.get("/parent/students", response_model=list[StudentOut])
def parent_students(db: Session = Depends(get_db), user: User = Depends(require_role("parent"))) -> list[Student]:
    stmt = select(Student).options(joinedload(Student.teacher)).where(Student.parent_user_id == user.id).order_by(Student.created_at.desc())
    return list(db.scalars(stmt).all())


@app.get("/parent/advice-records", response_model=list[AdviceRecordOut])
def parent_advice_records(db: Session = Depends(get_db), user: User = Depends(require_role("parent"))) -> list[AdviceRecord]:
    student_ids = [s.id for s in db.scalars(select(Student).where(Student.parent_user_id == user.id)).all()]
    if not student_ids:
        return []
    stmt = (
        select(AdviceRecord)
        .options(joinedload(AdviceRecord.teacher), joinedload(AdviceRecord.student).joinedload(Student.teacher))
        .where(AdviceRecord.student_id.in_(student_ids))
        .where(AdviceRecord.ai_advice_generated_at.is_not(None))
        .order_by(AdviceRecord.created_at.desc())
    )
    return list(db.scalars(stmt).all())



@app.get("/public/site", response_model=PublicSiteOut)
def public_site(locale: str = "en", db: Session = Depends(get_db)) -> dict:
    locale = locale if locale in {"en", "vi", "ko"} else "en"
    hero = db.scalar(select(PublicHomepageHero).where(PublicHomepageHero.is_published == True, PublicHomepageHero.locale == locale))
    return {
        "hero": hero,
        "courses": list(db.scalars(select(PublicCourse).where(PublicCourse.is_published == True, PublicCourse.locale == locale).order_by(PublicCourse.sort_order, PublicCourse.id)).all()),
        "teachers": list(db.scalars(select(PublicTeacher).where(PublicTeacher.is_published == True, PublicTeacher.locale == locale).order_by(PublicTeacher.sort_order, PublicTeacher.id)).all()),
        "testimonials": list(db.scalars(select(PublicTestimonial).where(PublicTestimonial.is_published == True, PublicTestimonial.locale == locale).order_by(PublicTestimonial.sort_order, PublicTestimonial.id)).all()),
        "posts": list(db.scalars(select(BlogPost).where(BlogPost.is_published == True, BlogPost.locale == locale).order_by(BlogPost.sort_order, BlogPost.id)).all()),
    }


@app.get("/public/blog/{slug}", response_model=BlogPostOut)
def public_blog_post(slug: str, locale: str = "en", db: Session = Depends(get_db)) -> BlogPost:
    locale = locale if locale in {"en", "vi", "ko"} else "en"
    post = db.scalar(select(BlogPost).where(BlogPost.slug == slug, BlogPost.locale == locale, BlogPost.is_published == True))
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    return post


@app.get("/cms/media-library")
def cms_media_library(_: User = Depends(require_role("admin"))) -> dict:
    return {"assets": list_media_assets()}




@app.delete("/cms/media-library")
def cms_delete_media(
    url: str,
    force: bool = Query(default=False),
    db: Session = Depends(get_db),
    _: User = Depends(require_role("admin")),
) -> dict:
    path = path_from_media_url(url)
    if not path.exists() or not path.is_file():
        raise HTTPException(status_code=404, detail="Photo not found in media library")
    if not force:
        usage = media_url_in_use(url, db)
        if usage:
            raise HTTPException(
                status_code=409,
                detail=f"Photo is currently used by CMS content ({', '.join(usage)}). Remove references first or retry with force=true.",
            )
    path.unlink()
    return {"deleted": True, "url": url, "message": "Photo deleted from the media library."}


@app.post("/cms/uploads")
async def cms_upload_image(file: UploadFile = File(...), _: User = Depends(require_role("admin"))) -> dict:
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=415, detail="Only JPG, PNG, and WEBP images are allowed")

    suffix = Path(file.filename or "image.png").suffix.lower()
    if suffix not in ALLOWED_IMAGE_SUFFIXES:
        suffix = ".png"

    content = await file.read()
    if len(content) > MAX_UPLOAD_IMAGE_SIZE:
        raise HTTPException(status_code=413, detail="Image must be smaller than 8MB")

    duplicate = find_duplicate_image(content)
    if duplicate:
        return {
            "url": media_url_for_path(duplicate),
            "filename": duplicate.name,
            "duplicate": True,
            "message": "This image already exists in the media library. Reused existing image instead of uploading a duplicate.",
        }

    digest = hashlib.sha256(content).hexdigest()[:16]
    destination = UPLOAD_DIR / f"{digest}{suffix}"
    counter = 1
    while destination.exists():
        destination = UPLOAD_DIR / f"{digest}-{counter}{suffix}"
        counter += 1

    destination.write_bytes(content)
    return {
        "url": media_url_for_path(destination),
        "filename": destination.name,
        "duplicate": False,
        "message": "Image uploaded and added to the media library.",
    }


@app.get("/cms/homepage-heroes", response_model=list[PublicHomepageHeroOut])
def cms_homepage_heroes(db: Session = Depends(get_db), _: User = Depends(require_role("admin"))) -> list[PublicHomepageHero]:
    return list(db.scalars(select(PublicHomepageHero).order_by(PublicHomepageHero.locale, PublicHomepageHero.id)).all())


@app.post("/cms/homepage-heroes", response_model=PublicHomepageHeroOut)
def cms_create_homepage_hero(payload: PublicHomepageHeroIn, db: Session = Depends(get_db), _: User = Depends(require_role("admin"))) -> PublicHomepageHero:
    existing = db.scalar(select(PublicHomepageHero).where(PublicHomepageHero.locale == payload.locale))
    if existing:
        raise HTTPException(status_code=409, detail="Homepage hero already exists for this language. Please edit the existing one.")
    item = PublicHomepageHero(**payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@app.put("/cms/homepage-heroes/{item_id}", response_model=PublicHomepageHeroOut)
def cms_update_homepage_hero(item_id: int, payload: PublicHomepageHeroIn, db: Session = Depends(get_db), _: User = Depends(require_role("admin"))) -> PublicHomepageHero:
    item = db.get(PublicHomepageHero, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Homepage hero not found")
    for k, v in payload.model_dump().items():
        setattr(item, k, v)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=409, detail="Homepage hero locale already exists") from exc
    db.refresh(item)
    return item


@app.delete("/cms/homepage-heroes/{item_id}")
def cms_delete_homepage_hero(item_id: int, db: Session = Depends(get_db), _: User = Depends(require_role("admin"))) -> dict:
    item = db.get(PublicHomepageHero, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Homepage hero not found")
    db.delete(item)
    db.commit()
    return {"ok": True}


@app.get("/cms/courses", response_model=list[PublicCourseOut])
def cms_courses(db: Session = Depends(get_db), _: User = Depends(require_role("admin"))) -> list[PublicCourse]:
    return list(db.scalars(select(PublicCourse).order_by(PublicCourse.sort_order, PublicCourse.id)).all())


@app.post("/cms/courses", response_model=PublicCourseOut)
def cms_create_course(payload: PublicCourseIn, db: Session = Depends(get_db), _: User = Depends(require_role("admin"))) -> PublicCourse:
    item = PublicCourse(**payload.model_dump())
    db.add(item); db.commit(); db.refresh(item); return item


@app.put("/cms/courses/{item_id}", response_model=PublicCourseOut)
def cms_update_course(item_id: int, payload: PublicCourseIn, db: Session = Depends(get_db), _: User = Depends(require_role("admin"))) -> PublicCourse:
    item = db.get(PublicCourse, item_id)
    if not item: raise HTTPException(status_code=404, detail="Course not found")
    for k, v in payload.model_dump().items(): setattr(item, k, v)
    db.commit(); db.refresh(item); return item


@app.delete("/cms/courses/{item_id}")
def cms_delete_course(item_id: int, db: Session = Depends(get_db), _: User = Depends(require_role("admin"))) -> dict:
    item = db.get(PublicCourse, item_id)
    if not item: raise HTTPException(status_code=404, detail="Course not found")
    db.delete(item); db.commit(); return {"ok": True}


@app.get("/cms/public-teachers", response_model=list[PublicTeacherOut])
def cms_public_teachers(db: Session = Depends(get_db), _: User = Depends(require_role("admin"))) -> list[PublicTeacher]:
    return list(db.scalars(select(PublicTeacher).order_by(PublicTeacher.sort_order, PublicTeacher.id)).all())


@app.post("/cms/public-teachers", response_model=PublicTeacherOut)
def cms_create_public_teacher(payload: PublicTeacherIn, db: Session = Depends(get_db), _: User = Depends(require_role("admin"))) -> PublicTeacher:
    item = PublicTeacher(**payload.model_dump())
    db.add(item); db.commit(); db.refresh(item); return item


@app.put("/cms/public-teachers/{item_id}", response_model=PublicTeacherOut)
def cms_update_public_teacher(item_id: int, payload: PublicTeacherIn, db: Session = Depends(get_db), _: User = Depends(require_role("admin"))) -> PublicTeacher:
    item = db.get(PublicTeacher, item_id)
    if not item: raise HTTPException(status_code=404, detail="Public teacher not found")
    for k, v in payload.model_dump().items(): setattr(item, k, v)
    db.commit(); db.refresh(item); return item


@app.delete("/cms/public-teachers/{item_id}")
def cms_delete_public_teacher(item_id: int, db: Session = Depends(get_db), _: User = Depends(require_role("admin"))) -> dict:
    item = db.get(PublicTeacher, item_id)
    if not item: raise HTTPException(status_code=404, detail="Public teacher not found")
    db.delete(item); db.commit(); return {"ok": True}


@app.get("/cms/testimonials", response_model=list[PublicTestimonialOut])
def cms_testimonials(db: Session = Depends(get_db), _: User = Depends(require_role("admin"))) -> list[PublicTestimonial]:
    return list(db.scalars(select(PublicTestimonial).order_by(PublicTestimonial.sort_order, PublicTestimonial.id)).all())


@app.post("/cms/testimonials", response_model=PublicTestimonialOut)
def cms_create_testimonial(payload: PublicTestimonialIn, db: Session = Depends(get_db), _: User = Depends(require_role("admin"))) -> PublicTestimonial:
    item = PublicTestimonial(**payload.model_dump())
    db.add(item); db.commit(); db.refresh(item); return item


@app.put("/cms/testimonials/{item_id}", response_model=PublicTestimonialOut)
def cms_update_testimonial(item_id: int, payload: PublicTestimonialIn, db: Session = Depends(get_db), _: User = Depends(require_role("admin"))) -> PublicTestimonial:
    item = db.get(PublicTestimonial, item_id)
    if not item: raise HTTPException(status_code=404, detail="Testimonial not found")
    for k, v in payload.model_dump().items(): setattr(item, k, v)
    db.commit(); db.refresh(item); return item


@app.delete("/cms/testimonials/{item_id}")
def cms_delete_testimonial(item_id: int, db: Session = Depends(get_db), _: User = Depends(require_role("admin"))) -> dict:
    item = db.get(PublicTestimonial, item_id)
    if not item: raise HTTPException(status_code=404, detail="Testimonial not found")
    db.delete(item); db.commit(); return {"ok": True}


@app.get("/cms/blog-posts", response_model=list[BlogPostOut])
def cms_blog_posts(db: Session = Depends(get_db), _: User = Depends(require_role("admin"))) -> list[BlogPost]:
    return list(db.scalars(select(BlogPost).order_by(BlogPost.sort_order, BlogPost.id)).all())


@app.post("/cms/blog-posts", response_model=BlogPostOut)
def cms_create_blog_post(payload: BlogPostIn, db: Session = Depends(get_db), _: User = Depends(require_role("admin"))) -> BlogPost:
    item = BlogPost(**payload.model_dump())
    db.add(item)
    try: db.commit()
    except IntegrityError as exc:
        db.rollback(); raise HTTPException(status_code=409, detail="Blog slug already exists") from exc
    db.refresh(item); return item


@app.put("/cms/blog-posts/{item_id}", response_model=BlogPostOut)
def cms_update_blog_post(item_id: int, payload: BlogPostIn, db: Session = Depends(get_db), _: User = Depends(require_role("admin"))) -> BlogPost:
    item = db.get(BlogPost, item_id)
    if not item: raise HTTPException(status_code=404, detail="Blog post not found")
    for k, v in payload.model_dump().items(): setattr(item, k, v)
    try: db.commit()
    except IntegrityError as exc:
        db.rollback(); raise HTTPException(status_code=409, detail="Blog slug already exists") from exc
    db.refresh(item); return item


@app.delete("/cms/blog-posts/{item_id}")
def cms_delete_blog_post(item_id: int, db: Session = Depends(get_db), _: User = Depends(require_role("admin"))) -> dict:
    item = db.get(BlogPost, item_id)
    if not item: raise HTTPException(status_code=404, detail="Blog post not found")
    db.delete(item); db.commit(); return {"ok": True}
