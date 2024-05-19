import React from "react";
import { Route, Redirect } from "wouter";
import { useAuth } from "./AuthContext";

const PrivateRoute = ({ component: Component, ...rest }) => {
  const { currentUser } = useAuth();

  return (
    <Route
      {...rest}
      component={(props) =>
        currentUser ? <Component {...props} /> : <Redirect to="/" />
      }
    />
  );
};

export default PrivateRoute;
