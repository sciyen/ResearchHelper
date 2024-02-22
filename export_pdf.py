#! /usr/bin/env python
import csv
import json
import os
import re
import argparse
import shutil
import glob

def export_pdf(args):
    print("Parsing Zotero library...")
    zotero_lib = {}
    with open(args.zotero_lib_path, newline='') as lib_file:
        lib = json.load(lib_file)
        for item in lib['items']:
            try:
                for attachment in item['attachments']:
                    print(attachment)
                    attachment_file_ext = attachment['path'].split('.')[-1]
                    attachment_key = attachment['select'].split('/')[-1]
                    zotero_lib[item['itemKey']] = {}
                    if attachment_file_ext == 'pdf':
                        zotero_lib[item['itemKey']]['attachmentKey'] = attachment_key
                        break
                    elif attachment_file_ext == 'html':
                        zotero_lib[item['itemKey']]['attachmentAlternativeKey'] = attachment_key
                        break
            except KeyError:
                continue

    print("Parsing CSV file...")
    with open(args.filename, newline='') as csvfile:
        csv_reader = csv.DictReader(csvfile, skipinitialspace=True, delimiter=',', quotechar='|')
        for row in csv_reader:
            try:
                if 'attachmentKey' in zotero_lib[row['Key']]:
                    src = os.path.join(args.zotero_folder, zotero_lib[row['Key']]['attachmentKey'], '*.pdf')
                    pdf_files = glob.glob(src)
                    for idx, pdf_file in enumerate(pdf_files):
                        # Add postfix if multiple PDFs are found
                        postfix = '' if idx == 0 else '_' + str(idx)

                        # NCS style citation format
                        prefix = re.sub(r'[^\w]', '_', re.sub(r'[^\w\s]', '', row['Citation'].strip()))
                        dst = os.path.join(args.output_folder, "[{}]{}{}.pdf".format(prefix, row['Title'], postfix))

                        # Copy the file
                        shutil.copyfile(pdf_file, dst)
            except KeyError:
                print("No attachment found for", row['Key'])
                continue

def main():
    """Command line interface"""

    parser = argparse.ArgumentParser(description="""
    This script exports PDFs from Zotero library based on a CSV file.
    
    The Zotero library can be exported by `right click` the library and click `Export Library`. 
    Choose `Better BibTeX JSON` format. 

    The CSV file should have the following columns: Key, Title, Citation. The CSV file can be 
    exported with the drawio plugin. 
    1. Go to https://sciyen.github.io/drawio/src/main/webapp/index.html
    2. Upload the bbl file 
    3. Export CSV file

    The zotero_folder is the folder where Zotero stores the PDFs.

    Example usage:
    python3 export_pdf.py keys.csv /mnt/c/Users/sciyen/Downloads/My\ Library.json /mnt/c/Users/sciyen/Zotero/storage/ --output_folder=/mnt/d/output\n
    """)
    parser.add_argument('filename', metavar='key.csv', 
        help='CSV input file. Must have the following columns: Key, Title.')

    parser.add_argument('zotero_lib_path', metavar='my_library.json', 
        help='JSON input file. Must be exported in Better BibTeX JSON format.')

    parser.add_argument('zotero_folder', metavar=r'C:\Users\sciyen\Zotero\storage', 
        help='The folder where Zotero stores the PDFs.')

    parser.add_argument('--output_folder', type=str, required=False, default='./output/', 
                        dest="output_folder", help='PDF output folder.')

    args = parser.parse_args()

    # Create the output folder if it doesn't exist
    if (not os.path.exists(args.output_folder)):
        os.makedirs(args.output_folder)

    export_pdf(args)

if __name__ == '__main__':
    main()