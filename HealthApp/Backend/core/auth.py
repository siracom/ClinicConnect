import jwt
from django.conf import settings
from rest_framework.response import Response
from rest_framework import status
from functools import wraps

from .validators import is_clinician
from .models import Clinician, User, Patient, Document
from .serializers import UserSerializer

JWT_ALG = 'HS256'


def _decode_bearer(request):
    auth = request.headers.get('Authorization', '')
    if not auth.startswith('Bearer '):
        return None
    token = auth.split()[1]
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[JWT_ALG])
        return payload
    except Exception:
        return None


def get_request_user(request):
    payload = _decode_bearer(request)
    if not payload:
        return None
    uid = payload.get('user_id')
    if uid is None:
        return None
    try:
        return User.objects.get(id=uid)
    except User.DoesNotExist:
        return None


# --- Permission decorators --------------------------------------------------

# Usage: @require_auth  (ensures request.user_obj is set)
#        @require_role('Clinician')
#        @require_patient_or_clinician


def require_auth(view_func):
    @wraps(view_func)
    def _wrapped(self, request, *args, **kwargs):
        user_obj = get_request_user(request)
        if not user_obj:
            return Response({'detail': 'Authentication required.'}, status=status.HTTP_401_UNAUTHORIZED)
        request.user_obj = user_obj
        return view_func(self, request, *args, **kwargs)
    return _wrapped

def check_patient_access(user_id, patient_id):
    """Return True if user allowed to access patient record."""
    if is_clinician(user_id=user_id):
        return True 
    else:
        try:
            patient = Patient.objects.get(patient_id=patient_id)
        except Patient.DoesNotExist:
            return False
        return patient.user_id == user_id


def check_document_delete(user_id, document: Document):
    """Delete allowed if patient owner OR uploader."""
    # patient owner match
    if document.uploaded_by.id == user_id:
        return True
    return False

def check_clinician_access(user_id, clinician_id):
    try:
        clinician = Clinician.objects.get(clinician_id=clinician_id)
    except Clinician.DoesNotExist:
        return False
    return clinician.user_id == user_id