import random
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, Patient, Clinician
from .serializers import UserSerializer, PatientSerializer, ClinicianSerializer
from .validators import is_clinician, is_patient
from .auth import require_auth, check_patient_access, check_clinician_access

class RegisterUser(APIView):
    def post(self, request):
        first_name = request.data.get('first_name')
        last_name = request.data.get('last_name')
        password = request.data.get('password')

        if not first_name or not password:
            return Response({'error': 'First name and password required'}, status=400)

        user = User(first_name=first_name, last_name=last_name)
        username = f"{first_name.lower()}_{random.randint(10000, 99999)}"
        user.username = username
        user.set_password(password)
        user.save()
        return Response(UserSerializer(user).data, status=201)

class RegisterPatient(APIView):
    @require_auth
    def post(self, request):
        user_id = request.data.get('user_id')
        age = int(request.data.get('age'))
        sex = request.data.get('sex')
        health_description = request.data.get('health_description')

        if not age or not sex:
            return Response({'error': 'Age and Sex required'}, status=400)
        if sex not in ["Male", "Female"]:
            return  Response({'error': 'Sex should be Male or Female'}, status=400)
        if not health_description:
            health_description = ''

        user = User.objects.get(id=user_id)
        patient = Patient(user=user, age=age, sex=sex, health_description=health_description)
        
        patient.save()
        return Response(PatientSerializer(patient).data, status=201)
    
class RegisterClinician(APIView):
    @require_auth
    def post(self, request):
        user_id = request.data.get('user_id')
        age = int(request.data.get('age'))
        gender = request.data.get('gender')
        speciality = request.data.get('speciality')

        if not age or not speciality:
            return Response({'error': 'Age and speciality required'}, status=400)
        if gender not in ['Male', 'Female', 'Not disclosed']:
            gender = 'Not disclosed'

        user = User.objects.get(id=user_id)
        clinician = Clinician(user=user, age=age, gender=gender, speciality=speciality)
        
        clinician.save()
        return Response(ClinicianSerializer(clinician).data, status=201)

class GetPatients(APIView):
    @require_auth
    def get(self, request):
        user = User.objects.get(username=request.user)
        if not is_clinician(user.id):
            return Response({'detail': 'Access denied.'}, status=status.HTTP_403_FORBIDDEN)
        patients = Patient.objects.select_related("user").all()
        if patients:
            return Response(PatientSerializer(patients, many=True).data, status=200)
        else:
            return Response({'error': 'No Patient Data'}, status=204)

class GetPatientDetails(APIView):
    @require_auth
    def get(self, request, **args):
        patient_id = args['patient_id']
        try: 
            user_id = get_user_id(request.user)
            # Check access: patient self OR clinician
            if not check_patient_access(user_id, patient_id):
                return Response({'detail': 'Access denied.'}, status=status.HTTP_403_FORBIDDEN)
            patient = Patient.objects.select_related("user").get(patient_id=patient_id)

            return Response(PatientSerializer(patient).data, status=200)
        except Exception:
            return Response({'error': 'Patient not found'}, status=404)
        
class GetClinicianDetails(APIView):
    @require_auth
    def get(self, request, **args):
        clinician_id = args['clinician_id']
        try: 
            user_id = get_user_id(request.user)
            if not check_clinician_access(user_id, clinician_id):
                return Response({'detail': 'Access denied.'}, status=status.HTTP_403_FORBIDDEN)
            clinician = Clinician.objects.select_related("user").get(clinician_id=clinician_id)
            return Response(ClinicianSerializer(clinician).data, status=200)
        except Exception:
            return Response({'error': 'Clinician not found'}, status=404)

class GetUserDetails(APIView):
    @require_auth
    def get(self, request, username):
        try:
            user = User.objects.get(username=request.user)
            if not str(user.username) == str(username):
                return Response({'detail': 'Access denied.'}, status=status.HTTP_403_FORBIDDEN)
            user_data = UserSerializer(user).data
            try:
                patient = Patient.objects.get(user_id=user.id)
                user_data['patient_id'] = patient.patient_id
            except Exception: 
                user_data['patient_id'] = ''
            try:
                clinician = Clinician.objects.get(user_id=user.id)
                user_data['clinician_id'] = clinician.clinician_id
            except Exception: 
                user_data['clinician_id'] = ''
            return Response(user_data, status=200)
        except Exception:
            return Response({'error': 'User not found'}, status=404)



def get_user_id(username):
    user = User.objects.get(username=username)
    return user.id
        