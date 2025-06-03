"use client";
import React, { useState, useEffect, FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { useDispatch } from "react-redux";
import axios from "axios";
import { Eye, EyeOff, Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { setAuthUser } from "@/store/authSlice";
import { setUserRoles } from "@/store/store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Image from "next/image";

const App: React.FC = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false); // Toggle visibility of password
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  type Role = {
    code: string;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/login`,
        formData,
        { withCredentials: true }
      );
      setTimeout(() => {}, 3000);
      const user = response.data.data.user;

      if (user.roles !== null && user.roles !== undefined) {
        const commaSeparatedNames = user.roles
          .map((role: Role) => role.code)
          .join(", ");
        sessionStorage.setItem("userRoles", commaSeparatedNames);
        dispatch(setUserRoles(commaSeparatedNames));
      }
      toast.success("Login Successful");
      dispatch(setAuthUser(user));
      sessionStorage.setItem("email", user.email);
      //router.push(`/Dashboard?email=${encodeURIComponent(formData.email)}`);
      router.push(`/attendance?email=${encodeURIComponent(user.email)}`);
    } catch (error: any) {
      toast.error(error.response.data.message);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full  h-screen items-center flex  bg-bgprimary justify-center">
      {/* <Toaster position="top-right" /> */}
      <div className="absolute top-0 right-0  bg-[url('/wave.svg')] w-[70vh] h-[45vh] bg-no-repeat  flex " />
      <div className="absolute bottom-0 right-0  bg-[url('/circle.svg')] w-[38vh] h-[34vh]  flex bg-no-repeat justify-center items-center overflow-hidden" />

      {/*  log image  */}
      <div className="absolute  top-[-10%] left-0  bg-no-repeat w-60 h-60    flex">
        <Image
          src="/lynk.png"
          fill
          className="object-cover"
          alt="Description of Image"
        />
      </div>

      <div className="absolute bottom-5 left-0 mb-2 ml-4 bg-no-repeat  flex ">
        <h2 className="text-secondarytext font-medium">
          Lynk247 a product of Optimize Innovations
        </h2>
      </div>

      <div className=" lg:w-[25%]  mx-auto flex justify-center border border-gray-200  items-center p-7 py-10 shadow-sm  bg-bgsecondary rounded-lg  box-border oerflow-hidden">
        <div className="w-full   flex flex-col gap-4">
          {/* <h1 className=" font-semibold text-4xl text-center   text-[#6366f1] tracking-widest font-nunito">
            Signin
          </h1> */}

          <div className=" relative mx-auto bg-no-repeat w-16 h-16    flex">
            <Image
              src="/lynklogo.png"
              fill
              className="object-cover"
              alt="Description of Image"
            />
          </div>

          <div className="space-y-1 text-center   leading-tight ">
            <h1 className="text-lg font-medium ">
              Welcome back to{" "}
              <span className="text-[#6366f1] text-xl tracking-wide font-medium">
                Lynk24<span className="text-[#6366f1] text-xl">7</span>!
              </span>
            </h1>
            <p className="text-secondarytext text-sm">
              Please sign in to your account
            </p>
          </div>


          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                name="email"
                id="email"
                placeholder="Enter your email"
                required
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-1">
              <Label>Password</Label>
              <div className="flex relative items-center">
                <Input
                  type={passwordVisible ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                />
                <span
                  className="absolute right-[10px] cursor-pointer text-[18px] text-[#999] flex items-center justify-center w-[25px] h-[25px] group hover:text-[#333]"
                  id="toggle-password"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                >
                  {passwordVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                </span>
              </div>

              <div className="flex items-center justify-end">
                <Link
                  href="/auth/ForgotPassword"
                  className="text-sm  text-[#5a67d8]  no-underline hover:underline"
                >
                  Forget password?
                </Link>
              </div>
            </div>
            <div className="flex items-center justify-center py-2">
              {!loading && (
                <Button className="bg-mainbtn text-white border-0 p-2.5 px-9 rounded  text-base cursor-pointer hover:bg-secondarybtn hover:text-mainbtn ">
                  Sign In
                </Button>
              )}
              {loading && (
                <Button className="bg-mainbtn w-2/6 text-white border-0  p-2.5 rounded  text-base cursor-pointer ">
                  <Loader className="animate-spin" />
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default App;
