"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FaDownload } from "react-icons/fa";

const DownloadButton = () => {

  const { certificateNo } = useParams();

  return (
    <div className="text-center mb-8">
      <Link
        href={`/verify/${certificateNo}/download`}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <FaDownload className="mr-2" />
        Download Certificate
      </Link>
    </div>
  );
};

export default DownloadButton;
