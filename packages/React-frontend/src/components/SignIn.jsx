import { useState } from "react";
import { supabase } from "../lib/supabase";

function SignIn({ setSignedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleLogin(event){
    event.preventDefault();

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password
      });

    if (error) {
      console.error(error);
      setMessage(error.message);
      return;
    } else {
      setMessage("Success");
    }

    console.log(data.user);
    setSignedIn(true);
  }

  return (
    <form className="signup-form" onSubmit={handleLogin}>
      <h2>Sign in</h2>

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

      <button type="submit">Sign In</button>

      {message && <p>{message}</p>}
    </form>
  );
}
export default SignIn;
