"use client";

import React, { useState, useEffect } from "react";
import { addUser } from "../api/userApi";
import Link from "next/link";
import { useRouter } from "next/router";
import SuccessModal from "@/components/Modals";

const Create = () => {
  const [formData, setFormData] = useState({
    img: null as File | null,
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const router = useRouter();

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: any) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFormData((prev) => ({
        ...prev,
        img: file,
      }));

     // Create a preview URL for the selected image
     const previewUrl = URL.createObjectURL(file);
     setImagePreview(previewUrl);
   }
  };

  useEffect(() => {
    return () => {
      // Clean up the preview URL when the component unmounts
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const data = new FormData();
    data.append("name", formData.name);
    data.append("email", formData.email);
    data.append("password", formData.password);
    if (formData.img) {
      data.append("image", formData.img);
    }

    try {
      const user = await addUser(data);
      console.log("User added:", user);
      setIsModalOpen(true);
      setFormData({
        img: null,
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
        setImagePreview(null);
      }

      router.push("/create");
    } catch (error) {
      console.error("Error adding:", error);
    }
  };

  const handleCancel = () => {
    // Clear form data
    setFormData({
      img: null,
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }

    // Navigate to the view page
    router.push("/create");
  };

  return (
    <div className="bg-gray-100 flex justify-center items-center flex-col h-full gap-6">
      <div className="mt-2">
        <p className="font-bold text-3xl">Create Profile</p>
      </div>
      <div className="w-[450px] p-4 h-[600px] bg-white rounded-3xl shadow-md">
        <form onSubmit={handleSubmit} action="/view">
          <div className="h-40">
            <label>
              <span className="text-black text-sm">Upload Photo</span>
              <span className="text-red-500">*</span>
              <p className="mt-1 text-gray-600 text-xs">
                Upload passport size photo
              </p>
            </label>
            <div className="mt-1 w-full h-36 flex relative">
              <img
                className="z-0 relative rounded-full w-36 h-36"
                src={imagePreview || "/R_Avator_2.svg"}
                alt="Add image avatar"
              />
              <label className="flex mt-[94px] ml-[94px] absolute items-center">
                <img
                  className="flex z-10 "
                  src="/Upload.svg"
                  alt="Add image avatar"
                />
                <input
                  type="file"
                  name="img"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="invisible"
                />
              </label>
            </div>
          </div>

          <div className="mt-12 space-y-3">
            <div>
              <label htmlFor="name" className="block text-sm font-medium">
                <span className="text-black text-sm"> Name</span>
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="h-[44px] mt-1 block w-full rounded-lg border-[1px] border-[#D0D5DD] shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                placeholder=" Enter full name"
                required
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                <span className="text-black text-sm">Email</span>
                <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="h-[44px] mt-1 block w-full rounded-lg border-[1px] border-[#D0D5DD] shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                placeholder=" Enter"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                <span className="text-black text-sm">Password</span>
                <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="h-[44px] mt-1 block w-full rounded-lg border-[1px] border-[#D0D5DD] shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                placeholder=" Enter"
                required
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                <span className="text-black text-sm">Confirm Password</span>
                <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="h-[44px] mt-1 block w-full rounded-lg border-[1px] border-[#D0D5DD] shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                placeholder=" Enter"
                required
              />
            </div>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-indigo-600 bg-white border border-indigo-600 rounded-md hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
      <SuccessModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        message="User have been successfully created "
      />
    </div>
  );
};

export default Create;
