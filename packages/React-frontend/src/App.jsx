import { useState, useEffect } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'
import { supabase } from "./lib/supabase";

import SignUp from "./components/SignUp";

function App() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    async function testConnection() {
      const { data, error } = await supabase.auth.getSession();

      console.log("Connected:", data);
      console.log("Error:", error);
    }

    testConnection();
  }, []);

  return (
    <SignUp />
  );
}

export default App
