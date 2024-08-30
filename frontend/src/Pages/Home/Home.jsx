import React, { useEffect, useRef, useState } from 'react'
import { IoIosAddCircle,IoMdCloseCircle  } from "react-icons/io";
import { MdChangeCircle } from "react-icons/md";
import axios from 'axios'
import { useNavigate } from 'react-router-dom';
import { useFiles } from '../../Context/files';

function Home() {
  const [files, setFiles] = useState([])
  const [type,setTypes]=useState("")
  const {setFile}=useFiles()
  const navigate=useNavigate()
  const fileInputRef = useRef(null);
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (indexToRemove) => {
    setFiles((prevFiles) => prevFiles.filter((_, index) => index !== indexToRemove));
  };
  
  const handleTypeChange = (e) => {
    setTypes(e.target.value);
  };
  useEffect(()=>{
    if (type=='annotate' && files.length>0){
      setFile(files)
      navigate("/PDF")
    }
  },[type,files])

  function converttoType(){
    console.log(files)
    axios.post('api/v1/formatter/fetch',{'file':files,'type':type},
      {
        headers: {
          'Content-Type': 'multipart/form-data', // Important header for sending files
        },
        responseType:'blob'
      }
    )
    .then(res=>{
      console.log(res.data)
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
      navigate("/thanks")
    })
    .catch(err=>{
      console.log(err)
    })
  }

  return (
    <div className='bg-gray-100 min-h-screen'>
  <div className='bg-gray-800 text-white w-full h-52 md:h-48 p-8 md:p-16'>
    <h1 className='text-lg md:text-2xl font-bold'>Image Format Converter</h1>
    <p className='w-full md:w-96'>This app converts your image files online. Amongst many others, we support PNG, JPG, PDF, HEIC.</p>
  </div>

  <div className='flex flex-col md:flex-row gap-4 w-full py-4 justify-center items-center'>
    <label htmlFor="uploadFile1"
      className="flex bg-red-800 flex gap-4 items-center shadow-lg hover:bg-white hover:text-red-600 text-white text-sm md:text-base px-3 md:px-5 py-2 md:py-3 outline-none rounded w-max cursor-pointer font-[sans-serif]">
      <IoIosAddCircle className='text-xl md:text-2xl' /> Select File
      <input type="file" id='uploadFile1' onChange={handleFileChange} multiple className="hidden" />
    </label>

    <p className='grid place-items-center text-sm md:text-base'>Convert to: </p>
    <select className='bg-transparent outline-0 text-sm md:text-base' onChange={handleTypeChange}>
      <option value="jpeg">JPEG</option>
      <option value='png'>PNG</option>
      <option value='heic'>HEIC</option>
      <option value='pdf'>PDF</option>
      <option value='annotate'>Annotate</option>
    </select>
  </div>

  <div className='flex py-2 flex-col place-items-center'>
    {files?.length > 0 && (
      <ul className='w-11/12 md:w-8/12 lg:w-6/12 flex flex-col gap-2'>
        {files.map((file, index) => (
          <li key={index} className="flex p-2 border-2 rounded-lg border-gray-300 justify-between items-center">
            <span className="text-sm md:text-base">{file.name}</span>
            <button
              onClick={() => removeFile(index)}
              className="ml-4 bg-red-700 hover:bg-red-500 text-white px-2 py-1 rounded text-base md:text-xl"
            >
              <IoMdCloseCircle />
            </button>
          </li>
        ))}
      </ul>
    )}
  </div>
  
  <button onClick={converttoType} className='text-lg md:text-2xl mx-auto flex gap-2 place-items-center p-2 px-4 md:px-5 bg-red-700 rounded-full text-white'>
    <MdChangeCircle /> Convert
  </button>
</div>

  )
}

export default Home