import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaSun, FaMoon } from "react-icons/fa"; // Import icons
import "./SignupPage.css";

const SignupPage = () => {
    // Check local storage for theme preference
    const storedTheme = localStorage.getItem("theme") || "light";
    const [theme, setTheme] = useState(storedTheme);

    useEffect(() => {
        document.body.setAttribute("data-theme", theme); // Apply theme
        localStorage.setItem("theme", theme); // Save preference
    }, [theme]);

    // Toggle dark mode
    const toggleTheme = () => {
        setTheme(theme === "light" ? "dark" : "light");
    };

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        mobile: "",
        password: ""
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try { //fetch(`${import.meta.env.VITE_BACKEND_URL}/users`)
        //http://localhost:5000/signup
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/signup`, formData);
            alert(response.data.message);
        } catch (error) {
            alert("Error signing up");
        }
    };

    return (
        <div className="signup-container">
            {/* Dark Mode Toggle Button */}
            <button className="dark-mode-toggle" onClick={toggleTheme}>
                {theme === "light" ? <FaMoon /> : <FaSun />}
            </button>

            <div className="signup-box">
                <h2>Sign Up</h2>
                <form onSubmit={handleSubmit}>
                    <input type="text" name="username" placeholder="Username" onChange={handleChange} required />
                    <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
                    <input type="text" name="mobile" placeholder="Mobile" onChange={handleChange} required />
                    <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
                    <button type="submit">Sign Up</button>
                </form>
                <p>Already have an account? <Link to="/login">Login</Link></p>
            </div>
        </div>
    );
};

export default SignupPage;
