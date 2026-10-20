import { useState } from "react";
import { supabase } from "../lib/supabase";
import "../styles/SignUp.css";

function SignIn({ setSignedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleLogin(event) {
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
    <main className="sign-in-page">
      <div className="sign-in-background" aria-hidden="true">
        <svg className="background-svg" viewBox="0 0 1000 600">
          <defs>
            <linearGradient id="purple-blue-pink">
              <stop stopColor="#a855f7" />
              <stop offset="0.5" stopColor="#38bdf8" />
              <stop offset="1" stopColor="#ec4899" />
            </linearGradient>
          </defs>

          <path 
            className="background-path"
            d="M -100 300 C 150 80, 260 520, 500, 300 S 800 80, 1100 300"
          />
        </svg>
      </div>

      <section className="sign-in-card">
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
            onChange={(event) =>
              setPassword(event.target.value)
            }
            required
          />

          <button type="submit">Sign In</button>

          {message && <p>{message}</p>}
        </form>
      </section>
    </main>
  );
}
export default SignIn;
