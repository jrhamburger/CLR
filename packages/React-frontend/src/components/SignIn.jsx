import { useState } from "react";
import { supabase } from "../lib/supabase";

function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [identifier, setIdentifier] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    let loginEmail = identifier;

    if (!identifier.includes("@")) {
      const { data, error: lookupError } = await supabase.rpc(
        "email_for_username",
        {
          lookup_name: identifier
        }
      );

      if (lookupError || !data) {
        setMessage("Invalid Login Credentials");
        return;
      }

      loginEmail = data;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password
    });

    if (error) {
      setMessage(error.message);
    }
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
        <form className="signup-form" onSubmit={handleSubmit}>
          <h2>Sign in</h2>

          <input
            type="text"
            placeholder="Email/Username"
            value={identifier}
            onChange={(event) =>
              setIdentifier(event.target.value)
            }
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
