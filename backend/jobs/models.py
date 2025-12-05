from django.db import models

# Create your models here.
class Job(models.Model):
    STATUS_CHOICES = [
        ("WISHLIST", "Wishlist"),
        ("APPLIED", "Applied"),
        ("INTERVIEW", "Interview"),
        ("OFFER", "Offer"),
        ("REJECTED", "Rejected"),
    ]
    company = models.CharField(max_length=200)
    title = models.CharField(max_length=200)
    status = models.CharField(max_length=200, choices=STATUS_CHOICES, default="WISHLIST")
    
    def __str__(self):
        return f"{self.company} - {self.title}"
    