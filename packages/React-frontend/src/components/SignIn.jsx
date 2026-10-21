import {useState} from "react";
import {supabase} from "../lib/supabase";

function SignIn () {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [identifier, setIdentifier] = useState("");

    async function handleSubmit(event) {
        event.preventDefault();

        let loginEmail = identifier;

        if (!identifier.includes("@")){
           const { data, error: lookupError } = await supabase.rpc("email_for_username", {
            lookup_name: identifier
        });

            if (lookupError || !data) {
                setMessage("Invalid Login Credentials")
                return;
            }

            loginEmail= data;
        }

        const { error } = await supabase.auth.signInWithPassword(
            {email: loginEmail, password,}
        )

        if (error) {
            setMessage(error.message);
        } 
    }

return (
    <form className="signup-form" onSubmit={handleSubmit}>
        <h2>Sign in</h2>

        <input
            type = "tezt"
            placeholder = "Email/Username"
            value = {identifier}
            onChange={(event) => setIdentifier(event.target.value)} 
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
) 
}
export default SignIn;