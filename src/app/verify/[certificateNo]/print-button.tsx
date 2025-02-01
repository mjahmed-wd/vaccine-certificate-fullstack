"use client";

import React from "react";
import { FaPrint } from "react-icons/fa";

const PrintButton = () => {
  return (
    <div className="text-center mb-8">
      <button
        onClick={() => window.print()}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <FaPrint className="mr-2" />
        Print Certificate
      </button>
    </div>
  );
};

export default PrintButton;
