from rest_framework import serializers
from .models import User, Patient, Clinician, Document

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'username', 'created_at']


class PatientSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = Patient
        fields = (
            "patient_id",
            "user",
            "created_at",
            "age",
            "sex",
            "health_description"
        )

class ClinicianSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = Clinician
        fields = (
            "clinician_id",
            "user",
            "created_at",
            "age",
            "gender",
            "speciality"
        )

class DocumentSerializer(serializers.ModelSerializer):
    download_url = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = ['document_id', 'uploaded_time', 'patient', 'uploaded_by', 'file_path', 'download_url']
        read_only_fields = ['document_id', 'uploaded_time', 'file_path', 'download_url']

    def get_download_url(self, obj):
        request = self.context.get('request')
        if not request:
            return None
        return request.build_absolute_uri(
            f"/api/patients/{obj.patient_id}/documents/{obj.document_id}/download/"
        )