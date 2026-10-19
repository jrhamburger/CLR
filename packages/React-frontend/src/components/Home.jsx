import { useState } from "react";
import { supabase } from "../lib/supabase"
import { useState, useEffect } from "react";

function Home({ session }){
    const [signedInState, setSignedInState] = useState("");
    const [username, setUsername] = useState("");


    async function handleSignOut(){
        const {error} = await supabase.auth.signOut();

        if (error) {
            setSignedInState(error.message);
        }   
    }

    //Fetching the Username from personal.users.username
    useEffect(() => {
        supabase
            .from("users")
            .select("user_name")
            .eq("user_id", session.user.id)
            .single()
            .then(({ data }) => setUsername(data?.user_name ?? ""));
        }, [session]);

    return (
        <div>
            <h2>Welcome, {username}</h2>
            <button onClick={handleSignOut}>Sign out</button>
            {signedInState && <p>{signedInState}</p>}
        </div>
    );
}


export default Home;