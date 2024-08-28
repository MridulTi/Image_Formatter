from flask import Blueprint,request,jsonify,send_file
from utils.ApiError import ApiError
from utils.ApiResponse import ApiResponse
from constants.https_status_codes import *
from PIL import Image
from pillow_heif import register_heif_opener
import os
import zipfile
from PyPDF2 import PdfWriter,PdfReader


formatter=Blueprint("formatter",__name__,url_prefix="/api/v1/formatter")


# Global variables
image_extensions=['jpg','png','heic','tiff']
register_heif_opener()
RESULT_FOLDER='images/results'
if not os.path.exists(RESULT_FOLDER):
        os.makedirs(RESULT_FOLDER)

# Routes & Controllers
def convertImage(data, type):
    converted_files = []
    images = [Image.open(f) for f in data]

    for i, img in enumerate(images):
        converted_file_path = os.path.join(RESULT_FOLDER, f"converted_image_{i + 1}.{type}")
        img.save(converted_file_path)
        converted_files.append(converted_file_path)

    if len(converted_files) > 1:
        zip_filename = os.path.join(RESULT_FOLDER, "converted_images.zip")
        with zipfile.ZipFile(zip_filename, 'w') as zipf:
            for file_path in converted_files:
                zipf.write(file_path, os.path.basename(file_path))
        print("Images successfully converted!")

        return send_file(zip_filename, as_attachment=True, download_name="converted_images.zip")
    else:
        print("Image successfully converted!")
        return send_file(converted_files[0], as_attachment=True, download_name=os.path.basename(converted_files[0]))

def convertToPdf(data):
    images = [Image.open(f).convert('RGB') for f in data]  # Ensure images are in RGB format for PDF
    print(images)

    pdf_filename = os.path.join(RESULT_FOLDER, "output.pdf")

    # Save the images as a single PDF file
    images[0].save(pdf_filename, resolution=100.0, save_all=True, append_images=images[1:])

    # Send the PDF file as an attachment
    return send_file(pdf_filename, as_attachment=True, download_name="converted_file.pdf")

def editPDF(data, pages):
    
    # Initialize PdfReader and PdfWriter
    infile = PdfReader(data[0])  # 'rb' mode is not necessary in PyPDF2
    output = PdfWriter()

    # Add selected pages to the output PDF
    for i in pages:
        try:
            p = infile.pages[i]
            output.add_page(p)
        except IndexError:
            print(f"Page {i} does not exist in the provided PDF.")
            continue

    # Save the edited PDF to a file
    pdf_filename = os.path.join(RESULT_FOLDER, 'newfile.pdf')
    with open(pdf_filename, 'wb') as f:
        output.write(f)
    
    # Send the edited PDF as an attachment
    return send_file(pdf_filename, as_attachment=True, download_name="edited_file.pdf")


@formatter.route("/fetch",methods=['POST'])
def file_fetch():
    data=request.files.getlist('file[]')
    if not data:
        return ApiError("No files uploaded", HTTP_400_BAD_REQUEST)
    
    filenames = [os.path.splitext(file.filename) for file in data]
    json_data=request.form
    file_type=json_data['type']
    # Extract the file extension from the filename
    # _, file_extension = os.path.splitext(data[0].filename)
    
    # Normalize the file extension and file_type for comparison
    # file_extension = file_extension.lower()
    
    if file_type in image_extensions:
        return convertImage(data,file_type)
    if file_type =='pdf':
        return convertToPdf(data)
    if file_type=='annotate':
        pages=json_data['pages_to_keep']
        if ',' in pages:
            pages = pages.split(',')

        else:
            pages = [pages]
        pages = [int(page) for page in pages]
        return editPDF(data,pages)

    # return ApiResponse("File Fetched!",HTTP_200_OK,{"filename":data})