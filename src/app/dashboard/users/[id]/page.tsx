import React from 'react';
import EditUserForm from './edit-user-form';

export default async function EditUserPage({ params }: { params: { id: string } }) {
  return <EditUserForm id={params.id} />;
} 