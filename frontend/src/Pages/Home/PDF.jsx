import React, { useState } from 'react';
import { Document, Page, pdfjs } from "react-pdf";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
import { useFiles } from '../../Context/files';
import { MdChangeCircle, MdDelete } from 'react-icons/md';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { IoIosAddCircle } from 'react-icons/io';

function PDF() {
    const { files, setFile } = useFiles();
    const [numPages, setNumPages] = useState(null);
    const [pagesToKeep, setPagesToKeep] = useState([]); // Tracks only the page numbers the user wants to keep
    const navigate = useNavigate();

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    };

    const togglePageKeep = (pageIndex) => {
        const pageNumber = pageIndex + 1;
        setPagesToKeep(prevPagesToKeep =>
            prevPagesToKeep.includes(pageNumber)
                ? prevPagesToKeep.filter(page => page !== pageNumber)
                : [...prevPagesToKeep, pageNumber]
        );
    };

    const removeFile = (indexToRemove) => {
        setFile(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
        navigate("/");
    };

    function handleEditPage() {
        axios.post("api/v1/formatter/fetch", { 'file': files, 'type': "annotate", 'pages_to_keep': pagesToKeep },
            {
                headers: {
                    'Content-Type': 'multipart/form-data', // Important header for sending files
                },
                responseType: 'blob'
            }
        )
            .then(res => {
                const url = window.URL.createObjectURL(new Blob([res.data]));

                // Create a link element and trigger a download
                const link = document.createElement('a');
                link.href = url;

                // Get the filename from the response headers if available
                const contentDisposition = res.headers['content-disposition'];
                let filename = 'downloaded_file';
                if (contentDisposition) {
                    const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
                    if (filenameMatch.length > 1) {
                        filename = filenameMatch[1];
                    }
                }
                link.setAttribute('download', filename);

                // Append the link to the body
                document.body.appendChild(link);

                // Programmatically click the link to trigger the download
                link.click();

                // Clean up by removing the link and revoking the object URL
                link.parentNode.removeChild(link);
                window.URL.revokeObjectURL(url);
                navigate("/thanks");

            })
            .catch(err => {
                console.log(err);
            });
    }

    return (
        <div className="flex flex-col lg:flex-row h-screen bg-gray-100">
            {/* Left Side - File Viewer */}
            <div className="w-full lg:w-3/4 p-4 overflow-auto bg-gray-200 rounded-lg shadow-lg">
                {files && files.length > 0 && files.map((file, fileIndex) => (
                    <div key={fileIndex} className="mb-6 grid place-items-center">
                        <Document
                            file={file}
                            className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12"
                            onLoadSuccess={onDocumentLoadSuccess}
                        >
                            {Array.from(new Array(numPages), (el, pageIndex) => (
                                <div key={`page_${pageIndex + 1}`} className="relative grid bg-white justify-center shadow-lg rounded-xl">
                                    <Page
                                        className={`w-full md:w-0 object-cover aspect-square bg-white rounded-lg overflow-hidden ${pagesToKeep.includes(pageIndex + 1) ? 'opacity-100' : 'opacity-50'}`}
                                        pageNumber={pageIndex + 1}
                                    />

                                    <div className="text-center mt-2 font-semibold">
                                        <button
                                            onClick={() => togglePageKeep(pageIndex)}
                                            className="px-4 md:px-10 text-sm md:text-base text-white bg-blue-600 hover:bg-blue-700 p-1 rounded-full shadow-md"
                                        >
                                            {pagesToKeep.includes(pageIndex + 1) ? 'Remove' : 'Keep'}
                                        </button>
                                        <h1 className="text-sm md:text-base">Page {pageIndex + 1}</h1>
                                    </div>
                                </div>
                            ))}
                        </Document>
                        <button
                            onClick={() => removeFile(fileIndex)}
                            className="mt-4 bg-red-800 hover:bg-red-600 transition-all duration-200 ease-in-out transform rounded-xl hover:scale-105 text-sm md:text-xl text-white px-4 md:px-5 py-2 md:py-3 hover:text-white"
                        >
                            <MdDelete className="inline-block mr-2" /> Remove File
                        </button>
                    </div>
                ))}
            </div>

            {/* Right Side - Edit PDF Section */}
            <div className="w-full lg:w-1/4 flex flex-col items-center lg:h-full">
                <div className="bg-gray-100 flex-grow w-full">
                    <div className="bg-gray-800 text-white p-6 md:p-12 text-center lg:text-left">
                        <h1 className="text-lg md:text-2xl font-bold">Edit PDF pages</h1>
                        <p className="w-full lg:w-96 text-sm md:text-base">Allows you to annotate, add, or remove pages of the PDF.</p>
                    </div>
                </div>
                <div className="mt-auto mb-4">
                    <button onClick={handleEditPage} className="text-sm md:text-lg lg:text-xl font-semibold flex gap-2 items-center p-2 md:p-3 lg:p-4 bg-red-600 hover:bg-red-700 rounded-full text-white shadow-lg transition-all duration-200 ease-in-out transform hover:scale-105">
                        <MdChangeCircle />
                        <span>Create</span>
                    </button>
                </div>
            </div>
        </div>

    );
}

export default PDF;
