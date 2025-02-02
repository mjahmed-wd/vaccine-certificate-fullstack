'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Role } from "@prisma/client";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  role: Role;
  center: string;
  phone: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error loading users:', error);
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center mb-8">
        <div className="sm:flex-auto">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="mt-2 text-md text-gray-600">
            Manage all registered users and their permissions within the platform.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={() => router.push('/dashboard/users/create')}
            className="inline-flex items-center justify-center rounded-lg transform transition-all duration-200 ease-in-out 
                       bg-[#007C02] hover:bg-[#007C02]/90 px-6 py-3 text-sm font-semibold text-white shadow-sm
                       focus:outline-none focus:ring-2 focus:ring-[#007C02] focus:ring-offset-2"
          >
            <span className="mr-2">+</span> Create New User
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 ease-in-out">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  User
                </th>
                <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Role
                </th>
                <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Center
                </th>
                <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Contact
                </th>
                <th scope="col" className="px-6 py-4 text-right text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center">
                    <div className="flex justify-center items-center space-x-2">
                      <div className="animate-spin h-8 w-8 border-4 border-[#007C02] rounded-full border-t-transparent"></div>
                      <span className="text-gray-600">Loading users...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No users found in the system.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr 
                    key={user.id} 
                    className="hover:bg-gray-50 transition-colors duration-200 ease-in-out cursor-pointer"
                    onClick={() => router.push(`/dashboard/users/${user.id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-[#007C02]/10 rounded-full flex items-center justify-center">
                          <span className="text-[#007C02] font-medium">
                            {user.firstName[0]}
                            {user.lastName[0]}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            @{user.username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.center}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dashboard/users/${user.id}`);
                        }}
                        className="text-[#007C02] hover:text-[#007C02]/90 transform transition-all duration-150 ease-in-out hover:translate-x-1"
                      >
                        Edit →
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}