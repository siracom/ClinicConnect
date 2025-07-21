import os
import uuid
from django.db import models
from django.contrib.auth.hashers import make_password, check_password
from django.utils import timezone
from django.conf import settings
from django.core.exceptions import ValidationError
from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import PermissionsMixin


class UserManager(BaseUserManager):
    def create_user(self, username, password=None, **extra_fields):
        if not username:
            raise ValueError('The username must be set')
        user = self.model(username=username, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, username, password=None, **extra_fields):
        extra_fields.setdefault('is_active', True)
        return self.create_user(username, password, **extra_fields)


class User(AbstractBaseUser):
    id = models.BigAutoField(primary_key=True)
    username = models.CharField(max_length=150, unique=True)
    first_name = models.CharField(max_length=150, db_column="first_name")
    last_name = models.CharField(max_length=150, db_column="last_name")
    password = models.CharField(max_length=128, db_column="password_hash")
    created_at = models.DateTimeField(default=timezone.now)
    is_active = models.BooleanField(default=True)

    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = []

    objects = UserManager()

    class Meta:
        db_table = "Users"
        verbose_name = "user"
        verbose_name_plural = "users"

    def __str__(self):
        return self.username

# class User(models.Model):

#     id = models.AutoField(primary_key=True)
#     username = models.CharField(unique=True, max_length=100)
#     firstname = models.CharField(max_length=100)
#     lastname = models.CharField(max_length=100)
#     password_hash = models.CharField(max_length=255)
#     created_at = models.DateTimeField(default=timezone.now)

#     def set_password(self, raw_password):
#         self.password_hash = make_password(raw_password)

#     def check_password(self, raw_password):
#         return check_password(raw_password, self.password_hash)

#     def __str__(self):
#         return f"{self.firstname} {self.lastname}"


class Patient(models.Model):
    patient_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="patients")
    created_at = models.DateTimeField(default=timezone.now)
    age = models.IntegerField()
    sex = models.CharField(max_length=10)
    health_description = models.TextField(blank=True, null=True)


class Clinician(models.Model):
    clinician_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="clinicians")
    created_at = models.DateTimeField(default=timezone.now)
    age = models.IntegerField()
    gender = models.CharField(max_length=10)
    speciality = models.CharField(max_length=255)


# Document/ File related Model logic
def patient_document_upload_to(instance, filename):
    """Upload path: patients/<patient_id>/<uuid4>.pdf (preserve original ext if present)."""
    base, ext = os.path.splitext(filename)
    ext = ext.lower() or '.pdf'
    # enforce .pdf file extension naming for storage safety
    if ext != '.pdf':
        ext = '.pdf'
    return f"patients/{instance.patient_id}/{uuid.uuid4()}{ext}"


def validate_pdf(file_obj):
    """Basic PDF signature check + file size limit (optional)."""
    # If size limit configured
    max_size = getattr(settings, 'MAX_UPLOAD_SIZE', None)
    if max_size and file_obj.size > max_size:
        raise ValidationError(f"File too large (>{max_size} bytes).")

    # Check first 4 bytes for %PDF signature when possible
    header = file_obj.read(4)
    file_obj.seek(0)  # reset pointer
    if header != b'%PDF':
        raise ValidationError("Uploaded file is not a valid PDF (missing %PDF header).")


class Document(models.Model):
    document_id = models.AutoField(primary_key=True)
    uploaded_time = models.DateTimeField(auto_now_add=True)

    # Owning Patient (the subject of the document)
    patient = models.ForeignKey('Patient', on_delete=models.CASCADE, related_name='documents')

    uploaded_by = models.ForeignKey('User', on_delete=models.SET_NULL, null=True, blank=True, related_name='uploaded_documents')

    # Actual stored file
    file = models.FileField(upload_to=patient_document_upload_to, validators=[validate_pdf])

    # Redundant path column per spec (auto set on save)
    file_path = models.CharField(max_length=500, editable=False)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)  # ensure file saved first
        if self.file and self.file.name != self.file_path:
            # update stored path (relative to MEDIA_ROOT)
            type(self).objects.filter(pk=self.pk).update(file_path=self.file.name)
            self.file_path = self.file.name

    def __str__(self):
        return f"Doc {self.document_id} for Patient {self.patient_id}"