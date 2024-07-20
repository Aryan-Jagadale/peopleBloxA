import { Link, useNavigate } from "react-router-dom";
import { formContent, server } from "../constants";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import _ from "lodash";
import axios from "axios";

const FormLoginRegister = ({ type = "register", setRerun }) => {
  const content = formContent[type];
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    setEmail("");
    setPassword("");
  }, [type]);

  const handleSubmit = async () => {
    if (!email || !password) {
      toast.error("Email and password are required!");
      return;
    }

    if (!_.isString(email) || !_.isString(password)) {
      toast.error("Invalid email or password");
      return;
    }

    try {
      const response = await axios.post(
        `${server}/${type}`,
        {
          email,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      if (
        response &&
        response.data &&
        _.isObject(response) &&
        _.isObject(response.data) &&
        response.data.success
      ) {
        if (type === "register") {
          navigate("/login");
        } else if (type === "login") {
          navigate("/");
          setRerun(true);
        }
      }
    } catch (error) {
      console.error("error", error.response.status === 400);
      if (error.response.status === 400) {
        toast.error("User already exists!");
      } else if (error.response.status === 403 && type === "login") {
        toast.error(
          "Account is locked for 24 hours due to multiple failed login attempts.!"
        );
      } else if (error.response.status === 401 && type === "login") {
        toast.error(
          "Unauthorized!"
        );
      } else {
        toast.error("Something went wrong!");
      }
    }
  };

  return (
    <div>
      <div className="container" id="container">
        <div className="form-container sign-in-container">
          <div id="form">
            <h1>{content.title}</h1>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handleSubmit}>{content.button}</button>
          </div>
        </div>
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-right">
              <h1>{content.overlayTitle}</h1>
              <p>{content.overlayText}</p>
              <Link to={`${content.redirect}`}>
                <button className="ghost" id="signUp">
                  {content.overlayButton}
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormLoginRegister;
