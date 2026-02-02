from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets
from .models import Job, Note
from .serializers import JobSerializer, NoteSerializer


class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.all()
    serializer_class = JobSerializer

class NoteViewSet(viewsets.ModelViewSet):
    queryset = Note.objects.all()
    serializer_class = NoteSerializer