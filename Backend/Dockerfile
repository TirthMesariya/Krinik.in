# Use official Python image
FROM python:3.11

# Set work directory
WORKDIR /app
COPY myapp /app/myapp
# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend code
COPY . .

# Expose the port Django runs on
EXPOSE 8080

# Run Django server
CMD ["python", "manage.py", "runserver", "0.0.0.0:8080"]
