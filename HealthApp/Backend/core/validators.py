from .models import Patient, Clinician

def is_clinician(user_id):
    """Check if the user is a clinician."""
    return Clinician.objects.filter(user_id=user_id).exists()

def is_patient(user_id):
    """Check if the user is a patient."""
    return Patient.objects.filter(user_id=user_id).exists()
