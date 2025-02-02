import React from 'react';
import EditUserForm from './edit-user-form';

export default async function EditUserPage({ params }: { params: Promise<Record<string, string>> }) {
  const { id } = await params;
  return <EditUserForm id={id} />;
} 
