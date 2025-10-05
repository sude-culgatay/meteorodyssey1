from django.db import models

#Question Model
class Question(models.Model):
    question = models.CharField(max_length=255)
    choice1 = models.CharField(max_length=255)
    choice2 = models.CharField(max_length=255)
    choice3 = models.CharField(max_length=255)
    choice4 = models.CharField(max_length=255)
    answer = models.CharField(max_length=255)
    points = models.IntegerField()
    hint = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.question