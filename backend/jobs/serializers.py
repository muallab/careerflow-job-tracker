from rest_framework import serializers
from .models import Job, Note

class JobSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = ["id", "company", "title", "status"]
        
class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ["id", "job", "text", "created_at"]