import React from 'react';
import { MdFileDownload } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

function ThankYouPage() {
    const navigate = useNavigate()

    function onConvertAnother() {
        navigate("/")
    }
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 sm:p-6">
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg text-center max-w-xs sm:max-w-md md:max-w-lg">
                <div className="flex flex-col items-center mb-4">
                    <MdFileDownload className="text-green-500 text-4xl sm:text-5xl mb-2" />
                    <h1 className="text-xl sm:text-2xl font-semibold mb-4">Thank You for Using Our Service!</h1>
                </div>
                <p className="text-gray-700 text-sm sm:text-base mb-6">
                    Your PDF or image has been successfully downloaded. Please check your download folder for the result.
                </p>
                <button
                    onClick={onConvertAnother}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-lg py-2 px-4 sm:px-6 rounded-full transition-all duration-200 ease-in-out transform hover:scale-105"
                >
                    Convert Another File
                </button>
            </div>
        </div>

    );
}

export default ThankYouPage;
