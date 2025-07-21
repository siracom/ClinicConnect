from django.urls import path
from .views import (
    RegisterUser, 
    RegisterPatient, 
    RegisterClinician, 
    GetUserDetails,
    GetPatientDetails,
    GetClinicianDetails,
    GetPatients
)

from .views_documents import (
    PatientDocumentUpload,
    DocumentView,
    GetDocuments,
    DocumentDownload
)

from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


urlpatterns = [
    path('register/', RegisterUser.as_view()),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('user/<str:username>/', GetUserDetails.as_view()),
    # path('login/', LoginView.as_view()),
    path('register-clinician/', RegisterClinician.as_view()),
    path('clinicians/<str:clinician_id>/', GetClinicianDetails.as_view()),
    path('register-patient/', RegisterPatient.as_view()),
    path('patients/<str:patient_id>/', GetPatientDetails.as_view()),
    path('patients/', GetPatients.as_view()),

    # Document URLs
    path('patients/<str:patient_id>/documents/upload/', PatientDocumentUpload.as_view()),
    path('patients/<str:patient_id>/documents/<str:document_id>/', DocumentView.as_view()),
    path('patients/<str:patient_id>/documents/', GetDocuments.as_view()),
    path('patients/<str:patient_id>/documents/<str:document_id>/download/', DocumentDownload.as_view()),
]
