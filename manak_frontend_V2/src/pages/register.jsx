import { useState } from "react";
import API from "../services/api";

export default function Register() {
  const [form, setForm] = useState({
    shopName: "",
    ownerName: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: ""
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (
      !form.shopName ||
      !form.ownerName ||
      !form.email ||
      !form.phone ||
      !form.address ||
      !form.password ||
      !form.confirmPassword
    ) {
      return "All fields are required";
    }

    if (!/\S+@\S+\.\S+/.test(form.email)) {
      return "Invalid email address";
    }

    if (!/^\d{10}$/.test(form.phone)) {
      return "Phone number must be 10 digits";
    }

    if (form.password.length < 6) {
      return "Password must be at least 6 characters";
    }

    if (form.password !== form.confirmPassword) {
      return "Passwords do not match";
    }

    return "";
  };

  const register = async () => {
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }

    try {
      await API.post("/auth/register", {
        shopName: form.shopName,
        ownerName: form.ownerName,
        email: form.email,
        phone: form.phone,
        address: form.address,
        password: form.password
      });

      alert("Registration successful. Please login.");
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed"
      );
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <div className="bg-white border rounded-md p-4 space-y-3">
        <h1 className="text-xl font-bold">Register</h1>

        {error && (
          <p className="text-red-600 text-sm">{error}</p>
        )}

        <input
          name="shopName"
          placeholder="Shop Name"
          className="border rounded p-2 w-full"
          onChange={handleChange}
        />

        <input
          name="ownerName"
          placeholder="Owner Name"
          className="border rounded p-2 w-full"
          onChange={handleChange}
        />

        <input
          name="email"
          placeholder="Email"
          className="border rounded p-2 w-full"
          onChange={handleChange}
        />

        <input
          name="phone"
          placeholder="Phone Number"
          className="border rounded p-2 w-full"
          onChange={handleChange}
        />

        <textarea
          name="address"
          placeholder="Address"
          className="border rounded p-2 w-full"
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          className="border rounded p-2 w-full"
          onChange={handleChange}
        />

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          className="border rounded p-2 w-full"
          onChange={handleChange}
        />

        <button
          onClick={register}
          className="bg-blue-600 hover:bg-blue-700 text-white w-full py-2 rounded"
        >
          Register
        </button>
        <p className="text-sm text-center mt-3">
  Already have an account?{" "}
   <a
            href="/"
            className="text-blue-600 underline"
          >
            Login
          </a>
</p>
      </div>
    </div>
  );
}
