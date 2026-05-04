import tempfile
import unittest
from pathlib import Path

from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.db import Base
from app.main import cms_delete_media, find_duplicate_image, media_url_in_use
from app.models import BlogPost, PublicCourse, PublicHomepageHero, PublicTeacher, PublicTestimonial


class MediaLibrarySafetyTests(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine('sqlite:///:memory:')
        Base.metadata.create_all(self.engine)
        self.Session = sessionmaker(bind=self.engine)

    def test_duplicate_upload_detects_existing_image(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            uploads = root / 'uploads'
            sample = root / 'sample'
            uploads.mkdir()
            sample.mkdir()
            payload = b'fake-image-content'
            existing = uploads / 'abc.png'
            existing.write_bytes(payload)

            import app.main as main_mod
            old_upload_dir = main_mod.UPLOAD_DIR
            old_media_root = main_mod.MEDIA_ROOT
            main_mod.UPLOAD_DIR = uploads
            main_mod.MEDIA_ROOT = root
            try:
                duplicate = find_duplicate_image(payload)
                self.assertEqual(duplicate, existing)
            finally:
                main_mod.UPLOAD_DIR = old_upload_dir
                main_mod.MEDIA_ROOT = old_media_root

    def test_reuse_existing_image_prefers_current_library_asset(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            uploads = root / 'uploads'
            sample = root / 'sample'
            uploads.mkdir()
            sample.mkdir()
            payload = b'same-image'
            existing = sample / 'from-sample.png'
            existing.write_bytes(payload)

            import app.main as main_mod
            old_upload_dir = main_mod.UPLOAD_DIR
            old_media_root = main_mod.MEDIA_ROOT
            main_mod.UPLOAD_DIR = uploads
            main_mod.MEDIA_ROOT = root
            try:
                reused = find_duplicate_image(payload)
                self.assertEqual(reused, existing)
            finally:
                main_mod.UPLOAD_DIR = old_upload_dir
                main_mod.MEDIA_ROOT = old_media_root

    def test_blocked_delete_when_image_in_use(self):
        db = self.Session()
        db.add(PublicHomepageHero(locale='en', eyebrow='x', title='x', subtitle='x', image_url='/media/uploads/in-use.png'))
        db.commit()

        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            media = root / 'media'
            uploads = media / 'uploads'
            uploads.mkdir(parents=True)
            target = uploads / 'in-use.png'
            target.write_bytes(b'data')

            import app.main as main_mod
            old_media_root = main_mod.MEDIA_ROOT
            main_mod.MEDIA_ROOT = media
            try:
                with self.assertRaises(HTTPException) as ctx:
                    cms_delete_media('/media/uploads/in-use.png', force=False, db=db, _=None)
                self.assertEqual(ctx.exception.status_code, 409)
                self.assertTrue(target.exists())
            finally:
                main_mod.MEDIA_ROOT = old_media_root

    def test_force_delete_removes_file_even_when_in_use(self):
        db = self.Session()
        db.add(PublicHomepageHero(locale='en', eyebrow='x', title='x', subtitle='x', image_url='/media/uploads/in-use.png'))
        db.commit()

        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            media = root / 'media'
            uploads = media / 'uploads'
            uploads.mkdir(parents=True)
            target = uploads / 'in-use.png'
            target.write_bytes(b'data')

            import app.main as main_mod
            old_media_root = main_mod.MEDIA_ROOT
            main_mod.MEDIA_ROOT = media
            try:
                result = cms_delete_media('/media/uploads/in-use.png', force=True, db=db, _=None)
                self.assertTrue(result['deleted'])
                self.assertFalse(target.exists())
            finally:
                main_mod.MEDIA_ROOT = old_media_root


if __name__ == '__main__':
    unittest.main()
