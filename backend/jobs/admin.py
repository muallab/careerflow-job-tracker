from django.contrib import admin

# Register your models here.
from .models import Job, Note

admin.site.register(Job)
admin.site.register(Note)
