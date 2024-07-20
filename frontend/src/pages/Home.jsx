import axios from "axios";
import _ from "lodash";
import { server } from "../constants";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Home = ({ user }) => {
  const navigate = useNavigate();



  async function handleLogout() {
    try {
      const response = await axios.get(`${server}/logout`, {
        withCredentials: true,
      });

      if (response && response.data && response.data.success) {
        navigate("/login");
      }
    } catch (error) {
      toast.error("Something went wrong!");
    }
  }

  return (
    <div className="container">
      <div
        className="flex-center"
        style={{
          padding: "20px",
        }}
      >
        <div className="flex-right">
          <button onClick={handleLogout}>Logout</button>
        </div>
        <div>
          {_.isEmpty(user) ? (
            <p>Loading....</p>
          ) : (
            <p>Welcome, {user?.email} !</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
