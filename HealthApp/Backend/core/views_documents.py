import os
from django.http import FileResponse, Http404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, parsers
from django.shortcuts import get_object_or_404

from .models import Patient, Document, User
from .serializers import DocumentSerializer
from .auth import require_auth, check_patient_access, check_document_delete
from .views import get_user_id


class PatientDocumentUpload(APIView):
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]
    @require_auth
    def post(self, request, patient_id):
        # Ensure patient exists
        try:
            patient = Patient.objects.get(patient_id=patient_id)
        except Patient.DoesNotExist:
            return Response({'detail': 'Patient not found.'}, status=status.HTTP_404_NOT_FOUND)
        
        user = User.objects.get(username=request.user)
        user_id = user.id
        # Check access: patient self OR clinician
        if not check_patient_access(user_id, patient_id):
            return Response({'detail': 'Access denied.'}, status=status.HTTP_403_FORBIDDEN)

        if 'file' not in request.FILES:
            return Response({'detail': 'No file uploaded (use form-data key "file").'}, status=status.HTTP_400_BAD_REQUEST)

        file_obj = request.FILES['file']
        # Create Document instance
        doc = Document(patient=patient, uploaded_by=user, file=file_obj)
        try:
            doc.full_clean()  # run validators (size + pdf signature)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        doc.save()

        ser = DocumentSerializer(doc, context={'request': request})
        return Response(ser.data, status=status.HTTP_201_CREATED)


class GetDocuments(APIView):
    @require_auth
    def get(self, request, patient_id):
        # Access check
        user_id = get_user_id(request.user)
        if not check_patient_access(user_id, patient_id):
            return Response({'detail': 'Access denied.'}, status=status.HTTP_403_FORBIDDEN)

        queryset = Document.objects.filter(patient_id=patient_id).order_by('-uploaded_time')
        ser = DocumentSerializer(queryset, many=True, context={'request': request})
        return Response(ser.data)


class DocumentView(APIView):
    """GET metadata or DELETE document."""
    @require_auth
    def get(self, request, patient_id, document_id):
        user_id = get_user_id(request.user)
        if not check_patient_access(user_id, patient_id):
            return Response({'detail': 'Access denied.'}, status=status.HTTP_403_FORBIDDEN)

        doc = get_object_or_404(Document, document_id=document_id, patient_id=patient_id)
        ser = DocumentSerializer(doc, context={'request': request})
        return Response(ser.data)

    @require_auth
    def delete(self, request, patient_id, document_id):
        user_id = get_user_id(request.user)
        if not check_patient_access(user_id, patient_id):
            return Response({'detail': 'Access denied.'}, status=status.HTTP_403_FORBIDDEN)
        doc = get_object_or_404(Document, document_id=document_id, patient_id=patient_id)
        if not check_document_delete(user_id, doc):
            return Response({'detail': 'Not allowed to delete.'}, status=status.HTTP_403_FORBIDDEN)

        # Remove file from disk
        stored_path = doc.file.path if doc.file else None
        doc.delete()
        if stored_path and os.path.exists(stored_path):
            try:
                os.remove(stored_path)
            except OSError:
                pass  # swallow errors; log in real app
        return Response(status=status.HTTP_204_NO_CONTENT)


class DocumentDownload(APIView):
    @require_auth
    def get(self, request, patient_id, document_id):
        user_id = get_user_id(request.user)
        if not check_patient_access(user_id, patient_id):
            return Response({'detail': 'Access denied.'}, status=status.HTTP_403_FORBIDDEN)

        doc = get_object_or_404(Document, document_id=document_id, patient_id=patient_id)
        file_field = doc.file
        if not file_field:
            raise Http404("File not found.")
        file_path = file_field.path
        if not os.path.exists(file_path):
            raise Http404("File missing on disk.")

        # stream
        response = FileResponse(open(file_path, 'rb'), content_type='application/pdf')
        # recommended filename in Content-Disposition
        filename = os.path.basename(file_path)
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response