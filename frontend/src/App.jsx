import { Toaster } from "react-hot-toast";
import FormLoginRegister from "./components/FormLoginRegister";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import axios from "axios";
import { useEffect,  useState } from "react";
import { useNavigate } from "react-router-dom";
import { server } from "./constants";
import _ from "lodash";


function App() {

  const [user, setUser] = useState({});
  const [rerun, setRerun] = useState(false)
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      let response = await axios.get(`${server}/`, {
        withCredentials: true,
      });
      if (
        response &&
        response.data &&
        _.isObject(response) &&
        _.isObject(response.data) &&
        response.data.success
      ) {
        setUser(response.data.user);
        return;
      } else {
        navigate("/login");
        return;
      }
    } catch (error) {
      if (error.response.status === 404) {
        navigate("/login");
      }
      if (error.response.status === 401) {
        navigate("/login");
      }
    }
  };


  useEffect(() => {
    fetchData();
  }, [rerun]);

  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/" element={<Home user={user} />} />

        <Route path="/register" element={<FormLoginRegister type={"register"} />} />
        <Route path="/login" element={<FormLoginRegister type={"login"} setRerun={setRerun} />} />
      </Routes>
    </>
  );
}

export default App;
