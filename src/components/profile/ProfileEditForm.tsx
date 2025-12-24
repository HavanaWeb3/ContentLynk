'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ImageUploadCrop } from './ImageUploadCrop';
import toast from 'react-hot-toast';

interface ProfileData {
  legalName?: string;
  displayName?: string | null;
  bio?: string | null;
  avatar?: string | null;
}

export function ProfileEditForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<ProfileData>({});
  const [bioLength, setBioLength] = useState(0);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        setFormData({
          legalName: data.user.legalName || '',
          displayName: data.user.displayName || '',
          bio: data.user.bio || '',
          avatar: data.user.avatar || null,
        });
        setBioLength(data.user.bio?.length || 0);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'bio') {
      setBioLength(value.length);
    }
  };

  const handleImageUploaded = (imageUrl: string) => {
    setFormData(prev => ({ ...prev, avatar: imageUrl }));
    toast.success('Profile image uploaded successfully');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      toast.success('Profile updated successfully!');
      router.push('/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Profile Image */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Profile Image
        </label>
        <ImageUploadCrop
          currentImage={formData.avatar || undefined}
          onImageUploaded={handleImageUploaded}
        />
      </div>

      {/* Legal Name */}
      <div>
        <label htmlFor="legalName" className="block text-sm font-medium text-gray-700 mb-2">
          Legal Name <span className="text-red-500">*</span>
          <span className="text-gray-500 font-normal ml-2">(Private - for payments/tax only)</span>
        </label>
        <input
          type="text"
          id="legalName"
          name="legalName"
          value={formData.legalName || ''}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Your full legal name"
        />
        <p className="mt-1 text-sm text-gray-500">
          Required for payment processing. This will never be shown publicly.
        </p>
      </div>

      {/* Display Name */}
      <div>
        <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
          Display Name
          <span className="text-gray-500 font-normal ml-2">(Public - shown on your profile)</span>
        </label>
        <input
          type="text"
          id="displayName"
          name="displayName"
          value={formData.displayName || ''}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Your creator name"
          maxLength={50}
        />
        <p className="mt-1 text-sm text-gray-500">
          This is how you'll appear to other users. Leave blank to use your username.
        </p>
      </div>

      {/* Bio */}
      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
          Bio
          <span className="text-gray-500 font-normal ml-2">
            ({bioLength}/1000 characters)
          </span>
        </label>
        <textarea
          id="bio"
          name="bio"
          value={formData.bio || ''}
          onChange={handleChange}
          rows={6}
          maxLength={1000}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          placeholder="Tell your audience about yourself..."
        />
        <p className="mt-1 text-sm text-gray-500">
          Share your story, interests, and what kind of content you create.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end space-x-4 pt-6 border-t">
        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          disabled={saving}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 font-medium"
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </form>
  );
}
