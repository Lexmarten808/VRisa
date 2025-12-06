from django.db import models

# Create your models here.

class User(models.Model):
    u_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    u_password = models.CharField(max_length=50)
    creation_date = models.DateTimeField(auto_now_add=True)
    u_type = models.CharField(max_length=20)  # admin, regular, invitado, super_admin
    validated = models.BooleanField(default=False)

    class Meta:
        db_table = 'users'
        

    def __str__(self):
        return f"{self.u_name} {self.last_name}"


class Email(models.Model):
    email_id = models.AutoField(primary_key=True, db_column='email_id')
    u_id = models.ForeignKey(User, on_delete=models.CASCADE, related_name='emails', db_column='u_id')
    email = models.CharField(max_length=100, unique=True)

    class Meta:
        db_table = 'email'
        


    def __str__(self):
        return self.email


class PhoneNumber(models.Model):
    p_number_id = models.AutoField(primary_key=True, db_column='p_number_id')
    u_id = models.ForeignKey(User, on_delete=models.CASCADE, related_name='phones', db_column='u_id')
    p_number = models.CharField(max_length=15, unique=True)

    class Meta:
        db_table = 'phone_number'
       


    def __str__(self):
        return self.p_number