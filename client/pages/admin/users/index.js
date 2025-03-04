import React from 'react';
import Layout from '../../../components/Layout';
import Head from 'next/head';
import { useAuth } from '../../../contexts/AuthContext';
import { FaUsers } from 'react-icons/fa';

const UsersPage = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated || !isAdmin()) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-full">
          <div className="bg-red-50 border-r-4 border-red-500 p-4 rounded">
            <p className="text-xl text-red-500 font-medium">
              אין לך הרשאות לצפות בדף זה
            </p>
            <p className="text-sm text-red-400 mt-2">
              דף זה מיועד למנהלים בלבד
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>ניהול משתמשים | מערכת ניהול מלון</title>
      </Head>
      <div className="min-h-screen bg-gray-50 rtl">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <FaUsers className="ml-2 text-blue-600" />
            ניהול משתמשים
          </h1>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-center text-gray-500">
              עמוד ניהול המשתמשים נמצא בפיתוח...
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UsersPage; 