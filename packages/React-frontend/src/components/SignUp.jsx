import { useState } from "react";
import { supabase } from "../lib/supabase";
import "../styles/SignUp.css";

import "../styles/SignUp.css"

function SignUp() {
<<<<<<< HEAD
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [username, setUsername] = useState("");

    async function handleSubmit(event) {
        event.preventDefault();
        
        const { data: existing } = await supabase
        .from("users")
        .select("user_name")
        .eq("user_name", username);

        if (existing.length > 0) {
        setMessage("That username is taken.");
        return;
        }

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: { data : {user_name: username } },
        });
=======
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    const { error } = await supabase.auth.signUp({
      email,
      password
    });
>>>>>>> file-uploading

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Check your email to confirm your account.");
    }
  }

<<<<<<< HEAD
    return (
        <form className="signup-form" onSubmit={handleSubmit}>
            <h2>Create an account</h2>
            
            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
            />
=======
  return (
    <>
      <form className="signup-form" onSubmit={handleSubmit}>
        <h2>Create an account</h2>
>>>>>>> file-uploading

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        <button type="submit">Sign up</button>

        {message && <p>{message}</p>}
      </form>
    </>
  );
}

export default SignUp;
