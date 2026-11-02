
import React, { useEffect, useState } from 'react';
import Sidebar from '../component/Sidebar';
import ProfileHeaderCard from '../component/ProfileHeaderCard';
import PersonalInfoCard from '../component/PersonalInfoCard';
import { getProfileAPI, updateProfileAPI } from '../api/authApi';
import Swal from 'sweetalert2';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await getProfileAPI();
      setUser(res.user);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (updatedData) => {
    try {
      const res = await updateProfileAPI(updatedData);
      setUser(res.user);

      Swal.fire({
        title: 'Success',
        text: 'อัปเดตข้อมูลสำเร็จ',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        background: '#111',
        color: '#fff'
      });
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  if (loading) {
    return (
      <div className="h-dvh w-full bg-neutral-950 flex items-center justify-center text-white">
        Loading Profile...
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex h-dvh w-full bg-neutral-950 overflow-hidden select-none">

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none opacity-10
        bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))]
        from-neutral-700 via-neutral-950 to-black"
      />

      {/* Sidebar */}
      <aside className="relative z-10 w-64 min-w-64 h-full shrink-0 border-r border-neutral-800">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <main className="relative z-10 flex-1 min-w-0 min-h-0 h-full overflow-y-auto overflow-x-hidden">

        <div className="w-full min-w-0 max-w-full px-6 lg:px-8 py-8">

          <div className="w-full min-w-0 flex flex-col gap-6">

            {/* Page Header */}
            <div className="w-full min-w-0">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-5 shrink-0 bg-neutral-300 rounded-full" />
                <h1 className="text-2xl font-serif font-bold text-white tracking-wide">
                  My Profile
                </h1>
              </div>

              
            </div>

            {/* Profile Header */}
            <div className="w-full min-w-0">
              <ProfileHeaderCard user={user} />
            </div>

            {/* Personal Information */}
            <div className="w-full min-w-0">
              <PersonalInfoCard
                user={user}
                onUpdate={handleUpdate}
              />
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
