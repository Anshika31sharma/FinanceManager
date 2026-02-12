import { useAuth } from '../context/AuthContext';

export function Profile() {
  const { user } = useAuth();

  return (
    <div className="max-w-lg animate-fade-in-up">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Profile</h1>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-500">Name</label>
          <p className="mt-1 text-slate-900 font-medium">{user?.name}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-500">Email</label>
          <p className="mt-1 text-slate-900 font-medium">{user?.email}</p>
        </div>
      </div>
    </div>
  );
}
