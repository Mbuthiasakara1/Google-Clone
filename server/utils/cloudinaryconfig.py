import cloudinary
import cloudinary.api

cloudconfig = cloudinary.config(
    cloud_name='da5ereqrh',
    api_key='315237513949645',
    api_secret='A7u5QYKaVwRkLNsPgbdx4_C1HSA',
    secure=True
)

# Initialize the API
cloudinary.api.ping()